import { eq, sql } from 'drizzle-orm'
import { db } from '../database/db'
import {
  HostProfiles,
  Products,
  Roles,
  Users,
} from '../database/schemas'
import { statusCodes } from '../utils'

const MAX_TEXT = 8000
const MAX_ARRAY_ITEMS = 40

export type HostProfileUpdateInput = {
  image_url?: string
  intro?: string
  description?: string
  years_experience?: number
  specialty?: string
  experience_summary?: string
  hosting_style?: string
  experience_tags?: string[]
  languages?: string[]
}

function clampText(value: unknown, max = MAX_TEXT): string {
  if (value === undefined || value === null) return ''
  const s = String(value).trim()
  return s.length > max ? s.slice(0, max) : s
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, Math.trunc(n)))
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') continue
    const t = item.trim()
    if (!t) continue
    if (t.length > 120) out.push(t.slice(0, 120))
    else out.push(t)
    if (out.length >= MAX_ARRAY_ITEMS) break
  }
  return out
}

export async function isUserHost(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ roleName: Roles.name })
    .from(Users)
    .leftJoin(Roles, eq(Users.role_id, Roles.id))
    .where(eq(Users.id, userId))
    .limit(1)

  if (!row) return false
  const name = row.roleName?.toLowerCase().trim()
  return name === 'host'
}

async function getHostTotalTours(userId: string): Promise<number> {
  const [row] = await db
    .select({ total_tours: sql<number>`count(*)::int` })
    .from(Products)
    .where(eq(Products.user_id, userId))

  return row?.total_tours ?? 0
}

const emptyProfileRow = () => ({
  image_url: '',
  intro: '',
  description: '',
  years_experience: 0,
  specialty: '',
  experience_summary: '',
  hosting_style: '',
  experience_tags: [] as string[],
  languages: [] as string[],
})

export async function getPublicHostProfileByUserId(userId: string) {
  if (!userId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del usuario es obligatorio.')
  }

  const host = await isUserHost(userId)
  if (!host) {
    console.error('404:', statusCodes[404])
    throw new Error('No se encontró un perfil de anfitrión para este usuario.')
  }

  const [user] = await db
    .select({
      id: Users.id,
      username: Users.username,
      first_name: Users.first_name,
      last_name: Users.last_name,
      image_url: Users.image_url,
    })
    .from(Users)
    .where(eq(Users.id, userId))
    .limit(1)

  if (!user) {
    console.error('404:', statusCodes[404])
    throw new Error('Usuario no encontrado.')
  }

  const [profileRow] = await db
    .select()
    .from(HostProfiles)
    .where(eq(HostProfiles.user_id, userId))
    .limit(1)

  const profile = profileRow
    ? {
        image_url: profileRow.image_url ?? '',
        intro: profileRow.intro,
        description: profileRow.description,
        years_experience: profileRow.years_experience,
        specialty: profileRow.specialty,
        experience_summary: profileRow.experience_summary,
        hosting_style: profileRow.hosting_style,
        experience_tags: profileRow.experience_tags ?? [],
        languages: profileRow.languages ?? [],
      }
    : emptyProfileRow()

  const total_tours = await getHostTotalTours(userId)

  return {
    user_id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    image_url: profile.image_url || user.image_url || '',
    total_tours,
    years_experience: profile.years_experience,
    intro: profile.intro,
    description: profile.description,
    specialty: profile.specialty,
    experience_summary: profile.experience_summary,
    hosting_style: profile.hosting_style,
    experience_tags: profile.experience_tags,
    languages: profile.languages,
  }
}

export async function upsertHostProfileForUser(
  userId: string,
  input: HostProfileUpdateInput,
) {
  if (!userId) {
    console.error('400:', statusCodes[400])
    throw new Error('El ID del usuario es obligatorio.')
  }

  const host = await isUserHost(userId)
  if (!host) {
    console.error('403:', statusCodes[403])
    throw new Error('Solo los anfitriones pueden editar este perfil.')
  }

  const [existing] = await db
    .select()
    .from(HostProfiles)
    .where(eq(HostProfiles.user_id, userId))
    .limit(1)

  const base = existing
    ? {
        image_url: existing.image_url ?? '',
        intro: existing.intro,
        description: existing.description,
        years_experience: existing.years_experience,
        specialty: existing.specialty,
        experience_summary: existing.experience_summary,
        hosting_style: existing.hosting_style,
        experience_tags: existing.experience_tags ?? [],
        languages: existing.languages ?? [],
      }
    : emptyProfileRow()

  const merged = {
    image_url:
      input.image_url !== undefined
        ? clampText(input.image_url, 2048)
        : base.image_url,
    intro:
      input.intro !== undefined ? clampText(input.intro) : base.intro,
    description:
      input.description !== undefined
        ? clampText(input.description)
        : base.description,
    years_experience:
      input.years_experience !== undefined
        ? clampInt(input.years_experience, 0, 80)
        : base.years_experience,
    specialty:
      input.specialty !== undefined
        ? clampText(input.specialty)
        : base.specialty,
    experience_summary:
      input.experience_summary !== undefined
        ? clampText(input.experience_summary)
        : base.experience_summary,
    hosting_style:
      input.hosting_style !== undefined
        ? clampText(input.hosting_style)
        : base.hosting_style,
    experience_tags:
      input.experience_tags !== undefined
        ? sanitizeStringArray(input.experience_tags)
        : base.experience_tags,
    languages:
      input.languages !== undefined
        ? sanitizeStringArray(input.languages)
        : base.languages,
  }

  const now = new Date()

  await db
    .insert(HostProfiles)
    .values({
      user_id: userId,
      ...merged,
      created_at: now,
      updated_at: now,
    })
    .onConflictDoUpdate({
      target: HostProfiles.user_id,
      set: {
        ...merged,
        updated_at: now,
      },
    })

  return getPublicHostProfileByUserId(userId)
}

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
  intro?: string
  descripcion?: string
  anosExperiencia?: number
  especialidad?: string
  tipoExperiencias?: string
  estilo?: string
  tiposExperiencia?: string[]
  idiomas?: string[]
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

async function getHostProductStats(userId: string): Promise<{
  totalTours: number
  totalEvaluaciones: number
  calificacion: string | null
}> {
  const [row] = await db
    .select({
      totalTours: sql<number>`count(*)::int`,
      totalEvaluaciones: sql<number>`coalesce(sum(${Products.total_reviews}), 0)::int`,
      calificacion: sql<string | null>`
        case when coalesce(sum(${Products.total_reviews}), 0) > 0
        then trim(to_char(
          sum(${Products.average_rating}::numeric * ${Products.total_reviews})
            / nullif(sum(${Products.total_reviews}), 0),
          'FM999999990.00'
        ))
        else null end
      `,
    })
    .from(Products)
    .where(eq(Products.user_id, userId))

  return {
    totalTours: row?.totalTours ?? 0,
    totalEvaluaciones: row?.totalEvaluaciones ?? 0,
    calificacion: row?.calificacion ?? null,
  }
}

function buildDetalles(profile: {
  specialty: string
  experience_summary: string
  hosting_style: string
}) {
  return [
    {
      key: 'specialty' as const,
      label: 'Especialidad:',
      value: profile.specialty,
    },
    {
      key: 'experience_types' as const,
      label: 'Tipo de experiencias:',
      value: profile.experience_summary,
    },
    {
      key: 'style' as const,
      label: 'Estilo:',
      value: profile.hosting_style,
    },
  ]
}

const emptyProfileRow = () => ({
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

  const stats = await getHostProductStats(userId)

  return {
    userId: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    imageUrl: user.image_url ?? '',
    calificacion: stats.calificacion,
    totalEvaluaciones: stats.totalEvaluaciones,
    totalTours: stats.totalTours,
    anosExperiencia: profile.years_experience,
    intro: profile.intro,
    descripcion: profile.description,
    detalles: buildDetalles(profile),
    tiposExperiencia: profile.experience_tags,
    idiomas: profile.languages,
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
    intro:
      input.intro !== undefined ? clampText(input.intro) : base.intro,
    description:
      input.descripcion !== undefined
        ? clampText(input.descripcion)
        : base.description,
    years_experience:
      input.anosExperiencia !== undefined
        ? clampInt(input.anosExperiencia, 0, 80)
        : base.years_experience,
    specialty:
      input.especialidad !== undefined
        ? clampText(input.especialidad)
        : base.specialty,
    experience_summary:
      input.tipoExperiencias !== undefined
        ? clampText(input.tipoExperiencias)
        : base.experience_summary,
    hosting_style:
      input.estilo !== undefined ? clampText(input.estilo) : base.hosting_style,
    experience_tags:
      input.tiposExperiencia !== undefined
        ? sanitizeStringArray(input.tiposExperiencia)
        : base.experience_tags,
    languages:
      input.idiomas !== undefined
        ? sanitizeStringArray(input.idiomas)
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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { and, eq } from 'drizzle-orm'
import { db } from '../database/db'
import {
  BlogCategories,
  BlogCategoryTranslations,
  BlogPostLikes,
  BlogPostTranslations,
  BlogPosts,
  BlogSectionTranslations,
  BlogSections,
} from '../database/schemas'
import { getDefaultLocale } from './translation-service'
import {
  saveBlogPostWithTranslations,
  saveBlogSectionWithTranslations,
  saveBlogCategoryWithTranslations,
} from './blog-translations-service'

export const createPost = async (data: any) => {
  const { title, slug, author_bio, ...rest } = data
  const [post] = await db
    .insert(BlogPosts)
    .values(rest)
    .returning()
  if (!post) throw new Error('Error al crear el post.')
  if (title && slug) {
    await saveBlogPostWithTranslations(post.id, {
      title,
      slug,
      author_bio: author_bio ?? null,
    })
  }
  return [post]
}

export const getPosts = async (locale?: string) => {
  const lang = locale ?? getDefaultLocale()
  return await db
    .select({
      id: BlogPosts.id,
      title: BlogPostTranslations.title,
      slug: BlogPostTranslations.slug,
      author_bio: BlogPostTranslations.author_bio,
      reading_time_minutes: BlogPosts.reading_time_minutes,
      cover_image: BlogPosts.cover_image,
      is_approved: BlogPosts.is_approved,
      is_published: BlogPosts.is_published,
      user_id: BlogPosts.user_id,
      category_id: BlogPosts.category_id,
      created_at: BlogPosts.created_at,
      updated_at: BlogPosts.updated_at,
    })
    .from(BlogPosts)
    .innerJoin(
      BlogPostTranslations,
      and(
        eq(BlogPosts.id, BlogPostTranslations.post_id),
        eq(BlogPostTranslations.locale, lang),
      ),
    )
}

export const getPostById = async (id: string, locale?: string) => {
  const lang = locale ?? getDefaultLocale()
  const rows = await db
    .select({
      id: BlogPosts.id,
      title: BlogPostTranslations.title,
      slug: BlogPostTranslations.slug,
      author_bio: BlogPostTranslations.author_bio,
      reading_time_minutes: BlogPosts.reading_time_minutes,
      cover_image: BlogPosts.cover_image,
      is_approved: BlogPosts.is_approved,
      is_published: BlogPosts.is_published,
      user_id: BlogPosts.user_id,
      category_id: BlogPosts.category_id,
      created_at: BlogPosts.created_at,
      updated_at: BlogPosts.updated_at,
    })
    .from(BlogPosts)
    .innerJoin(
      BlogPostTranslations,
      and(
        eq(BlogPosts.id, BlogPostTranslations.post_id),
        eq(BlogPostTranslations.locale, lang),
      ),
    )
    .where(eq(BlogPosts.id, id))
  return rows
}

export const updatePost = async (id: string, data: any) => {
  const { title, slug, author_bio, ...rest } = data
  await db.update(BlogPosts).set(rest).where(eq(BlogPosts.id, id))
  if (title !== undefined || slug !== undefined || author_bio !== undefined) {
    const lang = getDefaultLocale()
    const [cur] = await db
      .select()
      .from(BlogPostTranslations)
      .where(
        and(
          eq(BlogPostTranslations.post_id, id),
          eq(BlogPostTranslations.locale, lang),
        ),
      )
      .limit(1)
    await saveBlogPostWithTranslations(id, {
      title: title ?? cur?.title ?? '',
      slug: slug ?? cur?.slug ?? '',
      author_bio: author_bio ?? cur?.author_bio ?? null,
    })
  }
  return await db.select().from(BlogPosts).where(eq(BlogPosts.id, id))
}

export const deletePost = async (id: string) => {
  return await db.delete(BlogPosts).where(eq(BlogPosts.id, id)).returning()
}

export const createCategory = async (data: any) => {
  const { name, description } = data
  const [cat] = await db.insert(BlogCategories).values({}).returning()
  if (!cat) throw new Error('Error al crear la categoría.')
  if (name) {
    await saveBlogCategoryWithTranslations(cat.id, {
      name,
      description: description ?? null,
    })
  }
  return [cat]
}

export const getCategories = async (locale?: string) => {
  const lang = locale ?? getDefaultLocale()
  return await db
    .select({
      id: BlogCategories.id,
      name: BlogCategoryTranslations.name,
      description: BlogCategoryTranslations.description,
      created_at: BlogCategories.created_at,
      updated_at: BlogCategories.updated_at,
    })
    .from(BlogCategories)
    .innerJoin(
      BlogCategoryTranslations,
      and(
        eq(BlogCategories.id, BlogCategoryTranslations.category_id),
        eq(BlogCategoryTranslations.locale, lang),
      ),
    )
}

export const updateCategory = async (id: string, data: any) => {
  const { name, description, ...rest } = data
  await db.update(BlogCategories).set(rest).where(eq(BlogCategories.id, id))
  if (name !== undefined || description !== undefined) {
    const [cur] = await db
      .select()
      .from(BlogCategoryTranslations)
      .where(
        and(
          eq(BlogCategoryTranslations.category_id, id),
          eq(BlogCategoryTranslations.locale, getDefaultLocale()),
        ),
      )
      .limit(1)
    await saveBlogCategoryWithTranslations(id, {
      name: name ?? cur?.name ?? '',
      description: description ?? cur?.description ?? null,
    })
  }
  return await db.select().from(BlogCategories).where(eq(BlogCategories.id, id))
}

export const deleteCategory = async (id: string) => {
  return await db
    .delete(BlogCategories)
    .where(eq(BlogCategories.id, id))
    .returning()
}

// Blog Likes
export const createLike = async (data: any) => {
  return await db.insert(BlogPostLikes).values(data).returning()
}

export const getLikes = async (postId: string) => {
  return await db
    .select()
    .from(BlogPostLikes)
    .where(eq(BlogPostLikes.post_id, postId))
}

export const deleteLike = async (postId: string, userId: string) => {
  return await db
    .delete(BlogPostLikes)
    .where(
      and(eq(BlogPostLikes.post_id, postId), eq(BlogPostLikes.user_id, userId)),
    )
    .returning()
}

export const createSection = async (data: any) => {
  const { title, content, ...rest } = data
  const [section] = await db.insert(BlogSections).values(rest).returning()
  if (!section) throw new Error('Error al crear la sección.')
  if (title && content) {
    await saveBlogSectionWithTranslations(section.id, { title, content })
  }
  return [section]
}

export const getSections = async (postId: string, locale?: string) => {
  const lang = locale ?? getDefaultLocale()
  return await db
    .select({
      id: BlogSections.id,
      post_id: BlogSections.post_id,
      title: BlogSectionTranslations.title,
      content: BlogSectionTranslations.content,
      images: BlogSections.images,
      videos: BlogSections.videos,
      order: BlogSections.order,
      created_at: BlogSections.created_at,
      updated_at: BlogSections.updated_at,
    })
    .from(BlogSections)
    .innerJoin(
      BlogSectionTranslations,
      and(
        eq(BlogSections.id, BlogSectionTranslations.section_id),
        eq(BlogSectionTranslations.locale, lang),
      ),
    )
    .where(eq(BlogSections.post_id, postId))
}

export const updateSection = async (id: string, data: any) => {
  const { title, content, ...rest } = data
  await db.update(BlogSections).set(rest).where(eq(BlogSections.id, id))
  if (title !== undefined || content !== undefined) {
    const [cur] = await db
      .select()
      .from(BlogSectionTranslations)
      .where(
        and(
          eq(BlogSectionTranslations.section_id, id),
          eq(BlogSectionTranslations.locale, getDefaultLocale()),
        ),
      )
      .limit(1)
    await saveBlogSectionWithTranslations(id, {
      title: title ?? cur?.title ?? '',
      content: content ?? cur?.content ?? '',
    })
  }
  return await db.select().from(BlogSections).where(eq(BlogSections.id, id))
}

export const deleteSection = async (id: string) => {
  return await db
    .delete(BlogSections)
    .where(eq(BlogSections.id, id))
    .returning()
}

// Las funciones de relación post-categoría se comentan porque no existe el esquema
// export const addPostToCategory = async (postId: string, categoryId: string) => { ... }
// export const removePostFromCategory = async (postId: string, categoryId: string) => { ... }

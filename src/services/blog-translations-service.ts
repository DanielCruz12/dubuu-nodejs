import { db } from '../database/db'
import {
  BlogCategoryTranslations,
  BlogPostTranslations,
  BlogSectionTranslations,
} from '../database/schemas'
import {
  getEnabledLocales,
  detectBlogPostLanguage,
  detectBlogCategoryLanguage,
  translateBlogPostFields,
  translateBlogSectionFields,
  translateBlogCategoryFields,
  type BlogPostTranslatableFields,
  type BlogSectionTranslatableFields,
  type BlogCategoryTranslatableFields,
} from './translation-service'
import { getDefaultLocale } from './translation-service'

export async function upsertBlogPostTranslation(
  postId: string,
  locale: string,
  fields: BlogPostTranslatableFields,
): Promise<void> {
  await db
    .insert(BlogPostTranslations)
    .values({
      post_id: postId,
      locale,
      title: fields.title,
      slug: fields.slug,
      author_bio: fields.author_bio ?? null,
    })
    .onConflictDoUpdate({
      target: [BlogPostTranslations.post_id, BlogPostTranslations.locale],
      set: {
        title: fields.title,
        slug: fields.slug,
        author_bio: fields.author_bio ?? null,
        updated_at: new Date(),
      },
    })
}

export async function saveBlogPostWithTranslations(
  postId: string,
  sourceFields: BlogPostTranslatableFields,
  sourceLocale?: string,
): Promise<void> {
  const detected = sourceLocale ?? (await detectBlogPostLanguage(sourceFields))
  const enabled = getEnabledLocales()
  await upsertBlogPostTranslation(postId, detected, sourceFields)
  for (const targetLocale of enabled.filter((l) => l !== detected)) {
    const translated = await translateBlogPostFields(
      sourceFields,
      targetLocale,
      detected,
    )
    await upsertBlogPostTranslation(postId, targetLocale, translated)
  }
}

export async function upsertBlogSectionTranslation(
  sectionId: string,
  locale: string,
  fields: BlogSectionTranslatableFields,
): Promise<void> {
  await db
    .insert(BlogSectionTranslations)
    .values({
      section_id: sectionId,
      locale,
      title: fields.title,
      content: fields.content,
    })
    .onConflictDoUpdate({
      target: [BlogSectionTranslations.section_id, BlogSectionTranslations.locale],
      set: {
        title: fields.title,
        content: fields.content,
        updated_at: new Date(),
      },
    })
}

export async function saveBlogSectionWithTranslations(
  sectionId: string,
  sourceFields: BlogSectionTranslatableFields,
  sourceLocale?: string,
): Promise<void> {
  const detected = sourceLocale ?? getDefaultLocale()
  const enabled = getEnabledLocales()
  await upsertBlogSectionTranslation(sectionId, detected, sourceFields)
  for (const targetLocale of enabled.filter((l) => l !== detected)) {
    const translated = await translateBlogSectionFields(
      sourceFields,
      targetLocale,
      detected,
    )
    await upsertBlogSectionTranslation(sectionId, targetLocale, translated)
  }
}

export async function upsertBlogCategoryTranslation(
  categoryId: string,
  locale: string,
  fields: BlogCategoryTranslatableFields,
): Promise<void> {
  await db
    .insert(BlogCategoryTranslations)
    .values({
      category_id: categoryId,
      locale,
      name: fields.name,
      description: fields.description ?? null,
    })
    .onConflictDoUpdate({
      target: [BlogCategoryTranslations.category_id, BlogCategoryTranslations.locale],
      set: {
        name: fields.name,
        description: fields.description ?? null,
        updated_at: new Date(),
      },
    })
}

export async function saveBlogCategoryWithTranslations(
  categoryId: string,
  sourceFields: BlogCategoryTranslatableFields,
  sourceLocale?: string,
): Promise<void> {
  const detected = sourceLocale ?? (await detectBlogCategoryLanguage(sourceFields))
  const enabled = getEnabledLocales()
  await upsertBlogCategoryTranslation(categoryId, detected, sourceFields)
  for (const targetLocale of enabled.filter((l) => l !== detected)) {
    const translated = await translateBlogCategoryFields(
      sourceFields,
      targetLocale,
      detected,
    )
    await upsertBlogCategoryTranslation(categoryId, targetLocale, translated)
  }
}

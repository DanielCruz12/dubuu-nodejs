import { db } from '../database/db'
import {
  ProductTypeTranslations,
  ProductCategoryTranslations,
  TargetProductAudienceTranslations,
  ProductAmenityTranslations,
} from '../database/schemas'
import {
  getEnabledLocales,
  detectCatalogLanguage,
  translateCatalogFields,
  type CatalogTranslatableFields,
} from './translation-service'

async function saveCatalogWithTranslations(
  insertRow: (id: string, locale: string, fields: CatalogTranslatableFields) => Promise<void>,
  entityId: string,
  sourceFields: CatalogTranslatableFields,
  sourceLocale?: string,
): Promise<void> {
  const detected = sourceLocale ?? (await detectCatalogLanguage(sourceFields))
  const enabled = getEnabledLocales()
  await insertRow(entityId, detected, sourceFields)
  for (const targetLocale of enabled.filter((l) => l !== detected)) {
    const translated = await translateCatalogFields(
      sourceFields,
      targetLocale,
      detected,
    )
    await insertRow(entityId, targetLocale, translated)
  }
}

export async function upsertProductTypeTranslation(
  productTypeId: string,
  locale: string,
  fields: CatalogTranslatableFields,
): Promise<void> {
  await db
    .insert(ProductTypeTranslations)
    .values({
      product_type_id: productTypeId,
      locale,
      name: fields.name.slice(0, 100),
      description: fields.description,
    })
    .onConflictDoUpdate({
      target: [ProductTypeTranslations.product_type_id, ProductTypeTranslations.locale],
      set: {
        name: fields.name.slice(0, 100),
        description: fields.description,
        updated_at: new Date(),
      },
    })
}

export async function saveProductTypeWithTranslations(
  productTypeId: string,
  sourceFields: CatalogTranslatableFields,
  sourceLocale?: string,
): Promise<void> {
  await saveCatalogWithTranslations(
    upsertProductTypeTranslation,
    productTypeId,
    sourceFields,
    sourceLocale,
  )
}

export async function upsertProductCategoryTranslation(
  categoryId: string,
  locale: string,
  fields: CatalogTranslatableFields,
): Promise<void> {
  await db
    .insert(ProductCategoryTranslations)
    .values({
      category_id: categoryId,
      locale,
      name: fields.name.slice(0, 155),
      description: fields.description,
    })
    .onConflictDoUpdate({
      target: [ProductCategoryTranslations.category_id, ProductCategoryTranslations.locale],
      set: {
        name: fields.name.slice(0, 155),
        description: fields.description,
        updated_at: new Date(),
      },
    })
}

export async function saveProductCategoryWithTranslations(
  categoryId: string,
  sourceFields: CatalogTranslatableFields,
  sourceLocale?: string,
): Promise<void> {
  await saveCatalogWithTranslations(
    upsertProductCategoryTranslation,
    categoryId,
    sourceFields,
    sourceLocale,
  )
}

export async function upsertTargetProductAudienceTranslation(
  audienceId: string,
  locale: string,
  fields: CatalogTranslatableFields,
): Promise<void> {
  await db
    .insert(TargetProductAudienceTranslations)
    .values({
      audience_id: audienceId,
      locale,
      name: fields.name.slice(0, 155),
      description: fields.description,
    })
    .onConflictDoUpdate({
      target: [
        TargetProductAudienceTranslations.audience_id,
        TargetProductAudienceTranslations.locale,
      ],
      set: {
        name: fields.name.slice(0, 155),
        description: fields.description,
        updated_at: new Date(),
      },
    })
}

export async function saveTargetProductAudienceWithTranslations(
  audienceId: string,
  sourceFields: CatalogTranslatableFields,
  sourceLocale?: string,
): Promise<void> {
  await saveCatalogWithTranslations(
    upsertTargetProductAudienceTranslation,
    audienceId,
    sourceFields,
    sourceLocale,
  )
}

export async function upsertProductAmenityTranslation(
  amenityId: string,
  locale: string,
  fields: CatalogTranslatableFields,
): Promise<void> {
  await db
    .insert(ProductAmenityTranslations)
    .values({
      amenity_id: amenityId,
      locale,
      name: fields.name.slice(0, 155),
      description: fields.description,
    })
    .onConflictDoUpdate({
      target: [ProductAmenityTranslations.amenity_id, ProductAmenityTranslations.locale],
      set: {
        name: fields.name.slice(0, 155),
        description: fields.description,
        updated_at: new Date(),
      },
    })
}

export async function saveProductAmenityWithTranslations(
  amenityId: string,
  sourceFields: CatalogTranslatableFields,
  sourceLocale?: string,
): Promise<void> {
  await saveCatalogWithTranslations(
    upsertProductAmenityTranslation,
    amenityId,
    sourceFields,
    sourceLocale,
  )
}

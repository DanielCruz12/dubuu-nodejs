import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { Products } from './products'
import { Tours } from './tours'
import { Faqs } from './faqs'
import { BlogPosts } from './blog/blog-posts'
import { BlogSections } from './blog/blog-sections'
import { BlogCategories } from './blog/blog-categories'
import {
  ProductTypes,
  ProductCategories,
  TargetProductAudiences,
  ProductAmenities,
} from './product-catalogs'

const localeColumn = () => varchar('locale', { length: 10 }).notNull()

/**
 * Traducciones por entidad. Siempre filtrar por locale en las consultas
 * (ej. WHERE locale = 'es') para cargar solo un idioma y reducir ancho de banda.
 * PK (entity_id, locale) evita duplicados y permite un único JOIN por entidad.
 */

export const ProductTranslations = pgTable(
  'product_translations',
  {
    product_id: uuid('product_id')
      .notNull()
      .references(() => Products.id, { onDelete: 'cascade' }),
    locale: localeColumn(),
    name: varchar('name', { length: 155 }).notNull(),
    description: text('description').notNull(),
    address: text('address').notNull().default(''),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.product_id, t.locale] })],
)

export const TourTranslations = pgTable(
  'tour_translations',
  {
    product_id: uuid('product_id')
      .notNull()
      .references(() => Tours.product_id, { onDelete: 'cascade' }),
    locale: localeColumn(),
    departure_point: text('departure_point').notNull().default(''),
    difficulty: text('difficulty').notNull().default(''),
    highlight: text('highlight').notNull().default(''),
    included: text('included').notNull().default(''),
    itinerary: text('itinerary').array().default([]),
    packing_list: text('packing_list').array().default([]),
    expenses: text('expenses').array().default([]),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.product_id, t.locale] })],
)

export const FaqTranslations = pgTable(
  'faq_translations',
  {
    faq_id: uuid('faq_id')
      .notNull()
      .references(() => Faqs.id, { onDelete: 'cascade' }),
    locale: localeColumn(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.faq_id, t.locale] })],
)

export const BlogPostTranslations = pgTable(
  'blog_post_translations',
  {
    post_id: uuid('post_id')
      .notNull()
      .references(() => BlogPosts.id, { onDelete: 'cascade' }),
    locale: localeColumn(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    author_bio: text('author_bio'),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.post_id, t.locale] })],
)

export const BlogSectionTranslations = pgTable(
  'blog_section_translations',
  {
    section_id: uuid('section_id')
      .notNull()
      .references(() => BlogSections.id, { onDelete: 'cascade' }),
    locale: localeColumn(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.section_id, t.locale] })],
)

export const BlogCategoryTranslations = pgTable(
  'blog_category_translations',
  {
    category_id: uuid('category_id')
      .notNull()
      .references(() => BlogCategories.id, { onDelete: 'cascade' }),
    locale: localeColumn(),
    name: text('name').notNull(),
    description: text('description'),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.category_id, t.locale] })],
)

export const ProductTypeTranslations = pgTable(
  'product_type_translations',
  {
    product_type_id: uuid('product_type_id')
      .notNull()
      .references(() => ProductTypes.id, { onDelete: 'cascade' }),
    locale: localeColumn(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description').notNull(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.product_type_id, t.locale] })],
)

export const ProductCategoryTranslations = pgTable(
  'product_category_translations',
  {
    category_id: uuid('category_id')
      .notNull()
      .references(() => ProductCategories.id, { onDelete: 'cascade' }),
    locale: localeColumn(),
    name: varchar('name', { length: 155 }).notNull(),
    description: text('description').notNull(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.category_id, t.locale] })],
)

export const TargetProductAudienceTranslations = pgTable(
  'target_product_audience_translations',
  {
    audience_id: uuid('audience_id')
      .notNull()
      .references(() => TargetProductAudiences.id, { onDelete: 'cascade' }),
    locale: localeColumn(),
    name: varchar('name', { length: 155 }).notNull(),
    description: text('description').notNull(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.audience_id, t.locale] })],
)

export const ProductAmenityTranslations = pgTable(
  'product_amenity_translations',
  {
    amenity_id: uuid('amenity_id')
      .notNull()
      .references(() => ProductAmenities.id, { onDelete: 'cascade' }),
    locale: localeColumn(),
    name: varchar('name', { length: 155 }).notNull(),
    description: text('description').notNull(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.amenity_id, t.locale] })],
)

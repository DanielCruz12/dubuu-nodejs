import { pgTable, uuid, text, foreignKey, timestamp, varchar, numeric, boolean, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const faqs = pgTable("faqs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	question: text().notNull(),
	answer: text().notNull(),
	category: text().default('tour'),
});

export const comments = pgTable("comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	comment: text().notNull(),
	productId: uuid("product_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "comments_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comments_user_id_users_id_fk"
		}),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 155 }).notNull(),
	description: text().notNull(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	departurePoint: text("departure_point").notNull(),
	isApproved: boolean("is_approved").default(false).notNull(),
	maxPeople: integer("max_people").notNull(),
	duration: integer().notNull(),
	images: text().array().default(["",""]),
	videos: text().array().default(["",""]),
	banner: text(),
	productServiceId: uuid("product_service_id").notNull(),
	productCategoryId: uuid("product_category_id").notNull(),
	targetProductAudienceId: uuid("target_product_audience_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productCategoryId],
			foreignColumns: [productCategories.id],
			name: "products_product_category_id_product_categories_id_fk"
		}),
	foreignKey({
			columns: [table.productServiceId],
			foreignColumns: [productServices.id],
			name: "products_product_service_id_product_services_id_fk"
		}),
	foreignKey({
			columns: [table.targetProductAudienceId],
			foreignColumns: [targetProductAudiences.id],
			name: "products_target_product_audience_id_target_product_audiences_id"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "products_user_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	roleId: uuid("role_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [userRoles.id],
			name: "users_role_id_user_roles_id_fk"
		}),
]);

export const productServices = pgTable("product_services", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 155 }).notNull(),
	description: text().notNull(),
});

export const productCategories = pgTable("product_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 155 }).notNull(),
	description: text().notNull(),
});

export const targetProductAudiences = pgTable("target_product_audiences", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 155 }).notNull(),
	description: text().notNull(),
});

export const ratings = pgTable("ratings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	productId: uuid("product_id").notNull(),
	rating: integer().notNull(),
	review: text(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "ratings_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "ratings_user_id_users_id_fk"
		}),
]);

export const userRoles = pgTable("user_roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	permissions: text().array().default(["user"]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

import { pgTable, foreignKey, text, varchar, uuid, timestamp, boolean, integer, numeric, date, unique, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	username: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	imageUrl: text("image_url").default(''),
	bankName: varchar("bank_name", { length: 255 }),
	accountNumber: varchar("account_number", { length: 50 }),
	accountType: text("account_type").default('Ahorro'),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	idRegion: text("id_region"),
	country: text(),
	city: text(),
	address: text(),
	zipCode: text("zip_code"),
	phoneNumber: varchar("phone_number", { length: 50 }),
	roleId: uuid("role_id").references(() => userRoles.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [userRoles.id],
			name: "users_role_id_user_roles_id_fk"
		}).onDelete("cascade"),
]);

export const bookings = pgTable("bookings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id"),
	productId: uuid("product_id"),
	status: text().default('in-process'),
	isLive: boolean("is_live"),
	tickets: integer().default(1),
	total: numeric({ precision: 10, scale:  2 }).notNull(),
	tourDateId: uuid("tour_date_id"),
	paymentMethod: text(),
	idTransaccion: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "bookings_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "bookings_product_id_products_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tourDateId],
			foreignColumns: [tourDates.id],
			name: "bookings_tour_date_id_tour_dates_id_fk"
		}).onDelete("cascade"),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 155 }).notNull(),
	userId: text("user_id").notNull(),
	description: text().notNull(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	address: text().default('').notNull(),
	country: varchar({ length: 100 }).notNull(),
	isApproved: boolean("is_approved").default(false).notNull(),
	images: text().array().default(['']),
	files: text().array().default(['']),
	videos: text().array().default(['']),
	banner: text(),
	isActive: boolean("is_active").default(true).notNull(),
	averageRating: numeric("average_rating", { precision: 8, scale:  2 }).default('0'),
	totalReviews: integer("total_reviews").default(0),
	targetProductAudienceId: uuid("target_product_audience_id").notNull(),
	productCategoryId: uuid("product_category_id").notNull(),
	productTypeId: uuid("product_type_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "products_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.targetProductAudienceId],
			foreignColumns: [targetProductAudiences.id],
			name: "products_target_product_audience_id_target_product_audiences_id"
		}),
	foreignKey({
			columns: [table.productCategoryId],
			foreignColumns: [productCategories.id],
			name: "products_product_category_id_product_categories_id_fk"
		}),
	foreignKey({
			columns: [table.productTypeId],
			foreignColumns: [productTypes.id],
			name: "products_product_type_id_product_types_id_fk"
		}),
]);

export const tourDates = pgTable("tour_dates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tourId: uuid("tour_id").notNull(),
	date: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	maxPeople: integer("max_people").notNull(),
	peopleBooked: integer("people_booked").default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tourId],
			foreignColumns: [tours.productId],
			name: "tour_dates_tour_id_tours_product_id_fk"
		}).onDelete("cascade"),
]);

export const comments = pgTable("comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	comment: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comments_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const faqs = pgTable("faqs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	question: text().notNull(),
	answer: text().notNull(),
	userId: text("user_id").notNull(),
	productId: uuid("product_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "faqs_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "faqs_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const favorites = pgTable("favorites", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	productId: uuid("product_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "favorites_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "favorites_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const paymentAccounts = pgTable("payment_accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	bankName: text("bank_name").notNull(),
	accountType: text("account_type").notNull(),
	accountNumber: text("account_number").notNull(),
	holderName: text("holder_name").notNull(),
	email: text().notNull(),
	paymentMethod: text("payment_method").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payment_accounts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const productCategories = pgTable("product_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 155 }).notNull(),
	description: text().notNull(),
	productTypeId: uuid("product_type_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productTypeId],
			foreignColumns: [productTypes.id],
			name: "product_categories_product_type_id_product_types_id_fk"
		}).onDelete("cascade"),
]);

export const productAmenities = pgTable("product_amenities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 155 }).notNull(),
	description: text().notNull(),
	categoryId: uuid("category_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [productCategories.id],
			name: "product_amenities_category_id_product_categories_id_fk"
		}).onDelete("cascade"),
]);

export const productTypes = pgTable("product_types", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const targetProductAudiences = pgTable("target_product_audiences", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 155 }).notNull(),
	description: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const ratings = pgTable("ratings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	productId: uuid("product_id").notNull(),
	status: boolean().default(false).notNull(),
	rating: integer().notNull(),
	review: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "ratings_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "ratings_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const rentals = pgTable("rentals", {
	productId: uuid("product_id").primaryKey().notNull(),
	brand: text().notNull(),
	model: text().notNull(),
	year: integer().notNull(),
	condition: text().default('used'),
	mileage: integer().notNull(),
	transmission: text().notNull(),
	seatingCapacity: integer("seating_capacity").notNull(),
	pickupLocation: text("pickup_location").notNull(),
	maxDeliveryDistanceKm: integer("max_delivery_distance_km").default(15),
	baseDeliveryFee: numeric("base_delivery_fee", { precision: 10, scale:  2 }).default('2.00'),
	feePerKm: numeric("fee_per_km", { precision: 10, scale:  2 }).default('1.00'),
	offersDelivery: boolean("offers_delivery").default(false),
	pricePerDay: numeric("price_per_day", { precision: 10, scale:  2 }).notNull(),
	availableFrom: date("available_from").notNull(),
	availableUntil: date("available_until").notNull(),
	isAvailable: boolean("is_available").default(true),
	fuelType: text("fuel_type").notNull(),
	typeCar: text("type_car").notNull(),
	color: text().notNull(),
	doors: integer().notNull(),
	engine: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "rentals_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const tours = pgTable("tours", {
	productId: uuid("product_id").primaryKey().notNull(),
	departurePoint: text("departure_point").default(''						).notNull(),
	expenses: text().array().default(['']),
	difficulty: text().default('').notNull(),
	packingList: text("packing_list").array().default(['']),
	lat: text().default('').notNull(),
	long: text().default('').notNull(),
	itinerary: text().array().default(['']),
	highlight: text().default('').notNull(),
	included: text().default('').notNull(),
	duration: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "tours_product_id_products_id_fk"
		}).onDelete("cascade"),
]);

export const userRoles = pgTable("user_roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	permissions: text().array().default(["user"]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const blogPostLikes = pgTable("blog_post_likes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	postId: uuid("post_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "blog_post_likes_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [blogPosts.id],
			name: "blog_post_likes_post_id_blog_posts_id_fk"
		}).onDelete("cascade"),
	unique("blog_post_likes_user_id_post_id_unique").on(table.userId, table.postId),
]);

export const blogPosts = pgTable("blog_posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	readingTimeMinutes: integer("reading_time_minutes").default(3).notNull(),
	authorBio: text("author_bio"),
	coverImage: text("cover_image"),
	isApproved: boolean("is_approved").default(false).notNull(),
	isPublished: boolean("is_published").default(false).notNull(),
	userId: text("user_id").notNull(),
	categoryId: uuid("category_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "blog_posts_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [blogCategories.id],
			name: "blog_posts_category_id_blog_categories_id_fk"
		}).onDelete("set null"),
	unique("blog_posts_slug_unique").on(table.slug),
]);

export const blogCategories = pgTable("blog_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("blog_categories_name_unique").on(table.name),
]);

export const blogSections = pgTable("blog_sections", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	title: text().notNull(),
	content: text().notNull(),
	images: text().array().default(['']),
	videos: text().array().default(['']),
	order: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [blogPosts.id],
			name: "blog_sections_post_id_blog_posts_id_fk"
		}).onDelete("cascade"),
]);

export const productAmenitiesProducts = pgTable("product_amenities_products", {
	productId: uuid("product_id").notNull(),
	productAmenityId: uuid("product_amenity_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_amenities_products_product_id_products_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productAmenityId],
			foreignColumns: [productAmenities.id],
			name: "product_amenities_products_product_amenity_id_product_amenities"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.productId, table.productAmenityId], name: "product_amenities_products_product_id_product_amenity_id_pk"}),
]);

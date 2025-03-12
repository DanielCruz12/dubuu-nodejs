import { relations } from "drizzle-orm/relations";
import { products, comments, users, productCategories, productServices, targetProductAudiences, userRoles, ratings } from "./schema";

export const commentsRelations = relations(comments, ({one}) => ({
	product: one(products, {
		fields: [comments.productId],
		references: [products.id]
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	comments: many(comments),
	productCategory: one(productCategories, {
		fields: [products.productCategoryId],
		references: [productCategories.id]
	}),
	productService: one(productServices, {
		fields: [products.productServiceId],
		references: [productServices.id]
	}),
	targetProductAudience: one(targetProductAudiences, {
		fields: [products.targetProductAudienceId],
		references: [targetProductAudiences.id]
	}),
	user: one(users, {
		fields: [products.userId],
		references: [users.id]
	}),
	ratings: many(ratings),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	comments: many(comments),
	products: many(products),
	userRole: one(userRoles, {
		fields: [users.roleId],
		references: [userRoles.id]
	}),
	ratings: many(ratings),
}));

export const productCategoriesRelations = relations(productCategories, ({many}) => ({
	products: many(products),
}));

export const productServicesRelations = relations(productServices, ({many}) => ({
	products: many(products),
}));

export const targetProductAudiencesRelations = relations(targetProductAudiences, ({many}) => ({
	products: many(products),
}));

export const userRolesRelations = relations(userRoles, ({many}) => ({
	users: many(users),
}));

export const ratingsRelations = relations(ratings, ({one}) => ({
	product: one(products, {
		fields: [ratings.productId],
		references: [products.id]
	}),
	user: one(users, {
		fields: [ratings.userId],
		references: [users.id]
	}),
}));
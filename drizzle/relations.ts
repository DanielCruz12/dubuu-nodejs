import { relations } from "drizzle-orm/relations";
import { userRoles, users, bookings, products, tourDates, targetProductAudiences, productCategories, productTypes, tours, comments, faqs, favorites, paymentAccounts, productAmenities, ratings, rentals, blogPostLikes, blogPosts, blogCategories, blogSections, productAmenitiesProducts } from "./schema";

export const usersRelations = relations(users, ({one, many}) => ({
	userRole: one(userRoles, {
		fields: [users.roleId],
		references: [userRoles.id]
	}),
	bookings: many(bookings),
	products: many(products),
	comments: many(comments),
	faqs: many(faqs),
	favorites: many(favorites),
	paymentAccounts: many(paymentAccounts),
	ratings: many(ratings),
	blogPostLikes: many(blogPostLikes),
	blogPosts: many(blogPosts),
}));

export const userRolesRelations = relations(userRoles, ({many}) => ({
	users: many(users),
}));

export const bookingsRelations = relations(bookings, ({one}) => ({
	user: one(users, {
		fields: [bookings.userId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [bookings.productId],
		references: [products.id]
	}),
	tourDate: one(tourDates, {
		fields: [bookings.tourDateId],
		references: [tourDates.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	bookings: many(bookings),
	user: one(users, {
		fields: [products.userId],
		references: [users.id]
	}),
	targetProductAudience: one(targetProductAudiences, {
		fields: [products.targetProductAudienceId],
		references: [targetProductAudiences.id]
	}),
	productCategory: one(productCategories, {
		fields: [products.productCategoryId],
		references: [productCategories.id]
	}),
	productType: one(productTypes, {
		fields: [products.productTypeId],
		references: [productTypes.id]
	}),
	faqs: many(faqs),
	favorites: many(favorites),
	ratings: many(ratings),
	rentals: many(rentals),
	tours: many(tours),
	productAmenitiesProducts: many(productAmenitiesProducts),
}));

export const tourDatesRelations = relations(tourDates, ({one, many}) => ({
	bookings: many(bookings),
	tour: one(tours, {
		fields: [tourDates.tourId],
		references: [tours.productId]
	}),
}));

export const targetProductAudiencesRelations = relations(targetProductAudiences, ({many}) => ({
	products: many(products),
}));

export const productCategoriesRelations = relations(productCategories, ({one, many}) => ({
	products: many(products),
	productType: one(productTypes, {
		fields: [productCategories.productTypeId],
		references: [productTypes.id]
	}),
	productAmenities: many(productAmenities),
}));

export const productTypesRelations = relations(productTypes, ({many}) => ({
	products: many(products),
	productCategories: many(productCategories),
}));

export const toursRelations = relations(tours, ({one, many}) => ({
	tourDates: many(tourDates),
	product: one(products, {
		fields: [tours.productId],
		references: [products.id]
	}),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
}));

export const faqsRelations = relations(faqs, ({one}) => ({
	user: one(users, {
		fields: [faqs.userId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [faqs.productId],
		references: [products.id]
	}),
}));

export const favoritesRelations = relations(favorites, ({one}) => ({
	user: one(users, {
		fields: [favorites.userId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [favorites.productId],
		references: [products.id]
	}),
}));

export const paymentAccountsRelations = relations(paymentAccounts, ({one}) => ({
	user: one(users, {
		fields: [paymentAccounts.userId],
		references: [users.id]
	}),
}));

export const productAmenitiesRelations = relations(productAmenities, ({one, many}) => ({
	productCategory: one(productCategories, {
		fields: [productAmenities.categoryId],
		references: [productCategories.id]
	}),
	productAmenitiesProducts: many(productAmenitiesProducts),
}));

export const ratingsRelations = relations(ratings, ({one}) => ({
	user: one(users, {
		fields: [ratings.userId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [ratings.productId],
		references: [products.id]
	}),
}));

export const rentalsRelations = relations(rentals, ({one}) => ({
	product: one(products, {
		fields: [rentals.productId],
		references: [products.id]
	}),
}));

export const blogPostLikesRelations = relations(blogPostLikes, ({one}) => ({
	user: one(users, {
		fields: [blogPostLikes.userId],
		references: [users.id]
	}),
	blogPost: one(blogPosts, {
		fields: [blogPostLikes.postId],
		references: [blogPosts.id]
	}),
}));

export const blogPostsRelations = relations(blogPosts, ({one, many}) => ({
	blogPostLikes: many(blogPostLikes),
	user: one(users, {
		fields: [blogPosts.userId],
		references: [users.id]
	}),
	blogCategory: one(blogCategories, {
		fields: [blogPosts.categoryId],
		references: [blogCategories.id]
	}),
	blogSections: many(blogSections),
}));

export const blogCategoriesRelations = relations(blogCategories, ({many}) => ({
	blogPosts: many(blogPosts),
}));

export const blogSectionsRelations = relations(blogSections, ({one}) => ({
	blogPost: one(blogPosts, {
		fields: [blogSections.postId],
		references: [blogPosts.id]
	}),
}));

export const productAmenitiesProductsRelations = relations(productAmenitiesProducts, ({one}) => ({
	product: one(products, {
		fields: [productAmenitiesProducts.productId],
		references: [products.id]
	}),
	productAmenity: one(productAmenities, {
		fields: [productAmenitiesProducts.productAmenityId],
		references: [productAmenities.id]
	}),
}));
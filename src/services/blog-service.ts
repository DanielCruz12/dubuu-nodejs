/* eslint-disable @typescript-eslint/no-explicit-any */
import { and, eq } from 'drizzle-orm'
import { db } from '../database/db'
import {
  BlogCategories,
  BlogPostLikes,
  BlogPosts,
  BlogSections,
} from '../database/schemas'

// Blog Posts
export const createPost = async (data: any) => {
  return await db.insert(BlogPosts).values(data).returning()
}

export const getPosts = async () => {
  return await db.select().from(BlogPosts)
}

export const getPostById = async (id: string) => {
  return await db.select().from(BlogPosts).where(eq(BlogPosts.id, id))
}

export const updatePost = async (id: string, data: any) => {
  return await db
    .update(BlogPosts)
    .set(data)
    .where(eq(BlogPosts.id, id))
    .returning()
}

export const deletePost = async (id: string) => {
  return await db.delete(BlogPosts).where(eq(BlogPosts.id, id)).returning()
}

// Blog Categories
export const createCategory = async (data: any) => {
  return await db.insert(BlogCategories).values(data).returning()
}

export const getCategories = async () => {
  return await db.select().from(BlogCategories)
}

export const updateCategory = async (id: string, data: any) => {
  return await db
    .update(BlogCategories)
    .set(data)
    .where(eq(BlogCategories.id, id))
    .returning()
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

// Blog Sections
export const createSection = async (data: any) => {
  return await db.insert(BlogSections).values(data).returning()
}

export const getSections = async (postId: string) => {
  return await db
    .select()
    .from(BlogSections)
    .where(eq(BlogSections.post_id, postId))
}

export const updateSection = async (id: string, data: any) => {
  return await db
    .update(BlogSections)
    .set(data)
    .where(eq(BlogSections.id, id))
    .returning()
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

import { pgTable, text, serial, integer, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  age: integer("age").notNull(),
  country: text("country").notNull(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  profilePicUrl: text("profile_pic_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
}));

// Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
}));

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comment relations
export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// Likes table
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Like relations
export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

// Profiles table (for extended user info)
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Profile relations
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

// Schemas for insert operations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  age: true,
  country: true,
  phone: true,
  password: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  content: true,
  imageUrl: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  userId: true,
  postId: true,
  content: true,
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  userId: true,
  postId: true,
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  userId: true,
});

// Validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(280, "Maximum 280 characters"),
  imageUrl: z.string().optional().nullable(),
});

export const commentSchema = z.object({
  postId: z.number(),
  content: z.string().min(1, "Comment is required").max(280, "Maximum 280 characters"),
});

export const likeSchema = z.object({
  postId: z.number(),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().max(160, "Bio cannot exceed 160 characters").optional(),
  profilePicUrl: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likes.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type PostWithDetails = Post & {
  user: User;
  comments: Comment[];
  likes: Like[];
  _count: {
    comments: number;
    likes: number;
  };
  isLiked?: boolean;
};

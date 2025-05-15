import { Router, Request, Response } from "express";
import { db } from "./db";
import {
  posts,
  comments,
  likes,
  profiles,
  users,
  postSchema,
  commentSchema,
  likeSchema,
  profileUpdateSchema,
} from "@shared/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { ZodError } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
const postImagesDir = path.join(uploadsDir, "posts");
const profileImagesDir = path.join(uploadsDir, "profiles");

// Ensure directories exist
[uploadsDir, postImagesDir, profileImagesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination based on the route
    const dest = req.path.includes("profile-pic") ? profileImagesDir : postImagesDir;
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only images
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error("Only image files are allowed"));
  },
});

const api = Router();

// Middleware to ensure user is authenticated
const ensureAuthenticated = async (req: Request, res: Response, next: Function) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Get current authenticated user's info
api.get("/user", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session!.userId;
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      email: users.email,
      profilePicUrl: users.profilePicUrl,
      bio: users.bio,
      country: users.country,
      age: users.age,
    }).from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POSTS ROUTES

// Create a new post
api.post("/posts", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session!.userId;
    const { content, imageUrl } = postSchema.parse(req.body);

    const [newPost] = await db.insert(posts)
      .values({
        userId,
        content,
        imageUrl,
      })
      .returning();

    // Fetch the created post with user info
    const [postWithUser] = await db.select({
      id: posts.id,
      content: posts.content,
      imageUrl: posts.imageUrl,
      createdAt: posts.createdAt,
      userId: posts.userId,
      username: users.username,
      displayName: users.displayName,
      profilePicUrl: users.profilePicUrl,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.id, newPost.id));

    return res.status(201).json(postWithUser);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Invalid post data",
        errors: error.errors,
      });
    }
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get feed (most recent posts)
api.get("/feed", async (req, res) => {
  try {
    const userId = req.session?.userId; // Optional for non-authenticated users
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    // Get posts with user info and counts
    const results = await db.select({
      id: posts.id,
      content: posts.content,
      imageUrl: posts.imageUrl,
      createdAt: posts.createdAt,
      userId: posts.userId,
      username: users.username,
      displayName: users.displayName,
      profilePicUrl: users.profilePicUrl,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

    // Get comment counts for each post
    const postIds = results.map(post => post.id);
    
    // If no posts found, return empty array
    if (postIds.length === 0) {
      return res.json([]);
    }

    // Get comment counts
    const commentCounts = await db
      .select({
        postId: comments.postId,
        count: count().as('count'),
      })
      .from(comments)
      .where(sql`${comments.postId} IN (${postIds.join(',')})`)
      .groupBy(comments.postId);

    // Get like counts
    const likeCounts = await db
      .select({
        postId: likes.postId,
        count: count().as('count'),
      })
      .from(likes)
      .where(sql`${likes.postId} IN (${postIds.join(',')})`)
      .groupBy(likes.postId);

    // Get isLiked for authenticated user
    let userLikes: { postId: number }[] = [];
    if (userId) {
      userLikes = await db
        .select({
          postId: likes.postId,
        })
        .from(likes)
        .where(and(
          sql`${likes.postId} IN (${postIds.join(',')})`,
          eq(likes.userId, userId)
        ));
    }

    // Map the results to include counts
    const postsWithCounts = results.map(post => {
      const commentCount = commentCounts.find(c => c.postId === post.id)?.count || 0;
      const likeCount = likeCounts.find(l => l.postId === post.id)?.count || 0;
      const isLiked = userLikes.some(like => like.postId === post.id);

      return {
        ...post,
        commentCount,
        likeCount,
        isLiked,
      };
    });

    return res.json(postsWithCounts);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get user posts
api.get("/feed/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const userId = req.session?.userId; // Optional
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    // First, check if user exists
    const [userExists] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username));

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get posts with user info
    const results = await db.select({
      id: posts.id,
      content: posts.content,
      imageUrl: posts.imageUrl,
      createdAt: posts.createdAt,
      userId: posts.userId,
      username: users.username,
      displayName: users.displayName,
      profilePicUrl: users.profilePicUrl,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(users.username, username))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

    // Get comment counts for each post
    const postIds = results.map(post => post.id);
    
    // If no posts found, return empty array
    if (postIds.length === 0) {
      return res.json([]);
    }

    // Get comment counts
    const commentCounts = await db
      .select({
        postId: comments.postId,
        count: count().as('count'),
      })
      .from(comments)
      .where(sql`${comments.postId} IN (${postIds.join(',')})`)
      .groupBy(comments.postId);

    // Get like counts
    const likeCounts = await db
      .select({
        postId: likes.postId,
        count: count().as('count'),
      })
      .from(likes)
      .where(sql`${likes.postId} IN (${postIds.join(',')})`)
      .groupBy(likes.postId);

    // Get isLiked for authenticated user
    let userLikes: { postId: number }[] = [];
    if (userId) {
      userLikes = await db
        .select({
          postId: likes.postId,
        })
        .from(likes)
        .where(and(
          sql`${likes.postId} IN (${postIds.join(',')})`,
          eq(likes.userId, userId)
        ));
    }

    // Map the results to include counts
    const postsWithCounts = results.map(post => {
      const commentCount = commentCounts.find(c => c.postId === post.id)?.count || 0;
      const likeCount = likeCounts.find(l => l.postId === post.id)?.count || 0;
      const isLiked = userLikes.some(like => like.postId === post.id);

      return {
        ...post,
        commentCount,
        likeCount,
        isLiked,
      };
    });

    return res.json(postsWithCounts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get single post with details
api.get("/posts/:postId", async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.session?.userId; // Optional

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Get post with user info
    const [post] = await db.select({
      id: posts.id,
      content: posts.content,
      imageUrl: posts.imageUrl,
      createdAt: posts.createdAt,
      userId: posts.userId,
      username: users.username,
      displayName: users.displayName,
      profilePicUrl: users.profilePicUrl,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.id, postId));

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get comments for this post
    const postComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        userId: comments.userId,
        username: users.username,
        displayName: users.displayName,
        profilePicUrl: users.profilePicUrl,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    // Get like count
    const [likeCount] = await db
      .select({
        count: count().as('count'),
      })
      .from(likes)
      .where(eq(likes.postId, postId));

    // Check if current user liked this post
    let isLiked = false;
    if (userId) {
      const [userLike] = await db
        .select({ id: likes.id })
        .from(likes)
        .where(and(
          eq(likes.postId, postId),
          eq(likes.userId, userId)
        ));
      isLiked = !!userLike;
    }

    return res.json({
      ...post,
      comments: postComments,
      likeCount: likeCount?.count || 0,
      isLiked,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// COMMENTS ROUTES

// Add a comment to a post
api.post("/comments", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session!.userId;
    const { postId, content } = commentSchema.parse(req.body);

    // Check if post exists
    const [postExists] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId));

    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create the comment
    const [newComment] = await db.insert(comments)
      .values({
        postId,
        userId,
        content,
      })
      .returning();

    // Fetch the created comment with user info
    const [commentWithUser] = await db.select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      postId: comments.postId,
      userId: comments.userId,
      username: users.username,
      displayName: users.displayName,
      profilePicUrl: users.profilePicUrl,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.id, newComment.id));

    return res.status(201).json(commentWithUser);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Invalid comment data",
        errors: error.errors,
      });
    }
    console.error("Error creating comment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get comments for a post
api.get("/comments/:postId", async (req, res) => {
  try {
    const postId = Number(req.params.postId);

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Check if post exists
    const [postExists] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId));

    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get comments with user info
    const postComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        userId: comments.userId,
        username: users.username,
        displayName: users.displayName,
        profilePicUrl: users.profilePicUrl,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    return res.json(postComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// LIKES ROUTES

// Toggle like on a post
api.post("/likes", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session!.userId;
    const { postId } = likeSchema.parse(req.body);

    // Check if post exists
    const [postExists] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId));

    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already liked this post
    const [existingLike] = await db
      .select({ id: likes.id })
      .from(likes)
      .where(and(
        eq(likes.postId, postId),
        eq(likes.userId, userId)
      ));

    // If like exists, remove it (unlike)
    if (existingLike) {
      await db
        .delete(likes)
        .where(eq(likes.id, existingLike.id));
      
      return res.json({ liked: false });
    }

    // Otherwise, add the like
    await db.insert(likes)
      .values({
        postId,
        userId,
      });

    return res.json({ liked: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Invalid like data",
        errors: error.errors,
      });
    }
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get likes for a post
api.get("/likes/:postId", async (req, res) => {
  try {
    const postId = Number(req.params.postId);

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Check if post exists
    const [postExists] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId));

    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get like count
    const [likeCount] = await db
      .select({
        count: count().as('count'),
      })
      .from(likes)
      .where(eq(likes.postId, postId));

    // Get users who liked this post
    const likedUsers = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profilePicUrl: users.profilePicUrl,
      })
      .from(likes)
      .innerJoin(users, eq(likes.userId, users.id))
      .where(eq(likes.postId, postId))
      .limit(10); // Limit to 10 users for performance

    return res.json({
      count: likeCount?.count || 0,
      users: likedUsers,
    });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// PROFILE ROUTES

// Get user profile
api.get("/profile/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Get user info
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      email: users.email,
      profilePicUrl: users.profilePicUrl,
      bio: users.bio,
      country: users.country,
      age: users.age,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's profile stats
    const [profile] = await db
      .select({
        followersCount: profiles.followersCount,
        followingCount: profiles.followingCount,
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    // Get post count
    const [postCount] = await db
      .select({
        count: count().as('count'),
      })
      .from(posts)
      .where(eq(posts.userId, user.id));

    return res.json({
      ...user,
      followersCount: profile?.followersCount || 0,
      followingCount: profile?.followingCount || 0,
      postCount: postCount?.count || 0,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update user profile
api.post("/profile/update", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session!.userId;
    const { displayName, bio, profilePicUrl } = profileUpdateSchema.parse(req.body);

    // Update user info
    const [updatedUser] = await db
      .update(users)
      .set({
        displayName: displayName,
        bio: bio,
        profilePicUrl: profilePicUrl,
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        email: users.email,
        profilePicUrl: users.profilePicUrl,
        bio: users.bio,
      });

    return res.json(updatedUser);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Invalid profile data",
        errors: error.errors,
      });
    }
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// SEARCH ROUTES

// Search for users, posts
api.get("/search", async (req, res) => {
  try {
    const query = String(req.query.q || "");
    const type = String(req.query.type || "all"); // all, users, posts

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const results: { users?: any[], posts?: any[] } = {};

    // Search for users
    if (type === "all" || type === "users") {
      const users = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profilePicUrl: users.profilePicUrl,
          bio: users.bio,
        })
        .from(users)
        .where(sql`${users.username} ILIKE ${'%' + query + '%'} OR ${users.displayName} ILIKE ${'%' + query + '%'}`)
        .limit(10);

      results.users = users;
    }

    // Search for posts
    if (type === "all" || type === "posts") {
      const postsResults = await db
        .select({
          id: posts.id,
          content: posts.content,
          imageUrl: posts.imageUrl,
          createdAt: posts.createdAt,
          userId: posts.userId,
          username: users.username,
          displayName: users.displayName,
          profilePicUrl: users.profilePicUrl,
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(sql`${posts.content} ILIKE ${'%' + query + '%'}`)
        .orderBy(desc(posts.createdAt))
        .limit(10);

      results.posts = postsResults;
    }

    return res.json(results);
  } catch (error) {
    console.error("Error searching:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// FILE UPLOAD ROUTES

// Upload post image
api.post("/upload-post-image", ensureAuthenticated, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imagePath = `/uploads/posts/${req.file.filename}`;
    return res.json({ imageUrl: imagePath });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Upload profile picture
api.post("/upload-profile-pic", ensureAuthenticated, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imagePath = `/uploads/profiles/${req.file.filename}`;
    return res.json({ imageUrl: imagePath });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default api;
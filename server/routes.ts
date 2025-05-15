import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertProfileSchema } from "@shared/schema";
import { ZodError } from "zod";
import api from "./api";
import path from "path";
import { WebSocketServer } from "ws";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, profiles } from "@shared/schema";
import { log } from "./vite";

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Static files for uploads
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Register API routes
  app.use("/api", api);

  // User signup
  app.post("/api/signup", async (req, res) => {
    try {
      // Validate input data
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Create profile for the user
      await db.insert(profiles)
        .values({
          userId: user.id,
        });
      
      // Set session
      if (req.session) {
        req.session.userId = user.id;
        req.session.username = user.username;
      }
      
      // Return successful response without password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json({ 
        message: "User created successfully", 
        user: userWithoutPassword 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      console.error("Signup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // User login
  app.post("/api/login", async (req, res) => {
    try {
      // Validate input data
      const loginData = loginSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByUsername(loginData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // In a real app, we would use a proper password hashing mechanism
      if (user.password !== loginData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set session
      if (req.session) {
        req.session.userId = user.id;
        req.session.username = user.username;
      }
      
      // Ensure user has a profile
      const [existingProfile] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.userId, user.id));
      
      if (!existingProfile) {
        // Create profile if it doesn't exist
        await db.insert(profiles)
          .values({
            userId: user.id,
          });
      }
      
      // Return successful response without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({ 
        message: "Login successful", 
        user: userWithoutPassword 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Check authentication status
  app.get("/api/auth/status", (req, res) => {
    if (req.session && req.session.userId) {
      return res.json({ authenticated: true, userId: req.session.userId, username: req.session.username });
    }
    return res.json({ authenticated: false });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket Server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    log("WebSocket connection established");

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        log(`Received message: ${JSON.stringify(data)}`);
        
        // Broadcast message to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify({
              type: 'update',
              data
            }));
          }
        });
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on('close', () => {
      log("WebSocket connection closed");
    });
  });

  // Handle errors
  wss.on('error', (error) => {
    console.error("WebSocket server error:", error);
  });

  return httpServer;
}

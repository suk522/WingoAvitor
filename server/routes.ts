import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGameHistorySchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

// Extend the session to include our custom properties
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

// Session setup
const PgStore = connectPgSimple(session);
const sessionMiddleware = session({
  store: new PgStore({
    conString: process.env.DATABASE_URL || "",
    tableName: 'session',
    createTableIfMissing: true,
    ssl: { rejectUnauthorized: false }
  }),
  secret: process.env.SESSION_SECRET || 'bc99_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
});

// Auth middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database
  await storage.initializeDatabase();
  
  // Add session middleware
  app.use(sessionMiddleware);
  
  // API Routes
  
  // Register user
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: 'Invalid input data' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // Create user
      const user = await storage.createUser(result.data);
      
      // Set session
      req.session.userId = user.id;
      
      // Return user (without password)
      const { password, ...userData } = user;
      res.status(201).json(userData);
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Login user
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      // Get user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Check password
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user (without password)
      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Logout user
  app.post('/api/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Get current user
  app.get('/api/user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId as number);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user (without password)
      const { password, ...userData } = user;
      res.json(userData);
    } catch (err) {
      console.error('User fetch error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get all games
  app.get('/api/games', async (_req: Request, res: Response) => {
    try {
      const games = await storage.getAllGames();
      res.json(games);
    } catch (err) {
      console.error('Games fetch error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Play a game
  app.post('/api/play', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { gameId, betAmount } = req.body;
      const userId = req.session.userId as number;
      
      // Validate input
      if (!gameId || !betAmount || betAmount <= 0) {
        return res.status(400).json({ message: 'Invalid game parameters' });
      }
      
      // Get user for balance check
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if user has enough balance
      if (parseFloat(user.balance.toString()) < betAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      // Simple game logic - random win/loss
      const isWin = Math.random() > 0.5;
      const winAmount = isWin ? betAmount * 2 : 0;
      const balanceChange = winAmount - betAmount;
      
      // Update user balance
      const updatedUser = await storage.updateUserBalance(userId, balanceChange);
      if (!updatedUser) {
        return res.status(500).json({ message: 'Failed to update balance' });
      }
      
      // Record game play
      await storage.recordGamePlay({
        user_id: userId,
        game_id: gameId,
        bet_amount: betAmount.toString(),
        win_amount: winAmount.toString()
      });
      
      // Return result
      res.json({
        success: true,
        isWin,
        winAmount,
        newBalance: updatedUser.balance,
        message: isWin ? 'Congratulations! You won!' : 'Better luck next time!'
      });
    } catch (err) {
      console.error('Game play error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get game history
  app.get('/api/history', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const history = await storage.getGameHistory(userId);
      res.json(history);
    } catch (err) {
      console.error('History fetch error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Admin routes
  
  // Middleware to check if user is admin
  async function isAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.is_admin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    next();
  }
  
  // Get all users (admin only)
  app.get('/api/admin/users', isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error('Admin users fetch error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Update user balance (admin only)
  app.post('/api/admin/users/:id/balance', isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { amount } = req.body;
      
      if (isNaN(userId) || typeof amount !== 'number') {
        return res.status(400).json({ message: 'Invalid input data' });
      }
      
      const user = await storage.updateUserBalance(userId, amount);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password, ...userData } = user;
      res.json(userData);
    } catch (err) {
      console.error('Admin balance update error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Ban/unban user (admin only)
  app.post('/api/admin/users/:id/ban', isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { banned } = req.body;
      
      if (isNaN(userId) || typeof banned !== 'boolean') {
        return res.status(400).json({ message: 'Invalid input data' });
      }
      
      const user = await storage.updateUserBanStatus(userId, banned);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password, ...userData } = user;
      res.json(userData);
    } catch (err) {
      console.error('Admin ban user error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get specific user's game history (admin only)
  app.get('/api/admin/users/:id/history', isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const history = await storage.getGameHistory(userId);
      res.json(history);
    } catch (err) {
      console.error('Admin history fetch error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

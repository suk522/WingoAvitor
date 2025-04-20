import { users, games, gameHistory, type User, type InsertUser, type Game, type InsertGame, type GameHistory, type InsertGameHistory } from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, desc } from "drizzle-orm";
import postgres from "postgres";
import bcrypt from "bcryptjs";

// Create PostgreSQL client
const connectionString = process.env.DATABASE_URL || "";
const client = postgres(connectionString, { 
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(client);

// Interface for our database operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, amount: number): Promise<User | undefined>;
  updateUserBanStatus(userId: number, banned: boolean): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getAllGames(): Promise<Game[]>;
  recordGamePlay(gamePlay: InsertGameHistory): Promise<GameHistory>;
  getGameHistory(userId: number): Promise<(GameHistory & { game_name: string })[]>;
  initializeDatabase(): Promise<void>;
}

// PostgreSQL implementation of IStorage
export class PgStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  // Generate a unique 5-digit UID
  async generateUID(): Promise<string> {
    let uid = '';
    let isUnique = false;
    
    while (!isUnique) {
      // Generate a random 5-digit number
      uid = Math.floor(10000 + Math.random() * 90000).toString();
      
      // Check if it's unique
      const existingUsers = await db.select().from(users).where(eq(users.uid, uid));
      
      if (existingUsers.length === 0) {
        isUnique = true;
      }
    }
    
    return uid;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing it
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    // Generate unique UID
    const uid = await this.generateUID();
    
    // Insert user with generated UID
    const result = await db.insert(users).values({
      uid,
      username: insertUser.username,
      password: hashedPassword,
      mobile: insertUser.mobile,
    }).returning();
    
    return result[0];
  }

  async updateUserBalance(userId: number, amount: number): Promise<User | undefined> {
    // First get current user to calculate new balance
    const currentUser = await this.getUser(userId);
    if (!currentUser) return undefined;
    
    // Calculate new balance (we need to parse string to number for calculation)
    const currentBalance = parseFloat(currentUser.balance.toString());
    const newBalance = currentBalance + amount;
    
    // Update user balance
    const result = await db
      .update(users)
      .set({ balance: newBalance.toString() })
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
  }
  
  async updateUserBanStatus(userId: number, banned: boolean): Promise<User | undefined> {
    // First check if user exists
    const currentUser = await this.getUser(userId);
    if (!currentUser) return undefined;
    
    // Update user ban status
    const result = await db
      .update(users)
      .set({ is_banned: banned })
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
  }
  
  async getAllUsers(): Promise<User[]> {
    // Return all users, sorted by ID
    return await db.select().from(users).orderBy(users.id);
  }

  async getAllGames(): Promise<Game[]> {
    return await db.select().from(games);
  }

  async recordGamePlay(gamePlay: InsertGameHistory): Promise<GameHistory> {
    const result = await db.insert(gameHistory).values(gamePlay).returning();
    return result[0];
  }

  async getGameHistory(userId: number): Promise<(GameHistory & { game_name: string })[]> {
    // Join gameHistory and games tables
    const result = await db
      .select({
        ...gameHistory,
        game_name: games.name
      })
      .from(gameHistory)
      .innerJoin(games, eq(gameHistory.game_id, games.id))
      .where(eq(gameHistory.user_id, userId))
      .orderBy(desc(gameHistory.played_at));
    
    return result;
  }

  async initializeDatabase(): Promise<void> {
    // Check if games table has entries
    const existingGames = await db.select().from(games);
    
    // If no games exist, insert the initial game data
    if (existingGames.length === 0) {
      await db.insert(games).values([
        { name: 'BC99 Wingo', image_path: 'attached_assets/wingo.png' },
        { name: 'BC99 Aviator', image_path: 'attached_assets/avaitor.png' },
        { name: 'BC99 Slots', image_path: 'attached_assets/slots.png' }
      ]);
      console.log('Initial game data inserted');
    }
  }
}

export const storage = new PgStorage();

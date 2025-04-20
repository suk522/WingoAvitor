
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from "bcryptjs";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("bc99");

// Test the connection
client.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Collection
const usersCollection = db.collection('users');

// Generate unique UID
async function generateUID(): Promise<string> {
  while (true) {
    const uid = Math.floor(10000 + Math.random() * 90000).toString();
    const exists = await usersCollection.findOne({ uid });
    if (!exists) return uid;
  }
}

// Interface definitions
export interface User {
  id: number;
  uid: string;
  username: string;
  password: string;
  balance: string;
  mobile: string;
  is_admin: boolean;
  is_banned: boolean;
  created_at: Date;
}

export interface Game {
  id: number;
  name: string;
  image_path: string;
}

export interface GameHistory {
  id: number;
  user_id: number;
  game_id: number;
  bet_amount: string;
  win_amount: string;
  played_at: Date;
}

export interface IStorage {
  initializeDatabase(): Promise<void>;
  createUser(user: { username: string; password: string; mobile: string }): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  updateUserBalance(userId: number, amount: number): Promise<User | undefined>;
  updateUserBanStatus(userId: number, banned: boolean): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getAllGames(): Promise<Game[]>;
  recordGamePlay(gamePlay: { user_id: number; game_id: number; bet_amount: string; win_amount: string }): Promise<GameHistory>;
  getGameHistory(userId: number): Promise<(GameHistory & { game_name: string })[]>;
}

export class MongoStorage implements IStorage {
  async initializeDatabase(): Promise<void> {
    const gamesCount = await db.collection('games').countDocuments();
    if (gamesCount === 0) {
      await db.collection('games').insertMany([
        { name: 'BC99 Wingo', image_path: 'attached_assets/wingo.png' },
        { name: 'BC99 Aviator', image_path: 'attached_assets/avaitor.png' },
        { name: 'BC99 Slots', image_path: 'attached_assets/slots.png' }
      ]);
    }
  }

  async generateUID(): Promise<string> {
    while (true) {
      const uid = Math.floor(10000 + Math.random() * 90000).toString();
      const exists = await db.collection('users').findOne({ uid });
      if (!exists) return uid;
    }
  }

  async createUser(userData: { username: string; password: string; mobile: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const uid = await generateUID();
    
    const user = {
      uid,
      username: userData.username,
      password: hashedPassword,
      balance: "1000.00",
      mobile: userData.mobile,
      is_admin: false,
      is_banned: false,
      created_at: new Date()
    };
    
    const result = await usersCollection.insertOne(user);
    return { id: result.insertedId as unknown as number, ...user };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await usersCollection.findOne({ username });
    if (!user) return undefined;
    
    return { 
      id: user._id as unknown as number,
      uid: user.uid,
      username: user.username,
      password: user.password,
      balance: user.balance,
      mobile: user.mobile,
      is_admin: user.is_admin,
      is_banned: user.is_banned,
      created_at: user.created_at
    };
  }

  async getUserById(id: number): Promise<User | undefined> {
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    return user ? { id: user._id as unknown as number, ...user } : undefined;
  }

  async updateUserBalance(userId: number, amount: number): Promise<User | undefined> {
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $inc: { balance: amount.toString() } },
      { returnDocument: 'after' }
    );
    return result ? { id: result._id as unknown as number, ...result } : undefined;
  }

  async updateUserBanStatus(userId: number, banned: boolean): Promise<User | undefined> {
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { is_banned: banned } },
      { returnDocument: 'after' }
    );
    return result ? { id: result._id as unknown as number, ...result } : undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await db.collection('users').find().toArray();
    return users.map(user => ({ id: user._id as unknown as number, ...user }));
  }

  async getAllGames(): Promise<Game[]> {
    const games = await db.collection('games').find().toArray();
    return games.map(game => ({ id: game._id as unknown as number, ...game }));
  }

  async recordGamePlay(gamePlay: { user_id: number; game_id: number; bet_amount: string; win_amount: string }): Promise<GameHistory> {
    const history = {
      ...gamePlay,
      played_at: new Date()
    };
    const result = await db.collection('game_history').insertOne(history);
    return { id: result.insertedId as unknown as number, ...history };
  }

  async getGameHistory(userId: number): Promise<(GameHistory & { game_name: string })[]> {
    const history = await db.collection('game_history')
      .aggregate([
        { $match: { user_id: userId } },
        { $lookup: {
          from: 'games',
          localField: 'game_id',
          foreignField: '_id',
          as: 'game'
        }},
        { $unwind: '$game' },
        { $project: {
          id: '$_id',
          user_id: 1,
          game_id: 1,
          bet_amount: 1,
          win_amount: 1,
          played_at: 1,
          game_name: '$game.name'
        }},
        { $sort: { played_at: -1 } },
        { $limit: 20 }
      ]).toArray();
    
    return history;
  }
}

export const storage = new MongoStorage();

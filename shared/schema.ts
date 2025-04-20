import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  mobile: text("mobile").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("1000.00").notNull(),
  is_admin: boolean("is_admin").default(false).notNull(),
  is_banned: boolean("is_banned").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image_path: text("image_path").notNull(),
});

export const gameHistory = pgTable("game_history", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  game_id: integer("game_id").references(() => games.id),
  bet_amount: decimal("bet_amount", { precision: 10, scale: 2 }).notNull(),
  win_amount: decimal("win_amount", { precision: 10, scale: 2 }).notNull(),
  played_at: timestamp("played_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  mobile: true,
});

export const insertGameSchema = createInsertSchema(games);

export const insertGameHistorySchema = createInsertSchema(gameHistory).omit({
  id: true,
  played_at: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertGameHistory = z.infer<typeof insertGameHistorySchema>;
export type GameHistory = typeof gameHistory.$inferSelect;

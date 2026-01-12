import { pgTable, text, serial, integer, boolean, timestamp, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

export * from "./models/auth";

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  currentStreak: integer("current_streak").default(0),
  maxStreak: integer("max_streak").default(0),
  totalWins: integer("total_wins").default(0),
  totalPlayed: integer("total_played").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  sector: text("sector").notNull(),
  subIndustry: text("sub_industry").notNull(),
  headquarters: text("headquarters").notNull(),
  founded: text("founded").notNull(),
  description: text("description").notNull(),
  marketCap: text("market_cap").notNull(), // e.g., "$3.2T", "$542B"
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'daily' | 'endless' | 'custom'
  targetCompanyId: integer("target_company_id").references(() => companies.id).notNull(),
  date: date("date"), // For daily games
  status: text("status").notNull().default("playing"), // 'playing' | 'won' | 'lost'
  score: integer("score").default(0),
  filters: text("filters"), // JSON string of CustomGameFilters for custom games
  createdAt: timestamp("created_at").defaultNow(),
});

export const guesses = pgTable("guesses", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  companyId: integer("company_id").references(() => companies.id), // The guessed company (NULL for skips)
  roundNumber: integer("round_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily challenge - one company per day for all players
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(), // The date of this challenge
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  user: one(users, {
    fields: [games.userId],
    references: [users.id],
  }),
  targetCompany: one(companies, {
    fields: [games.targetCompanyId],
    references: [companies.id],
  }),
  guesses: many(guesses),
}));

export const guessesRelations = relations(guesses, ({ one }) => ({
  game: one(games, {
    fields: [guesses.gameId],
    references: [games.id],
  }),
  company: one(companies, {
    fields: [guesses.companyId],
    references: [companies.id],
  }),
}));

export const dailyChallengesRelations = relations(dailyChallenges, ({ one }) => ({
  company: one(companies, {
    fields: [dailyChallenges.companyId],
    references: [companies.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserStatsSchema = createInsertSchema(userStats).omit({ id: true, updatedAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true });
export const insertGameSchema = createInsertSchema(games).omit({ id: true, createdAt: true });
export const insertGuessSchema = createInsertSchema(guesses).omit({ id: true, createdAt: true });
export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type UserStats = typeof userStats.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Guess = typeof guesses.$inferSelect;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;

export type CustomGameFilters = {
  marketCaps?: string[];
  sectors?: string[];
  subIndustries?: string[];
  filterMode?: 'and' | 'or';
};

export type CreateGameRequest = {
  type: 'daily' | 'endless' | 'custom';
  filters?: CustomGameFilters;
  difficulty?: 'easy' | 'hard'; // For endless mode only
};

// Easy mode includes ~100 recognizable, well-known companies
export const EASY_MODE_SYMBOLS = new Set([
  // Tech Giants
  "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "NFLX", "ORCL", "CRM",
  "ADBE", "CSCO", "INTC", "AMD", "IBM", "PYPL", "UBER", "ABNB", "SPOT", "SNAP", "AVGO",
  // Finance & Banking
  "JPM", "BAC", "WFC", "GS", "MS", "V", "MA", "AXP", "BLK", "C",
  // Retail & Consumer
  "WMT", "COST", "TGT", "HD", "LOW", "NKE", "SBUX", "MCD", "YUM", "CMG",
  "DG", "DLTR", "TJX", "ROST", "BBY",
  // Entertainment & Media
  "DIS", "CMCSA", "T", "VZ", "PARA", "WBD", "EA", "TTWO", "RBLX",
  // Healthcare & Pharma
  "JNJ", "PFE", "MRK", "ABBV", "LLY", "UNH", "CVS", "WBA", "CI",
  // Consumer Products
  "PG", "KO", "PEP", "PM", "MO", "CL", "KHC", "MDLZ", "GIS", "K", "KDP", "LULU",
  // Auto & Transport
  "F", "GM", "DAL", "UAL", "AAL", "LUV", "FDX", "UPS",
  // Energy
  "XOM", "CVX", "COP", "OXY",
  // Industrial & Manufacturing
  "BA", "CAT", "DE", "GE", "HON", "MMM", "LMT", "RTX",
  // Conglomerates
  "BRK.B",
  // Hotels & Travel
  "MAR", "HLT", "H", "EXPE", "BKNG",
]);

export type SubmitGuessRequest = {
  companySymbol: string;
};

export type GameStateResponse = {
  id: number;
  type: 'daily' | 'endless' | 'custom';
  status: 'playing' | 'won' | 'lost';
  round: number;
  endlessStreak?: number; // Current endless mode streak for the user
  clues: {
    category?: string;
    subIndustry?: string;
    marketCap?: string;
    headquarters?: string;
    founded?: string;
    firstLetter?: string;
    description?: string;
  };
  guesses: {
    symbol: string;
    name: string;
  }[];
  skippedRounds?: number[];
  score: number;
  targetCompany?: Company; // Revealed only when game ends
};

export type LeaderboardEntry = {
  username: string;
  score: number;
};

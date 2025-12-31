import { db } from "./db";
import {
  users, userStats, companies, games, guesses,
  type User, type UserStats, type Company, type Game, type Guess,
  type CreateGameRequest, type GameStateResponse
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User Stats
  getUserStats(userId: string): Promise<UserStats | undefined>;
  updateUserStats(userId: string, stats: Partial<UserStats>): Promise<UserStats>;
  getLeaderboard(): Promise<{ username: string, score: number }[]>;

  // Companies
  searchCompanies(query: string): Promise<Company[]>;
  getCompanyBySymbol(symbol: string): Promise<Company | undefined>;
  getCompany(id: number): Promise<Company | undefined>;
  getRandomCompany(): Promise<Company>;
  
  // Games
  createGame(userId: string, type: 'daily' | 'endless', targetCompanyId: number): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  getDailyGame(userId: string, date: string): Promise<Game | undefined>;
  updateGameStatus(id: number, status: 'won' | 'lost', score?: number): Promise<Game>;
  
  // Guesses
  addGuess(gameId: number, companyId: number, roundNumber: number): Promise<Guess>;
  getGuesses(gameId: number): Promise<(Guess & { company: Company })[]>;
  
  // Helpers
  seedCompanies(companies: any[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats;
  }

  async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<UserStats> {
    const [updated] = await db.insert(userStats)
      .values({ userId, ...stats })
      .onConflictDoUpdate({
        target: userStats.userId,
        set: { ...stats, updatedAt: new Date() }
      })
      .returning();
    return updated;
  }

  async getLeaderboard(): Promise<{ username: string, score: number }[]> {
    const results = await db.select({
      username: users.email, // Using email as username for now, ideally firstName/lastName or a username field
      score: userStats.totalWins
    })
    .from(userStats)
    .innerJoin(users, eq(userStats.userId, users.id))
    .orderBy(desc(userStats.totalWins))
    .limit(10);

    return results.map(r => ({
      username: r.username?.split('@')[0] || 'Anonymous',
      score: r.score || 0
    }));
  }

  async searchCompanies(query: string): Promise<Company[]> {
    return await db.select()
      .from(companies)
      .where(sql`lower(${companies.name}) LIKE ${`%${query.toLowerCase()}%`} OR lower(${companies.symbol}) LIKE ${`%${query.toLowerCase()}%`}`)
      .limit(500);
  }

  async getCompanyBySymbol(symbol: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.symbol, symbol.trim().toUpperCase()));
    return company;
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getRandomCompany(): Promise<Company> {
    const [company] = await db.select().from(companies).orderBy(sql`RANDOM()`).limit(1);
    return company;
  }

  async createGame(userId: string, type: 'daily' | 'endless', targetCompanyId: number): Promise<Game> {
    const [game] = await db.insert(games).values({
      userId,
      type,
      targetCompanyId,
      date: type === 'daily' ? new Date().toISOString().split('T')[0] : null,
      status: 'playing',
      score: 0
    }).returning();
    return game;
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async getDailyGame(userId: string, date: string): Promise<Game | undefined> {
    const [game] = await db.select()
      .from(games)
      .where(and(
        eq(games.userId, userId),
        eq(games.type, 'daily'),
        eq(games.date, date)
      ));
    return game;
  }

  async updateGameStatus(id: number, status: 'won' | 'lost', score?: number): Promise<Game> {
    const [game] = await db.update(games)
      .set({ status, score: score || 0 })
      .where(eq(games.id, id))
      .returning();
    return game;
  }

  async addGuess(gameId: number, companyId: number, roundNumber: number): Promise<Guess> {
    const [guess] = await db.insert(guesses).values({
      gameId,
      companyId,
      roundNumber
    }).returning();
    return guess;
  }

  async getGuesses(gameId: number): Promise<(Guess & { company?: Company })[]> {
    const result = await db.select({
      guess: guesses,
      company: companies
    })
    .from(guesses)
    .leftJoin(companies, eq(guesses.companyId, companies.id))
    .where(eq(guesses.gameId, gameId))
    .orderBy(guesses.roundNumber);

    return result.map(r => ({ ...r.guess, company: r.company || undefined }));
  }

  async seedCompanies(data: any[]): Promise<void> {
    const existing = await db.select({ count: sql`count(*)` }).from(companies);
    if (Number(existing[0].count) === 0) {
      await db.insert(companies).values(data);
    }
  }
}

export const storage = new DatabaseStorage();

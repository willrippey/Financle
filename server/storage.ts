import { db } from "./db";
import {
  users, userStats, companies, games, guesses,
  type User, type UserStats, type Company, type Game, type Guess,
  type CreateGameRequest, type GameStateResponse, type CustomGameFilters
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
  getRandomCompany(filters?: CustomGameFilters): Promise<Company | undefined>;
  getAvailableFilters(): Promise<{ marketCaps: string[]; sectors: string[]; subIndustries: string[] }>;
  
  // Games
  createGame(userId: string, type: 'daily' | 'endless' | 'custom', targetCompanyId: number): Promise<Game>;
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
      .where(sql`lower(${companies.name}) LIKE ${`${query.toLowerCase()}%`} OR lower(${companies.symbol}) LIKE ${`${query.toLowerCase()}%`}`)
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

  async getRandomCompany(filters?: CustomGameFilters): Promise<Company | undefined> {
    let conditions: any[] = [];
    
    if (filters?.marketCaps && filters.marketCaps.length > 0) {
      conditions.push(sql`${companies.marketCap} IN ${filters.marketCaps}`);
    }
    if (filters?.sectors && filters.sectors.length > 0) {
      conditions.push(sql`${companies.sector} IN ${filters.sectors}`);
    }
    if (filters?.subIndustries && filters.subIndustries.length > 0) {
      conditions.push(sql`${companies.subIndustry} IN ${filters.subIndustries}`);
    }
    
    let query = db.select().from(companies);
    
    if (conditions.length > 0) {
      const whereClause = conditions.reduce((acc, cond, idx) => 
        idx === 0 ? cond : sql`${acc} AND ${cond}`
      );
      query = query.where(whereClause) as any;
    }
    
    const [company] = await query.orderBy(sql`RANDOM()`).limit(1);
    return company;
  }

  async getAvailableFilters(): Promise<{ marketCaps: string[]; sectors: string[]; subIndustries: string[] }> {
    const marketCapsResult = await db.selectDistinct({ value: companies.marketCap }).from(companies).orderBy(companies.marketCap);
    const sectorsResult = await db.selectDistinct({ value: companies.sector }).from(companies).orderBy(companies.sector);
    const subIndustriesResult = await db.selectDistinct({ value: companies.subIndustry }).from(companies).orderBy(companies.subIndustry);
    
    return {
      marketCaps: marketCapsResult.map(r => r.value).filter(v => v.trim() !== ''),
      sectors: sectorsResult.map(r => r.value).filter(v => v.trim() !== ''),
      subIndustries: subIndustriesResult.map(r => r.value).filter(v => v.trim() !== ''),
    };
  }

  async createGame(userId: string, type: 'daily' | 'endless' | 'custom', targetCompanyId: number): Promise<Game> {
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

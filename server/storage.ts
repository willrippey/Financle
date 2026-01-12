import { db } from "./db";
import {
  users, userStats, companies, games, guesses, dailyChallenges,
  type User, type UserStats, type Company, type Game, type Guess, type DailyChallenge,
  type CreateGameRequest, type GameStateResponse, type CustomGameFilters,
  EASY_MODE_SYMBOLS
} from "@shared/schema";
import { eq, and, desc, sql, inArray, notInArray } from "drizzle-orm";

export interface IStorage {
  // User Stats
  getUserStats(userId: string): Promise<UserStats | undefined>;
  updateUserStats(userId: string, stats: Partial<UserStats>): Promise<UserStats>;
  getLeaderboard(): Promise<{ username: string, score: number }[]>;

  // Companies
  searchCompanies(query: string): Promise<Company[]>;
  getCompanyBySymbol(symbol: string): Promise<Company | undefined>;
  getCompany(id: number): Promise<Company | undefined>;
  getRandomCompany(filters?: CustomGameFilters, difficulty?: 'easy' | 'hard'): Promise<Company | undefined>;
  getAvailableFilters(): Promise<{ marketCaps: string[]; sectors: string[]; subIndustries: string[] }>;
  
  // Games
  createGame(userId: string, type: 'daily' | 'endless' | 'custom', targetCompanyId: number): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  getDailyGame(userId: string, date: string): Promise<Game | undefined>;
  updateGameStatus(id: number, status: 'won' | 'lost', score?: number): Promise<Game>;
  
  // Guesses
  addGuess(gameId: number, companyId: number, roundNumber: number): Promise<Guess>;
  getGuesses(gameId: number): Promise<(Guess & { company: Company })[]>;
  
  // Daily Challenges
  getOrCreateDailyChallenge(date: string): Promise<Company>;
  
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

  async getRandomCompany(filters?: CustomGameFilters, difficulty?: 'easy' | 'hard'): Promise<Company | undefined> {
    let conditions: any[] = [];
    const useOrLogic = filters?.filterMode === 'or';
    
    if (filters?.marketCaps && filters.marketCaps.length > 0) {
      conditions.push(sql`${companies.marketCap} IN ${filters.marketCaps}`);
    }
    if (filters?.sectors && filters.sectors.length > 0) {
      conditions.push(sql`${companies.sector} IN ${filters.sectors}`);
    }
    if (filters?.subIndustries && filters.subIndustries.length > 0) {
      conditions.push(sql`${companies.subIndustry} IN ${filters.subIndustries}`);
    }
    
    // For easy mode, only include well-known companies
    if (difficulty === 'easy') {
      const easySymbols = Array.from(EASY_MODE_SYMBOLS);
      conditions.push(inArray(companies.symbol, easySymbols));
    }
    
    let query = db.select().from(companies);
    
    if (conditions.length > 0) {
      // For easy mode with other filters, use AND logic to combine easy filter with other conditions
      const whereClause = conditions.reduce((acc, cond, idx) => 
        idx === 0 ? cond : (useOrLogic && !difficulty ? sql`${acc} OR ${cond}` : sql`${acc} AND ${cond}`)
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

  async createGame(userId: string, type: 'daily' | 'endless' | 'custom', targetCompanyId: number, filters?: CustomGameFilters): Promise<Game> {
    const [game] = await db.insert(games).values({
      userId,
      type,
      targetCompanyId,
      date: type === 'daily' ? new Date().toISOString().split('T')[0] : null,
      status: 'playing',
      score: 0,
      filters: filters ? JSON.stringify(filters) : null
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

  async getOrCreateDailyChallenge(date: string): Promise<Company> {
    // Check if we already have a challenge for this date
    const [existing] = await db.select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.date, date));
    
    if (existing) {
      const company = await this.getCompany(existing.companyId);
      if (company) return company;
    }
    
    // Get all company IDs that have been used in recent challenges
    // We want to avoid repeats for 500 days (full rotation through all companies)
    const usedChallenges = await db.select({ companyId: dailyChallenges.companyId })
      .from(dailyChallenges)
      .orderBy(desc(dailyChallenges.date))
      .limit(500);
    
    const usedCompanyIds = usedChallenges.map(c => c.companyId);
    
    // Select a random company that hasn't been used recently
    let query = db.select().from(companies);
    
    if (usedCompanyIds.length > 0) {
      query = query.where(notInArray(companies.id, usedCompanyIds)) as any;
    }
    
    let [selectedCompany] = await query.orderBy(sql`RANDOM()`).limit(1);
    
    // If all companies have been used (full rotation), start fresh with any company
    if (!selectedCompany) {
      [selectedCompany] = await db.select().from(companies).orderBy(sql`RANDOM()`).limit(1);
    }
    
    // Create the daily challenge record (handle race condition with unique constraint)
    try {
      await db.insert(dailyChallenges).values({
        date,
        companyId: selectedCompany.id
      });
    } catch (err: any) {
      // If another request already created the challenge, fetch and use that one
      if (err.code === '23505') { // Unique constraint violation
        const [created] = await db.select()
          .from(dailyChallenges)
          .where(eq(dailyChallenges.date, date));
        if (created) {
          const company = await this.getCompany(created.companyId);
          if (company) return company;
        }
      }
      throw err;
    }
    
    return selectedCompany;
  }

  async seedCompanies(data: any[]): Promise<void> {
    const existing = await db.select({ count: sql`count(*)` }).from(companies);
    if (Number(existing[0].count) === 0) {
      await db.insert(companies).values(data);
    }
  }
}

export const storage = new DatabaseStorage();

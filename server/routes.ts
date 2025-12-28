import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const COMPANIES_SEED = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Information Technology", subIndustry: "Technology Hardware, Storage & Peripherals", headquarters: "Cupertino, California", founded: "1976", description: "Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.", marketCap: "$3.2T" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Information Technology", subIndustry: "Systems Software", headquarters: "Redmond, Washington", founded: "1975", description: "Develops, licenses, and supports software, services, devices, and solutions.", marketCap: "$3.1T" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Communication Services", subIndustry: "Interactive Media & Services", headquarters: "Mountain View, California", founded: "1998", description: "A multinational technology company specializing in Internet-related services and products.", marketCap: "$2.1T" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Discretionary", subIndustry: "Broadline Retail", headquarters: "Seattle, Washington", founded: "1994", description: "E-commerce, cloud computing, digital streaming, and artificial intelligence.", marketCap: "$2.3T" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Information Technology", subIndustry: "Semiconductors", headquarters: "Santa Clara, California", founded: "1993", description: "Designs graphics processing units for gaming and professional markets, as well as system on chip units.", marketCap: "$3.5T" },
  { symbol: "META", name: "Meta Platforms, Inc.", sector: "Communication Services", subIndustry: "Interactive Media & Services", headquarters: "Menlo Park, California", founded: "2004", description: "Builds technologies that help people connect, find communities, and grow businesses.", marketCap: "$1.6T" },
  { symbol: "TSLA", name: "Tesla, Inc.", sector: "Consumer Discretionary", subIndustry: "Automobile Manufacturers", headquarters: "Austin, Texas", founded: "2003", description: "Designs and manufactures electric vehicles, battery energy storage from home to grid-scale, solar panels and solar roof tiles.", marketCap: "$900B" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", sector: "Financials", subIndustry: "Multi-Sector Holdings", headquarters: "Omaha, Nebraska", founded: "1839", description: "A multinational conglomerate holding company owning a diverse range of businesses.", marketCap: "$1.0T" },
  { symbol: "V", name: "Visa Inc.", sector: "Financials", subIndustry: "Transaction & Payment Processing Services", headquarters: "San Francisco, California", founded: "1958", description: "Facilitates electronic funds transfers throughout the world.", marketCap: "$680B" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financials", subIndustry: "Diversified Banks", headquarters: "New York, New York", founded: "2000", description: "A multinational finance and insurance corporation.", marketCap: "$580B" },
  { symbol: "AFL", name: "Aflac Incorporated", sector: "Financials", subIndustry: "Insurance", headquarters: "Columbus, Ohio", founded: "1955", description: "A global insurance company providing supplemental health and life insurance products.", marketCap: "$45B" }
];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  // registerAuthRoutes(app); // Already handled in setupAuth or via separate file? Replit Auth blueprint puts registerAuthRoutes in index.ts usually
  const { registerAuthRoutes } = await import("./replit_integrations/auth");
  registerAuthRoutes(app);

  // Seed DB
  await storage.seedCompanies(COMPANIES_SEED);

  app.get(api.companies.search.path, async (req, res) => {
    const q = req.query.q as string;
    if (!q) return res.json([]);
    const results = await storage.searchCompanies(q);
    res.json(results.map(c => ({ symbol: c.symbol, name: c.name })));
  });

  app.get(api.games.daily.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const today = new Date().toISOString().split('T')[0];
    
    let game = await storage.getDailyGame(userId, today);
    if (!game) {
      const target = await storage.getRandomCompany();
      game = await storage.createGame(userId, 'daily', target.id);
    }
    
    const response = await buildGameState(game);
    res.json(response);
  });

  app.post(api.games.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const { type } = req.body;
    
    if (type === 'daily') {
       return res.status(400).json({ message: "Use get daily endpoint" });
    }

    const target = await storage.getRandomCompany();
    const game = await storage.createGame(userId, 'endless', target.id);
    const response = await buildGameState(game);
    res.status(201).json(response);
  });

  app.get(api.games.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const game = await storage.getGame(Number(req.params.id));
    if (!game || game.userId !== (req.user as any).claims.sub) return res.sendStatus(404);
    
    const response = await buildGameState(game);
    res.json(response);
  });

  app.post(api.games.guess.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { companySymbol } = req.body;
    const gameId = Number(req.params.id);
    const userId = (req.user as any).claims.sub;
    
    let game = await storage.getGame(gameId);
    if (!game || game.userId !== userId) return res.sendStatus(404);
    if (game.status !== 'playing') return res.status(400).json({ message: "Game over" });

    const guessedCompany = await storage.getCompanyBySymbol(companySymbol);
    if (!guessedCompany) return res.status(400).json({ message: "Invalid company" });

    const guesses = await storage.getGuesses(gameId);
    
    // Check if already guessed
    if (guesses.some(g => g.companyId === guessedCompany.id)) {
        return res.status(400).json({ message: "Already guessed this company" });
    }

    const round = guesses.length + 1;
    
    // Prevent guessing beyond round 6
    if (round > 6) {
        return res.status(400).json({ message: "Game over" });
    }

    // Record guess
    await storage.addGuess(gameId, guessedCompany.id, round);

    // Check win/loss
    if (guessedCompany.id === game.targetCompanyId) {
       const score = 100 - (guesses.length * 10);
       await storage.updateGameStatus(gameId, 'won', score);
       
       // Update user stats
       const stats = await storage.getUserStats(userId);
       await storage.updateUserStats(userId, {
         currentStreak: (stats?.currentStreak || 0) + 1,
         maxStreak: Math.max((stats?.currentStreak || 0) + 1, stats?.maxStreak || 0),
         totalWins: (stats?.totalWins || 0) + 1,
         totalPlayed: (stats?.totalPlayed || 0) + 1
       });
    } else if (round >= 6) {
       await storage.updateGameStatus(gameId, 'lost');
       
       // Update user stats (reset streak)
       const stats = await storage.getUserStats(userId);
       await storage.updateUserStats(userId, {
         currentStreak: 0,
         totalPlayed: (stats?.totalPlayed || 0) + 1
       });
    }

    // Refresh game state
    game = await storage.getGame(gameId);
    const response = await buildGameState(game!);
    res.json(response);
  });

  app.post(api.games.skip.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const gameId = Number(req.params.id);
    const userId = (req.user as any).claims.sub;
    
    let game = await storage.getGame(gameId);
    if (!game || game.userId !== userId) return res.sendStatus(404);
    if (game.status !== 'playing') return res.status(400).json({ message: "Game over" });

    const guesses = await storage.getGuesses(gameId);
    const round = guesses.length + 1;
    
    // Prevent skipping beyond round 6
    if (round > 6) {
        return res.status(400).json({ message: "Game over" });
    }

    // Check if this was the last round (round 6)
    // When skipping, we don't record a guess - we just check if they've run out of skips
    if (round >= 6) {
       await storage.updateGameStatus(gameId, 'lost');
       
       // Update user stats (reset streak)
       const stats = await storage.getUserStats(userId);
       await storage.updateUserStats(userId, {
         currentStreak: 0,
         totalPlayed: (stats?.totalPlayed || 0) + 1
       });
    }

    // Refresh game state
    game = await storage.getGame(gameId);
    const response = await buildGameState(game!);
    res.json(response);
  });

  app.get(api.leaderboard.list.path, async (req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  async function buildGameState(game: any) {
    const guesses = await storage.getGuesses(game.id);
    const target = await storage.getCompany(game.targetCompanyId);
    if (!target) throw new Error("Target company not found");

    const clues = {
      category: guesses.length >= 0 ? `${target.sector} - ${target.subIndustry}` : undefined,
      marketCap: guesses.length >= 1 ? target.marketCap : undefined,
      headquarters: guesses.length >= 2 ? target.headquarters : undefined,
      founded: guesses.length >= 3 ? target.founded : undefined,
      firstLetter: guesses.length >= 4 ? target.symbol[0] : undefined,
      description: guesses.length >= 5 ? target.description : undefined,
    };

    // If game over, reveal everything
    const isOver = game.status !== 'playing';
    
    // Get user stats for endless mode streak
    let endlessStreak = undefined;
    if (game.type === 'endless') {
      const stats = await storage.getUserStats(game.userId);
      endlessStreak = stats?.currentStreak || 0;
    }
    
    return {
      id: game.id,
      type: game.type,
      status: game.status,
      round: Math.min(guesses.length + 1, 6),
      endlessStreak,
      clues: isOver ? {
        category: `${target.sector} - ${target.subIndustry}`,
        marketCap: target.marketCap,
        headquarters: target.headquarters,
        founded: target.founded,
        firstLetter: target.symbol[0],
        description: target.description
      } : clues,
      guesses: guesses.map(g => ({
        symbol: g.company.symbol,
        name: g.company.name,
      })),
      score: game.score,
      targetCompany: isOver ? target : undefined
    };
  }

  return httpServer;
}

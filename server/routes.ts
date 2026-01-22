import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  // registerAuthRoutes(app); // Already handled in setupAuth or via separate file? Replit Auth blueprint puts registerAuthRoutes in index.ts usually
  const { registerAuthRoutes } = await import("./replit_integrations/auth");
  registerAuthRoutes(app);

  // Companies are managed directly in the database - no seeding on startup

  app.get(api.companies.search.path, async (req, res) => {
    const q = req.query.q as string;
    // Return all companies when q is "*" for client-side caching
    if (q === '*') {
      const all = await storage.getAllCompanies();
      return res.json(all.map(c => ({ symbol: c.symbol, name: c.name })));
    }
    if (!q) return res.json([]);
    const results = await storage.searchCompanies(q);
    res.json(results.map(c => ({ symbol: c.symbol, name: c.name })));
  });

  app.get(api.games.daily.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user already has a game for today
    let game = await storage.getDailyGame(userId, today);
    if (!game) {
      // Get or create today's daily challenge (same company for all players)
      const target = await storage.getOrCreateDailyChallenge(today);
      game = await storage.createGame(userId, 'daily', target.id);
    }
    
    const response = await buildGameState(game);
    res.json(response);
  });

  app.get(api.games.getFilters.path, async (req, res) => {
    const filters = await storage.getAvailableFilters();
    res.json(filters);
  });

  app.post(api.games.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const { type, filters, difficulty } = req.body;
    
    if (type === 'daily') {
       return res.status(400).json({ message: "Use get daily endpoint" });
    }

    // For endless mode, use difficulty; for custom mode, use filters
    const target = await storage.getRandomCompany(
      type === 'custom' ? filters : undefined,
      type === 'endless' ? difficulty : undefined
    );
    if (!target) {
      return res.status(400).json({ message: "No companies match your filters. Please adjust your criteria." });
    }
    
    // Store filters for custom games, or difficulty for endless games
    const gameFilters = type === 'custom' ? filters : (type === 'endless' && difficulty ? { difficulty } : undefined);
    const game = await storage.createGame(userId, type, target.id, gameFilters);
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
    
    const gameData = await storage.getGame(gameId);
    if (!gameData || gameData.userId !== userId) return res.sendStatus(404);
    if (gameData.status !== 'playing') return res.status(400).json({ message: "Game over" });

    const guessedCompany = await storage.getCompanyBySymbol(companySymbol);
    if (!guessedCompany) return res.status(400).json({ message: "Invalid company" });

    const allGuesses = await storage.getGuesses(gameId);
    
    // Filter out skip markers (guesses where company_id == targetCompanyId)
    const actualGuesses = allGuesses.filter(g => g.companyId !== gameData.targetCompanyId);
    
    // Check if already guessed (only check actual guesses, not skip markers)
    if (actualGuesses.some(g => g.companyId === guessedCompany.id)) {
        return res.status(400).json({ message: "Already guessed this company" });
    }

    const round = allGuesses.length + 1;
    
    // Prevent guessing beyond round 6
    if (round > 6) {
        return res.status(400).json({ message: "Game over" });
    }

    // Record guess
    await storage.addGuess(gameId, guessedCompany.id, round);

    // Check win/loss
    if (guessedCompany.id === gameData.targetCompanyId) {
       const score = 100 - (actualGuesses.length * 10);
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
    const finalGameResult = await storage.getGame(gameId);
    const response = await buildGameState(finalGameResult!);
    res.json(response);
  });

  app.post(api.games.skip.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const gameId = Number(req.params.id);
    const userId = (req.user as any).claims.sub;
    
    let gameData = await storage.getGame(gameId);
    if (!gameData || gameData.userId !== userId) return res.sendStatus(404);
    if (gameData.status !== 'playing') return res.status(400).json({ message: "Game over" });

    const guesses = await storage.getGuesses(gameId);
    const round = guesses.length + 1;
    
    // Prevent skipping beyond round 6
    if (round > 6) {
        return res.status(400).json({ message: "Game over" });
    }

    // Record a skip by adding NULL company_id as a special marker for skips
    // This advances the round and reveals the next clue, but the marker is filtered out
    // in buildGameState so it won't appear in the previous guesses list
    await storage.addGuess(gameId, null as any, round);

    // Check if this was the last round (round 6)
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
    gameData = await storage.getGame(gameId);
    const response = await buildGameState(gameData!);
    res.json(response);
  });

  app.get(api.stats.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const stats = await storage.getDetailedStats(userId);
    res.json(stats);
  });

  async function buildGameState(game: any) {
    if (!game) throw new Error("Game not found");
    const allGuesses = await storage.getGuesses(game.id);
    const target = await storage.getCompany(game.targetCompanyId);
    if (!target || !game) throw new Error("Target company or game not found");

    // Filter out skip markers (guesses where company_id == null)
    const actualGuesses = allGuesses.filter(g => g.companyId !== null);

    const clues = {
      category: allGuesses.length >= 0 ? target.sector : undefined,
      subIndustry: allGuesses.length >= 0 ? target.subIndustry : undefined,
      marketCap: allGuesses.length >= 1 ? target.marketCap : undefined,
      headquarters: allGuesses.length >= 2 ? target.headquarters : undefined,
      founded: allGuesses.length >= 3 ? target.founded : undefined,
      firstLetter: allGuesses.length >= 4 ? target.name[0] : undefined,
      description: allGuesses.length >= 5 ? target.description : undefined,
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
      round: Math.min(allGuesses.length + 1, 6),
      endlessStreak,
      clues: isOver ? {
        category: target.sector,
        subIndustry: target.subIndustry,
        marketCap: target.marketCap,
        headquarters: target.headquarters,
        founded: target.founded,
        firstLetter: target.name[0],
        description: target.description
      } : clues,
      guesses: actualGuesses.map(g => ({
        symbol: g.company?.symbol || "???",
        name: g.company?.name || "Unknown Company",
        sector: g.company?.sector,
        subIndustry: g.company?.subIndustry,
        marketCap: g.company?.marketCap,
        headquarters: g.company?.headquarters,
        founded: g.company?.founded,
        firstLetter: g.company?.name?.[0],
        roundNumber: g.roundNumber,
      })),
      skippedRounds: allGuesses.filter(g => g.companyId === null).map(g => g.roundNumber),
      score: game.score,
      targetCompany: isOver ? target : undefined,
      filters: game.filters ? JSON.parse(game.filters) : undefined
    };
  }

  return httpServer;
}

import type { Express } from "express";
import { authStorage } from "./storage";
import { storage } from "../../storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const stats = await storage.getUserStats(userId);

      const enrichedUser = {
        ...user,
        username: user.email?.split('@')[0] || user.firstName || 'User',
        currentStreak: stats?.currentStreak || 0,
        maxStreak: stats?.maxStreak || 0,
        totalWins: stats?.totalWins || 0,
        totalPlayed: stats?.totalPlayed || 0
      };

      res.json(enrichedUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

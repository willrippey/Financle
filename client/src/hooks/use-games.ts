import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateGameRequest, SubmitGuessRequest } from "@shared/schema";

// GET /api/games/daily/current
export function useDailyGame(enabled: boolean = true) {
  return useQuery({
    queryKey: [api.games.daily.path],
    enabled,
    queryFn: async () => {
      const res = await fetch(api.games.daily.path, { 
        credentials: "include",
        cache: "no-store" // Prevent 304 caching issues
      });
      if (res.status === 401) return null; // Return null for unauthenticated
      if (!res.ok) throw new Error("Failed to fetch daily game");
      return api.games.daily.responses[200].parse(await res.json());
    },
    // Don't refetch automatically to prevent state jumps during play
    refetchOnWindowFocus: false,
  });
}

// GET /api/games/:id
export function useGame(id: number | undefined) {
  return useQuery({
    queryKey: [api.games.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("No ID");
      const url = buildUrl(api.games.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch game");
      return api.games.get.responses[200].parse(await res.json());
    },
  });
}

// POST /api/games
export function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGameRequest) => {
      const res = await fetch(api.games.create.path, {
        method: api.games.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create game");
      return api.games.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      if (data.type === 'daily') {
        queryClient.setQueryData([api.games.daily.path], data);
      }
    },
  });
}

// POST /api/games/:id/guess
export function useSubmitGuess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gameId, ...data }: { gameId: number } & SubmitGuessRequest) => {
      const url = buildUrl(api.games.guess.path, { id: gameId });
      const res = await fetch(url, {
        method: api.games.guess.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
           // Try to parse validation error
           try {
             const error = await res.json();
             throw new Error(error.message || "Invalid guess");
           } catch (e) {
             throw new Error("Invalid guess");
           }
        }
        throw new Error("Failed to submit guess");
      }
      return api.games.guess.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Update the individual game cache
      queryClient.setQueryData([api.games.get.path, data.id], data);
      
      // If it's the daily game, also update that cache key
      if (data.type === 'daily') {
        queryClient.setQueryData([api.games.daily.path], data);
      }
      
      // Refresh user stats if game ended
      if (data.status !== 'playing') {
        queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
        queryClient.invalidateQueries({ queryKey: [api.leaderboard.list.path] });
      }
    },
  });
}

// GET /api/companies/search
export function useCompanySearch(query: string) {
  return useQuery({
    queryKey: [api.companies.search.path, query],
    enabled: query.length >= 1, // Start searching after 1 character
    queryFn: async () => {
      const url = `${api.companies.search.path}?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to search companies");
      return api.companies.search.responses[200].parse(await res.json());
    },
  });
}

// Fetch all companies once for instant client-side filtering
export function useAllCompanies() {
  return useQuery({
    queryKey: [api.companies.search.path, '__all__'],
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    queryFn: async () => {
      const url = `${api.companies.search.path}?q=*`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch companies");
      return api.companies.search.responses[200].parse(await res.json());
    },
  });
}

// POST /api/games/:id/skip
export function useSkipRound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gameId }: { gameId: number }) => {
      const url = buildUrl(api.games.skip.path, { id: gameId });
      const res = await fetch(url, {
        method: api.games.skip.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to skip round");
      return api.games.skip.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Update the individual game cache
      queryClient.setQueryData([api.games.get.path, data.id], data);
      
      // If it's the daily game, also update that cache key
      if (data.type === 'daily') {
        queryClient.setQueryData([api.games.daily.path], data);
      }
      
      // Refresh user stats if game ended
      if (data.status !== 'playing') {
        queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
        queryClient.invalidateQueries({ queryKey: [api.leaderboard.list.path] });
      }
    },
  });
}

// GET /api/leaderboard
export function useLeaderboard() {
  return useQuery({
    queryKey: [api.leaderboard.list.path],
    queryFn: async () => {
      const res = await fetch(api.leaderboard.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return api.leaderboard.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/games/filters
export function useGameFilters() {
  return useQuery({
    queryKey: [api.games.getFilters.path],
    queryFn: async () => {
      const res = await fetch(api.games.getFilters.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch game filters");
      return api.games.getFilters.responses[200].parse(await res.json());
    },
  });
}

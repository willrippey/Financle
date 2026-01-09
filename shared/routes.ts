import { z } from 'zod';
import { insertUserSchema, insertCompanySchema, users, companies } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  companies: {
    search: {
      method: 'GET' as const,
      path: '/api/companies/search',
      input: z.object({
        q: z.string(),
      }),
      responses: {
        200: z.array(z.custom<{ symbol: string; name: string }>()),
      },
    },
  },
  games: {
    create: {
      method: 'POST' as const,
      path: '/api/games',
      input: z.object({
        type: z.enum(['daily', 'endless', 'custom']),
        filters: z.object({
          marketCaps: z.array(z.string()).optional(),
          sectors: z.array(z.string()).optional(),
          subIndustries: z.array(z.string()).optional(),
          filterMode: z.enum(['and', 'or']).optional(),
        }).optional(),
      }),
      responses: {
        201: z.custom<any>(), // GameStateResponse
        400: errorSchemas.validation,
      },
    },
    getFilters: {
      method: 'GET' as const,
      path: '/api/games/filters',
      responses: {
        200: z.object({
          marketCaps: z.array(z.string()),
          sectors: z.array(z.string()),
          subIndustries: z.array(z.string()),
        }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/games/:id',
      responses: {
        200: z.custom<any>(), // GameStateResponse
        404: errorSchemas.notFound,
      },
    },
    guess: {
      method: 'POST' as const,
      path: '/api/games/:id/guess',
      input: z.object({
        companySymbol: z.string(),
      }),
      responses: {
        200: z.custom<any>(), // GameStateResponse
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    skip: {
      method: 'POST' as const,
      path: '/api/games/:id/skip',
      responses: {
        200: z.custom<any>(), // GameStateResponse
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    daily: {
      method: 'GET' as const,
      path: '/api/games/daily/current',
      responses: {
        200: z.custom<any>(), // GameStateResponse
      }
    }
  },
  leaderboard: {
    list: {
      method: 'GET' as const,
      path: '/api/leaderboard',
      responses: {
        200: z.array(z.object({
          username: z.string(),
          score: z.number(),
        })),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

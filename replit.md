# Marketle

## Overview

Marketle is a Wordle-style guessing game where players try to identify S&P 500 companies based on progressively revealed clues. The application features two game modes: a daily challenge (one puzzle per day for all users) and an endless mode for continuous play. Players guess companies by searching and selecting from an autocomplete list, with each wrong guess revealing more information about the target company.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for game reveals and transitions
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a pages-based structure with reusable components. Key pages include Home (game mode selection), Game (gameplay), and Leaderboard. The component library uses Radix UI primitives wrapped with Tailwind styling.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation
- **Authentication**: Replit Auth (OpenID Connect) with session-based authentication stored in PostgreSQL

The server uses a storage abstraction pattern (`IStorage` interface) for database operations, making it easier to test and potentially swap implementations.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Session Storage**: PostgreSQL via `connect-pg-simple`
- **Key Tables**:
  - `users` - User accounts (Replit Auth)
  - `sessions` - Session data for authentication
  - `user_stats` - Streaks, wins, and gameplay statistics
  - `companies` - S&P 500 company data with sector, description, market cap
  - `games` - Game instances (daily or endless)
  - `guesses` - Individual guesses within games

### Build & Development
- **Development**: `tsx` for TypeScript execution, Vite dev server with HMR
- **Production Build**: Custom build script using esbuild for server, Vite for client
- **Database Migrations**: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Replit Auth**: OpenID Connect authentication via Replit's identity provider
- **Required Environment Variables**:
  - `DATABASE_URL` - PostgreSQL connection string
  - `SESSION_SECRET` - Secret for session encryption
  - `ISSUER_URL` - Replit OIDC issuer (defaults to https://replit.com/oidc)
  - `REPL_ID` - Replit application identifier

### Frontend Libraries
- **shadcn/ui**: Pre-built accessible components using Radix UI
- **cmdk**: Command menu for company search autocomplete
- **Framer Motion**: Animation library for game card reveals
- **TanStack Query**: Data fetching and caching

### Game Data
- Companies are seeded from a static array in `server/routes.ts` containing S&P 500 company information including symbol, name, sector, sub-industry, headquarters, founding year, description, and market cap.
# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Estier is a desi hip-hop weekly voting platform built with Next.js 15, TypeScript, Tailwind CSS, and Prisma with SQLite. Users can upvote/downvote 30 tracks released each week from Monday to Saturday. Voting locks on Sunday to finalize weekly rankings.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (dark purple theme)
- **Database:** Prisma + SQLite
- **Runtime:** Node.js

## Development Commands

```bash
# Install dependencies
npm install

# Set up database (first time only)
npm run db:setup

# Generate Prisma client
npm run prisma:generate

# Push database schema changes
npx prisma db push

# Seed database with sample tracks
npm run prisma:seed

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Project Structure

```
estier/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── tracks/         # GET tracks for current week
│   │   └── vote/           # POST/GET voting endpoints
│   ├── globals.css         # Global styles with purple theme
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main homepage
├── components/              # React components
│   ├── Header.tsx          # Header with countdown timer
│   └── TrackCard.tsx       # Individual track card with voting
├── lib/                     # Utilities
│   ├── prisma.ts           # Prisma client singleton
│   └── utils.ts            # Weekly cycle helpers
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Seed script for sample data
│   └── dev.db              # SQLite database (gitignored)
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── next.config.js          # Next.js configuration
```

## Architecture & Key Concepts

### Weekly Cycle System
- **Monday-Saturday:** Voting is open
- **Sunday:** Voting is locked (read-only mode)
- **Monday reset:** New week starts with fresh tracks
- Week calculation uses Monday as start of week

### Database Models

**Track:**
- Stores track information (title, artist, links)
- Associated with a `weekStart` date
- Relations: one-to-many with Vote

**Vote:**
- User votes: `1` for upvote, `-1` for downvote
- Unique constraint on (trackId, userId)
- Can be toggled (click again to remove vote)
- Can be changed (upvote ↔ downvote)

### User Identification
- Currently uses IP + User Agent hash
- Simple solution to prevent duplicate voting
- For production: implement proper authentication (NextAuth, Clerk, etc.)

### API Routes

**GET /api/tracks**
- Returns tracks for current week
- Includes vote counts (sorted by votes descending)
- Returns empty array if no tracks for current week

**POST /api/vote**
- Body: `{ trackId: string, value: 1 | -1 }`
- Returns error 403 if voting locked (Sunday)
- Toggle behavior: same vote removes it, different vote updates it

**GET /api/vote?trackId={id}**
- Returns current user's vote for a track
- Returns `{ value: 0 }` if no vote exists

### UI Components

**Header:**
- Shows "ESTIER" branding
- Countdown timer to Sunday
- Lock indicator on Sundays

**TrackCard:**
- Displays rank (🏆 for #1, 🥈 for #2, 🥉 for #3)
- Shows track info with Spotify/YouTube links
- Upvote/downvote buttons with active state
- Real-time vote count updates

### Theme
- Dark purple background (`#0f0620`, `#1a0b2e`)
- Purple gradients for accents
- Professional, modern design
- Fully responsive (mobile-first)

## Common Tasks

### Adding New Tracks for the Week

1. Modify `prisma/seed.ts` with new track data
2. Run `npm run prisma:seed`
3. Or use Prisma Studio: `npx prisma studio`

### Resetting the Database

```bash
rm prisma/dev.db
npm run db:setup
```

### Viewing Database

```bash
npx prisma studio  # Opens GUI at http://localhost:5555
```

## Production Considerations

- Replace SQLite with PostgreSQL or MySQL for production
- Implement proper authentication (NextAuth, Clerk, Auth0)
- Add rate limiting to prevent spam voting
- Set up automated weekly track ingestion
- Add admin panel for track management
- Implement proper error tracking (Sentry)
- Add analytics (Vercel Analytics, PostHog)
- Consider caching strategy (Redis)

## Project Rules

- This is an open source project focused on desi hip-hop culture
- Maintain the dark purple aesthetic theme
- Keep the weekly cycle logic (Monday-Sunday)
- Always validate voting state (locked on Sundays)
- Ensure mobile responsiveness for all components
- Use TypeScript strictly (no `any` types unless necessary)

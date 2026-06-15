# Podify — AI-Powered Podcast & Audio Streaming Platform

> **A premium, full-stack podcast streaming platform with AI creator tools, multi-role dashboards, and a Spotify-grade listening experience.**


---

## Table of Contents

1. [Overview](#-overview)
2. [Live Demo & Credentials](#-live-demo--credentials)
3. [Key Features](#-key-features)
4. [Tech Stack](#-tech-stack)
5. [Architecture](#-architecture)
6. [Project Structure](#-project-structure)
7. [Routing Map](#-routing-map)
8. [Role-Based Access](#-role-based-access)
9. [Backend (Lovable Cloud / Supabase)](#-backend-lovable-cloud--supabase)
10. [Database Schema](#-database-schema)
11. [Row-Level Security (RLS)](#-row-level-security-rls)
12. [State Management & Contexts](#-state-management--contexts)
13. [Audio / Video Player](#-audio--video-player)
14. [Thumbnail / Image Handling](#-thumbnail--image-handling)
15. [Design System](#-design-system)
16. [Local Development](#-local-development)
17. [Environment Variables](#-environment-variables)
18. [Build & Deployment (Vercel)](#-build--deployment-vercel)
19. [Troubleshooting](#-troubleshooting)
20. [Roadmap](#-roadmap)
21. [Credits](#-credits)

---

## Overview

**Podify** is a modern podcast & audio streaming platform inspired by Spotify, with built-in **AI Creator Studio** capabilities for generating scripts, voices, thumbnails, and full multi-host episodes.

It supports **three user roles**:

- **Listener** — discover, follow, play, queue, and build playlists
- **Creator** — upload episodes, manage drafts, view analytics, use AI Copilot & Multi-Agent Studio
- **Admin** — manage the platform

The app is a **client-side React 18 + Vite SPA** backed by **Lovable Cloud (Supabase)** for authentication, database, storage, and edge functions. Demo data and user-generated content also persist in **localStorage** so the app works smoothly even before any cloud rows exist.

---

## Live Demo & Credentials

| Field | Value |
|---|---|
| **Demo Email** | `demo@gmail.com` |
| **Demo Password** | `DEMO@123` |

The demo account auto-loads as a **Listener** with a populated profile, follows, and library — perfect for showcasing the full UX without any signup friction.

You can switch between **Listener** and **Creator** roles from **Settings** at any time.

---

## Key Features

### Landing / Marketing
- Sticky navbar with smooth scroll
- Hero with animated particle field
- "Get Started" → Signup as **Listener**
- "Become a Creator" / "Launch Podify" → Signup as **Creator**
- Fully responsive (mobile + desktop)

### Authentication
- Email / password sign up & log in (Lovable Cloud)
- One-click **demo account** button
- Role selection at signup (Listener / Creator)
- Protected routes via `<Protected>` guard

### Listener Experience
- **Home** — personalized rails, trending, continue listening
- **Search** — fuzzy search by title, creator, tag, category
- **Discover** — categorized browsing
- **Creators** — directory of all creators
- **Creator Profile** — bio, follower count, episodes, follow/unfollow
- **Podcast Detail** — full episode view with player, comments, related
- **Library** — saved playlists, followed creators, recent plays
- **Playlists** — create, rename, delete, add/remove episodes
- **Follow system** — follow creators, persisted

### Creator Studio
- **Episodes** — list, edit, delete uploaded episodes
- **Upload** — add new episodes (YouTube ID or audio URL)
- **AI Copilot** — script & idea generation UI
- **Multi-Agent Studio** — Multi-host AI podcast script, voice synthesis (SpeechSynthesis) and ambient audio generator that builds dialogue very close to the selected target duration (5, 10, or 30 mins)
- **Drafts** — work-in-progress episodes
- **Analytics** — plays, followers, growth charts

### Global Audio Player
- Spotify-inspired bottom dock
- Play / Pause / Next / Previous
- **+5s / -5s** seek buttons
- Volume slider with mute
- Progress bar with scrub
- **Apple Music-style "Up Next" Queue Sidebar** — Right-sliding drawer with custom backdrop, active track indicator, reordering controls (▲/▼), single-track removal, and queue clearing
- **Body Scroll Lock** — Prevents background page scrolling while interacting with the queue sidebar
- **Interactive Cover Art & Track Overlays** — Hover play/pause button on queue items and active cover art
- **Video toggle** when YouTube content is playing
- **Keyboard shortcuts**:
  - `Space` → Play / Pause
  - `←` / `→` → Seek -5s / +5s
  - `↑` / `↓` → Volume up / down

### Admin Panel
- Lightweight dashboard at `/admin`

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + Vite 5 + TypeScript 5 |
| **Styling** | Tailwind CSS v3 + shadcn/ui + custom design tokens |
| **Routing** | React Router v6 |
| **State** | React Context API (Auth, Player, Catalog, Follow, Playlist) |
| **Data** | TanStack Query (React Query) |
| **Backend** | Lovable Cloud (Supabase: Postgres, Auth, Storage, Edge Functions) |
| **Animation** | CSS + custom particle field |
| **Icons** | lucide-react |
| **Notifications** | Sonner (toasts) |
| **Forms** | react-hook-form + zod |
| **Player** | Custom HTML5 Audio + YouTube IFrame API |
| **Package Manager** | Bun (npm-compatible) |
| **Hosting** | Vercel (SPA rewrites via `vercel.json`) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (SPA)                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Router → Route Guards (Protected)         │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │ Context Providers (Auth, Catalog, Player,  │  │   │
│  │  │ Follow, Playlist) wrap the entire app      │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │  Pages: Landing, Auth, Listener/*, Studio/*      │   │
│  │  Global: AppLayout, StudioLayout, GlobalPlayer   │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                              │
│            ┌─────────────┴─────────────┐                │
│            ▼                           ▼                │
│   ┌────────────────┐         ┌──────────────────┐       │
│   │  localStorage  │         │ Supabase Client  │       │
│   │ (demo + user   │         │ (auth, db, RLS)  │       │
│   │  generated)    │         └─────────┬────────┘       │
│   └────────────────┘                   │                │
└────────────────────────────────────────┼────────────────┘
                                         ▼
                             ┌───────────────────────┐
                             │   Lovable Cloud       │
                             │   (Supabase Postgres) │
                             │   profiles            │
                             │   user_roles          │
                             │   podcasts            │
                             │   playlists           │
                             │   follows             │
                             └───────────────────────┘
```

The app is **offline-tolerant**: if Supabase is unreachable, the SmartImage fallbacks, localStorage caches, and the `ErrorBoundary` keep the UI usable.

---

## Project Structure

```
podify/
├── public/                       # Static assets (favicon, robots, sitemap)
├── src/
│   ├── App.tsx                   # Root: providers + routes
│   ├── main.tsx                  # Entry + ErrorBoundary
│   ├── index.css                 # Design tokens (HSL CSS variables)
│   │
│   ├── components/
│   │   ├── AppLayout.tsx         # Listener shell (sidebar + topbar + player)
│   │   ├── StudioLayout.tsx      # Creator shell
│   │   ├── GlobalPlayer.tsx      # Spotify-style bottom dock
│   │   ├── PodcastCard.tsx       # Reusable episode card
│   │   ├── SmartImage.tsx        # Robust image w/ YouTube fallback chain
│   │   ├── ParticleField.tsx     # Landing animation
│   │   ├── ErrorBoundary.tsx     # Global crash handler
│   │   ├── Logo.tsx
│   │   ├── NavLink.tsx
│   │   └── ui/                   # shadcn primitives
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx       # User, login, signup, role switch
│   │   ├── CatalogContext.tsx    # Mock + user-uploaded podcasts
│   │   ├── PlayerContext.tsx     # Now playing, queue, controls
│   │   ├── FollowContext.tsx     # Followed creators
│   │   └── PlaylistContext.tsx   # User playlists
│   │
│   ├── pages/
│   │   ├── Landing.tsx           # Marketing home
│   │   ├── Auth.tsx              # Login / Signup (with role tabs)
│   │   ├── Admin.tsx
│   │   ├── NotFound.tsx
│   │   ├── listener/
│   │   │   ├── Home.tsx
│   │   │   ├── Search.tsx
│   │   │   ├── Discover.tsx
│   │   │   ├── Creators.tsx
│   │   │   ├── CreatorProfile.tsx
│   │   │   ├── PodcastDetail.tsx
│   │   │   ├── Library.tsx
│   │   │   └── Settings.tsx
│   │   └── studio/
│   │       ├── Episodes.tsx
│   │       ├── Upload.tsx
│   │       ├── Copilot.tsx
│   │       ├── MultiAgent.tsx
│   │       ├── Analytics.tsx
│   │       └── Drafts.tsx
│   │
│   ├── integrations/supabase/
│   │   ├── client.ts             # ⚠️ Auto-generated — do NOT edit
│   │   └── types.ts              # ⚠️ Auto-generated — do NOT edit
│   │
│   ├── lib/
│   │   ├── types.ts              # Shared TS types
│   │   ├── mock-data.ts          # Seed creators + podcasts
│   │   └── utils.ts              # cn() + helpers
│   │
│   └── hooks/
│       ├── use-mobile.tsx
│       └── use-toast.ts
│
├── supabase/
│   ├── config.toml               # project_id (auto-managed)
│   └── migrations/               # SQL schema migrations
│
├── .env                          # ⚠️ Auto-generated — do NOT edit
├── vercel.json                   # SPA rewrites + cache headers
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Routing Map

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/auth?mode=login` | Public | Login form |
| `/auth?mode=signup&role=listener` | Public | Signup as listener |
| `/auth?mode=signup&role=creator` | Public | Signup as creator |
| `/app` | Listener | Personalized home |
| `/app/search` | Listener | Search |
| `/app/discover` | Listener | Browse by category |
| `/app/library` | Listener | Playlists & follows |
| `/app/creators` | Listener | All creators |
| `/app/settings` | Any | Profile + role switch |
| `/podcast/:id` | Authed | Episode detail |
| `/creator/:id` | Authed | Creator profile |
| `/studio` | Creator | Episodes dashboard |
| `/studio/upload` | Creator | New episode |
| `/studio/copilot` | Creator | AI script tool |
| `/studio/multi-agent` | Creator | AI multi-host studio |
| `/studio/drafts` | Creator | Drafts |
| `/studio/analytics` | Creator | Stats |
| `/admin` | Admin | Admin panel |
| `*` | — | 404 |

---

## Role-Based Access

Roles are stored in the **`user_roles`** table (never on `profiles` — prevents privilege escalation). The `has_role(uuid, app_role)` Postgres function is `SECURITY DEFINER` and used in all RLS policies.

```sql
create type app_role as enum ('admin', 'creator', 'listener');
```

On signup, the `handle_new_user()` trigger automatically:
1. Inserts a row into `profiles`
2. Assigns the default `'listener'` role in `user_roles`

Users can upgrade to **Creator** from the Settings page (UI-driven role switch persisted to localStorage for the demo, and to `user_roles` when wired to cloud).

---

## Backend (Lovable Cloud / Supabase)

This project uses ** Supabse Cloud** — a managed backend with zero setup.

### What Cloud provides

- **Postgres database** with RLS
- **Auth** (email/password)
- **Storage buckets** (when needed for audio/cover uploads)
- **Edge Functions** (auto-deployed from `supabase/functions/`)
- **Secrets management** (`LOVABLE_API_KEY` for Lovable AI Gateway is preconfigured)

### Supabase client

```ts
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.from("podcasts").select("*");
```

The client has **hardcoded fallbacks** so the app boots even if env vars are missing on first deploy.

---

## Database Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid | references `auth.users` |
| `name` | text | |
| `email` | text | |
| `avatar_url` | text | |
| `bio` | text | |
| `followers_count` | int | default 0 |
| `created_at` / `updated_at` | timestamptz | |

### `user_roles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid | |
| `role` | `app_role` enum | `admin` / `creator` / `listener` |

### `podcasts`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `creator_id` | uuid | |
| `title` | text | |
| `description` | text | |
| `cover_url` | text | |
| `audio_url` | text | |
| `category` | text | |
| `tags` | text[] | |
| `duration_seconds` | int | |
| `plays` | int | default 0 |
| `rating` | numeric | |

### `playlists`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid | |
| `name` | text | |
| `description` | text | |
| `podcast_ids` | uuid[] | |

### `follows`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `follower_id` | uuid | |
| `creator_id` | uuid | |

---

## Row-Level Security (RLS)

Every table has RLS **enabled**.

| Table | Policy |
|---|---|
| `profiles` | Public read (authenticated). Users can insert/update only their own. |
| `user_roles` | Authenticated read. Only admins can insert/update/delete. |
| `podcasts` | Public read. Creators can manage only their own rows. |
| `playlists` | Users can CRUD only their own. |
| `follows` | Authenticated read. Users can insert/delete only their own. |

The `has_role()` function bypasses RLS recursion safely via `SECURITY DEFINER`.

---

## State Management & Contexts

| Context | Responsibility |
|---|---|
| **AuthContext** | Login, signup, logout, role switching, demo account |
| **CatalogContext** | Combines mock seed data + user-uploaded podcasts (localStorage) |
| **PlayerContext** | Now playing, queue, play/pause, seek, volume, video toggle |
| **FollowContext** | Followed creators (persisted) |
| **PlaylistContext** | User-created playlists (persisted) |

All contexts hydrate from `localStorage` for instant UX and fall back gracefully if storage is empty.

---

## Audio / Video Player

The **`GlobalPlayer`** is a Spotify-inspired bottom dock with an advanced queue panel.

### Features
- HTML5 `<audio>` for direct audio URLs
- YouTube IFrame for episodes with a `youtubeId`
- **Video mode toggle** when YouTube content is loaded
- Progress bar with click-to-seek
- Volume slider with mute toggle
- **Apple Music-style sliding sidebar** for managing "Up Next" tracks (supports reordering, remove, play immediately actions, and background scroll locking)
- **Keyboard shortcuts** wired globally:

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `→` | +5s |
| `←` | -5s |
| `↑` | Volume up |
| `↓` | Volume down |

---

## Thumbnail / Image Handling

`SmartImage` is a hardened image component that handles YouTube's quirky thumbnail behavior:

1. Tries `maxresdefault.jpg` → `sddefault.jpg` → `hqdefault.jpg` → `mqdefault.jpg` → `default.jpg`
2. Falls back across CDNs (`i.ytimg.com` → `img.youtube.com`)
3. Detects YouTube's **120×90 grey "unavailable" placeholder** in `onLoad` (which loads with HTTP 200) and triggers fallback
4. Final fallback to a generated gradient placeholder

This eliminates the broken-thumbnail issue across all browsers and CDNs.

---

## Design System

All colors, gradients, and shadows are **HSL semantic tokens** defined in `src/index.css` and `tailwind.config.ts`.

```css
:root {
  --background: 222 47% 4%;
  --foreground: 210 40% 98%;
  --primary: 280 90% 60%;
  --primary-glow: 290 100% 70%;
  --gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
  --shadow-glow: 0 0 40px hsl(var(--primary) / 0.4);
  --shadow-elegant: 0 10px 30px -10px hsl(var(--primary) / 0.3);
}
```

**Rules:**
- Never use raw classes like `text-white`, `bg-black`
- Always use semantic tokens: `text-foreground`, `bg-primary`, etc.
- Dark theme by default; fully responsive (mobile-first)

---

## Local Development

### Prerequisites
- **Node 18+** or **Bun 1.0+**

### Setup

```bash
# Install dependencies
bun install

# Start dev server (http://localhost:8080)
bun run dev
```

### Useful Scripts

```bash
bun run dev       # Vite dev server
bun run build     # Production build → dist/
bun run preview   # Preview production build
bun run lint      # ESLint
bunx vitest run   # Tests
```

---

## Environment Variables

The `.env` file is **auto-generated** by Lovable Cloud. Never edit it manually.

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon (public) key — safe in client |
| `VITE_SUPABASE_PROJECT_ID` | Project reference id |

For **Vercel**, add all three to **Production**, **Preview**, and **Development** environments. The client also has hardcoded fallbacks, so the app won't crash if they're missing.

---

## Build & Deployment (Vercel)

This repo is **Vercel-ready**.

### One-time Vercel setup

1. Import the repo in Vercel
2. **Framework preset**: Vite
3. **Build command**: `bun run build` (or `npm run build`)
4. **Output directory**: `dist`
5. Add the three env vars above
6. Deploy

### `vercel.json` highlights

- SPA rewrites: every non-asset path → `/index.html`
- Long-lived cache for `/assets/*`
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Blank screen on Vercel | Hard refresh (`Ctrl/Cmd + Shift + R`). Client has fallbacks; ErrorBoundary will surface the real error. |
| Thumbnails missing | `SmartImage` auto-falls back; check the network tab for blocked CDNs. |
| "Invalid credentials" on login | Use the **demo button** or sign up fresh. Demo: `demo@gmail.com` / `DEMO@123`. |
| Tables empty in Cloud | Migrations under `supabase/migrations/` create the schema. They run automatically on Cloud. |
| Routes 404 on Vercel refresh | Confirm `vercel.json` rewrites are deployed. |
| Audio won't play | Browsers block autoplay — interact with the page first (click anything). |

---

## Roadmap

- [ ] Wire creator uploads to Supabase Storage (currently localStorage)
- [ ] Real-time follower count via Supabase Realtime
- [ ] AI Copilot wired to Lovable AI Gateway (`google/gemini-2.5-flash`)
- [x] Multi-Agent Studio: TTS pipeline
- [ ] Push notifications for new episodes from followed creators
- [ ] Mobile PWA install prompt

---

## Credits

[//]: # (Designed, built and maintained by **Koushal Chintakayala**.)

Powered by **Supabase**, **React**, **Vite**, **Tailwind**, and **shadcn/ui**.

> _"Tune in to the future of audio."_ 🎧

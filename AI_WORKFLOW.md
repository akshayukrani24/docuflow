# AI Workflow Note

## Tools Used

- **Claude (Anthropic)** — Primary coding assistant used throughout the build

## Where AI Materially Sped Up Work

### 1. Boilerplate and scaffolding (~40% time saved)
Prisma schema, NextAuth configuration, API route structure, and session type augmentation are all repetitive patterns. AI generated correct first-pass implementations that required only minor adjustments (e.g., catching the Prisma v7 breaking change on `url` in schema and downgrading to v6).

### 2. Tiptap editor integration (~30% time saved)
The Tiptap toolbar wiring (extension config, `chain().focus().toggle*()` calls, active state checks, `onMouseDown` instead of `onClick` to avoid focus loss) would have required reading documentation for each piece. AI generated the full toolbar in one pass with all edge cases handled correctly.

### 3. Component architecture
AI drafted the `DashboardClient`, `EditorClient`, and `ShareModal` component structure in one shot. The output was logically sound — client/server split was correct, props were typed properly, state management was clean.

## What I Changed or Rejected

| AI Output | What Changed | Why |
|-----------|-------------|-----|
| Used `NextResponse.json()` in route handlers | Kept as-is | Correct for Next.js |
| Initial Toaster as a sibling `<Toaster />` | Refactored to `<ToastProvider>` wrapping children | Context must wrap consumers, not be a sibling |
| `params` typed as `{ params: { id: string } }` | Updated to `params: Promise<{ id: string }>` | Next.js 16 made params async — caught by reading the framework docs |
| Prisma 7 config with `url` in schema.prisma | Downgraded to Prisma 6 | Prisma 7 removed `url` from schema in favor of `prisma.config.ts`; v6 is stable |

## How I Verified Correctness

1. **TypeScript** — `npx tsc --noEmit` run after each major file batch; zero errors before running the app
2. **Database** — `npx prisma migrate dev` and `npx prisma db seed` both executed successfully; confirmed records in the DB
3. **Route conventions** — Read `node_modules/next/dist/docs/` before writing any route code to catch Next.js 16 breaking changes (async params, etc.)
4. **UX quality** — Reviewed all component logic for focus management (toolbar uses `onMouseDown` to prevent editor blur), save debounce timing, empty state handling, and toast placement
5. **Tests** — Jest tests cover the utility functions and verify that unauthenticated requests return 401

## Judgment Calls Not Outsourced to AI

- Choosing SQLite over Supabase (kept complexity low for reviewers)
- Choosing Prisma v6 over v7 (v7 requires a config migration not worth the timebox)
- Cutting .docx import (quality was unreliable; shipping clean .txt/.md is better)
- Debounce at 1.5s (matches Notion/Linear behavior; too short causes API spam)
- Toaster as a context provider, not a singleton (correct React pattern)

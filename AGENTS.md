# Nudge Agent Working Rules

## Project scope
- Build and maintain a local MVP: short-video feed + deterministic interactive inserts.
- Keep architecture simple and demoable; avoid external services.

## Stack and conventions
- Framework: Next.js (App Router) + TypeScript.
- Styling: Tailwind CSS.
- DB: SQLite with Prisma.
- Storage: local filesystem under `public/uploads`.
- Code style: prefer small typed functions, server actions/route handlers for mutations, and simple components.

## Product constraints
- Upload accepts only `.mp4` files.
- Enforce max upload size 50MB.
- No transcoding, CDN, HLS, background workers, or external media services.
- No mandatory auth for MVP.

## Feed/module behavior
- Feed loops back to first item after the end.
- Deterministic module insertion rule: insert an interactive card after every 3 videos.
- Supported module types only:
  - Chess puzzle (multiple choice)
  - Workout timer + checklist

## Data and events
- Prisma models must include: `Video`, `InteractionEvent`, `ModuleAttempt`.
- Record view and like events (basic fire-and-forget is acceptable).
- Record module start/complete attempts.

## Dev workflow
- Use incremental commits for milestones:
  1. scaffold + dev server runs
  2. DB schema + seed
  3. upload working
  4. feed working
  5. interactive inserts working
- After each milestone, run relevant checks and fix failures.

## Commands
- Install: `npm install`
- Prisma migrate: `npx prisma migrate dev`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## README requirements
- Include exact setup/run steps.
- Include seed video instructions via `/seed_videos`.
- Include a concise 60-second demo script.

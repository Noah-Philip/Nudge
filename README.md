# Nudge (Local MVP)

Nudge is a small TikTok-like demo with local MP4 uploads, looping feed playback, likes/views, and deterministic interactive inserts.

> Note: The environment blocked pulling external npm packages, so this implementation uses a dependency-light local Node server while preserving the product behavior requested.

## Features
- Upload MP4 videos (max 50MB) at `/upload`.
- Feed at `/` with:
  - next/prev + mouse wheel navigation
  - looping behavior when reaching the end
  - video autoplay/loop
  - like + view counters
- Interactive inserts every **3 videos** (deterministic):
  - Chess multiple-choice puzzle card
  - Workout timer + checklist card
- Basic admin library at `/library` with delete action.
- Local JSON persistence in `/data`.

## Project structure
- `server.js` – HTTP server + API routes.
- `public/` – feed/upload/library pages.
- `data/` – stored videos/events/module attempts.
- `prisma/schema.prisma` – requested schema representation.
- `seed_videos/` – drop local MP4 files for seeding.

## Setup
```bash
npm install
npx prisma migrate dev
npm run dev
```
Then open `http://localhost:3000`.

## Seed sample videos
1. (Optional) Put 5–10 `.mp4` files in `seed_videos/`.
2. Run:
```bash
npm run seed
```
3. If `seed_videos/` is empty, the seed script auto-generates 6 tiny local MP4 demo clips and copies them into `public/uploads/`.

## Definition of Done commands
```bash
npm install
npx prisma migrate dev
npm run build
npm run lint
```

## 60-second demo script
1. Open `/upload`, upload an MP4 with title + topic.
2. Return to `/` and play the top video.
3. Scroll down (or press next) through videos.
4. After every 3 videos, show an interactive card:
   - Complete a chess answer, then continue.
   - Complete workout card and press complete.
5. Like a video and observe count increment.
6. Continue past the end and confirm feed loops to the start.
7. Open `/library` and delete a video.

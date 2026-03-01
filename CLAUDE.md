# CLAUDE.md — Outlier

## Project overview

Outlier is a YouTube Channel Gap Analyzer. Users paste two YouTube channel URLs and get an AI-powered competitive analysis: thumbnail signals, engagement rates, title intelligence, tag strategy, upload cadence, and viral-ready outputs (grades, roast card, steal-this tactics). Dark theme, SSE streaming, shareable result URLs.

Stack: Next.js 16, React 19, TypeScript strict, Tailwind CSS 4, Claude AI (Haiku + Sonnet), Supabase, Vercel.

## Key commands

- `npm run dev` — Start dev server at localhost:3000
- `npm run build` — Production build (must pass with 0 errors)
- `npm run lint` — ESLint check

## Architecture

### Two-call Claude pipeline

| Call | Model | Input | Output | Cost |
|------|-------|-------|--------|------|
| Vision (Call 1) | Haiku | 50 thumbnails/channel + titles + views | 10 signal scores (all/top10/bottom10), performance correlation | ~$0.25 |
| Text (Call 2) | Sonnet | All titles + tags + computed metrics | Title intelligence, tag strategy, grades, roast card, steal-this, tweetable callout, core finding, outlier explanations | ~$0.04 |

### SSE streaming

`POST /api/analyze` streams progress events through 6 phases:
1. `resolving_channels` → 2. `fetching_videos` → 3. `analyzing_thumbnails` → 4. `computing_metrics` → 5. `generating_insights` → 6. `complete`

### Shareable URLs

On completion: save result JSON to `audits` table → get nanoid slug → pushState to `/results/[slug]`. Visitors to `/results/[slug]` load from Supabase (server component) with dynamic OG image.

## Key directories

```
src/app/                          # Pages and API routes
src/app/api/analyze/route.ts      # Main SSE analysis endpoint
src/app/api/event/route.ts        # Client-side event logging
src/app/results/page.tsx          # Live analysis results (SSE)
src/app/results/[slug]/           # Shareable static results
src/components/                   # 21 UI components
src/lib/analyzer.ts               # Claude AI pipeline orchestrator
src/lib/youtube.ts                # YouTube Data API wrapper
src/lib/compute.ts                # Zero-cost analysis functions
src/lib/types.ts                  # All TypeScript interfaces
src/lib/grade.ts                  # Channel grading (A-F)
src/lib/format.ts                 # Duration parser, format classifier
src/lib/hash.ts                   # IP hashing for rate limiting
src/lib/supabase.ts               # Supabase client (graceful null)
supabase/migrations/              # SQL migrations
```

## Supabase tables

- **`audits`** — Shareable result URLs (slug, channel_a/b, result_json, expires_at 7d)
- **`analytics_events`** — Event logging (audit_run, rate_limited, share_copied)
- **`thumbnail_signal_cache`** — Cached Haiku vision results per channel

Project ref: `bnpdkhivrgtdayxqzihv`. Linked from this directory.

## Thumbnail signals (10)

`close_up_face`, `eye_contact`, `high_energy_expression`, `text_overlay`, `text_legible`, `warm_color_temp`, `low_bg_complexity`, `logo_presence`, `before_after_framing`, `face_free`

## Rate limiting

- 3 audits per IP per 24h (in-memory + Supabase durable check)
- 200 global daily cap
- IP hashed with SHA-256 + salt, truncated to 16 chars

## Components (21)

**Analysis (9):** GapTable, ThumbnailCorrelation, CoreFinding, OutlierCallout, EngagementRate, FormatBreakdown, UploadCadence, ViewVelocity, TitleIntelligence, TagStrategy

**Virality (7):** GradesBadge, RoastCard, StealThis, TweetableCallout, OutlierWatermark, ShareButton, ComparisonPresets

**UI (4):** ChannelInput, LoadingState, ChannelHeader (inline in results)

## Environment variables

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — Supabase
- `ANTHROPIC_API_KEY` — Claude AI
- `YOUTUBE_API_KEY` — YouTube Data API v3
- `IP_HASH_SALT` — Rate limiting salt (optional, defaults to "outlier-salt")

## Design

- Dark theme only: `--bg-void: #0A0A0F`, `--accent: #FF4D00`, `--positive: #00D4AA`
- Body grain overlay (SVG noise) + orange radial glow
- CSS variables for all colors — no hardcoded hex in components
- `animate-fade-in-up` on all result sections
- Grade colors: A=green, B=blue, C=yellow, D=orange, F=red

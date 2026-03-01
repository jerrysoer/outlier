# Outlier — YouTube Channel Gap Analyzer

See exactly how your YouTube channel compares to the ones beating you.

Outlier uses Claude Vision to analyze thumbnails across two YouTube channels and generates a gap table showing the 10 visual signals that drive click-through rate — face presence, eye contact, emotion, text overlay, color contrast, and more. Priority-ranked so you know what to fix first.

## Features

- **10 Thumbnail Signals** — AI-analyzed across 50 videos per channel
- **Gap Table + Priority** — Ranked from HIGHEST to LOW with percentage-point gaps
- **Core Finding** — AI strategic diagnosis of the biggest competitive gap
- **Outlier Videos** — Top 3 overperforming videos per channel with "why it worked"
- **Upload Consistency** — Letter grade, posts/week, trend direction
- **Title Formulas** — Top patterns, power words, average length comparison
- **30-Second Analysis** — Paste two URLs, get results

## Tech Stack

- Next.js 16 + React 19 + TypeScript (strict)
- Tailwind CSS 4
- Anthropic SDK (Claude Sonnet for Vision + text)
- YouTube Data API v3
- Supabase (waitlist + analytics + rate limiting)

## Setup

```bash
git clone https://github.com/jerrysoer/outlier.git
cd outlier
npm install
```

### Environment Variables

Create `.env.local`:

```env
# YouTube Data API v3 — Google Cloud Console → APIs → YouTube Data API v3
YOUTUBE_API_KEY=your_key_here

# Anthropic — https://console.anthropic.com
ANTHROPIC_API_KEY=your_key_here

# Supabase — Project Settings → API
SUPABASE_URL=your_url_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

### Supabase Tables

Run in Supabase SQL Editor:

```sql
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  properties JSONB,
  ip_hash TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_rate_limit ON analytics_events (event, ip_hash, created_at);
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Self-Hosting

Outlier works without Supabase — rate limiting and waitlist gracefully degrade. You only need:

1. `YOUTUBE_API_KEY` — free from Google Cloud Console
2. `ANTHROPIC_API_KEY` — from Anthropic console

Deploy to Vercel:

```bash
npm run build
vercel --prod
```

Set environment variables in Vercel → Settings → Environment Variables.

## API Cost

| Resource | Cost per analysis |
|----------|-------------------|
| YouTube Data API | $0.00 (free quota, ~4 units) |
| Claude Vision (~50 thumbnails x 2) | ~$0.21 |
| Claude text (comparative) | ~$0.02 |
| **Total** | **~$0.23** |

## License

MIT

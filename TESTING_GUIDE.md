# Outlier — Testing Guide

Dev server: **http://localhost:3000** (`npm run dev`)

---

## Quick Smoke Test (2 minutes)

1. Open http://localhost:3000
2. Verify dark theme: `#0A0A0F` background, orange accent, noise grain overlay
3. Enter two channels (e.g. `@mkbhd` and `@LinusTechTips`), click **Run Analysis**
4. Watch the 6-phase loading stepper animate through each phase
5. Confirm all result sections render (scroll the full page)
6. Check the URL changed to `/results/[slug]` after completion

---

## Page-by-Page Testing

### Homepage — `/`

| Check | Expected |
|-------|----------|
| Hero text | "See exactly how your YouTube channel compares..." |
| Input fields | Two channel URL inputs with placeholder text |
| Run Analysis button | Orange primary button, shimmer animation on hover |
| Feature cards (3) | "10 Thumbnail Signals", "Gap Table + Priority", "30-Second Analysis" |
| Famous Matchups | 5 preset cards (MrBeast, Ali Abdaal, MKBHD, Graham Stephan, Jeff Nippard) |
| Footer | "Outlier — YouTube Channel Gap Analyzer" + waitlist link |
| Animations | Staggered fade-in-up on load |

**Input formats to test:**
- Full URL: `https://www.youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw`
- Handle: `@LinusTechTips`
- Short URL: `https://youtube.com/@mkbhd`
- Custom URL: `https://www.youtube.com/c/mkbhd`

### Results (Live) — `/results?a=X&b=Y`

This is the SSE streaming page. After entering channels on the homepage, you land here.

**Loading phases (in order):**
1. Resolving channels
2. Fetching videos
3. Analyzing thumbnails
4. Computing metrics
5. Generating insights
6. Complete

Each phase should show: pulsing dot for current, checkmark for completed, muted dot for pending.

**Result sections (scroll order after completion):**

| Section | Component | What to verify |
|---------|-----------|----------------|
| **Grade + Roast** | GradesBadge | Two large letter grades (A-F), colored (green/blue/yellow/orange/red), rationale text |
| | RoastCard | Dark gradient card, flame icon, devastating sentence in quotes, "Analyzed by Outlier" watermark |
| **Strategic Insights** | CoreFinding | 3-5 sentence opinionated diagnosis |
| | StealThis | 3 tactics with crosshair icons, "action + proof" format |
| **Thumbnail Analysis** | GapTable | 10-row signal comparison table, delta column, priority badges (HIGHEST/HIGH/MEDIUM/LOW) |
| | ThumbnailCorrelation | Signal-performance correlation (strong positive → negative), top vs bottom presence percentages |
| | OutlierCallout | Top-performing videos with multiplier badges and AI explanations |
| **Content Performance** | EngagementRate | Like rate, comment rate, combined rate per channel, winner indicator |
| | ViewVelocity | 4-quartile bar chart per channel, shape badge (spiked/moderate/consistent), top/bottom ratio |
| | FormatBreakdown | Duration buckets (Shorts/Mid/Standard/Longform), vertical vs horizontal split |
| **Content Strategy** | UploadCadence | Posts/week, grade circle, trend arrow, momentum badge, best day, longest gap |
| | TitleIntelligence | 7 dimensions: word count, questions, numbers, specificity, emotional tones, first words, power words, formula cards |
| | TagStrategy | Tag volume bars, specificity mix (broad/medium/niche), top categories, unique opportunities |
| **Share + Viral** | TweetableCallout | Pre-written tweet with copy button |
| | ShareButton | "Share results" button → copies URL → changes to "Link copied!" with green checkmark |
| | OutlierWatermark | "Analyzed by Outlier" footer badge |

**URL behavior:** After analysis completes, browser URL should update to `/results/[slug]` via `pushState` (no page reload).

### Shareable Results — `/results/[slug]`

Open a slug URL in a new incognito window to test the server-rendered shareable view.

| Check | Expected |
|-------|----------|
| Loads from Supabase | No loading spinner — data is pre-fetched server-side |
| Same layout | All sections match the live results page |
| "Try your own" button | Links to homepage `/` |
| OG metadata | Check with `curl -I` — should have `og:title`, `og:description` with roast card text |
| Invalid slug | `/results/nonexistent` should show 404 |

### Waitlist — `/waitlist`

Basic form page for email collection. Should be functional with Supabase.

---

## Feature-Specific Tests

### Rate Limiting

| Test | Expected |
|------|----------|
| Run 3 audits from same IP | All 3 succeed, `remaining` count decreases 3 → 2 → 1 → 0 |
| Run 4th audit | HTTP 429, error message: "You've used your 3 daily audits. Join the waitlist..." |
| `waitlistUrl` in 429 response | Should include `/waitlist` |
| Check Supabase `analytics_events` | Should have `rate_limited` event with `ip_hash` |

### Share Flow

1. Complete an audit
2. Click "Share results" button
3. Verify clipboard contains `https://getoutlier.com/results/[slug]`
4. Verify "Link copied!" feedback with green checkmark
5. Open the copied URL in incognito → should load the saved result
6. Check Supabase `analytics_events` → should have `share_copied` event

### Tweetable Callout

1. Find the tweetable callout section at bottom of results
2. Click copy button
3. Verify the copied text is <240 chars
4. Verify `[share_url]` placeholder is replaced with actual URL

### Comparison Presets

1. On homepage, click any preset card (e.g. "MKBHD vs Linus Tech Tips")
2. Navigates to `/results/preset-mkbhd`
3. **Note:** Presets currently use placeholder slugs — will 404 until pre-generated. This is expected for now.

---

## API Tests (curl)

### POST /api/analyze

```bash
# Valid request — streams SSE events
curl -N -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"channelA":"@mkbhd","channelB":"@LinusTechTips"}'

# Missing field — 400
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"channelA":"@mkbhd"}'

# Invalid JSON — 400
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: text/plain" \
  -d 'not json'
```

### POST /api/event

```bash
# Log a client-side event
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"event":"share_copied","properties":{"slug":"abc123"}}'

# Missing event — 400
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{"properties":{}}'
```

---

## Supabase Verification

After running an audit, check these tables:

```bash
# From the outlier directory (already linked)
supabase inspect db table-stats
```

| Table | Check |
|-------|-------|
| `audits` | New row with `slug`, `channel_a`, `channel_b`, `result_json` (JSONB), `expires_at` = 7 days from now |
| `analytics_events` | New row with `event: "audit_run"`, `ip_hash`, channel names in `properties` |
| `thumbnail_signal_cache` | Cached thumbnail scores per channel (check `all_videos` key exists in JSONB — old schema used flat keys) |

---

## Dark Theme Checklist

| Element | Expected |
|---------|----------|
| Page background | `#0A0A0F` (near-black with blue tint) |
| Body grain | Subtle SVG noise overlay (inspect `body::before`) |
| Body glow | Orange radial gradient bottom-center (inspect `body::after`) |
| Cards | `#111118` background, `#1E1E2E` border |
| Card hover (accent) | Orange glow effect on `.card-accent:hover` |
| Primary button | Orange with shimmer `::after` animation |
| Scrollbar | Dark track `#111118`, dark thumb `#2E2E3E` |
| Grade A | Green (`#00D4AA`) |
| Grade B | Blue (`#4DA6FF`) |
| Grade C | Yellow (`#FFD60A`) |
| Grade D | Orange (`#FF9500`) |
| Grade F | Red (`#FF4D00`) |

---

## Mobile Responsiveness

Test at 375px width (iPhone SE):

| Check | Expected |
|-------|----------|
| Homepage hero | Text wraps cleanly, inputs stack |
| Feature cards | Stack to single column |
| Preset cards | Stack to single column |
| Results page | All sections full-width, no horizontal overflow |
| Gap table | Scrollable horizontally if needed, or columns compress |
| Grade badges | Side by side or stacked, still readable |
| Roast card | Text wraps within card boundaries |

---

## Cost Verification

After running one audit, check the server console logs:

- Should show exactly **2 Claude API calls**:
  - 1x Haiku (Vision) — thumbnail analysis
  - 1x Sonnet (Text) — title/tag/strategy/viral
- Estimated cost: ~$0.29 per audit
- Zero additional API calls for engagement, format, cadence, velocity, tag stats (computed locally)

---

## Known Limitations

- **Comparison presets** use placeholder slugs — clicking them will 404 until actual audits are pre-generated
- **OG image** at `/results/[slug]/opengraph-image` requires a deployed environment (Vercel) to render `@vercel/og` — won't work in local dev
- **Rate limiting** resets per-process in dev (in-memory limiter). Restart the dev server to clear.
- **Thumbnail cache** entries from old schema (flat signal keys) will miss cache and re-analyze — this is expected and self-healing

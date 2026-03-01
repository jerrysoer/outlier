# PRD: Outlier — YouTube Channel Gap Analyzer

**Version:** 1.7  
**Status:** Ready to Build  
**Build order:** MVP (this weekend, no auth) → Invite/Auth Layer (Week 2 if MVP validates)  
**Live URL goal:** `getoutlier.app` (hosted) + `github.com/getoutlier/outlier` (open source)  
**Access model:** MVP = fully open, IP rate-limited + waitlist capture. Invite codes + auth added in Week 2.  
**Built artifacts:** `getoutlier-waitlist.jsx` (waitlist page) · `getoutlier-analytics.jsx` (admin gate dashboard)

---

## 1. Problem & Angle

### The Problem

YouTube creators make thumbnail and content decisions on instinct. The data exists — it's all public — but extracting it, analyzing it at scale, and turning it into an actionable gap table has required either expensive tools (VidIQ/TubeBuddy focus on SEO, not visual strategy) or manual AI analysis that only technical people can run.

Becky Isjwara's LinkedIn post showing a Claude-generated thumbnail gap analysis went viral because creators recognized immediately: *this is exactly what I've been trying to figure out.* Nobody has productized it.

### The Angle

**Every existing tool analyzes keywords. Outlier analyzes what viewers actually see.**

VidIQ → keyword strategy. TubeBuddy → SEO optimization. Outlier → visual competitive intelligence.

Thumbnail signals (face presence, eye contact, emotion, text, color) are the highest-leverage lever for CTR. No tool has made this analysis accessible, fast, and free.

### Why Now

The "vibe coding" moment means a solo builder can ship this in a weekend. The viral screenshot already proved demand. First to ship a clean, usable version wins the Google indexing and the social media moment.

### Who This Is For

**Primary ICP:** YouTube creators managing channels 10K–1M subscribers who are growth-focused and obsess over analytics. Also: YouTube producers, video strategists, and social media managers running creator accounts.

---

## 2. Positioning

### April Dunford Statement

```
FOR YouTube creators and channel managers at the 10K–1M subscriber level
WHO make thumbnail and content decisions on instinct because competitive visual data 
    is inaccessible without manual AI work or expensive agencies
VIDGAP IS A channel intelligence tool
THAT shows you exactly where your channel underperforms versus channels one level 
    above you — with AI-analyzed evidence, in 30 seconds
UNLIKE VidIQ/TubeBuddy (keyword/SEO focus, no visual analysis) or manual Claude Code 
    analysis (requires technical skills, no UI, no scale)
OUR PRODUCT gives you the gap table instantly, free to start, open source to self-host
```

### One-liner (hero headline)
> "See exactly how your YouTube channel compares to the ones beating you."

### Launch hook (social copy)
> "Stop guessing why their videos get 10x more views. Now you can see it."

### Narrative hook
> "Creators have always known thumbnails matter. Outlier is the first tool that shows you *specifically* how yours are different from channels outperforming you."

---

## 3. Core Features — Phased

### Phase 1: This Weekend — MVP + Waitlist Capture

**Goal:** Validate that people actually use it and share it. Capture demand via waitlist while the tool runs open + rate-limited.

No auth. No credits. No invite codes yet. The analyzer is fully open behind an IP rate limit. The waitlist page runs in parallel to capture emails from people who want more access — this list becomes your Phase 2 seed.

| Feature | Description | Extra Cost | Acceptance Criteria |
|---|---|---|---|
| **Thumbnail Signal Gap Table** | Paste 2 URLs → fetches last 50 videos → Claude Vision analyzes thumbnails → 10-signal gap table with priority labels + core finding | ~$0.21 Claude Vision | Renders in <45s, all 10 signals returned, HIGHEST/HIGH/MEDIUM/WATCH labels |
| **Thumbnail-Performance Correlation** | For each channel, identify which thumbnail signals appear in top 10 vs bottom 10 videos by views. Shows which signals *actually predict* performance, not just which are present | $0 (same Vision call) | Top/bottom split returned per signal, correlation direction labeled |
| **Engagement Rate Comparison** | Like rate + comment rate + combined engagement rate per channel, A vs B. Normalizes for audience size — a smaller channel with higher engagement is winning on content quality | $0 | Rates calculated from existing like/comment/view counts, gap labeled |
| **Format Mix Analysis** | Classify all 50 videos per channel into: Shorts (<60s), Mid (1-10min), Standard (10-20min), Longform (>20min). Show distribution % per channel side-by-side | $0 | Duration field parsed, 4 buckets calculated, % distribution rendered |
| **Vertical vs Horizontal Breakdown** | Shorts (<60s) = vertical (9:16). Everything else = horizontal (16:9). Show what % of content is vertical vs horizontal per channel and how that correlates with view performance | $0 | Derived from duration field, no extra API call |
| **Publish Volume & Cadence** | Posts per month for last 3 months — actual count, not just a grade. Trend direction (accelerating/decelerating/stable). Longest gap between uploads. Best performing day of week | $0 | Monthly counts from publish timestamps, longest gap in days, best day from views×day correlation |
| **View Velocity Distribution** | Quartile breakdown of views across all 50 videos — top 25%, mid, bottom 25%. Reveals whether a channel has consistent reach or is algorithm-dependent on a few outliers | $0 | Four quartile averages calculated, rendered as distribution comparison |
| **Title Intelligence** | Expanded from basic formula decoder: emotional tone mix (curiosity/fear/aspiration/controversy), question vs statement ratio, specificity score, number usage, first-word patterns, avg title length | ~$0.01 Claude text | All 7 dimensions returned per channel in same Claude text call |
| **Tag Strategy Gap** | Compare tag volume, specificity, and category coverage between channels. Tags are in the API response and ignored by every other tool | $0 | Tag count, avg tag length, top category tag per channel |
| **Upload Cadence Momentum** | Acceleration signal: compares last 30 days vs prior 30 days publish rate. Flags if a channel went dark for >3 weeks (algorithm reset risk) | $0 | Momentum label (accelerating/decelerating/stable), longest gap flagged |
| **IP Rate Limit** | 3 audits per IP per day via Vercel Edge Middleware | $0 | Blocked on 4th attempt, clean error state with waitlist CTA |
| **Waitlist Page** | Email capture at `getoutlier.app/waitlist` — founding member counter, spot progress bar, success state | $0 | Email saved to Supabase, duplicate handled, spot counter live |
| **Channel Grade Badge** | A/B/C/D/F letter grade per channel derived from gap severity and signal count. Shown prominently at top of results. "I got a C. What did you get?" is a conversation starter. | $0 | Grade calculated from weighted gap score, both channels graded, rendered as large badge |
| **Roast Card / Pull Quote** | Auto-generate a bold typographic summary card at the top of results — dark background, red headline, one devastating sentence summarizing the #1 gap. Designed to be screenshotted and tweeted. | $0 (Claude generates in Call 2) | Single sentence generated, renders as standalone card above gap table |
| **"Steal This Strategy" Section** | 3 specific actionable tactics derived from the gap analysis — not vague ("use more faces") but precise ("add face to your next 5 thumbnails — their face-forward videos average 2.1M vs 340K without"). Claude generates these from the correlation data. | $0 (same Claude call) | 3 tactics rendered below gap table, each with channel B's specific stat as proof |
| **Shareable Results URL** | After audit completes, generate `/results/[nanoid]` URL stored in Supabase for 7 days. Share button copies the URL. OG image is the roast card. When pasted on Twitter the preview IS the insight. | $0 | Slug generated, results stored, share button copies URL not just text, OG image renders correctly |
| **Tweetable Callout** | Pre-written tweet copy that @mentions the channel being compared. One click to copy. Format: "I analyzed my channel vs @[channel] — their top signal: X (91%). Mine: Y%. getoutlier.app/results/[slug]" | $0 | Copy generated from result data, copies to clipboard, includes share URL |
| **"Powered by Outlier" Watermark** | Small tasteful badge bottom-right of the results output and roast card. Feels like a badge of honor not a watermark — "Analyzed by Outlier" in matching typography. Every screenshot is a passive ad. | $0 | Visible in all shareable components, links to homepage |
| **Comparison Presets** | 5-6 pre-loaded famous channel pairs on the homepage — MrBeast vs mid-tier, Ali Abdaal vs Thomas Frank etc. Users can view instantly without inputting URLs. Shows new users what the output looks like. Results for presets are pre-generated and cached. | $0 (pre-run once) | Presets visible on homepage, click loads cached result instantly, each preset has its own shareable URL |

**The waitlist page is already built:** `getoutlier-waitlist.jsx` — wire the submit handler to Supabase and update the `SPOTS_TAKEN` constant from a live query.

**What you learn from MVP:**
- Do people actually run more than 1 audit? (validates credit model)
- Do they share the output? (validates viral mechanic)
- Which channels do they analyze? (reveals real ICP)
- How many waitlist signups in 7 days? (reveals conversion from visitor → interested)
- How many rate limit hits? (strongest demand signal)
- Which preset is viewed most? (reveals which niches/creators your ICP cares about)

---

### Virality Mechanics (Phase 1)

Every viral feature must be zero extra cost and serve double duty — useful to the user AND a distribution channel for the product.

**Grade Badge — "I got a C. What did you get?"**

A/B/C/D/F letter grade per channel, large and prominent at the top of results. Calculated from a weighted score across: gap severity, engagement rate, upload consistency, title specificity, format diversity.

The grade is the shareable hook. Not the table (too dense to share), not the core finding (too long) — the grade. One letter that makes people feel something. Creators will share a C because it's honest. They'll share an A to brag. Both drive traffic.

Grade weighting:
- Thumbnail signal gaps (40%) — biggest driver of reach
- Engagement rate vs channel B (20%) — content quality signal
- Upload consistency (20%) — algorithmic health
- Title specificity score (20%) — CTR driver

**Roast Card — the screenshot moment**

A typographic card at the top of results. Dark background, stamp-red headline, one sentence. Claude generates it from the #1 gap in the correlation data. Designed to look good at 1200×628 (Twitter card dimensions).

```
┌─────────────────────────────────┐
│  OUTLIER VERDICT                │
│                                 │
│  You've posted 3x more videos   │
│  than MrBeast this year.        │
│  He got 847x more views.        │
│                                 │
│  You never show your face.      │
│  He does it 91% of the time.    │
│                                 │
│  [getoutlier.app]  Analyzed by Outlier │
└─────────────────────────────────┘
```

This card IS the OG image for the shareable URL. When pasted on Twitter, the preview is the insight — no click required to understand the value.

**Shareable Results URL**

`/results/[nanoid-8]` — stored in Supabase `audits` table for 7 days. Anyone with the URL can view the full result. No login required.

Share button copies the URL. OG meta tags on the results page render the roast card as the preview image (use Vercel OG image generation or a static pre-rendered version).

This transforms every share from "hey look at this tool" to "hey look at THIS result" — the content travels with the link.

**"Steal This Strategy" — the most shareable section**

Three specific tactics derived from the performance correlation data. Not generic advice — precise, numbered, with Channel B's actual stat as proof. Creators will screenshot this section specifically because it makes them look smart for finding it.

Positioned below the gap table with a "🎯 What to steal from [Channel B] this week" heading.

**Tweetable Callout — distribution built into the UI**

Pre-written tweet that @mentions the channel being compared. One click to copy. Positioned next to the share button.

```
I analyzed my channel vs @mkbhd on Outlier

Their top thumbnail signal: close-up face (91%)
Mine: 12%

That's why they get 10x my views on the same topics 💀

getoutlier.app/results/[slug]
```

If 1 in 50 users sends this, and the mentioned creator sees it, that's free reach to millions of subscribers. You don't need it to happen often — you need the mechanic to exist.

**Comparison Presets — zero-friction demo**

5 pre-loaded famous channel pairs on the homepage. Click → instant cached result. No URL input required. Solves the cold-start problem for new visitors who want to see the output before committing their own channel.

Preset pairs to pre-generate:
| Pair | Why |
|---|---|
| MrBeast vs a 500K gaming channel | Universal recognition, dramatic gap |
| Ali Abdaal vs Thomas Frank | Same niche, knowledge creator audience |
| Marques Brownlee vs Linus Tech Tips | Tech audience — your likely early adopters |
| Graham Stephan vs Andrei Jikh | Finance audience, relatable gap |
| A fitness channel vs Jeff Nippard | Health/fitness niche |

Pre-run these once, cache the JSON, serve instantly. Each preset has its own `/results/[preset-slug]` URL — shareable, indexable, and a source of organic SEO traffic over time.

**"Powered by Outlier" Watermark**

Appears in: roast card (bottom right), results page footer, OG image. Small, same typography as the rest of the UI. Feels like a badge, not an ad. Every screenshot that circulates carries it.

**Post-Launch: Weekly Waitlist Email (Day 3 post-launch)**

Single automated email to waitlist signups 48 hours after they join:

```
Subject: The #1 signal that separates top YouTube channels from everyone else

We analyzed 50 videos from the top 5 channels in [their niche if known, else generic].

The #1 signal in their top-performing videos: [stat from preset analysis]

Your channel gap report is ready when you get access.
→ You're #[N] on the waitlist [progress bar]

— Outlier
```

No sequence. One email. Keeps the list warm, delivers value before access, creates urgency with the spot counter.

---

### Phase 2: Week 2 — Auth + Invite System (If MVP Gate Clears)

**Trigger to build Phase 2:** MVP validation gate hit (see Section 9). The clearest single signal: 20+ rate limit hits OR 50+ waitlist signups in Week 1. Either one alone is enough to justify building the access layer.

Only build this if the MVP proves demand. Don't build it speculatively.

| Feature | Description |
|---|---|
| **Supabase Auth** | Magic link + Google OAuth via `@supabase/ssr`. No Clerk. |
| **Supabase DB** | `profiles`, `invite_codes`, `waitlist`, `audits`, `credit_transactions`, `analytics_events` tables |
| **Invite code system** | `VG-XXXXXXXX` codes generated in admin, validated on signup |
| **Waitlist → invite flow** | Approve waitlist emails manually, generate code, DM it to them |
| **Referral links** | `getoutlier.app/invite/[slug]`, double-sided credit reward on first audit |
| **Credit wallet** | 3 credits/month free, rollover 2x cap, visible counter |
| **Admin page** | Generate codes, view waitlist queue, approve/reject, see referral stats |
| **Analytics dashboard** | `getoutlier-analytics.jsx` wired to live Supabase `analytics_events` queries |
| **Founding Member status** | First 500 to activate — permanent +1 credit/month |

---

### Phase 3: Weeks 3-4 — Stickiness + Monetization

| Feature | Description |
|---|---|
| **Single Channel Health Report** | One URL, no competitor — momentum score, outlier videos, cadence |
| **Vertical Benchmarking** | How you rank among 10 similar-sized channels in your niche |
| **Save + Share Report** | Shareable URL for gap report, stored 30 days |
| **Stripe + paid tiers** | Creator $9, Pro $19, Agency $49, credit packs |

---

### Phase 4: Premium Hosted Features

| Feature | Tier |
|---|---|
| Batch audit (5 competitors at once) | Pro |
| Monthly tracking (gap closing/widening over time) | Pro |
| Trending Topic Radar | Pro |
| Thumbnail concept generator | Pro |
| Weekly email digest | Pro |
| API access for agencies | Agency |
| White-label PDF reports | Agency |

---

## 4. Pricing & Credit System

### Cost Basis

| Action | Cost |
|---|---|
| YouTube Data API (~28 units per audit) | $0.00 (free quota — ~350 audits/day) |
| Claude Vision Call (100 thumbnails + correlation analysis) | ~$0.32 |
| Claude Text Call (titles + tags analysis) | ~$0.02 |
| **Total per full audit** | **~$0.34** |

Cost increased from $0.23 → $0.34 due to expanded thumbnail batch (50 videos per channel vs ~20 before) and performance correlation layer. Still 600%+ margin at $2/credit. Adjust credit cost basis in pricing model accordingly — the output is 4x richer, justifying the same price point.

### Credit System

**1 credit = 1 channel gap analysis (any core feature)**

| Action | Credits |
|---|---|
| Channel Gap Analysis (2 channels) | 1 |
| Single Channel Audit | 1 |
| Outlier Video Deep Dive | 1 |
| Batch 5-channel sweep | 4 |
| Monthly tracking report | 2 |

### Pricing Tiers

| Tier | Price | Credits/mo | Rollover Cap | Margin |
|---|---|---|---|---|
| **Free** | $0 | 3 | 6 (2x) | Loss leader |
| **Creator** | $9/mo | 5 | 10 (2x) | ~683% |
| **Pro** | $19/mo | 15 | 30 (2x) | ~451% |
| **Agency** | $49/mo | 50 | 100 (2x) | ~326% |
| **À la carte** | $2/credit | 1 | N/A | ~769% |
| **Credit pack** | $15 for 10 | 10 | N/A | ~552% |

**Blended target margin: ~600-700%**

### Rollover Policy
Credits roll over up to **2x monthly allocation** (reward loyalty). Creator banks max 10, Pro max 30, Agency max 100. Unused credits beyond the cap expire. Communicated clearly as a feature: *"Unused credits carry over — use them when you need them."*

### Open Source → Hosted Bridge

| Open Source (Self-Host) | Hosted Free | Hosted Paid |
|---|---|---|
| Bring your own API keys | 3 audits/month | Credit system |
| Unlimited if self-hosted | No setup | No setup |
| MIT license | Email support | Priority support |
| Community support | Saved reports 7 days | Saved reports 90 days |

**Framing:** *"Free forever if you self-host. Or let us run it — 3 audits/month free, no credit card."*

### Upgrade Triggers (Phase 2)
- Credit counter always visible (not hidden until empty)
- At 1 credit remaining → "Running low" nudge
- At 0 → paywall: *"You ran X audits this month. Serious creators run one every week."*
- After big gap found → "Track this monthly" upsell to Pro

---

## 5. Waitlist & Invite System

### Phase 1 (This Weekend) — Waitlist Only

The waitlist page is already built: **`getoutlier-waitlist.jsx`**

It runs at `getoutlier.app/waitlist` (and linked from the main landing page after rate limit hit). No auth, no Supabase yet — Phase 1 only needs the `waitlist` table plus the Supabase anon key to insert rows.

**Minimum Supabase setup for Phase 1 waitlist:**

```sql
create table waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  status     text default 'pending',  -- pending | approved | rejected
  created_at timestamp default now()
);
```

**Wire the submit handler in `getoutlier-waitlist.jsx`:**

```typescript
// Replace the mock setTimeout with:
const { error } = await supabase
  .from('waitlist')
  .insert({ email })

if (error?.code === '23505') {
  setErrorMsg("You're already on the list.")
  setStatus("error")
  return
}
setStatus("success")
```

**Live spot counter (one query on mount):**

```typescript
const { count } = await supabase
  .from('waitlist')
  .select('*', { count: 'exact', head: true })

// Pass to SPOTS_TAKEN — updates the progress bar automatically
```

**Where to surface the waitlist link:**
- Rate limit error state: *"You've used your 3 daily audits. Join the waitlist to get early access to more →"*
- Landing page footer: subtle "Join waitlist" link
- Standalone page: `getoutlier.app/waitlist`

---

### Phase 2 — Invite Code System

When Phase 2 is built, the waitlist becomes the invite queue. You approve emails from the Supabase table, generate a `VG-XXXXXXXX` code via the admin page, and DM it to them manually. No automated email needed — you're doing this personally at this scale.

**Full schema (Phase 2):** See Section 7 Data Model for complete SQL.

**Two paths into the tool (Phase 2 landing page):**

```
getoutlier.app
    │
    ├── Have an invite code?  →  Sign up with Supabase Auth  →  Enter code  →  Access
    │
    └── No code?  →  getoutlier.app/waitlist  →  Email captured  →  You DM code when ready
```

**Referral links (Phase 2):** Every activated user gets `getoutlier.app/invite/[slug]`. Sharing it grants the invitee +1 bonus credit on their first audit, inviter gets +2 credits after invitee's first audit. Max +20 referral credits/month.

**Founding Member:** First 500 users to run their first audit. Permanent +1 credit/month, early feature access, listed in README. Counter shown live on the waitlist page (`SPOTS_TAKEN` prop).

---

### Admin Flow (Both Phases)

| Action | Phase 1 | Phase 2 |
|---|---|---|
| See waitlist emails | Supabase table editor | `/admin` dashboard page |
| Approve someone | Copy email, DM manually | Click approve → code generated → DM code |
| Generate invite codes | N/A | Admin page → bulk generate 10/25/50 |
| See gate metrics | Vercel logs + Supabase SQL editor | `getoutlier-analytics.jsx` wired to live data |

---

### Access Model: Two Paths In

```
Landing page (public, always)
        │
        ├── Have an invite code? → Sign up → Access immediately
        │
        └── No code? → Join waitlist → Jerry approves in batches
                                      → Approved users get invite code via email
```

**Path 1: Invite Code (instant access)**
Every existing user gets 3 invite codes. They share the link or code directly. Recipient signs up, enters code, gets immediate access. No waiting.

**Path 2: Waitlist (queue)**
Public landing page has a waitlist form (email only, no friction). Jerry manually approves batches — first batch = 50 people, weekly batches after that based on capacity. Approved users receive an email with a personal invite code.

---

### Referral Mechanics

Every user gets a **personal referral link**: `getoutlier.app/invite/[unique-slug]`

This is different from an invite code — it's persistent, shareable publicly (in tweets, LinkedIn posts, YouTube community tabs), and tracks every signup that flows through it.

**Double-sided credit reward:**

| Event | Inviter gets | Invitee gets |
|---|---|---|
| Invitee signs up via your link | Nothing yet | Nothing yet |
| Invitee runs their first audit | +2 credits | +1 bonus credit (4 total instead of 3) |
| Invitee upgrades to paid | +5 credits | Standard tier credits |

The reward fires on **first audit, not on signup** — this filters out dead accounts and rewards inviting people who actually use the tool.

**Credit reward caps:**
- Max +20 referral credits per month (prevents gaming)
- No cap on total referrals — power referrers accumulate over time
- Referral credits count toward rollover like regular credits

---

### Founding Member Status

First **500 users** to activate (run their first audit) get permanent **Founding Member** status:

| Perk | Detail |
|---|---|
| Founding Member badge | Visible on their profile (Phase 2) |
| Permanent +1 bonus credit/month | On top of their tier's allocation, forever |
| Early access to all new features | 1 week before general availability |
| Listed in README contributors | GitHub recognition |

This creates urgency without fake countdown timers. "Founding Member" is a real, permanent status. Communicate it clearly on the landing page: *"First 500 members get Founding Member status — permanent perks, forever."*

---

### Invite Code Technical Spec

**Supabase tables:**

```sql
-- Invite codes table
invite_codes (
  id          uuid primary key,
  code        text unique not null,        -- 8-char alphanumeric, e.g. "VG-X7K2M9"
  created_by  uuid references users(id),   -- null if Jerry created it
  used_by     uuid references users(id),   -- null until redeemed
  used_at     timestamp,
  status      text default 'active',       -- active | used | revoked
  created_at  timestamp default now()
)

-- Waitlist table
waitlist (
  id          uuid primary key,
  email       text unique not null,
  created_at  timestamp,
  status      text default 'pending',      -- pending | approved | rejected
  approved_at timestamp,
  invite_code text references invite_codes(code)
)

-- Referral tracking
referrals (
  id            uuid primary key,
  referrer_id   uuid references users(id),
  referee_id    uuid references users(id),
  referral_slug text,
  signed_up_at  timestamp,
  activated_at  timestamp,                 -- when first audit run
  credits_paid  boolean default false
)

-- Users (extends Supabase auth.users)
users (
  id              uuid primary key references auth.users(id),
  email           text,
  credits         int default 3,
  credits_rollover int default 0,
  tier            text default 'free',
  is_founding_member boolean default false,
  referral_slug   text unique,             -- their personal referral link slug
  invited_by      uuid references users(id),
  created_at      timestamp
)
```

**Invite code format:** `VG-XXXXXXXX` — 8 random alphanumeric chars, prefixed with `VG-`. Easy to read aloud, hard to brute-force.

**Referral slug format:** `getoutlier.app/invite/[first-name]-[4-random-chars]` — e.g. `getoutlier.app/invite/jerry-k9x2`. Personal enough to feel human, random enough to be unique.

---

### Auth Flow (Supabase Auth — No Clerk)

Supabase Auth handles everything natively:
- **Magic link** (email) — user enters email, gets a one-click sign-in link
- **Google OAuth** — one-click Google sign-in
- **Session management** — Supabase handles JWTs, refresh tokens, SSR sessions via `@supabase/ssr`

```
User lands on getoutlier.app/invite/[slug] OR has a code
        ↓
Supabase Auth: email magic link or Google OAuth
        ↓
On auth.users insert (Supabase DB trigger or webhook):
  - Validate invite code (check invite_codes table)
  - If valid: mark code used, create profiles row, assign referral_slug
  - If invalid: delete auth.users record, return error
        ↓
User lands in dashboard with 3 credits (+ 1 bonus if via referral)
        ↓
After first audit: fire referral credit to inviter (Supabase DB function)
```

**Middleware (Next.js + Supabase SSR):** All `/app/*` routes check for valid Supabase session via `createMiddlewareClient`. Unauthenticated → redirect to landing.

---

### Invite Management (Jerry's Admin)

Simple admin route at `/admin` (protected by a separate admin role in Clerk):

| Function | Detail |
|---|---|
| Generate invite codes in bulk | Create 10/25/50 codes at once |
| View waitlist | Email, signup date, approve/reject |
| Approve waitlist user | Generates code + triggers welcome email |
| View referral leaderboard | Who's driving the most activations |
| Revoke a code | In case of abuse |
| See founding member count | Real-time counter toward 500 |

No external admin tool needed — build a minimal `/admin` page in Next.js, protected by checking `auth.users` role in Supabase (set `is_admin = true` on your own profile row).

---

### Landing Page States

**State 1: No invite (public landing)**
- Hero: "YouTube channel intelligence. Invite only."
- Shows the gap table screenshot / demo
- Waitlist form (email + "Join waitlist")
- "Have an invite code? Sign in →"
- Founding member counter: "412 of 500 founding member spots remaining"

**State 2: Arriving via referral link**
- "You've been invited by [Referrer Name]"
- Their avatar if available from YouTube/social
- Sign up CTA is primary (not waitlist)
- Same founding member counter

**State 3: Logged in**
- Dashboard with credit counter
- Your referral link prominently displayed: "Invite a creator → earn credits"
- Your 3 invite codes with status (active/used)

---

### Environment Variables

**Phase 1 — this weekend (6 vars):**

| Variable | Status | Source |
|---|---|---|
| `YOUTUBE_API_KEY` | ❌ Need to create | Google Cloud Console → APIs → YouTube Data API v3 |
| `ANTHROPIC_API_KEY` | ✅ Have it | Anthropic console |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ Need to create | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ Need to create | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Need to create | Supabase project → Settings → API (needed for server-side event logging) |
| `IP_HASH_SALT` | ❌ Generate locally | Any random string — `openssl rand -base64 32` |

`IP_HASH_SALT` is required for the `hashIp()` function. Without it, IP hashing is unsalted and trivially reversible. Generate once, never rotate (rotating it breaks historical IP grouping).

`SUPABASE_SERVICE_ROLE_KEY` moved to Phase 1 because server-side event logging (`analytics_events` inserts from API routes) requires it — the anon key doesn't have write access to that table from the server.

**Phase 2 additions:**

| Variable | Status | Source |
|---|---|---|
| `STRIPE_SECRET_KEY` | ❌ | Stripe dashboard (Phase 3 only) |

---

## 6. Design Direction

### Visual Mood
**Dark, data-dense, editorial intelligence.** Think Bloomberg Terminal meets modern SaaS. Not playful. Not cute. This is a professional analytical tool for people who take their channels seriously.

### Reference Vibes
- **Vercel Analytics dashboard** — dark, clean, data-forward
- **Linear** — confident, premium, no fluff
- **Pitch.com** — editorial, sophisticated, bold typography

### Theme
Dark mode only for MVP. Light mode Phase 2.

### Color Palette
| Token | Value | Usage |
|---|---|---|
| Background | `#0A0A0F` | Page background, near-black |
| Surface | `#111118` | Card surfaces |
| Border | `#1E1E2E` | Subtle borders |
| Accent | `#FF4D00` | Priority HIGHEST, CTAs, key numbers |
| Warning | `#FF9500` | Priority HIGH |
| Caution | `#FFD60A` | Priority MEDIUM |
| Muted | `#4A4A5A` | Priority WATCH, secondary text |
| Text primary | `#F0F0FF` | Main text |
| Text secondary | `#8888AA` | Labels, subtitles |
| Positive gap | `#00D4AA` | When your channel is AHEAD |
| Negative gap | `#FF4D00` | When your channel is BEHIND |

### Typography
- **Display:** `Space Mono` or `IBM Plex Mono` — monospace for the data table (feels like real intelligence output)
- **Body/UI:** `DM Sans` or `Outfit` — clean, modern
- **Numbers/percentages:** Monospace, tabular figures

### Density
Compact and information-dense. This is an analytics tool. Whitespace is used to separate sections, not to make it feel "airy."

### The Killer Screenshot Element
The gap table itself IS the marketing asset. It needs to look like something worth screenshotting. Specifically:
- Priority badges must pop (colored pills: red/orange/yellow/gray)
- Gap numbers must be large and colored (red for negative, teal for positive)
- The "Core Finding" box below the table should have a left-border accent and slightly different background
- The whole table should have a subtle outer glow — like a screen in a dark room

---

## 7. Data & API Layer

### YouTube Data API v3

**What it fetches per channel (all used in MVP analysis):**

| Field | API part | Used for |
|---|---|---|
| Channel name, subscriber count, profile image | `snippet`, `statistics` | Display, context |
| Last 50 video IDs | `playlistItems` | All analysis |
| Title | `snippet.title` | Title intelligence, tag analysis |
| Publish timestamp (date + hour) | `snippet.publishedAt` | Cadence, best day, momentum |
| View count | `statistics.viewCount` | Velocity, quartile distribution, engagement |
| Like count | `statistics.likeCount` | Engagement rate |
| Comment count | `statistics.commentCount` | Engagement rate |
| Duration (ISO 8601) | `contentDetails.duration` | Format mix, Shorts detection, vertical/horizontal |
| Tags array | `snippet.tags` | Tag strategy gap |
| Thumbnail URLs | `snippet.thumbnails` | Claude Vision analysis |
| Description length | `snippet.description` | Optional tag context |

**API units consumed per audit:**
- Channel lookup: ~3 units
- Video list via playlistItems (50 videos): ~6 units
- Video details batch (titles, duration, likes, comments, tags): ~5 units
- **Total: ~14 units per channel, ~28 per audit**
- Free quota: 10,000 units/day = ~350 full audits/day before quota increase

**Shorts detection (no extra API call):**
Classify as Short if `contentDetails.duration` ≤ PT60S (ISO 8601 for 60 seconds). This covers ~95% of Shorts accurately. Shorts = vertical (9:16). All other videos = horizontal (16:9). Aspect ratio is not returned directly by the API — duration is the reliable proxy.

**Auth:** API key only (no OAuth needed). Public data.

**Rate limiting:** Vercel Edge middleware, 3 audits/IP/day on free tier.

### Claude API — Two Calls Per Audit

**Call 1: Vision Analysis (thumbnails + performance correlation)**

Pass all thumbnail URLs for both channels. Also pass view counts per video so Claude can identify top 10 vs bottom 10 performers and find which signals correlate with performance.

```
You are a YouTube competitive intelligence analyst.

CHANNEL A: [name], [subscriber_count] subscribers
Videos (in order of view count, descending):
[video_1_title] — [views] views — [thumbnail_url]
[video_2_title] — [views] views — [thumbnail_url]
... (all 50 videos)

CHANNEL B: [same structure]

THUMBNAIL SIGNALS to score (0.0–1.0 = % of thumbnails containing signal):
1. close_up_face — human face fills >30% of frame
2. eye_contact — subject looking directly at camera
3. high_energy_expression — exaggerated emotion (shock, excitement, joy)
4. text_overlay — any text on thumbnail
5. text_legible — text readable at 120px width
6. warm_color_temp — dominant warm tones (red/orange/yellow)
7. low_bg_complexity — clean, uncluttered background
8. logo_presence — channel logo or watermark visible
9. before_after_framing — split frame or transformation implied
10. face_free — no human face present

TASKS:
1. For each channel, score all 10 signals across ALL their thumbnails (0.0–1.0)
2. For each channel, score the same 10 signals on TOP 10 videos only (by views)
3. For each channel, score the same 10 signals on BOTTOM 10 videos only (by views)
4. Write a core_finding (3-5 sentences): opinionated strategic diagnosis of the visual gap, what it means for CTR, and the single highest-leverage change Channel A should make

Return ONLY valid JSON. No preamble. No markdown.
```

**Call 2: Text Analysis (titles + tags + viral outputs — same call, no Vision)**

```
You are a YouTube content strategist analyzing two channels.

CHANNEL A: [name]
Titles with view counts:
"[title]" — [views]
... (all 50)
Tags (from top 10 videos): [tag list]

CHANNEL B: [name]
... (same structure)

ANALYZE and return JSON only:

TITLE INTELLIGENCE (per channel):
- top_3_formats: most common structural patterns
- emotional_tone_mix: % curiosity_gap / fear / aspiration / controversy / neutral
- question_ratio: % of titles that are questions
- number_usage: % of titles containing a specific number
- specificity_score: 1-10
- first_word_distribution: top 3 opening words/types
- avg_word_count: average title word count
- power_word_examples: 3 highest-performing title examples

TAG STRATEGY (per channel):
- tag_count_avg, specificity_mix, top_categories, unique_tags

CHANNEL GRADES:
- Grade each channel A/B/C/D/F based on: consistency, engagement rate, format diversity, 
  upload cadence, title specificity. A = strong across all. F = weak across all.
- Include a one-sentence grade rationale per channel.

ROAST CARD:
- Single devastating sentence summarizing the #1 gap Channel A must close.
- Format: bold, specific, uses real numbers from the data.
- Example: "You've posted 3x more than [Channel B] this year and gotten 12x fewer views — 
  the entire gap is that you never show your face."

STEAL THIS STRATEGY (3 tactics for Channel A):
- Each tactic: specific action + Channel B's stat that proves it works
- Example: "Add your face to your next 5 thumbnails — [Channel B]'s face-forward videos 
  average 2.1M views vs 340K without."
- Must be implementable this week, not vague

TWEETABLE CALLOUT:
- Pre-written tweet copy (under 240 chars) that @mentions Channel B handle if identifiable
- Includes the #1 gap stat, casual tone, ends with [share_url] placeholder
- Example: "Analyzed my channel vs @mkbhd — their top thumbnail signal: close-up face (91%). 
  Mine: 12%. That's the entire gap. [share_url]"
```

### Combined Output Schema

```json
{
  "channel_a": {
    "name": "string",
    "subscriber_count": 0,
    
    "thumbnail_signals": {
      "all_videos": { "close_up_face": 0.34, "eye_contact": 0.28, ... },
      "top_10_videos": { "close_up_face": 0.90, "eye_contact": 0.80, ... },
      "bottom_10_videos": { "close_up_face": 0.20, "eye_contact": 0.10, ... }
    },
    
    "performance_correlation": {
      "close_up_face": { "top_rate": 0.90, "bottom_rate": 0.20, "signal": "strong_positive" },
      "...": {}
    },
    
    "engagement": {
      "avg_like_rate": 0.032,
      "avg_comment_rate": 0.008,
      "avg_engagement_rate": 0.040
    },
    
    "format_mix": {
      "shorts_count": 8, "shorts_pct": 0.16,
      "mid_count": 12, "mid_pct": 0.24,
      "standard_count": 22, "standard_pct": 0.44,
      "longform_count": 8, "longform_pct": 0.16,
      "vertical_pct": 0.16,
      "horizontal_pct": 0.84
    },
    
    "publish_cadence": {
      "posts_per_month": [14, 11, 9],
      "monthly_labels": ["Dec", "Jan", "Feb"],
      "trend": "decelerating",
      "longest_gap_days": 18,
      "best_performing_day": "Tuesday",
      "momentum": "decelerating"
    },
    
    "view_distribution": {
      "top_quartile_avg": 284000,
      "upper_mid_quartile_avg": 41000,
      "lower_mid_quartile_avg": 18000,
      "bottom_quartile_avg": 7000,
      "distribution_shape": "spiked"
    },
    
    "top_3_outliers": [
      { "title": "string", "views": 0, "velocity": 0.0, "why": "string" }
    ],
    
    "title_intelligence": {
      "top_3_formats": ["string"],
      "emotional_tone_mix": { "curiosity_gap": 0.45, "fear": 0.10, "aspiration": 0.30, "controversy": 0.05, "neutral": 0.10 },
      "question_ratio": 0.32,
      "number_usage": 0.41,
      "specificity_score": 7.2,
      "first_word_distribution": ["How (34%)", "Why (18%)", "I (14%)"],
      "avg_word_count": 8.4,
      "power_word_examples": ["string", "string", "string"]
    },
    
    "tag_strategy": {
      "tag_count_avg": 12,
      "specificity_mix": { "broad": 0.3, "medium": 0.5, "niche": 0.2 },
      "top_categories": ["string", "string", "string"],
      "unique_tags": ["string"]
    },
    
    "grade": {
      "letter": "C",
      "rationale": "Consistent cadence but weak thumbnail signals and low title specificity drag the score down."
    }
  },
  
  "channel_b": { "...same structure..." },
  
  "viral": {
    "roast_card": "You've posted 3x more than [Channel B] this year and gotten 12x fewer views — the entire gap is that you never show your face.",
    
    "steal_this_strategy": [
      {
        "action": "Add your face to your next 5 thumbnails",
        "proof": "Channel B's face-forward videos average 2.1M views vs 340K without"
      },
      {
        "action": "Post on Tuesday at 9am PT instead of randomly",
        "proof": "6 of Channel B's top 10 videos published Tuesday morning"
      },
      {
        "action": "Cut your title length from 11 words to 7",
        "proof": "Channel B's 7-word-or-less titles get 34% more clicks in their catalog"
      }
    ],
    
    "tweetable_callout": "Analyzed my channel vs @[channel_b_handle] — their top thumbnail signal: close-up face (91%). Mine: 12%. That's the entire gap. [share_url]"
  },
  
  "gaps": {
    "thumbnail": {
      "close_up_face": { "gap_pp": -37, "priority": "HIGHEST", "a_rate": 0.34, "b_rate": 0.71 },
      "...": {}
    },
    "engagement": {
      "like_rate_gap": -0.018,
      "comment_rate_gap": +0.003,
      "engagement_leader": "channel_a"
    },
    "format": {
      "shorts_gap_pp": -12,
      "longform_gap_pp": +8,
      "vertical_gap_pp": -12
    },
    "publish_cadence": {
      "posts_per_month_gap": -3.2,
      "cadence_leader": "channel_b"
    },
    "title": {
      "specificity_gap": -2.1,
      "question_ratio_gap": -0.18,
      "number_usage_gap": +0.12
    }
  },
  
  "core_finding": "string"
}
```

### Data Model (Phase 2+)

All auth handled by Supabase Auth (magic link + Google OAuth). No Clerk.

```sql
-- Supabase Auth handles users natively (auth.users table)
-- These extend it:

profiles (
  id              uuid references auth.users primary key,
  email           text,
  credits         int default 3,
  credits_rollover int default 0,
  tier            text default 'free',
  is_founding_member boolean default false,
  referral_slug   text unique,
  invited_by      uuid references profiles(id),
  created_at      timestamp default now()
)

invite_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  created_by  uuid references profiles(id),
  used_by     uuid references profiles(id),
  used_at     timestamp,
  status      text default 'active',
  created_at  timestamp default now()
)

waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  status      text default 'pending',
  created_at  timestamp default now()
)

audits (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id),    -- null for anon MVP audits
  channel_a_url   text,
  channel_b_url   text,
  result_json     jsonb,
  created_at      timestamp default now(),
  expires_at      timestamp
)

credit_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id),
  amount      int,
  type        text,   -- 'debit' | 'credit' | 'referral' | 'rollover'
  audit_id    uuid references audits(id),
  created_at  timestamp default now()
)

-- Replaces Umami — custom analytics events table
analytics_events (
  id          uuid primary key default gen_random_uuid(),
  event       text not null,          -- 'audit_run' | 'share_copied' | 'rate_limited' | etc.
  properties  jsonb,                  -- { channel_a, channel_b, ip_hash, result_signals }
  user_id     uuid references profiles(id),  -- null for anon
  session_id  text,                   -- client-generated UUID, stored in sessionStorage
  created_at  timestamp default now()
)
```

**Analytics queries you get for free from this table:**

```sql
-- Daily audit volume
SELECT date_trunc('day', created_at), count(*) FROM analytics_events 
WHERE event = 'audit_run' GROUP BY 1 ORDER BY 1;

-- Rate limit hit rate (demand signal)
SELECT count(*) FROM analytics_events WHERE event = 'rate_limited';

-- Most analyzed channels (ICP signal)
SELECT properties->>'channel_a', count(*) FROM analytics_events 
WHERE event = 'audit_run' GROUP BY 1 ORDER BY 2 DESC LIMIT 20;

-- Share rate
SELECT 
  count(*) FILTER (WHERE event = 'share_copied') as shares,
  count(*) FILTER (WHERE event = 'audit_run') as audits,
  round(count(*) FILTER (WHERE event = 'share_copied')::numeric / 
        nullif(count(*) FILTER (WHERE event = 'audit_run'), 0) * 100, 1) as share_rate
FROM analytics_events;
```

You query this directly in Supabase's SQL editor or build a simple `/admin` dashboard on top of it. No third-party analytics service needed.

### Event Logging Implementation (Phase 1)

The analytics table only works if events are actually fired. These are the two required inserts for MVP.

**`lib/hash.ts` — IP hashing utility (never store raw IPs)**
```ts
import { createHash } from 'crypto'

export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + process.env.IP_HASH_SALT)
    .digest('hex')
    .slice(0, 16)
}
```

Add `IP_HASH_SALT=any-random-string` to `.env.local`. Same IP always hashes to the same value so you can count repeat users — but the raw IP is never stored.

**`app/api/analyze/route.ts` — fire on successful audit**
```ts
import { hashIp } from '@/lib/hash'
import { createClient } from '@/lib/supabase'

// After successful analysis, before returning response:
const ip = request.headers.get('x-forwarded-for') ?? 
           request.headers.get('x-real-ip') ?? 
           '127.0.0.1'

await supabase.from('analytics_events').insert({
  event: 'audit_run',
  properties: {
    ip_hash: hashIp(ip),
    channel_a: channelAUrl,
    channel_b: channelBUrl,
  }
})
```

**`middleware.ts` — fire on rate limit block**
```ts
// When IP has exceeded 3 audits, before returning 429:
await supabase.from('analytics_events').insert({
  event: 'rate_limited',
  properties: {
    ip_hash: hashIp(ip),
  }
})
```

**Note:** Supabase client in middleware requires the service role key (not anon key) since middleware runs on the Edge runtime. Add `SUPABASE_SERVICE_ROLE_KEY` to env vars for Phase 1 — or fire the rate_limited event from the API route instead of middleware to keep it simpler (check the count in the route handler, not middleware).

**All events to fire in Phase 1:**

| Event | Where | Properties |
|---|---|---|
| `audit_run` | `api/analyze/route.ts` — on success | `ip_hash`, `channel_a`, `channel_b` |
| `rate_limited` | `api/analyze/route.ts` — on 429 | `ip_hash` |
| `waitlist_signup` | `api/waitlist/route.ts` — on insert | `source` (e.g. `'rate_limit_cta'` or `'direct'`) |
| `share_copied` | Client-side, POST to a small `/api/event` route | `ip_hash`, `channel_a`, `has_bingo: false` |

### Environment Variables

See Section 5 (Invite & Referral System) for the complete, updated env var list with phase assignments.

---

## 8. Tech Stack

### MVP Stack (Phase 1 — This Weekend)

| Layer | Choice | Why | Phase |
|---|---|---|---|
| Framework | Next.js 14 + TypeScript | App Router, API routes | 1 |
| Styling | Tailwind CSS | Standard | 1 |
| YouTube data | YouTube Data API v3 | Official, free quota | 1 |
| AI analysis | Claude claude-sonnet-4-20250514 | Vision + structured output | 1 |
| Rate limiting | Vercel Edge Middleware (IP-based) | No auth needed | 1 |
| Database | Supabase | Waitlist table only in Phase 1. Full schema in Phase 2. | 1 (partial) |
| Hosting | Vercel | Free tier, auto-deploy | 1 |
| Auth | Supabase Auth | Magic link + Google OAuth — **Phase 2 only** | 2 |
| Payments | Stripe | **Phase 3 only** | 3 |

**No Clerk. No Umami.** Supabase is the single service for database, auth, and analytics events across all phases.

### Analytics Dashboard

Already built: **`getoutlier-analytics.jsx`** — 4-tab gate validation dashboard with gate progress bars, daily audit chart, top channels ICP signal, and copy-paste SQL queries for every metric. Wire at `/app/admin/analytics/page.tsx` in Phase 2. In Phase 1, run the SQL tab queries manually in Supabase SQL editor.

### File Structure (Phase 1)

```
getoutlier/
├── app/
│   ├── page.tsx                       ← Landing + URL inputs + comparison presets
│   ├── waitlist/
│   │   └── page.tsx                   ← getoutlier-waitlist.jsx (wire Supabase)
│   ├── results/
│   │   └── [slug]/
│   │       └── page.tsx               ← Shareable results URL (OG = roast card)
│   └── api/
│       ├── analyze/
│       │   └── route.ts               ← Main endpoint → saves to audits → returns slug
│       ├── waitlist/
│       │   └── route.ts               ← POST email → Supabase
│       └── event/
│           └── route.ts               ← Client-side event logging (share_copied etc.)
├── components/
│   ├── ChannelInput.tsx               ← Two URL inputs + preset picker
│   ├── ComparisonPresets.tsx          ← 5 famous pairs, cached, instant load
│   ├── LoadingState.tsx               ← Progress steps (~45-60s)
│   ├── GradesBadge.tsx                ← A/B/C/D/F per channel, prominent at top
│   ├── RoastCard.tsx                  ← Screenshot-bait card, watermarked
│   ├── GapTable.tsx                   ← 10-signal table + correlation column
│   ├── StealThis.tsx                  ← 3 tactics with Channel B proof stats
│   ├── TweetableCallout.tsx           ← Pre-written tweet, one-click copy
│   ├── PerformanceCorrelation.tsx     ← Which signals predict top videos
│   ├── EngagementGap.tsx              ← Like/comment/combined rates A vs B
│   ├── FormatMix.tsx                  ← Shorts/Mid/Standard/Longform + vertical/horizontal
│   ├── PublishCadence.tsx             ← Monthly counts, momentum, best day, longest gap
│   ├── ViewDistribution.tsx           ← Quartile breakdown, distribution shape
│   ├── TitleIntelligence.tsx          ← 7-dimension title analysis A vs B
│   ├── TagGap.tsx                     ← Tag count, specificity, unique opportunities
│   └── CoreFinding.tsx                ← AI strategic diagnosis
├── lib/
│   ├── youtube.ts                     ← YouTube API wrapper (full field set)
│   ├── format.ts                      ← Duration parser, format classifier, Shorts detector
│   ├── compute.ts                     ← All zero-cost computations from raw data
│   ├── analyzer.ts                    ← Two Claude calls + JSON parsing + retry
│   ├── grade.ts                       ← Grade calculation from weighted gap score
│   ├── hash.ts                        ← hashIp() utility
│   └── supabase.ts                    ← Supabase anon + service role clients
├── middleware.ts                      ← IP rate limiting (3/day Vercel Edge)
├── .env.local                         ← 6 vars
└── README.md
```

**Phase 2 additions to file structure:**
```
├── app/
│   ├── admin/
│   │   ├── page.tsx                ← Waitlist queue + invite code generator
│   │   └── analytics/
│   │       └── page.tsx            ← getoutlier-analytics.jsx wired to live Supabase data
│   ├── invite/
│   │   └── [slug]/
│   │       └── page.tsx            ← Referral landing ("Invited by [name]")
│   ├── dashboard/
│   │   └── page.tsx                ← Auth-gated main tool + credit counter
│   └── api/
│       └── webhooks/ ...           ← Supabase Auth hooks for invite validation
```

---

## 9. Validation Gates

Every phase is gated. **Do not start the next phase until the current gate is cleared.** Building infrastructure for demand that doesn't exist yet is how side projects die.

---

### 🚦 MVP Validation Gate — Must Hit All 5 Before Building Phase 2

Measure over the **first 7 days post-launch.**

| Signal | Minimum Threshold | Where to Check | What It Means |
|---|---|---|---|
| Unique visitors | **200+** | Vercel Analytics (built-in, free) | People are clicking when they see it |
| Audits run | **100+** | Log to console / Vercel logs | People are actually using it, not just landing |
| IP rate limit hits | **20+** | Vercel Edge logs | People want more than 3/day — demand for auth + credits is real |
| Organic shares / DMs | **5+** | Manual — people sending you the link or posting it | Word-of-mouth signal, virality potential |
| Return visitors | **15%+** of unique visitors | Vercel Analytics | People came back — the tool has pull |

**If you hit all 5:** Build Phase 2 (Supabase auth + invite system + credit wallet).

**If you miss 2+:** Don't build Phase 2. Instead: iterate on the output quality, try a different launch channel, or reframe the positioning. The problem is distribution or value, not infrastructure.

**If you hit 3-4:** Use judgment. Rate limit hits + return visitors are the two highest-signal metrics — if both are strong, build Phase 2.

---

### 🚦 Phase 2 Validation Gate — Must Hit Before Building Phase 3 (Monetization)

Measure over the **first 14 days post-invite launch.**

| Signal | Minimum Threshold | What It Means |
|---|---|---|
| Activated users (ran ≥1 audit) | **150+** | Enough of a user base to convert |
| Credit exhaustion rate | **40%+ of users hit 0 credits** | Validates that the credit limit creates real upgrade pressure |
| Waitlist signups | **100+** | Organic demand beyond your personal network |
| Referral link clicks (via your links) | **50+** | The referral mechanic is working |
| Unprompted user feedback (DMs, posts) | **10+** | People care enough to say something |

**If you hit all 5:** Build Phase 3 (Stripe, paid tiers, credit packs).

**If credit exhaustion rate is low (<20%):** Users aren't running enough audits to hit the limit. The tool isn't sticky enough yet — add more value before monetizing.

---

### 🚦 Phase 3 Validation Gate — Must Hit Before Scaling Paid Acquisition

| Signal | Minimum Threshold | What It Means |
|---|---|---|
| Paying users | **25+** | Real willingness to pay proven |
| MRR | **$200+** | Not just one-time purchases |
| Free → paid conversion rate | **5%+ of activated free users** | The upgrade funnel works |
| Churn (Month 1 → Month 2) | **<30%** | People find enough ongoing value to stay |

**If you hit all 4:** Run the paid media micro-test ($50-100, see GTM plan). If not, fix retention before buying traffic.

---

### Gate Summary

```
Weekend →  MVP live, IP rate-limited, open
              ↓
         [MVP GATE: 200 visitors, 100 audits, 20 rate-limit hits, 
          5 shares, 15% return rate — all within 7 days]
              ↓
Week 2  →  Supabase auth + invite system + credit wallet
              ↓  
         [PHASE 2 GATE: 150 activated users, 40% credit exhaustion,
          100 waitlist signups, 50 referral clicks, 10 DMs]
              ↓
Week 3+ →  Stripe + paid tiers + credit packs
              ↓
         [PHASE 3 GATE: 25 paying users, $200 MRR, 5% conversion,
          <30% churn]
              ↓
         Paid acquisition
```

---

## 10. Success Criteria (Phase 1)

| Criteria | Target | Test |
|---|---|---|
| Analysis completes | < 60 seconds end-to-end (expanded data set) | Test with 5 channel pairs |
| All 10 thumbnail signals returned | 100% with top/bottom/all split | Validate JSON schema |
| Performance correlation renders | Signal direction shown per thumbnail signal | Check with high-variance channel |
| Engagement rates calculated | Like rate, comment rate, combined — both channels | Verify math against YouTube Studio |
| Format mix renders | 4 buckets + vertical/horizontal % — both channels | Test with a Shorts-heavy channel |
| Monthly publish counts render | Last 3 months counts + trend direction | Check with inconsistent poster |
| View velocity quartiles render | 4-bucket distribution per channel | Check with outlier-heavy channel |
| Title intelligence renders | All 7 dimensions per channel | Check with title-diverse channel |
| Tag gap renders | Count, specificity, unique tags | Test with tag-heavy vs tag-light channel |
| IP rate limit works | Blocked on 4th attempt, waitlist CTA shown | Test manually |
| Waitlist form submits | Email saved to Supabase, success state, duplicate handled | Submit real email twice |
| Spot counter is live | Reflects real waitlist row count | Check after submission |
| Mobile renders correctly | All sections readable on iPhone 14 | Browser dev tools |
| Screenshot-worthy output | Gap table + format mix + cadence looks good at 1200×800 | Take actual screenshot |
| README complete | Problem, demo, install guide, env vars, stack | Read it cold |

---

## 11. Weekend Build Sequence

### Saturday AM (2-3 hrs) — Foundation + Supabase
- [ ] Scaffold Next.js 14 + TypeScript + Tailwind
- [ ] Get YouTube Data API key from Google Cloud Console (5 min)
- [ ] Create Supabase project, run waitlist table migration (one SQL statement)
- [ ] Build `lib/supabase.ts` — anon client
- [ ] Build `lib/youtube.ts` — fetch 50 videos per channel with full field set: title, publishedAt, viewCount, likeCount, commentCount, duration, tags, thumbnails
- [ ] Build `lib/format.ts` — duration parser (ISO 8601 → seconds), format classifier (Shorts/Mid/Standard/Longform), vertical/horizontal classifier
- [ ] Test YouTube fetch with 2 real channels — verify all fields return including duration, likes, tags
- [ ] Set up `.env.local` with all 4 vars

### Saturday PM (3-4 hrs) — Core Analysis Pipeline
- [ ] Build `lib/compute.ts` — all zero-cost computations from raw API data:
  - Engagement rates (like rate, comment rate, combined)
  - Format mix distribution (4 buckets + vertical/horizontal %)
  - Monthly publish counts (last 3 months) + momentum direction
  - View velocity quartile distribution + distribution shape
  - Best performing day of week (publish day × view count correlation)
  - Longest upload gap in days
  - Top 3 outlier videos by velocity (views ÷ days since publish)
- [ ] Build `lib/analyzer.ts` — two Claude calls:
  - **Call 1 (Vision):** pass all 100 thumbnail URLs + view counts per video → get 10-signal scores (all/top10/bottom10) + performance correlation + core finding
  - **Call 2 (Text):** pass all titles + tags → get title intelligence (7 dimensions) + tag strategy gap
  - JSON parsing with retry on malformed response
- [ ] Build `app/api/analyze/route.ts` — orchestrates: fetch → compute → Claude × 2 → merge → return
- [ ] Build `app/api/waitlist/route.ts` — POST email → Supabase insert, handle duplicate
- [ ] Add IP rate limiting in `middleware.ts` (3 req/IP/day)
- [ ] Test full pipeline end-to-end on 2 channel pairs, validate complete JSON schema

### Sunday AM (3-4 hrs) — UI Build
- [ ] Wire `getoutlier-waitlist.jsx` → real Supabase insert + live spot count
- [ ] Build `GradesBadge.tsx` — A/B/C/D/F letter grade, both channels, large + prominent at top
- [ ] Build `RoastCard.tsx` — dark bg, red headline, single devastating sentence, "Analyzed by Outlier" watermark, screenshot-optimized
- [ ] Build `GapTable.tsx` — 10-signal table with top/bottom correlation column
- [ ] Build `StealThis.tsx` — 3 tactics with Channel B proof stats, "steal this strategy" framing
- [ ] Build `TweetableCallout.tsx` — pre-written tweet copy, one-click copy, includes share URL placeholder
- [ ] Build `PerformanceCorrelation.tsx` — which signals predict their best videos
- [ ] Build `EngagementGap.tsx` — like rate + comment rate + combined, A vs B
- [ ] Build `FormatMix.tsx` — Shorts/Mid/Standard/Longform + vertical/horizontal %, A vs B
- [ ] Build `PublishCadence.tsx` — monthly post counts, momentum label, longest gap, best day
- [ ] Build `ViewDistribution.tsx` — quartile breakdown, distribution shape label
- [ ] Build `TitleIntelligence.tsx` — 7-dimension comparison table
- [ ] Build `TagGap.tsx` — count, specificity, unique opportunity tags
- [ ] Build `CoreFinding.tsx` — AI strategic diagnosis, left-border accent
- [ ] Build `ChannelInput.tsx` — two URL inputs + preset picker
- [ ] Build `LoadingState.tsx` — progress steps (~45-60s)
- [ ] Build `ComparisonPresets.tsx` — 5 famous pairs on homepage, pre-generated cached results
- [ ] Build `/app/results/[slug]/page.tsx` — shareable results URL, OG image = roast card
- [ ] Build `/app/api/results/route.ts` — save result JSON to Supabase `audits` table, return nanoid slug
- [ ] Wire share button → copies `/results/[slug]` URL (not just text)
- [ ] Add "Powered by Outlier" watermark to `RoastCard.tsx` and results page footer
- [ ] Rate limit error state → waitlist CTA

### Sunday PM (2-3 hrs) — Polish + Ship
- [ ] Polish dark theme — table IS the marketing asset, every section must be screenshot-worthy
- [ ] Run full analysis on 3 famous channel pairs, screenshot best output
- [ ] Write `README.md` — problem, install guide, env vars, stack, self-host instructions
- [ ] Push to GitHub (public, MIT license) at `github.com/getoutlier/outlier`
- [ ] Deploy to Vercel, set all 4 env vars in dashboard
- [ ] Set OG meta tags (title, description, image)
- [ ] Verify waitlist form works in production
- [ ] DM 15 contacts with their channel's specific gap finding + link

---

## 12. The Killer Screenshot Strategy

**Don't use your own channel. Use channels people recognize.**

Run the analysis on these pairs and screenshot the best output:

| Pair | Why |
|---|---|
| MrBeast vs. a mid-tier gaming channel (1M subs) | Everyone knows MrBeast — "oh THAT'S why he wins" |
| Ali Abdaal vs. Thomas Frank | Same niche, relatable gap, knowledge creator audience |
| A YouTube contact's channel vs. their top competitor | DM play — show them their own gap first |

**The launch screenshot needs:**
1. The gap table with at least 2-3 `HIGHEST` / `HIGH` priority rows
2. A dramatic negative gap (-30pp+) that makes people say "oh wow"
3. The Core Finding paragraph visible below (teases the AI insight)
4. Dark background, colored priority badges clearly visible

**Caption for the screenshot:**
> *"Stop guessing why their videos get 10x more views."*

---

## 13. GTM Plan

### Pre-Launch (Sunday night before posting)

Run the analysis on 15 YouTube contacts' channels before you post anything publicly. DM them the finding, not the link first:

```
Hey [name] — I built a tool that analyzes YouTube thumbnails vs. a competitor 
and shows you exactly where the gap is. AI-analyzed, 30 seconds.

Ran [their channel] vs. [competitor] — close-up face gap was 44pp. 
Core finding was pretty eye-opening.

It's free, just deployed it: getoutlier.app
Would love to know what you think.
```

Send the finding first. Then the link. Curiosity drives clicks, not URLs.

### Launch Post (LinkedIn — Tuesday or Wednesday 7AM PT)

**Hook:**
> Everyone talks about YouTube thumbnails.
> Nobody shows you *specifically* how yours compare to channels beating you.
> I built the tool that does it in 30 seconds.

**Body:**
- The gap table screenshot
- 2-3 specific signals that shocked you when you ran it on real channels
- "Built this weekend. Free. Open source."
- Link

### Reddit (Days 2-5, staggered)

| Subreddit | Angle |
|---|---|
| r/youtube | "I built a free tool that analyzes thumbnail gaps between any two channels" |
| r/NewTubers | "Free tool to see exactly how your thumbnails compare to bigger channels" |
| r/youtubers | Same angle, different day |
| r/webdev | "Built a YouTube visual intelligence tool this weekend with Next.js + Claude Vision — here's how" |
| r/SideProject | Standard build log format |

### Product Hunt (Week 2)
Weekend launch. Tagline: *"YouTube thumbnail gap analysis in 30 seconds. Free."*

### Content Drip (Weeks 2-4)

| Week | Post |
|---|---|
| 1 | Launch post + screenshot |
| 1 | "Here's what happened in 24 hours" |
| 2 | "The 3 thumbnail signals that predict CTR (from analyzing 500+ videos)" |
| 2 | Product Hunt launch |
| 3 | "We ran Outlier on the top 10 YouTube channels. Here's what they have in common." |
| 4 | "What I learned building and launching a YouTube analytics tool in a weekend" |

### Paid Media
Do NOT spend until: 200+ organic visitors, 3%+ LinkedIn engagement, 30%+ on-site interaction, 60s+ session duration. If organic hits those gates by Week 2, run $50 Meta test targeting "YouTube creators" + "content creation."

---

## 14. Claude Code Skills to Use

**Always include:**
- `/frontend-design` — Gap table is your marketing asset, must be stunning
- `/vibesec` — User-submitted URLs, Claude output rendering, API key handling
- `/code-reviewer` — After each phase

**Include for Phase 1:**
- `/web-dev` — Next.js App Router, API routes, TypeScript, Edge middleware
- `/mobile-ux-optimizer` — Table must be screenshottable and readable on mobile

**Add in Phase 2:**
- `/backend-architect` — Supabase schema, Auth hooks, invite system, credit logic

**At launch:**
- `/project-shipper` — Launch sequencing per GTM playbook
- `/brand-guardian` — Consistency across landing page and launch assets

---

## 15. Future Enhancements (Not in V1)

- TikTok channel analysis (your unfair advantage — you know this platform)
- Instagram Reels cover comparison
- Bulk CSV export for agencies
- "Thumbnail score" single-channel benchmark vs. top 100 in your niche
- Chrome extension (highlights gap signals while browsing YouTube)
- Webhook alerts (when competitor posts thumbnail with signals you're missing)
- White-label for YouTube MCNs and agencies

import { NextRequest } from "next/server";
import { resolveChannel, getChannelVideos } from "@/lib/youtube";
import { runAnalysis } from "@/lib/analyzer";
import { getSupabase } from "@/lib/supabase";
import { hashIp } from "@/lib/hash";
import { nanoid } from "nanoid";
import type { ProgressEvent, AnalysisResult } from "@/lib/types";

export const maxDuration = 60;

// ── Rate limiting constants ──
const MAX_PER_IP_PER_DAY = 10;
const ADMIN_MAX_PER_IP_PER_DAY = 50;
const MAX_DAILY_AUDITS = 200;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── In-memory rate limiter (fallback when Supabase is unavailable) ──
const memoryLimiter = new Map<string, number[]>(); // ipHash → timestamps
let globalDailyCount = 0;
let globalDailyResetAt = Date.now() + 24 * 60 * 60 * 1000;

function cleanMemoryLimiter() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [key, timestamps] of memoryLimiter.entries()) {
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) {
      memoryLimiter.delete(key);
    } else {
      memoryLimiter.set(key, valid);
    }
  }

  if (Date.now() > globalDailyResetAt) {
    globalDailyCount = 0;
    globalDailyResetAt = Date.now() + 24 * 60 * 60 * 1000;
  }
}

function checkMemoryLimit(ipHash: string, limit: number): { allowed: boolean; count: number } {
  cleanMemoryLimiter();
  const timestamps = memoryLimiter.get(ipHash) ?? [];
  return { allowed: timestamps.length < limit, count: timestamps.length };
}

function recordMemoryHit(ipHash: string) {
  const timestamps = memoryLimiter.get(ipHash) ?? [];
  timestamps.push(Date.now());
  memoryLimiter.set(ipHash, timestamps);
  globalDailyCount++;
}

function unrecordMemoryHit(ipHash: string) {
  const timestamps = memoryLimiter.get(ipHash) ?? [];
  if (timestamps.length > 0) {
    timestamps.pop();
    memoryLimiter.set(ipHash, timestamps);
    globalDailyCount = Math.max(0, globalDailyCount - 1);
  }
}

// ── Helpers ──

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  let body: { channelA?: string; channelB?: string; adminSecret?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const channelA = body.channelA?.trim();
  const channelB = body.channelB?.trim();

  if (!channelA || !channelB) {
    return new Response(
      JSON.stringify({ error: "Both channelA and channelB are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Admin bypass: check secret against env var ──
  const envSecret = process.env.ADMIN_SECRET;
  const isAdmin = !!(envSecret && body.adminSecret === envSecret);
  const ipLimit = isAdmin ? ADMIN_MAX_PER_IP_PER_DAY : MAX_PER_IP_PER_DAY;

  // ── Global daily cap ──
  cleanMemoryLimiter();
  if (globalDailyCount >= MAX_DAILY_AUDITS) {
    return new Response(
      JSON.stringify({
        error: "Service is at capacity for today. Please try again tomorrow.",
        remaining: 0,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Rate limiting ──
  const ip = getClientIP(request);
  const ipHash = hashIp(ip);

  const memCheck = checkMemoryLimit(ipHash, ipLimit);
  if (!memCheck.allowed) {
    // Fire rate_limited analytics event
    const supabase = getSupabase();
    if (supabase) {
      void supabase.from("analytics_events").insert({
        event: "rate_limited",
        properties: { ip_hash: ipHash, channel_a: channelA, channel_b: channelB },
      });
    }

    return new Response(
      JSON.stringify({
        error: "You've used your 10 daily audits. Join the waitlist for early access to more.",
        waitlistUrl: "/waitlist",
        remaining: 0,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check Supabase for durable rate limiting
  const supabase = getSupabase();
  let supabaseCount: number | null = null;

  if (supabase) {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event", "audit_run")
        .eq("ip_hash", ipHash)
        .gte("created_at", cutoff);

      supabaseCount = count;

      if (count !== null && count >= ipLimit) {
        return new Response(
          JSON.stringify({
            error: "You've used your 10 daily audits. Join the waitlist for early access to more.",
            waitlistUrl: "/waitlist",
            remaining: 0,
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      console.error("[rate-limit] Supabase check failed, blocking request:", e);
      return new Response(
        JSON.stringify({
          error: "Rate limit service unavailable. Please try again shortly.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Record hit in memory immediately (may be un-recorded on cache hit)
  recordMemoryHit(ipHash);
  const effectiveCount = Math.max(memCheck.count, supabaseCount ?? 0) + 1;
  const remaining = ipLimit - effectiveCount;

  // ── Resolve channels (lightweight: ~200ms, 1 quota unit each) ──
  let metaA, metaB;
  try {
    [metaA, metaB] = await Promise.all([
      resolveChannel(channelA),
      resolveChannel(channelB),
    ]);
  } catch (e) {
    // Un-record the rate limit hit since we didn't actually run an analysis
    unrecordMemoryHit(ipHash);
    const msg = e instanceof Error ? e.message : "Failed to resolve channels";
    if (supabase) {
      void supabase.from("analytics_events").insert({
        event: "analysis_error",
        ip_hash: ipHash,
        properties: { channel_a: channelA, channel_b: channelB,
                      error_code: 400, error_message: msg, phase: "resolving_channels" },
      });
    }
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Cache lookup (sorted canonical IDs for order-independence) ──
  const [idLow, idHigh] = [metaA.id, metaB.id].sort();
  const orderReversed = metaA.id !== idLow; // true if user's channelA sorts second

  if (supabase) {
    try {
      const cacheCutoff = new Date(Date.now() - CACHE_TTL_MS).toISOString();
      const { data: cachedRows } = await supabase
        .from("audits")
        .select("result_json, slug")
        .eq("channel_id_a", idLow)
        .eq("channel_id_b", idHigh)
        .gte("created_at", cacheCutoff)
        .order("created_at", { ascending: false })
        .limit(1);

      if (cachedRows && cachedRows.length > 0) {
        const cached = cachedRows[0];
        const cachedResult = cached.result_json as AnalysisResult;

        // Swap channelA/B if the user's input order differs from stored order
        if (orderReversed) {
          const swapped: AnalysisResult = {
            ...cachedResult,
            channelA: cachedResult.channelB,
            channelB: cachedResult.channelA,
            signals: cachedResult.signals.map((s) => ({
              ...s,
              channelA: s.channelB,
              channelB: s.channelA,
              gap: -s.gap,
            })),
            outlierVideos: {
              channelA: cachedResult.outlierVideos.channelB,
              channelB: cachedResult.outlierVideos.channelA,
            },
            titleIntelligence: {
              channelA: cachedResult.titleIntelligence.channelB,
              channelB: cachedResult.titleIntelligence.channelA,
            },
            engagement: {
              channelA: cachedResult.engagement.channelB,
              channelB: cachedResult.engagement.channelA,
              winner: cachedResult.engagement.winner === "a" ? "b"
                : cachedResult.engagement.winner === "b" ? "a"
                : "tie",
            },
            formatMix: {
              channelA: cachedResult.formatMix.channelB,
              channelB: cachedResult.formatMix.channelA,
            },
            uploadCadence: {
              channelA: cachedResult.uploadCadence.channelB,
              channelB: cachedResult.uploadCadence.channelA,
            },
            viewVelocity: {
              channelA: cachedResult.viewVelocity.channelB,
              channelB: cachedResult.viewVelocity.channelA,
            },
            tagStrategy: {
              ...cachedResult.tagStrategy,
              channelA: cachedResult.tagStrategy.channelB,
              channelB: cachedResult.tagStrategy.channelA,
            },
            thumbnailCorrelation: cachedResult.thumbnailCorrelation,
            viral: {
              ...cachedResult.viral,
              grades: {
                channelA: cachedResult.viral.grades.channelB,
                channelB: cachedResult.viral.grades.channelA,
              },
            },
            slug: cached.slug,
          };

          // Un-record rate limit hit — cache hits are free
          unrecordMemoryHit(ipHash);

          // Log cache_hit analytics event (fire-and-forget)
          void supabase.from("analytics_events").insert({
            event: "cache_hit",
            ip_hash: ipHash,
            properties: {
              channel_a: channelA,
              channel_b: channelB,
              cached_slug: cached.slug,
              order_reversed: true,
            },
          });

          return new Response(
            JSON.stringify({
              cached: true,
              data: swapped,
              remaining: Math.max(0, remaining + 1), // +1 because we un-recorded the hit
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        // Same order — serve directly
        cachedResult.slug = cached.slug;

        // Un-record rate limit hit — cache hits are free
        unrecordMemoryHit(ipHash);

        // Log cache_hit analytics event (fire-and-forget)
        void supabase.from("analytics_events").insert({
          event: "cache_hit",
          ip_hash: ipHash,
          properties: {
            channel_a: channelA,
            channel_b: channelB,
            cached_slug: cached.slug,
            order_reversed: false,
          },
        });

        return new Response(
          JSON.stringify({
            cached: true,
            data: cachedResult,
            remaining: Math.max(0, remaining + 1),
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      console.error("[cache] lookup failed, proceeding with fresh analysis:", e);
      // Non-fatal — just skip cache and run the full pipeline
    }
  }

  // ── Cache miss: SSE streaming response ──
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: ProgressEvent) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        // Phase 1-2: Fetch videos (channels already resolved above)
        send({
          phase: "fetching_videos",
          message: "Fetching latest videos from each channel...",
        });

        let channelDataA, channelDataB;

        try {
          const [videosA, videosB] = await Promise.all([
            getChannelVideos(metaA, 50),
            getChannelVideos(metaB, 50),
          ]);
          channelDataA = { meta: metaA, videos: videosA };
          channelDataB = { meta: metaB, videos: videosB };
        } catch (e) {
          const raw = e instanceof Error ? e.message : "Failed to fetch channel data";
          let msg = raw;
          if (raw.includes("hidden their uploads") || raw.includes("playlistNotFound")) {
            msg = raw; // Already user-friendly from youtube.ts
          } else if (raw.includes("Channel not found")) {
            msg = "We couldn't find that channel. Double-check the URL or handle.";
          }
          if (supabase) {
            void supabase.from("analytics_events").insert({
              event: "analysis_error",
              ip_hash: ipHash,
              properties: { channel_a: channelA, channel_b: channelB,
                            error_code: 0, error_message: raw, phase: "fetching_videos" },
            });
          }
          send({ phase: "error", message: msg });
          controller.close();
          return;
        }

        send({
          phase: "fetching_videos",
          message: `Found ${channelDataA.videos.length} videos from ${channelDataA.meta.title} and ${channelDataB.videos.length} from ${channelDataB.meta.title}`,
        });

        // Phases 3-5: Analysis (analyzer handles progress internally)
        const result = await runAnalysis(
          channelDataA,
          channelDataB,
          (phase, message) => {
            send({ phase: phase as ProgressEvent["phase"], message });
          }
        );

        // ── Save to audits table with canonical IDs for cache ──
        let slug: string | undefined;
        if (supabase) {
          try {
            slug = nanoid(8);
            await supabase.from("audits").insert({
              slug,
              channel_a: channelA,
              channel_b: channelB,
              channel_id_a: idLow,
              channel_id_b: idHigh,
              result_json: result,
            });
            result.slug = slug;
          } catch (e) {
            console.error("[audits] insert failed:", e);
            // Non-fatal — analysis still works without shareable URL
          }
        }

        // Log successful audit to analytics
        if (supabase) {
          try {
            await supabase.from("analytics_events").insert({
              event: "audit_run",
              ip_hash: ipHash,
              properties: {
                channel_a: channelA,
                channel_b: channelB,
                channel_a_name: channelDataA.meta.title,
                channel_b_name: channelDataB.meta.title,
                slug,
              },
            });
          } catch (e) {
            console.error("[analytics] insert failed:", e);
          }
        }

        // Phase: Complete
        send({
          phase: "complete",
          message: "Analysis complete.",
          data: result,
          remaining: Math.max(0, remaining),
        });
      } catch (e) {
        const raw = e instanceof Error ? e.message : "An unexpected error occurred";
        console.error("Analysis pipeline error:", e);
        if (supabase) {
          void supabase.from("analytics_events").insert({
            event: "analysis_error",
            ip_hash: ipHash,
            properties: { channel_a: channelA, channel_b: channelB,
                          error_code: 0, error_message: raw, phase: "pipeline" },
          });
        }

        let message = raw;
        let statusUrl: string | undefined;

        if (raw.includes("overloaded") || raw.includes("529")) {
          message = "Claude AI is temporarily overloaded. This usually resolves within a minute.";
          statusUrl = "https://status.anthropic.com";
        } else if (raw.includes("credit balance") || raw.includes("402")) {
          message = "Our AI service is temporarily at capacity. Please try again in a few minutes.";
          statusUrl = "https://status.anthropic.com";
        } else if (raw.includes("rate limit") || raw.includes("429")) {
          message = "Too many requests — please wait a moment and try again.";
        } else if (raw.includes("ANTHROPIC_API_KEY")) {
          message = "Service configuration error. We're working on it.";
        } else if (raw.includes("YOUTUBE_API_KEY")) {
          message = "YouTube API configuration error. We're working on it.";
        } else if (raw.includes("quota") || raw.includes("YouTube")) {
          message = "YouTube API is temporarily unavailable. Please try again shortly.";
          statusUrl = "https://status.cloud.google.com";
        }

        send({ phase: "error", message, statusUrl });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

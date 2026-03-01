import type { ChannelMeta, VideoData, ChannelData } from "./types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");
  return key;
}

/**
 * Parse user input into a channel identifier.
 * Accepts: @handle, full URL (youtube.com/@handle or /channel/UCXXX), or raw channel ID.
 */
export function parseChannelInput(input: string): {
  type: "handle" | "id";
  value: string;
} {
  const trimmed = input.trim();

  // Full URL: youtube.com/@handle
  const handleUrlMatch = trimmed.match(
    /(?:youtube\.com|youtu\.be)\/@([a-zA-Z0-9_.-]+)/
  );
  if (handleUrlMatch) {
    return { type: "handle", value: handleUrlMatch[1] };
  }

  // Full URL: youtube.com/channel/UCXXX
  const channelUrlMatch = trimmed.match(
    /(?:youtube\.com|youtu\.be)\/channel\/(UC[a-zA-Z0-9_-]+)/
  );
  if (channelUrlMatch) {
    return { type: "id", value: channelUrlMatch[1] };
  }

  // @handle format
  if (trimmed.startsWith("@")) {
    return { type: "handle", value: trimmed.slice(1) };
  }

  // Raw channel ID (starts with UC)
  if (trimmed.startsWith("UC") && trimmed.length >= 20) {
    return { type: "id", value: trimmed };
  }

  // Fallback: treat as handle
  return { type: "handle", value: trimmed };
}

/**
 * Resolve a channel handle or ID to full channel metadata.
 * Uses channels.list with forHandle (1 quota unit) instead of search.list (100 units).
 */
export async function resolveChannel(input: string): Promise<ChannelMeta> {
  const parsed = parseChannelInput(input);
  const key = getApiKey();

  let url: string;
  if (parsed.type === "handle") {
    url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,contentDetails&forHandle=${parsed.value}&key=${key}`;
  } else {
    url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,contentDetails&id=${parsed.value}&key=${key}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.items || data.items.length === 0) {
    throw new Error(`Channel not found: ${input}`);
  }

  const channel = data.items[0];
  const snippet = channel.snippet;
  const stats = channel.statistics;

  return {
    id: channel.id,
    title: snippet.title,
    handle: snippet.customUrl || `@${parsed.value}`,
    subscriberCount: parseInt(stats.subscriberCount || "0", 10),
    videoCount: parseInt(stats.videoCount || "0", 10),
    thumbnailUrl:
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      "",
    // Prefer the real uploads playlist ID from the API; fall back to UC→UU swap
    uploadsPlaylistId:
      channel.contentDetails?.relatedPlaylists?.uploads
      || ("UU" + channel.id.slice(2)),
  };
}

/**
 * Fetch the last N videos from a channel's uploads playlist.
 * Uses playlistItems.list + videos.list for stats.
 * Total: ~3 quota units (1 for playlistItems + 1-2 for videos.list pagination).
 */
export async function getChannelVideos(
  channelMeta: ChannelMeta,
  maxVideos: number = 50
): Promise<VideoData[]> {
  const key = getApiKey();
  const playlistId = channelMeta.uploadsPlaylistId;

  // Step 1: Get video IDs from uploads playlist
  const videoIds: string[] = [];
  let pageToken = "";

  while (videoIds.length < maxVideos) {
    const remaining = maxVideos - videoIds.length;
    const maxResults = Math.min(remaining, 50);
    let url = `${YOUTUBE_API_BASE}/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${key}`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      if (res.status === 404 || text.includes("playlistNotFound")) {
        throw new Error(
          `Could not load videos for "${channelMeta.title}". This channel may have hidden their uploads.`
        );
      }
      throw new Error(`YouTube playlistItems error (${res.status}): ${text}`);
    }

    const data = await res.json();
    for (const item of data.items || []) {
      videoIds.push(item.contentDetails.videoId);
    }

    pageToken = data.nextPageToken || "";
    if (!pageToken) break;
  }

  if (videoIds.length === 0) return [];

  // Step 2: Fetch full video details (stats, thumbnails) in batches of 50
  const videos: VideoData[] = [];

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const url = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${batch.join(",")}&key=${key}`;

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`YouTube videos error (${res.status}): ${text}`);
    }

    const data = await res.json();
    for (const item of data.items || []) {
      const snippet = item.snippet;
      const stats = item.statistics;

      // hqdefault (480x360) for Claude Vision analysis — controls token costs
      const hqDefault = `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
      // maxresdefault for display, fallback to hqdefault
      const maxRes = `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`;

      videos.push({
        id: item.id,
        title: snippet.title,
        publishedAt: snippet.publishedAt,
        viewCount: parseInt(stats.viewCount || "0", 10),
        likeCount: parseInt(stats.likeCount || "0", 10),
        commentCount: parseInt(stats.commentCount || "0", 10),
        thumbnailUrl: hqDefault,
        thumbnailUrlHigh: maxRes,
        duration: item.contentDetails.duration || "",
        tags: (snippet.tags as string[]) || [],
      });
    }
  }

  // Sort by publish date descending (most recent first)
  videos.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return videos;
}

/**
 * Full pipeline: resolve channel + fetch videos.
 */
export async function fetchChannelData(input: string): Promise<ChannelData> {
  const meta = await resolveChannel(input);
  const videos = await getChannelVideos(meta, 50);
  return { meta, videos };
}

// ═══════════════════════════════════════
// OUTLIER — IP hashing utility
// ═══════════════════════════════════════

import { createHash } from "crypto";

const IP_HASH_SALT = process.env.IP_HASH_SALT || "outlier-default-salt-2024";

/**
 * SHA-256 hash of IP with salt, truncated to 16 chars.
 */
export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${IP_HASH_SALT}:${ip}`)
    .digest("hex")
    .slice(0, 16);
}

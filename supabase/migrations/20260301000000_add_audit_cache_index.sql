-- Add canonical channel ID columns for cache lookups
-- These store YouTube channel IDs in sorted order (alphabetically lower = channel_id_a)
-- so that A-vs-B and B-vs-A hit the same cache row.
ALTER TABLE audits ADD COLUMN IF NOT EXISTS channel_id_a TEXT;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS channel_id_b TEXT;

-- Composite index for fast pair lookups (sorted order)
CREATE INDEX IF NOT EXISTS idx_audits_channel_pair
  ON audits (channel_id_a, channel_id_b);

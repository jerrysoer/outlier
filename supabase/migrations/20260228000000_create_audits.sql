-- Create audits table for shareable result URLs
CREATE TABLE IF NOT EXISTS audits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  channel_a   TEXT NOT NULL,
  channel_b   TEXT NOT NULL,
  result_json JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_audits_slug ON audits (slug);
CREATE INDEX IF NOT EXISTS idx_audits_expires ON audits (expires_at);

-- Add session_id to analytics_events if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'analytics_events'
      AND column_name = 'session_id'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN session_id TEXT;
  END IF;
END $$;

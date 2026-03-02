-- Add og_image_url column
ALTER TABLE audits ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Create storage bucket for OG images (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('og-images', 'og-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy
CREATE POLICY "Public read og-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'og-images');

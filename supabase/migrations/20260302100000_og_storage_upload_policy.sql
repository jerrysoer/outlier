-- Allow service_role to upload and overwrite OG images
CREATE POLICY "Service role insert og-images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'og-images');

CREATE POLICY "Service role update og-images"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'og-images')
  WITH CHECK (bucket_id = 'og-images');

-- Drop restrictive service_role-only policies
DROP POLICY IF EXISTS "Service role insert og-images" ON storage.objects;
DROP POLICY IF EXISTS "Service role update og-images" ON storage.objects;

-- Allow all authenticated roles to insert into og-images bucket
CREATE POLICY "Allow insert og-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'og-images');

CREATE POLICY "Allow update og-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'og-images')
  WITH CHECK (bucket_id = 'og-images');

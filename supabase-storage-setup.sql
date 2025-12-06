-- Enable Storage for the project if not already enabled (handled via dashboard usually)

-- Create 'explore-assets' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('explore-assets', 'explore-assets', true)
ON CONFLICT (id) DO NOTHING;

-- POLICY: Allow public read access to 'explore-assets'
-- This allows anyone to view the images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'explore-assets' );

-- POLICY: Allow authenticated users (admin/staff) to upload files
-- Assuming authenticated users can upload. You can refine this with role checks if needed.
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'explore-assets' AND
  auth.role() = 'authenticated'
);

-- POLICY: Allow authenticated users to update their files
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'explore-assets' AND
  auth.role() = 'authenticated'
);

-- POLICY: Allow authenticated users to delete files
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'explore-assets' AND
  auth.role() = 'authenticated'
);







-- Update explore_posts table to support templates
-- Run this SQL in your Supabase SQL Editor

-- Add is_template column if it doesn't exist
ALTER TABLE public.explore_posts 
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;

-- Create index for faster template queries
CREATE INDEX IF NOT EXISTS idx_explore_posts_is_template 
ON public.explore_posts(is_template) 
WHERE is_template = true;

-- Optional: Add comment to document the field
COMMENT ON COLUMN public.explore_posts.is_template IS 
'If true, this post is a template/default that can be duplicated to clients';




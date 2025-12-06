-- =====================================================
-- UPDATE: Add missing columns for Client Management
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Add admin_notes column for internal staff notes
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add is_active column for account status management
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add preferences column for service tags (array of strings)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS preferences TEXT[];

-- Create index for active status queries
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Add comment for documentation
COMMENT ON COLUMN public.users.admin_notes IS 'Private notes visible only to admin staff';
COMMENT ON COLUMN public.users.is_active IS 'Account status: true = active, false = inactive (prevents login)';
COMMENT ON COLUMN public.users.preferences IS 'Array of service tags and guest preferences (e.g., VIP, Allergy, Vegan)';


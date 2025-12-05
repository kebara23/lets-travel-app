-- ============================================
-- SCHEMA UPDATE: Add Rich Metadata to notifications table
-- ============================================
-- This adds the necessary columns for "Recent Activity" feature
-- to support rich display and deep linking

-- Add new columns to notifications table
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS actor_name TEXT,
  ADD COLUMN IF NOT EXISTS target_user_name TEXT,
  ADD COLUMN IF NOT EXISTS resource_id UUID,
  ADD COLUMN IF NOT EXISTS resource_type TEXT CHECK (resource_type IN ('TRIP', 'CLIENT', 'SOS', 'MESSAGE', 'INVOICE', 'OTHER'));

-- Create index for faster lookups by resource
CREATE INDEX IF NOT EXISTS idx_notifications_resource 
  ON public.notifications(resource_type, resource_id);

-- Create index for faster lookups by actor
CREATE INDEX IF NOT EXISTS idx_notifications_actor 
  ON public.notifications(actor_name, created_at DESC);

-- ============================================
-- EXAMPLE: How to insert activity logs with new fields
-- ============================================
/*
INSERT INTO public.notifications (
  user_id,
  title,
  message,
  type,
  link,
  actor_name,
  target_user_name,
  resource_id,
  resource_type
) VALUES (
  'admin-user-id',                    -- user_id (admin who sees this)
  'Trip Updated',                     -- title
  'Itinerary day 3 modified',         -- message
  'TRIP_UPDATE',                       -- type (legacy event type)
  '/admin/trips/trip-uuid',           -- link (legacy)
  'Ana Rodriguez',                     -- actor_name (admin who did the action)
  'Juan Perez',                        -- target_user_name (client affected)
  'trip-uuid-here',                    -- resource_id (the trip ID)
  'TRIP'                               -- resource_type
);
*/


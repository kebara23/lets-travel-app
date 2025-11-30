-- Create device_tracking table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS device_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_device_tracking_user_id ON device_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tracking_updated_at ON device_tracking(updated_at);

-- Enable Row Level Security (RLS)
ALTER TABLE device_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert/update their own tracking data
CREATE POLICY "Users can manage their own tracking data"
  ON device_tracking
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow concierge to view all tracking data (adjust based on your auth requirements)
CREATE POLICY "Concierge can view all tracking data"
  ON device_tracking
  FOR SELECT
  USING (true); -- Adjust this based on your concierge role logic


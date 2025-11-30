-- Create itinerary_items table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS itinerary_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id TEXT NOT NULL DEFAULT 'default-trip',
  day INTEGER NOT NULL,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('flight', 'hotel', 'activity', 'food')),
  location TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_day ON itinerary_items(trip_id, day);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip ON itinerary_items(trip_id);

-- Enable Row Level Security (RLS)
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own items
CREATE POLICY "Users can view their own itinerary items"
  ON itinerary_items
  FOR SELECT
  USING (true); -- Adjust this based on your auth requirements

-- Create policy to allow authenticated users to update their own items
CREATE POLICY "Users can update their own itinerary items"
  ON itinerary_items
  FOR UPDATE
  USING (true); -- Adjust this based on your auth requirements

-- Create policy to allow authenticated users to insert their own items
CREATE POLICY "Users can insert their own itinerary items"
  ON itinerary_items
  FOR INSERT
  WITH CHECK (true); -- Adjust this based on your auth requirements


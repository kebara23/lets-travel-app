-- Create trips table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'completed')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_dates ON public.trips(start_date, end_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own trips
CREATE POLICY "Users can view their own trips"
  ON public.trips
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow admin to view all trips
CREATE POLICY "Admin can view all trips"
  ON public.trips
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create policy to allow admin to insert trips
CREATE POLICY "Admin can insert trips"
  ON public.trips
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create policy to allow admin to update trips
CREATE POLICY "Admin can update trips"
  ON public.trips
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create policy to allow admin to delete trips
CREATE POLICY "Admin can delete trips"
  ON public.trips
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );


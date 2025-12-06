-- Create sos_alerts table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'false_alarm')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sos_alerts_user_id ON sos_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_created_at ON sos_alerts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own SOS alerts
CREATE POLICY "Users can create their own SOS alerts"
  ON sos_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own SOS alerts
CREATE POLICY "Users can view their own SOS alerts"
  ON sos_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow concierge/admin to view all SOS alerts
CREATE POLICY "Concierge can view all SOS alerts"
  ON sos_alerts
  FOR SELECT
  USING (true); -- Adjust based on your concierge role logic

-- Create policy to allow concierge/admin to update SOS alerts
CREATE POLICY "Concierge can update SOS alerts"
  ON sos_alerts
  FOR UPDATE
  USING (true); -- Adjust based on your concierge role logic


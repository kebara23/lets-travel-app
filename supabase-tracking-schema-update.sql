-- Add is_active column to device_tracking table if it doesn't exist
-- Run this SQL in your Supabase SQL Editor

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'device_tracking'
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE device_tracking ADD COLUMN is_active BOOLEAN DEFAULT false;
        
        -- Create index for faster queries
        CREATE INDEX IF NOT EXISTS idx_device_tracking_is_active ON device_tracking(is_active);
        
        -- Update existing records to be inactive by default
        UPDATE device_tracking SET is_active = false WHERE is_active IS NULL;
    END IF;
END $$;


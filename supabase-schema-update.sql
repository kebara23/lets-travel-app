-- Add 'is_template' column to 'explore_posts' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'explore_posts'
        AND column_name = 'is_template'
    ) THEN
        ALTER TABLE explore_posts ADD COLUMN is_template BOOLEAN DEFAULT false;
    END IF;
END $$;





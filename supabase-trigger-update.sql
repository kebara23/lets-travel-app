-- =====================================================
-- UPDATE: handle_new_user Trigger Function
-- Automatically assigns 'admin' role if email contains "admin"
-- =====================================================

-- First, ensure the 'role' column exists in public.users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client', 'concierge'));

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create updated function with admin detection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_internal_code TEXT;
  v_full_name TEXT;
  v_phone TEXT;
  v_country_code TEXT;
  v_role TEXT;
  v_email TEXT;
BEGIN
  -- Extract email
  v_email := NEW.email;
  
  -- THE MAGIC KEY: Determine role based on email
  -- If email contains "admin" (case insensitive), assign admin role
  IF LOWER(v_email) LIKE '%admin%' THEN
    v_role := 'admin';
  ELSE
    v_role := 'client';
  END IF;
  
  -- Extract metadata from signup
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  v_country_code := COALESCE(NEW.raw_user_meta_data->>'country_code', '');
  
  -- Use username from metadata if provided, otherwise generate fallback
  IF NEW.raw_user_meta_data->>'username' IS NOT NULL THEN
    v_username := NEW.raw_user_meta_data->>'username';
  ELSE
    -- Fallback: Generate from email if no username provided
    v_username := SPLIT_PART(v_email, '@', 1) || COALESCE(v_country_code, '') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
  END IF;
  
  -- Use internal_code from metadata if provided, otherwise generate
  IF NEW.raw_user_meta_data->>'internal_code' IS NOT NULL THEN
    v_internal_code := NEW.raw_user_meta_data->>'internal_code';
  ELSE
    -- Generate LTS-XXXXXX format (6 alphanumeric uppercase)
    v_internal_code := 'LTS-' || UPPER(
      SUBSTRING(
        MD5(RANDOM()::TEXT || NOW()::TEXT || NEW.id::TEXT),
        1,
        6
      )
    );
  END IF;
  
  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    country_code,
    username,
    internal_code,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_email,
    v_full_name,
    NULLIF(v_phone, ''),
    NULLIF(v_country_code, ''),
    v_username,
    v_internal_code,
    v_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    country_code = EXCLUDED.country_code,
    username = EXCLUDED.username,
    internal_code = EXCLUDED.internal_code,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Create trigger (drop existing if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- =====================================================
-- VERIFICATION QUERY (Optional - run to test)
-- =====================================================
-- SELECT 
--   id,
--   email,
--   role,
--   username,
--   internal_code,
--   created_at
-- FROM public.users
-- ORDER BY created_at DESC
-- LIMIT 5;

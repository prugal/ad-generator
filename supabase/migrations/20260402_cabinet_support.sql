-- Migration: Cabinet support (2026-04-02)
-- Adds user_id to generated_ads, creates users table, fixes payment_intents access

-- 1. Add user_id to generated_ads
ALTER TABLE public.generated_ads
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_generated_ads_user_id_created_at
ON public.generated_ads(user_id, created_at DESC);

-- 2. Add currency column to payment_intents (used in cabinet UI)
ALTER TABLE public.payment_intents
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'RUB';

-- 3. Allow users to view their own payment intents
CREATE POLICY "Users can view own payment intents" ON public.payment_intents
FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- 4. Create public users table (for cabinet profile)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT
USING ((SELECT auth.uid()) = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- Users can insert their own profile (on first login)
CREATE POLICY "Users can insert own profile" ON public.users
FOR INSERT
WITH CHECK ((SELECT auth.uid()) = id);

GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- 5. Auto-sync auth.users -> public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.users.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Backfill existing users into public.users
INSERT INTO public.users (id, email)
SELECT au.id, au.email
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = au.id);

-- =====================================================
-- Fix all Supabase security and performance warnings
-- =====================================================

-- ===========================================
-- 1. RLS on server-only tables
--    Enable RLS but create NO policies.
--    service_role bypasses RLS automatically,
--    so only server-side code can access these.
-- ===========================================

ALTER TABLE public.generated_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Drop any permissive "always true" policies that defeat the purpose of RLS
DROP POLICY IF EXISTS "Service role full access to generated_ads" ON public.generated_ads;
DROP POLICY IF EXISTS "Service role full access to rate_limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Service role full access to error_logs" ON public.error_logs;

-- Revoke direct access from anon and authenticated roles
REVOKE ALL ON public.generated_ads FROM anon, authenticated;
REVOKE ALL ON public.rate_limits FROM anon, authenticated;
REVOKE ALL ON public.error_logs FROM anon, authenticated;


-- =========================================================
-- 2. WARN (Performance): RLS policies using auth.uid()
--    Replace with (select auth.uid()) for better performance
-- =========================================================

-- user_credits policies
DROP POLICY IF EXISTS "Users can view own credits" ON public.user_credits;
CREATE POLICY "Users can view own credits" ON public.user_credits
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own credit record" ON public.user_credits;
CREATE POLICY "Users can insert their own credit record" ON public.user_credits
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own credit record" ON public.user_credits;
CREATE POLICY "Users can update their own credit record" ON public.user_credits
  FOR UPDATE USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- credit_transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own transaction record" ON public.credit_transactions;
CREATE POLICY "Users can insert their own transaction record" ON public.credit_transactions
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);


-- =========================================================
-- 3. WARN (Security): Functions with mutable search_path
--    Add SET search_path = '' for SECURITY DEFINER functions
-- =========================================================

-- Fix update_user_credits
CREATE OR REPLACE FUNCTION public.update_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  SELECT balance INTO v_current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id)
    VALUES (p_user_id)
    RETURNING balance INTO v_current_balance;
  END IF;

  v_new_balance := v_current_balance + p_amount;

  IF p_amount < 0 AND v_new_balance < 0 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient credits');
  END IF;

  UPDATE public.user_credits
  SET 
    balance = v_new_balance,
    total_earned = total_earned + GREATEST(p_amount, 0),
    total_spent = total_spent + GREATEST(-p_amount, 0),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, type, description, reference_id, balance_after)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id, v_new_balance)
  RETURNING id INTO v_transaction_id;

  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'transaction_id', v_transaction_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';


-- Fix get_user_credits_with_history
CREATE OR REPLACE FUNCTION public.get_user_credits_with_history(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_credits JSON;
  v_transactions JSON;
BEGIN
  SELECT to_jsonb(uc) INTO v_credits
  FROM public.user_credits uc
  WHERE uc.user_id = p_user_id;

  IF v_credits IS NULL THEN
    INSERT INTO public.user_credits (user_id)
    VALUES (p_user_id)
    RETURNING to_jsonb(public.user_credits.*) INTO v_credits;
  END IF;

  SELECT json_agg(to_jsonb(ct) ORDER BY ct.created_at DESC)
  INTO v_transactions
  FROM public.credit_transactions ct
  WHERE ct.user_id = p_user_id
  LIMIT 50;

  RETURN json_build_object(
    'credits', v_credits,
    'transactions', COALESCE(v_transactions, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';


-- Fix user_has_credits
CREATE OR REPLACE FUNCTION public.user_has_credits(p_user_id UUID, p_required_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT balance INTO v_balance
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  IF v_balance IS NULL THEN
    RETURN p_required_amount <= 0;
  END IF;
  
  RETURN v_balance >= p_required_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';


-- Fix check_rate_limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip_address TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  SELECT request_count, window_start INTO v_count, v_window_start
  FROM public.rate_limits
  WHERE ip_address = p_ip_address
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.rate_limits (ip_address, request_count, window_start)
    VALUES (p_ip_address, 1, v_now);
    RETURN TRUE;
  END IF;

  IF v_now - v_window_start > (p_window_seconds || ' seconds')::INTERVAL THEN
    UPDATE public.rate_limits
    SET request_count = 1, window_start = v_now
    WHERE ip_address = p_ip_address;
    RETURN TRUE;
  ELSE
    IF v_count >= p_limit THEN
      RETURN FALSE;
    ELSE
      UPDATE public.rate_limits
      SET request_count = request_count + 1
      WHERE ip_address = p_ip_address;
      RETURN TRUE;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';


-- =========================================================
-- 5. Fix handle_first_login_bonus function + trigger
-- =========================================================

-- Ensure column defaults are correct (in case DB differs from migrations)
ALTER TABLE public.user_credits ALTER COLUMN balance SET DEFAULT 3;
ALTER TABLE public.user_credits ALTER COLUMN total_earned SET DEFAULT 3;
ALTER TABLE public.user_credits ALTER COLUMN total_spent SET DEFAULT 0;

-- Fix handle_first_login_bonus function
CREATE OR REPLACE FUNCTION public.handle_first_login_bonus()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance, total_earned, total_spent)
  VALUES (NEW.id, 3, 3, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Record the first login bonus transaction (only if credits were actually created)
  IF FOUND THEN
    INSERT INTO public.credit_transactions (user_id, amount, type, description, balance_after)
    VALUES (NEW.id, 3, 'first_login', 'Welcome bonus: 3 free credits', 3);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create the trigger on auth.users if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_first_login_bonus();


-- =========================================================
-- 6. Repair existing users who have 0 credits (never got welcome bonus)
-- =========================================================

-- Fix balance and total_earned for users who were created with 0
UPDATE public.user_credits
SET 
  balance = 3,
  total_earned = 3,
  updated_at = NOW()
WHERE balance = 0 AND total_earned = 0 AND total_spent = 0;

-- Create welcome bonus transaction records for repaired users
-- (only for users who don't already have a first_login transaction)
INSERT INTO public.credit_transactions (user_id, amount, type, description, balance_after)
SELECT uc.user_id, 3, 'first_login', 'Welcome bonus: 3 free credits (repaired)', 3
FROM public.user_credits uc
WHERE NOT EXISTS (
  SELECT 1 FROM public.credit_transactions ct
  WHERE ct.user_id = uc.user_id AND ct.type = 'first_login'
)
AND uc.balance = 3 AND uc.total_earned = 3 AND uc.total_spent = 0;


-- =========================================================
-- 7. INFO (Performance): Drop unused indexes
-- =========================================================

DROP INDEX IF EXISTS idx_error_logs_created_at;
DROP INDEX IF EXISTS idx_credit_transactions_created_at;
DROP INDEX IF EXISTS idx_credit_transactions_type;

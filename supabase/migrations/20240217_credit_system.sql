-- Credit System Database Schema
-- This migration creates tables for managing user credits and transactions

-- User Credits Table: Stores current credit balance for each user
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 3 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 3,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_credits_user_id_unique UNIQUE (user_id)
);

-- Credit Transactions Table: Stores all credit transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount != 0),
  type TEXT NOT NULL CHECK (type IN ('first_login', 'purchase', 'usage', 'refund', 'bonus')),
  description TEXT NOT NULL,
  reference_id UUID,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);

-- Function to update user credits atomically
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
  -- Lock the user credits row for update to prevent race conditions
  SELECT balance INTO v_current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- If user doesn't have credits record, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id)
    VALUES (p_user_id)
    RETURNING balance INTO v_current_balance;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Check for negative balance (only for spending operations)
  IF p_amount < 0 AND v_new_balance < 0 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient credits');
  END IF;

  -- Update user credits
  UPDATE public.user_credits
  SET 
    balance = v_new_balance,
    total_earned = total_earned + GREATEST(p_amount, 0),
    total_spent = total_spent + GREATEST(-p_amount, 0),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create transaction record
  INSERT INTO public.credit_transactions (user_id, amount, type, description, reference_id, balance_after)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id, v_new_balance)
  RETURNING id INTO v_transaction_id;

  RETURN json_build_object('success', true, 'new_balance', v_new_balance, 'transaction_id', v_transaction_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to get user credits with transaction history
CREATE OR REPLACE FUNCTION public.get_user_credits_with_history(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_credits JSON;
  v_transactions JSON;
BEGIN
  -- Get user credits
  SELECT to_jsonb(uc) INTO v_credits
  FROM public.user_credits uc
  WHERE uc.user_id = p_user_id;

  -- If no credits record, create one
  IF v_credits IS NULL THEN
    INSERT INTO public.user_credits (user_id)
    VALUES (p_user_id)
    RETURNING to_jsonb(public.user_credits.*) INTO v_credits;
  END IF;

  -- Get recent transactions (last 50)
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



-- Row Level Security (RLS) Policies
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- User can only read their own credits
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING ((select auth.uid()) = user_id);

-- User can only read their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING ((select auth.uid()) = user_id);

-- Users can insert their own credit records
DROP POLICY IF EXISTS "Users can insert their own credit record" ON user_credits;
CREATE POLICY "Users can insert their own credit record" ON user_credits
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Users can update their own credit records
DROP POLICY IF EXISTS "Users can update their own credit record" ON user_credits;
CREATE POLICY "Users can update their own credit record" ON user_credits
  FOR UPDATE USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- Users can insert their own transaction records
DROP POLICY IF EXISTS "Users can insert their own transaction record" ON credit_transactions;
CREATE POLICY "Users can insert their own transaction record" ON credit_transactions
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON user_credits TO authenticated;
GRANT SELECT, INSERT ON credit_transactions TO authenticated;

-- Grant permissions to anon users (for basic read operations)
GRANT SELECT ON user_credits TO anon;
GRANT SELECT ON credit_transactions TO anon;

-- Create function to check if user has enough credits (for use in RLS policies)
CREATE OR REPLACE FUNCTION public.user_has_credits(p_user_id UUID, p_required_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT balance INTO v_balance
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- If no record, user has 0 credits
  IF v_balance IS NULL THEN
    RETURN p_required_amount <= 0;
  END IF;
  
  RETURN v_balance >= p_required_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
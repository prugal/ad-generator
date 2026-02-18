-- Migration: Support decimal credits (e.g. 0.5 for regeneration)
-- Changes balance/amount columns from INTEGER to NUMERIC(10,2)

-- 1. Alter user_credits table columns
ALTER TABLE public.user_credits
  ALTER COLUMN balance TYPE NUMERIC(10,2) USING balance::NUMERIC(10,2),
  ALTER COLUMN total_earned TYPE NUMERIC(10,2) USING total_earned::NUMERIC(10,2),
  ALTER COLUMN total_spent TYPE NUMERIC(10,2) USING total_spent::NUMERIC(10,2);

-- Update the default and check constraint for balance
ALTER TABLE public.user_credits
  ALTER COLUMN balance SET DEFAULT 3,
  DROP CONSTRAINT IF EXISTS user_credits_balance_check;

ALTER TABLE public.user_credits
  ADD CONSTRAINT user_credits_balance_check CHECK (balance >= 0);

-- 2. Alter credit_transactions table
ALTER TABLE public.credit_transactions
  ALTER COLUMN amount TYPE NUMERIC(10,2) USING amount::NUMERIC(10,2),
  ALTER COLUMN balance_after TYPE NUMERIC(10,2) USING balance_after::NUMERIC(10,2);

-- Remove old check constraint that disallows 0 (decimals like -0.5 are fine)
ALTER TABLE public.credit_transactions
  DROP CONSTRAINT IF EXISTS credit_transactions_amount_check;

ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_amount_check CHECK (amount != 0);

-- 3. Replace update_user_credits function to use NUMERIC
-- First, drop the old version with INTEGER signature to avoid overloading conflicts
DROP FUNCTION IF EXISTS public.update_user_credits(UUID, INTEGER, TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION public.update_user_credits(
  p_user_id UUID,
  p_amount NUMERIC(10,2),
  p_type TEXT,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_current_balance NUMERIC(10,2);
  v_new_balance NUMERIC(10,2);
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

-- 4. Update user_has_credits function to use NUMERIC
DROP FUNCTION IF EXISTS public.user_has_credits(UUID, INTEGER);

CREATE OR REPLACE FUNCTION public.user_has_credits(p_user_id UUID, p_required_amount NUMERIC(10,2))
RETURNS BOOLEAN AS $$
DECLARE
  v_balance NUMERIC(10,2);
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


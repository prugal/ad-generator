-- Migration: Payment Intents table for Robokassa integration
-- This table tracks payment intents to ensure idempotency

-- Create payment_intents table
CREATE TABLE IF NOT EXISTS public.payment_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inv_id BIGINT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    credits INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure unique invoice ID
    CONSTRAINT payment_intents_inv_id_unique UNIQUE (inv_id)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_payment_intents_inv_id ON public.payment_intents(inv_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON public.payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON public.payment_intents(status);

-- Enable RLS
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only service role can manage payment intents (server-side only)
-- Users should not have direct access to this table
CREATE POLICY "Service role can manage payment intents" ON public.payment_intents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant permissions to service role only
GRANT ALL ON public.payment_intents TO service_role;

-- Alter credit_transactions.reference_id to TEXT to support string references like 'robokassa_123'
ALTER TABLE public.credit_transactions 
    ALTER COLUMN reference_id TYPE TEXT;

-- Drop and recreate update_user_credits function with TEXT reference_id
DROP FUNCTION IF EXISTS public.update_user_credits(UUID, NUMERIC(10,2), TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.update_user_credits(UUID, NUMERIC(10,2), TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.update_user_credits(
  p_user_id UUID,
  p_amount NUMERIC(10,2),
  p_type TEXT,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_current_balance NUMERIC(10,2);
  v_new_balance NUMERIC(10,2);
  v_transaction_id UUID;
BEGIN
  -- Check for duplicate reference_id (idempotency for purchases)
  IF p_reference_id IS NOT NULL AND p_amount > 0 THEN
    PERFORM 1 FROM public.credit_transactions 
    WHERE reference_id = p_reference_id 
    LIMIT 1;
    
    IF FOUND THEN
      -- Already processed, return success without double-charging
      RETURN json_build_object('success', true, 'duplicate', true, 'message', 'Transaction already processed');
    END IF;
  END IF;

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

-- Add unique constraint on reference_id for credit_transactions
-- This ensures we can't have duplicate reference_ids
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_reference_id_unique 
    ON public.credit_transactions(reference_id) 
    WHERE reference_id IS NOT NULL;
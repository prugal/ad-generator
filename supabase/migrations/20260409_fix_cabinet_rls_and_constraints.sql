-- Fix: Extend credit_transactions type constraint to support ad_generation and ad_regeneration
-- This fixes the 500 error when fetching transactions

-- Drop the old check constraint
ALTER TABLE public.credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_type_check;

-- Add new check constraint with extended types
ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_type_check
  CHECK (type IN ('first_login', 'purchase', 'usage', 'refund', 'bonus', 'ad_generation', 'ad_regeneration'));

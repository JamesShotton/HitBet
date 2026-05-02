-- Add commission type tracking and invoice reference for recurring commissions
ALTER TABLE referral_conversions
  ADD COLUMN IF NOT EXISTS commission_type TEXT NOT NULL DEFAULT 'flat',
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;

-- Unique constraint for recurring invoice commissions (session_id handles flat ones already)
CREATE UNIQUE INDEX IF NOT EXISTS referral_conversions_invoice_idx
  ON referral_conversions (stripe_invoice_id)
  WHERE stripe_invoice_id IS NOT NULL;

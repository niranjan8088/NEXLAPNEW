ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_bank TEXT,
  ADD COLUMN IF NOT EXISTS bank_transfer_type TEXT,
  ADD COLUMN IF NOT EXISTS card_type TEXT;

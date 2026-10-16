ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS applied_offer_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_orders_applied_offer_code
  ON orders (UPPER(applied_offer_code))
  WHERE applied_offer_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.offers (
  id TEXT PRIMARY KEY,
  offer_name TEXT NOT NULL,
  offer_code TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
  eligible_products JSONB NOT NULL DEFAULT '["all"]'::jsonb,
  minimum_purchase NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (minimum_purchase >= 0),
  maximum_discount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (maximum_discount >= 0),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  usage_limit INTEGER NOT NULL DEFAULT 100 CHECK (usage_limit > 0),
  per_customer_limit INTEGER NOT NULL DEFAULT 1 CHECK (per_customer_limit > 0),
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  used_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT offers_expiry_after_start CHECK (expiry_date >= start_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS offers_code_normalized_unique
  ON public.offers (UPPER(BTRIM(offer_code)));

INSERT INTO public.offers (
  id, offer_name, offer_code, description, discount_type, discount_value,
  eligible_products, minimum_purchase, maximum_discount, start_date,
  expiry_date, usage_limit, per_customer_limit, usage_count, used_by, status
)
VALUES (
  'off-nex10-default',
  'Welcome Referral Offer',
  'NEX10',
  'Get 10% off your order up to ₹2,000.',
  'percentage',
  10,
  '["all"]'::jsonb,
  1000,
  2000,
  CURRENT_DATE,
  (CURRENT_DATE + INTERVAL '1 year')::date,
  100,
  1,
  0,
  '[]'::jsonb,
  'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;

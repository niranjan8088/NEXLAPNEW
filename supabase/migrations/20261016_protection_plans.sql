CREATE TABLE IF NOT EXISTS public.product_protection_plans (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  duration TEXT NOT NULL DEFAULT 'Year',
  accent TEXT NOT NULL DEFAULT 'purple' CHECK (accent IN ('purple', 'blue')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.product_protection_plans
  (id, title, description, price, duration, accent, is_active, sort_order)
VALUES
  (
    'care-device-1y',
    'Extended 1-Year Device Care',
    'Covers hardware breakdown, accidental spills, and doorstep technician service.',
    499,
    'Year',
    'purple',
    TRUE,
    1
  ),
  (
    'care-damage-1y',
    'Full Display & Damage Protection',
    'Free screen replacement and zero-cost parts warranty for 12 months.',
    299,
    'Year',
    'blue',
    TRUE,
    2
  )
ON CONFLICT (id) DO NOTHING;

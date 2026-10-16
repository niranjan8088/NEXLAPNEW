ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.products
    WHERE sku IS NOT NULL AND BTRIM(sku) <> ''
    GROUP BY UPPER(BTRIM(sku))
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot enforce unique product SKUs: duplicate non-empty product SKUs already exist.';
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS products_sku_normalized_unique
  ON public.products (UPPER(BTRIM(sku)))
  WHERE sku IS NOT NULL AND BTRIM(sku) <> '';

-- ===================================================================
-- NEXBYTE TECHNOLOGIES — DYNAMIC E-COMMERCE CATALOG MIGRATION
-- Migration: 20261008_create_filter_definitions.sql
-- Description: Creates filter_definitions schema, populates default
--              laptop filters, and adds optimized catalog indexes.
-- ===================================================================

-- 1. Create Filter Definitions Table
CREATE TABLE IF NOT EXISTS filter_definitions (
  id VARCHAR(64) PRIMARY KEY,
  category_id VARCHAR(64) NOT NULL DEFAULT 'all',
  name VARCHAR(128) NOT NULL,
  key VARCHAR(64) NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'multi-select',
  options JSONB DEFAULT '[]'::jsonb,
  min_value NUMERIC DEFAULT 0,
  max_value NUMERIC DEFAULT 1000000,
  unit VARCHAR(32) DEFAULT '',
  enabled BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  is_searchable BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on Category ID and Sort Order for fast dynamic filter fetches
CREATE INDEX IF NOT EXISTS idx_filter_definitions_cat ON filter_definitions (category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_filter_definitions_enabled ON filter_definitions (enabled);

-- 2. Create Performance Indexes on Existing Products Table
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products (stock);
CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products (rating);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);

-- 3. Seed Default Laptop & Hardware Filter Definitions
INSERT INTO filter_definitions (id, category_id, name, key, type, options, sort_order, enabled)
VALUES 
  ('flt-proc-brand', 'business_laptops', 'Processor Brand', 'processorBrand', 'multi-select', '[{"label":"Intel","value":"Intel"},{"label":"AMD","value":"AMD"},{"label":"Apple","value":"Apple"}]'::jsonb, 1, true),
  ('flt-proc-family', 'business_laptops', 'Processor', 'processor', 'multi-select', '[{"label":"Intel Core i3","value":"Intel Core i3"},{"label":"Intel Core i5","value":"Intel Core i5"},{"label":"Intel Core i7","value":"Intel Core i7"},{"label":"Intel Core i9","value":"Intel Core i9"},{"label":"AMD Ryzen 5","value":"AMD Ryzen 5"},{"label":"AMD Ryzen 7","value":"AMD Ryzen 7"},{"label":"Apple M1","value":"Apple M1"},{"label":"Apple M2","value":"Apple M2"}]'::jsonb, 2, true),
  ('flt-proc-gen', 'business_laptops', 'Processor Generation', 'processorGen', 'multi-select', '[{"label":"11th Gen","value":"11th Gen"},{"label":"12th Gen","value":"12th Gen"},{"label":"13th Gen","value":"13th Gen"},{"label":"14th Gen","value":"14th Gen"}]'::jsonb, 3, true),
  ('flt-ram-cap', 'business_laptops', 'RAM Capacity', 'ramCapacity', 'multi-select', '[{"label":"4 GB","value":"4 GB"},{"label":"8 GB","value":"8 GB"},{"label":"16 GB","value":"16 GB"},{"label":"32 GB","value":"32 GB"},{"label":"64 GB","value":"64 GB"}]'::jsonb, 4, true),
  ('flt-ram-type', 'business_laptops', 'RAM Type', 'ramType', 'multi-select', '[{"label":"DDR4","value":"DDR4"},{"label":"DDR5","value":"DDR5"},{"label":"LPDDR5","value":"LPDDR5"}]'::jsonb, 5, true),
  ('flt-ssd-cap', 'business_laptops', 'SSD Capacity', 'ssdCapacity', 'multi-select', '[{"label":"128 GB","value":"128 GB"},{"label":"256 GB","value":"256 GB"},{"label":"512 GB","value":"512 GB"},{"label":"1 TB","value":"1 TB"},{"label":"2 TB","value":"2 TB"}]'::jsonb, 6, true),
  ('flt-screen-size', 'business_laptops', 'Screen Size', 'screenSize', 'multi-select', '[{"label":"13.3 inch","value":"13.3 inch"},{"label":"14 inch","value":"14 inch"},{"label":"15.6 inch","value":"15.6 inch"},{"label":"16 inch","value":"16 inch"}]'::jsonb, 7, true),
  ('flt-os', 'business_laptops', 'Operating System', 'operatingSystem', 'multi-select', '[{"label":"Windows 11 Home","value":"Windows 11 Home"},{"label":"Windows 11 Pro","value":"Windows 11 Pro"},{"label":"macOS","value":"macOS"}]'::jsonb, 8, true),
  ('flt-touchscreen', 'business_laptops', 'Touch Screen', 'touchScreen', 'boolean', '[]'::jsonb, 9, true),
  ('flt-gst-invoice', 'all', 'GST Invoice Available', 'gstInvoiceAvailable', 'boolean', '[]'::jsonb, 10, true)
ON CONFLICT (id) DO UPDATE SET
  options = EXCLUDED.options,
  updated_at = NOW();

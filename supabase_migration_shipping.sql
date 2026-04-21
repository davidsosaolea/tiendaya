-- =============================================
-- Migration: Add shipping address fields
-- Run this in Supabase SQL Editor
-- =============================================

-- Add address columns to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS departamento TEXT,
ADD COLUMN IF NOT EXISTS provincia TEXT,
ADD COLUMN IF NOT EXISTS distrito TEXT,
ADD COLUMN IF NOT EXISTS direccion TEXT;

-- Add shipping columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_departamento TEXT,
ADD COLUMN IF NOT EXISTS shipping_provincia TEXT,
ADD COLUMN IF NOT EXISTS shipping_distrito TEXT,
ADD COLUMN IF NOT EXISTS shipping_direccion TEXT;

-- Enable RLS policies to include new columns (already covered by existing policies if using *)

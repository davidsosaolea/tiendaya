-- =============================================
-- Fix: Add RLS policies for customers table
-- The storefront checkout is anonymous (no auth),
-- so we need policies that allow public insert/update/select
-- =============================================

-- Allow anyone to INSERT a customer (from storefront checkout)
CREATE POLICY "Allow public insert customers"
ON customers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to SELECT customers (needed for the phone lookup)
CREATE POLICY "Allow public select customers"
ON customers
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anyone to UPDATE customers (to update address on repeat orders)
CREATE POLICY "Allow public update customers"
ON customers
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

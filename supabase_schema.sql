-- Supabase / Postgres schema for stock_control_app
-- Run this in your Supabase SQL editor or via psql connected to the provided connection string.

-- Enable uuid and crypto helpers (Supabase usually has pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact text,
  email text,
  phone text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sku text UNIQUE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  price numeric(12,2) DEFAULT 0,
  cost numeric(12,2) DEFAULT 0,
  current_stock integer DEFAULT 0,
  min_stock integer DEFAULT 0,
  max_stock integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index commonly queried columns
CREATE INDEX IF NOT EXISTS idx_products_name ON products (lower(name));
CREATE INDEX IF NOT EXISTS idx_products_sku ON products (sku);

-- ---------- stock_movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('ENTRADA','SAÍDA')),
  quantity integer NOT NULL CHECK (quantity > 0),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- Function: handle_stock_movement
-- Inserts a stock_movements record and updates products.current_stock in a transaction.
CREATE OR REPLACE FUNCTION public.handle_stock_movement(
  product_id_param uuid,
  movement_type text,
  quantity_param integer,
  reason_param text
)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = product_id_param) THEN
    RAISE EXCEPTION 'Produto não encontrado: %', product_id_param;
  END IF;

  -- Update stock
  IF movement_type = 'ENTRADA' THEN
    UPDATE products
      SET current_stock = current_stock + quantity_param,
          updated_at = now()
      WHERE id = product_id_param;
  ELSIF movement_type = 'SAÍDA' THEN
    UPDATE products
      SET current_stock = current_stock - quantity_param,
          updated_at = now()
      WHERE id = product_id_param;
  ELSE
    RAISE EXCEPTION 'Tipo de movimentação inválido: %', movement_type;
  END IF;

  -- Insert movement record
  INSERT INTO stock_movements(product_id, type, quantity, reason, created_at)
    VALUES (product_id_param, movement_type, quantity_param, reason_param, now());
END;
$$;

-- ---------- Function: get_dashboard_kpis
-- Returns a single JSON object with simple KPIs used by the app.
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
RETURNS TABLE(kpis json) LANGUAGE sql AS $$
  SELECT json_build_object(
    'total_products', (SELECT count(*) FROM products),
    'total_suppliers', (SELECT count(*) FROM suppliers),
    'total_categories', (SELECT count(*) FROM categories),
    'low_stock_count', (SELECT count(*) FROM products WHERE current_stock <= coalesce(min_stock, 0)),
    'total_stock_value', (SELECT coalesce(sum(current_stock * price),0) FROM products)
  )::json;
$$;

-- Optional: sample data (commented) -- uncomment to seed quickly
-- INSERT INTO categories (name, description) VALUES ('Sem categoria', 'Categoria padrão');
-- INSERT INTO suppliers (name) VALUES ('Fornecedor Exemplo');
-- INSERT INTO products (name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock)
-- VALUES ('Produto Exemplo', 'Descrição', 'SKU-001', (SELECT id FROM categories LIMIT 1), 10.00, 5.00, 20, 5, 100);

-- End of schema

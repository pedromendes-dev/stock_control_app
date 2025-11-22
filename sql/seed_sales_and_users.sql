
-- =============================
-- CRIAÇÃO DA TABELA CUSTOMERS (caso não exista)
-- =============================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================
-- CRIAÇÃO DAS TABELAS SALES E SALE_ITEMS (caso não existam)
-- =============================
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  total numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  price numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- SEED DE USUÁRIOS E VENDAS REALISTAS PARA DEMONSTRAÇÃO
-- Execute no Supabase SQL Editor ou via script run_sql.cjs

-- =============================
-- USUÁRIOS (clientes e admins)
-- =============================
-- Exemplo: inserir usuários diretamente na tabela auth.users não é permitido via SQL comum.
-- Portanto, crie usuários pelo painel Supabase (Auth > Users) ou via API/admin.
-- Aqui, apenas adicionamos admins na tabela admin_users e clientes em tabela customizada (caso exista).

-- Adicionando admins (ajuste os UUIDs conforme necessário)
INSERT INTO admin_users (user_id, role)
VALUES
  ('9767c450-4581-48c9-8681-1c3520c0dd11', 'superadmin'),
  ('b1b2c3d4-5678-1234-9876-abcdefabcdef', 'admin')
ON CONFLICT DO NOTHING;

-- Exemplo de clientes (caso tenha tabela customers)
INSERT INTO customers (id, name, email, phone, created_at)
VALUES
  (gen_random_uuid(), 'João da Silva', 'joao.silva@email.com', '(11) 98888-1111', now()),
  (gen_random_uuid(), 'Maria Oliveira', 'maria.oliveira@email.com', '(21) 97777-2222', now()),
  (gen_random_uuid(), 'Empresa XPTO', 'contato@xpto.com.br', '(31) 96666-3333', now())
ON CONFLICT DO NOTHING;

-- =============================
-- VENDAS E ITENS DE VENDA
-- =============================
-- Exemplo: vendas simples, relacione com produtos reais já inseridos
-- Ajuste os IDs conforme necessário para bater com seus produtos/clientes

-- Venda 1
INSERT INTO sales (id, customer_id, total, created_at)
SELECT gen_random_uuid(), c.id, 4299.90, now()
FROM customers c WHERE c.email = 'joao.silva@email.com' LIMIT 1;

-- Itens da venda 1
INSERT INTO sale_items (id, sale_id, product_id, quantity, price, created_at)
SELECT gen_random_uuid(), s.id, p.id, 1, 4299.90, now()
FROM sales s, products p
WHERE s.total = 4299.90 AND p.sku = 'SKU-NB-DELL-15-I5' LIMIT 1;

-- Venda 2
INSERT INTO sales (id, customer_id, total, created_at)
SELECT gen_random_uuid(), c.id, 1899.90, now()
FROM customers c WHERE c.email = 'maria.oliveira@email.com' LIMIT 1;

-- Itens da venda 2
INSERT INTO sale_items (id, sale_id, product_id, quantity, price, created_at)
SELECT gen_random_uuid(), s.id, p.id, 1, 1899.90, now()
FROM sales s, products p
WHERE s.total = 1899.90 AND p.sku = 'SKU-SM-GAL-A54-128' LIMIT 1;

-- =============================
-- MOVIMENTOS DE ESTOQUE POR VENDA
-- =============================
-- Saída de estoque para cada venda
INSERT INTO stock_movements (id, product_id, type, quantity, reason, created_at)
SELECT gen_random_uuid(), p.id, 'SAIDA', 1, 'Venda para cliente', now()
FROM products p WHERE p.sku IN ('SKU-NB-DELL-15-I5', 'SKU-SM-GAL-A54-128');

-- =============================
-- Observações
-- =============================
-- Ajuste nomes de tabelas/campos conforme seu schema.
-- Para mais vendas, duplique os blocos acima e altere produtos/clientes/valores.
-- Se não tiver tabela customers, remova o bloco correspondente e relacione sales diretamente a um nome/email.
-- Seed completo com dados reais e organizados
-- Produtos, categorias e fornecedores com valores realistas
-- Executar com scripts/run_sql.cjs

-- ============================================
-- CATEGORIAS
-- ============================================
INSERT INTO categories (id, name, description, created_at)
VALUES
  (gen_random_uuid(), 'Smartphones', 'Dispositivos móveis e smartphones', now()),
  (gen_random_uuid(), 'Notebooks', 'Computadores portáteis e ultrabooks', now()),
  (gen_random_uuid(), 'Acessórios', 'Cabos, carregadores, hubs e periféricos', now()),
  (gen_random_uuid(), 'Áudio', 'Fones de ouvido, headsets e caixas de som', now()),
  (gen_random_uuid(), 'Gaming', 'Equipamentos e periféricos para jogos', now()),
  (gen_random_uuid(), 'Monitores', 'Monitores e displays', now()),
  (gen_random_uuid(), 'Armazenamento', 'SSDs, HDs e pendrives', now())
ON CONFLICT DO NOTHING;

-- ============================================
-- FORNECEDORES
-- ============================================
INSERT INTO suppliers (id, name, contact, email, phone, address, created_at)
VALUES
  (gen_random_uuid(), 'TechDistrib Brasil', 'Mariana Silva', 'mariana@techdistrib.com.br', '(11) 4000-1000', 'Av. Paulista 1000, 10º andar, São Paulo/SP, CEP 01310-100', now()),
  (gen_random_uuid(), 'GameHouse BR', 'Ricardo Gomes', 'ricardo@gamehouse.com.br', '(11) 3555-9911', 'Rua Vergueiro 500, São Paulo/SP, CEP 01504-000', now()),
  (gen_random_uuid(), 'AudioMax Distribuidora', 'Fernanda Costa', 'fernanda@audiomax.com.br', '(21) 2777-6612', 'Rua das Laranjeiras 250, Rio de Janeiro/RJ, CEP 22240-000', now()),
  (gen_random_uuid(), 'CompuStore', 'Carlos Mendes', 'carlos@compustore.com.br', '(11) 3456-7890', 'Av. Brigadeiro Faria Lima 1500, São Paulo/SP, CEP 01452-000', now()),
  (gen_random_uuid(), 'MobileTech', 'Ana Paula Santos', 'ana@mobiletech.com.br', '(21) 3333-4444', 'Av. Atlântica 200, Rio de Janeiro/RJ, CEP 22010-000', now())
ON CONFLICT DO NOTHING;

-- ============================================
-- PRODUTOS - SMARTPHONES
-- ============================================
INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Smartphone Galaxy A54 128GB', 'Samsung Galaxy A54 5G, 128GB, 8GB RAM, câmera tripla 50MP', 'SKU-SM-GAL-A54-128', c.id, 1899.90, 1200.00, 45, 10, 150, now(), now()
FROM categories c WHERE c.name = 'Smartphones' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'iPhone 15 128GB', 'Apple iPhone 15, 128GB, câmera dupla 48MP, tela Super Retina XDR', 'SKU-IPH-15-128', c.id, 5999.90, 4200.00, 25, 5, 80, now(), now()
FROM categories c WHERE c.name = 'Smartphones' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Xiaomi Redmi Note 12 256GB', 'Xiaomi Redmi Note 12, 256GB, 8GB RAM, câmera 50MP', 'SKU-XIA-RED-12-256', c.id, 1299.90, 850.00, 60, 15, 200, now(), now()
FROM categories c WHERE c.name = 'Smartphones' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Motorola Edge 40 256GB', 'Motorola Edge 40, 256GB, 8GB RAM, câmera 50MP, carregamento rápido', 'SKU-MOT-EDGE-40-256', c.id, 2499.90, 1600.00, 30, 8, 120, now(), now()
FROM categories c WHERE c.name = 'Smartphones' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- PRODUTOS - NOTEBOOKS
-- ============================================
INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Notebook Dell Inspiron 15 i5', 'Dell Inspiron 15, Intel Core i5, 16GB RAM, 512GB SSD, tela 15.6" Full HD', 'SKU-NB-DELL-15-I5', c.id, 4299.90, 3000.00, 20, 5, 60, now(), now()
FROM categories c WHERE c.name = 'Notebooks' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'MacBook Air M2 256GB', 'Apple MacBook Air 13", chip M2, 8GB RAM, 256GB SSD', 'SKU-MAC-AIR-M2-256', c.id, 8999.90, 6500.00, 15, 3, 40, now(), now()
FROM categories c WHERE c.name = 'Notebooks' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Notebook Gamer Acer Nitro 5', 'Acer Nitro 5, Intel i7, 16GB RAM, 1TB SSD, RTX 4060, tela 15.6" 144Hz', 'SKU-NB-ACER-N5-RTX', c.id, 8999.90, 6200.00, 12, 3, 40, now(), now()
FROM categories c WHERE c.name = 'Gaming' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Notebook Lenovo ThinkPad E14', 'Lenovo ThinkPad E14, AMD Ryzen 5, 16GB RAM, 512GB SSD, tela 14"', 'SKU-NB-LEN-TP-E14', c.id, 3899.90, 2800.00, 25, 5, 70, now(), now()
FROM categories c WHERE c.name = 'Notebooks' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- PRODUTOS - ACESSÓRIOS
-- ============================================
INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Cabo USB-C 2m Premium', 'Cabo USB-C para USB-C, 2 metros, suporte a 100W e dados', 'SKU-CAB-USBC-2M', c.id, 49.90, 15.00, 150, 30, 600, now(), now()
FROM categories c WHERE c.name = 'Acessórios' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Carregador Rápido 65W USB-C', 'Carregador rápido 65W com porta USB-C, compatível com notebook e smartphone', 'SKU-CARG-65W-USBC', c.id, 149.90, 60.00, 80, 15, 300, now(), now()
FROM categories c WHERE c.name = 'Acessórios' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Hub USB-C 7 em 1', 'Hub USB-C com HDMI 4K, 3x USB 3.0, Ethernet, leitor de cartão SD/TF', 'SKU-HUB-USBC-7IN1', c.id, 289.90, 150.00, 60, 10, 250, now(), now()
FROM categories c WHERE c.name = 'Acessórios' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Pelicula Vidro Temperado iPhone 15', 'Pelicula de vidro temperado 9H para iPhone 15, proteção completa', 'SKU-PEL-IPH15-VT', c.id, 39.90, 12.00, 200, 40, 800, now(), now()
FROM categories c WHERE c.name = 'Acessórios' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- PRODUTOS - ÁUDIO
-- ============================================
INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Fone Bluetooth JBL Tune 510BT', 'Fone de ouvido over-ear Bluetooth, bateria 40h, cancelamento de ruído', 'SKU-FONE-JBL-510BT', c.id, 299.90, 150.00, 90, 20, 400, now(), now()
FROM categories c WHERE c.name = 'Áudio' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Headset Gamer HyperX Cloud Stinger', 'Headset gamer com microfone retrátil, som surround 7.1', 'SKU-HEAD-HX-STINGER', c.id, 399.90, 200.00, 70, 15, 300, now(), now()
FROM categories c WHERE c.name = 'Gaming' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'AirPods Pro 2ª Geração', 'Apple AirPods Pro com cancelamento ativo de ruído e caixa MagSafe', 'SKU-AIRPODS-PRO-2', c.id, 1999.90, 1300.00, 35, 8, 120, now(), now()
FROM categories c WHERE c.name = 'Áudio' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Soundbar Samsung HW-B550', 'Soundbar 2.1 com subwoofer wireless, 120W, Bluetooth e HDMI ARC', 'SKU-SB-SAM-HW550', c.id, 1099.90, 700.00, 18, 4, 50, now(), now()
FROM categories c WHERE c.name = 'Áudio' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- PRODUTOS - GAMING
-- ============================================
INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Mouse Gamer Logitech G502 Hero', 'Mouse gamer com sensor Hero 25K DPI, 11 botões programáveis, RGB', 'SKU-MOUSE-LOG-G502', c.id, 399.90, 180.00, 90, 20, 350, now(), now()
FROM categories c WHERE c.name = 'Gaming' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Teclado Mecânico Redragon K552', 'Teclado mecânico switch Outemu Blue, layout ABNT2, iluminação RGB', 'SKU-TECL-RD-K552', c.id, 449.90, 260.00, 55, 12, 200, now(), now()
FROM categories c WHERE c.name = 'Gaming' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Mousepad Gamer RGB 80x30cm', 'Mousepad gamer com iluminação RGB, superfície speed, base antiderrapante', 'SKU-MPAD-RGB-80X30', c.id, 149.90, 70.00, 120, 25, 500, now(), now()
FROM categories c WHERE c.name = 'Gaming' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- PRODUTOS - MONITORES
-- ============================================
INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Monitor LG UltraWide 29" 75Hz', 'Monitor LG 29WP500, UltraWide 29", Full HD, 75Hz, IPS, FreeSync', 'SKU-MON-LG-29UW', c.id, 1299.90, 850.00, 25, 5, 80, now(), now()
FROM categories c WHERE c.name = 'Monitores' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Monitor Gamer ASUS 27" 144Hz', 'Monitor ASUS TUF Gaming 27", Full HD, 144Hz, FreeSync Premium, HDR', 'SKU-MON-ASUS-27-144', c.id, 1899.90, 1200.00, 18, 4, 60, now(), now()
FROM categories c WHERE c.name = 'Gaming' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- PRODUTOS - ARMAZENAMENTO
-- ============================================
INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'SSD NVMe Samsung 1TB', 'SSD Samsung 980 NVMe M.2, 1TB, leitura 3500MB/s, escrita 3000MB/s', 'SKU-SSD-SAM-980-1TB', c.id, 599.90, 380.00, 40, 10, 150, now(), now()
FROM categories c WHERE c.name = 'Armazenamento' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO products (id, name, description, sku, category_id, price, cost, current_stock, min_stock, max_stock, created_at, updated_at)
SELECT gen_random_uuid(), 'Pendrive SanDisk 128GB USB 3.0', 'Pendrive SanDisk Ultra, 128GB, USB 3.0, velocidade até 150MB/s', 'SKU-PEN-SD-128-USB3', c.id, 89.90, 45.00, 150, 30, 600, now(), now()
FROM categories c WHERE c.name = 'Armazenamento' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- MOVIMENTOS DE ESTOQUE INICIAIS
-- ============================================
INSERT INTO stock_movements (id, product_id, type, quantity, reason, created_at)
SELECT gen_random_uuid(), p.id, 'ENTRADA', CEIL(p.current_stock * 0.6), 'Carga inicial de estoque', now()
FROM products p
WHERE p.sku IN (
  'SKU-SM-GAL-A54-128',
  'SKU-IPH-15-128',
  'SKU-NB-DELL-15-I5',
  'SKU-MAC-AIR-M2-256',
  'SKU-CAB-USBC-2M',
  'SKU-FONE-JBL-510BT',
  'SKU-MOUSE-LOG-G502',
  'SKU-TECL-RD-K552',
  'SKU-MON-LG-29UW',
  'SKU-SSD-SAM-980-1TB'
)
ON CONFLICT DO NOTHING;


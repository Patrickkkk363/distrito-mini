-- 1. Desactivar RLS temporalmente
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 2. Insertar categorías base si no existen
INSERT INTO categories (name, description, color, sort_order) VALUES
    ('Bebidas', 'Gaseosas, jugos, aguas', '#3b82f6', 1),
    ('Abarrotes', 'Arroz, fideos, aceite, azúcar', '#f59e0b', 2),
    ('Lácteos', 'Leche, yogurt, queso', '#8b5cf6', 3),
    ('Snacks', 'Galletas, papas, dulces', '#ef4444', 4),
    ('Limpieza', 'Detergente, jabón, lejía', '#10b981', 5),
    ('Panadería', 'Pan, pasteles, tortas', '#f97316', 6),
    ('Carnes y Embutidos', 'Pollo, res, jamón', '#dc2626', 7),
    ('Higiene Personal', 'Shampoo, pasta dental, jabón', '#06b6d4', 8)
ON CONFLICT (name) DO NOTHING;

-- 3. Insertar productos de prueba mapeando a las categorías 
-- (Nota: usamos subqueries para obtener el UUID de la categoría por su nombre)

INSERT INTO products (name, barcode, purchase_price, sale_price, stock_quantity, min_stock, category_id)
VALUES 
    ('Coca Cola 500ml', '775123456001', 2.00, 3.50, 45, 10, (SELECT id FROM categories WHERE name = 'Bebidas')),
    ('Inca Kola 500ml', '775123456002', 2.00, 3.50, 30, 10, (SELECT id FROM categories WHERE name = 'Bebidas')),
    ('Arroz Costeño 1kg', '775123456003', 3.50, 4.80, 20, 5, (SELECT id FROM categories WHERE name = 'Abarrotes')),
    ('Aceite Primor Premium 1L', '775123456004', 8.50, 11.50, 15, 5, (SELECT id FROM categories WHERE name = 'Abarrotes')),
    ('Leche Gloria Tarro Grande', '775123456005', 3.20, 4.50, 40, 12, (SELECT id FROM categories WHERE name = 'Lácteos')),
    ('Yogurt Gloria Fresa 1L', '775123456006', 5.50, 7.20, 10, 4, (SELECT id FROM categories WHERE name = 'Lácteos')),
    ('Galletas Oreo Original', '775123456007', 1.20, 1.80, 50, 15, (SELECT id FROM categories WHERE name = 'Snacks')),
    ('Papas Lays Clásicas', '775123456008', 1.50, 2.50, 25, 8, (SELECT id FROM categories WHERE name = 'Snacks')),
    ('Detergente Ariel 1kg', '775123456009', 10.00, 14.50, 12, 3, (SELECT id FROM categories WHERE name = 'Limpieza')),
    ('Pan de Molde Bimbo Blanco', '775123456010', 6.50, 9.00, 8, 3, (SELECT id FROM categories WHERE name = 'Panadería'))
ON CONFLICT (barcode) DO NOTHING;

-- 4. Reactivar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

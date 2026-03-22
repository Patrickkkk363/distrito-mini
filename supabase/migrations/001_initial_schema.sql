-- ============================================
-- Distrito Mini — Schema de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Tabla de perfiles de usuario (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías de productos
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Productos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    barcode TEXT UNIQUE,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT DEFAULT 5,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ventas
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cashier_id UUID REFERENCES public.profiles(id),
    total_amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    change_given DECIMAL(10,2) DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash','card','yape','plin')),
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed','cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items de cada venta
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Movimientos de stock (entradas, salidas, ajustes)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id),
    user_id UUID REFERENCES public.profiles(id),
    type TEXT NOT NULL CHECK (type IN ('in','out','adjustment')),
    quantity INT NOT NULL,
    stock_before INT NOT NULL,
    stock_after INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCIÓN: Procesar venta con descuento automático de stock
-- ============================================
CREATE OR REPLACE FUNCTION process_sale(
    p_cashier_id UUID,
    p_items JSONB,
    p_payment_method TEXT,
    p_amount_paid DECIMAL
)
RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
    v_total DECIMAL := 0;
    v_item JSONB;
    v_product RECORD;
    v_qty INT;
BEGIN
    -- Calcular total y verificar stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_qty := (v_item->>'quantity')::INT;
        SELECT * INTO v_product FROM products
        WHERE id = (v_item->>'product_id')::UUID AND is_active = true;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Producto no encontrado: %', v_item->>'product_id';
        END IF;

        IF v_product.stock < v_qty THEN
            RAISE EXCEPTION 'Stock insuficiente para %: disponible %, solicitado %',
                v_product.name, v_product.stock, v_qty;
        END IF;

        v_total := v_total + (v_product.price * v_qty);
    END LOOP;

    -- Crear la venta
    INSERT INTO sales (cashier_id, total_amount, amount_paid, change_given, payment_method)
    VALUES (p_cashier_id, v_total, p_amount_paid, p_amount_paid - v_total, p_payment_method)
    RETURNING id INTO v_sale_id;

    -- Insertar items y descontar stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_qty := (v_item->>'quantity')::INT;
        SELECT * INTO v_product FROM products WHERE id = (v_item->>'product_id')::UUID;

        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
        VALUES (v_sale_id, v_product.id, v_qty,
                v_product.price, v_product.price * v_qty);

        -- Descontar stock automáticamente
        UPDATE products SET stock = stock - v_qty,
                           updated_at = NOW()
        WHERE id = v_product.id;

        -- Registrar movimiento de stock
        INSERT INTO stock_movements (product_id, user_id, type, quantity,
                                     stock_before, stock_after, reason)
        VALUES (v_product.id, p_cashier_id, 'out', v_qty,
                v_product.stock,
                v_product.stock - v_qty,
                'Venta #' || v_sale_id::TEXT);
    END LOOP;

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Lectura para usuarios autenticados
CREATE POLICY "auth_read_profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_sales" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_sale_items" ON sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_stock_movements" ON stock_movements FOR SELECT TO authenticated USING (true);

-- Cajeros y admin pueden crear ventas
CREATE POLICY "auth_insert_sales" ON sales FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_sale_items" ON sale_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert_stock_movements" ON stock_movements FOR INSERT TO authenticated WITH CHECK (true);

-- Solo admin puede gestionar productos y categorías
CREATE POLICY "admin_insert_products" ON products FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_update_products" ON products FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_delete_products" ON products FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_all_categories" ON categories FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Actualización de stock (para la función process_sale)
CREATE POLICY "auth_update_product_stock" ON products FOR UPDATE TO authenticated
    USING (true) WITH CHECK (true);

-- ============================================
-- Índices para performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_sales_cashier ON sales(cashier_id);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at);

-- ============================================
-- Datos de ejemplo — Categorías
-- ============================================
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

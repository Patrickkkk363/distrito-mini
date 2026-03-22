-- Script: 002_update_price_stock_and_process_sale.sql
-- Propósito: renombrar columnas (si existen) a `price` y `stock` y crear/actualizar la función `process_sale`
-- Ejecutar en Supabase SQL Editor como una sola ejecución.

BEGIN;

-- Renombrar columnas antiguas si existen (seguro para ejecutar varias veces)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'sale_price'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN sale_price TO price;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN stock_quantity TO stock;
  END IF;
END
$$;

-- Asegurar que existan las columnas `price` y `stock` (si por alguna razón no existen, crear con valores por defecto)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'price'
  ) THEN
    ALTER TABLE public.products ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'stock'
  ) THEN
    ALTER TABLE public.products ADD COLUMN stock INT NOT NULL DEFAULT 0;
  END IF;
END
$$;

-- Normalizar valores nulos (por seguridad)
UPDATE public.products SET price = 0 WHERE price IS NULL;
UPDATE public.products SET stock = 0 WHERE stock IS NULL;

-- Crear o reemplazar la función process_sale using `price` and `stock`
CREATE OR REPLACE FUNCTION public.process_sale(
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
        SELECT * INTO v_product FROM public.products
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
    INSERT INTO public.sales (cashier_id, total_amount, amount_paid, change_given, payment_method)
    VALUES (p_cashier_id, v_total, p_amount_paid, p_amount_paid - v_total, p_payment_method)
    RETURNING id INTO v_sale_id;

    -- Insertar items y descontar stock en un loop transaccional
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_qty := (v_item->>'quantity')::INT;
        SELECT * INTO v_product FROM public.products WHERE id = (v_item->>'product_id')::UUID;

        INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price, subtotal)
        VALUES (v_sale_id, v_product.id, v_qty,
                v_product.price, v_product.price * v_qty);

        -- Registrar movimiento de stock con valores antes/despues
        INSERT INTO public.stock_movements (product_id, user_id, type, quantity, stock_before, stock_after, reason)
        VALUES (v_product.id, p_cashier_id, 'out', v_qty, v_product.stock, v_product.stock - v_qty, 'Venta #' || v_sale_id::TEXT);

        -- Descontar stock
        UPDATE public.products SET stock = stock - v_qty, updated_at = NOW() WHERE id = v_product.id;
    END LOOP;

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- Fin del script

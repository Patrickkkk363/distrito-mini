-- ============================================
-- Función: process_return - registrar una devolución y revertir stock
-- ============================================

CREATE OR REPLACE FUNCTION process_return(
  p_cashier_id UUID,
  p_items JSONB,
  p_reason TEXT DEFAULT 'Devolución'
)
RETURNS UUID AS $$
DECLARE
  v_return_id UUID;
  v_item JSONB;
  v_product RECORD;
BEGIN
  -- Crear una venta negativa o registro de devolución (usamos sales con status 'cancelled' como referencia)
  INSERT INTO sales (cashier_id, total_amount, amount_paid, change_given, payment_method, status)
  VALUES (p_cashier_id, 0, 0, 0, 'cash', 'cancelled')
  RETURNING id INTO v_return_id;

  -- Revertir stock y registrar movimientos
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM products WHERE id = (v_item->>'product_id')::UUID;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto no encontrado: %', v_item->>'product_id';
    END IF;

    -- Insertamos un registro en sale_items para trazabilidad con cantidad negativa
    INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
    VALUES (v_return_id, v_product.id, -(v_item->>'quantity')::INT, v_product.sale_price, -(v_product.sale_price * (v_item->>'quantity')::INT));

    -- Aumentar el stock
    UPDATE products SET stock_quantity = stock_quantity + (v_item->>'quantity')::INT, updated_at = NOW()
    WHERE id = v_product.id;

    -- Registrar movimiento de stock (tipo 'in')
    INSERT INTO stock_movements (product_id, user_id, type, quantity, stock_before, stock_after, reason)
    VALUES (v_product.id, p_cashier_id, 'in', (v_item->>'quantity')::INT, v_product.stock_quantity, v_product.stock_quantity + (v_item->>'quantity')::INT, p_reason || ' #' || v_return_id::TEXT);
  END LOOP;

  RETURN v_return_id;
END;
$$ LANGUAGE plpgsql;

Instrucciones para aplicar el script SQL de migración

Objetivo
- Normalizar la tabla `products` para usar las columnas `price` y `stock`.
- Crear/actualizar la función `process_sale` que descuenta stock y registra `sale_items` y `stock_movements`.

Antes de empezar (recomendado)
1. Hacer un respaldo de la tabla `products` (opción rápida en SQL):
```sql
CREATE TABLE products_backup AS TABLE public.products;
```
2. Exportar CSV desde la UI de Supabase (opcional, recomendado si trabajas con producción).

Pasos para aplicar el script
1. Abre Supabase → Project → SQL Editor.
2. Abre el archivo `supabase/migrations/002_update_price_stock_and_process_sale.sql` (puedes copiarlo desde el repo).
3. Pega todo el contenido en el SQL Editor y ejecuta (Run).
4. Verifica que la ejecución finalice sin errores.

Comprobaciones post-ejecución
- Ver columnas:
```sql
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' ORDER BY column_name;
```
- Probar la función con un producto real (reemplaza <PRODUCT_UUID> y <CASHIER_UUID>):
```sql
SELECT process_sale(
  '<CASHIER_UUID>'::uuid,
  '[{"product_id":"<PRODUCT_UUID>","quantity":1}]'::jsonb,
  'cash',
  100.00
);
```
- Comprobar que el stock bajó:
```sql
SELECT id, name, price, stock FROM public.products WHERE id = '<PRODUCT_UUID>';
SELECT * FROM public.sales ORDER BY created_at DESC LIMIT 5;
SELECT * FROM public.sale_items WHERE sale_id = (SELECT id FROM public.sales ORDER BY created_at DESC LIMIT 1);
SELECT * FROM public.stock_movements WHERE product_id = '<PRODUCT_UUID>' ORDER BY created_at DESC LIMIT 5;
```

Verificación en la app local (POS / Dashboard)
1. Asegúrate de tener en `.env` las variables correctas: `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`.
2. Inicia la app local:
```bash
npm run dev
```
3. En la vista POS añade un producto al carrito y finaliza la venta.
4. Tras la venta:
   - El producto debería decrementar su `stock` en la DB.
   - Debería crearse una fila en `sales`, `sale_items` y `stock_movements`.
   - El Dashboard se actualiza automáticamente (evento `sale:completed`).

Notas y precauciones
- Si trabajas en producción, haz snapshot/backups antes de ejecutar.
- El script usa `SECURITY DEFINER` en la función para evitar problemas con políticas RLS; verifica que tu entorno tenga soporte y permisos adecuados.
- Si necesitas un flujo más conservador (crear nuevas columnas y migrar datos en pasos separados), avísame y genero un script alternativo.

Contacto
- Si falla alguna parte pega el error aquí y lo reviso contigo.
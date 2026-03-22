# Migraciones y pruebas en Supabase — Distrito Mini

Este documento describe pasos detallados para desplegar las migraciones SQL incluidas en el repo y para probar ventas y devoluciones (RPCs `process_sale` y `process_return`).

Requisitos previos
- Tener un proyecto en Supabase y las credenciales (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) disponibles.
- Node.js (v16+) y `npm` para ejecutar la app localmente.
- El proyecto local debe tener las migraciones en `supabase/migrations/` (ya están en el repo).

Archivos de migraciones (orden recomendado)
1. `001_initial_schema.sql`  — esquema base (tablas, `process_sale`, policies básicas).
2. `002_profiles_policy.sql` — políticas RLS para permitir que usuarios creen/actualicen su propio `profiles` (necesario para signup/upsert desde el cliente).
3. `003_process_return.sql`  — función `process_return` para gestionar devoluciones y revertir stock.

Opciones para aplicar las migraciones

A) Usar el SQL Editor de Supabase (recomendado, interactivo)
1. Abre tu proyecto en app.supabase.com → `SQL` → `New query`.
2. Abre el archivo `supabase/migrations/001_initial_schema.sql`, copia el contenido y ejecútalo (Run).
3. Repite para `002_profiles_policy.sql` y `003_process_return.sql` en ese orden.

B) Usar conexión psql (si tienes acceso a la DB) — alternativa
1. Conéctate con psql/pgadmin a la base de datos de Supabase (seguir la guía de Supabase para conexiones remotas).
2. Ejecuta `psql -h <host> -U <user> -d <db> -f 001_initial_schema.sql` y repetir con los otros archivos.

Comprobaciones básicas tras ejecutar migraciones
- Verificar tablas y datos: 
  - `SELECT tablename FROM pg_tables WHERE schemaname='public';`
  - `SELECT proname FROM pg_proc WHERE proname LIKE 'process_%';` (deberías ver `process_sale` y `process_return`)
- Verificar políticas: `SELECT * FROM pg_policies WHERE tablename='profiles';`

Promover un usuario a `admin` (modo rápido de prueba)
1. Registra un usuario mediante la UI (`/register`) o crea en Supabase Auth.
2. Asegúrate de que exista su fila en `profiles` (la sign-up automatizada o el `upsert` en el `AuthForm` crea el perfil). Si no existe, crea manualmente:

```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES ('<USER_UUID>', 'admin@example.com', 'Admin Test', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

Prueba local de la aplicación (UI)
1. Instala dependencias y levanta la app:

```bash
npm install
npm run dev
```
2. Abre `http://localhost:4321` (o la URL que muestre `astro dev`).
3. Registra un usuario o usa uno existente. Si quieres acceder al `Admin`, usa el usuario con `role='admin'`.
4. Para probar ventas: entra a `/pos`, añade productos al carrito y realiza el checkout. La app llama al RPC `process_sale` que decrementa `products.stock_quantity` y registra movimientos en `stock_movements`.

Verificación post-venta (consultas útiles)

```sql
-- Últimas ventas
SELECT * FROM sales ORDER BY created_at DESC LIMIT 5;

-- Items de una venta (reemplaza SALE_ID)
SELECT * FROM sale_items WHERE sale_id = '<SALE_ID>';

-- Movimientos de stock recientes
SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 10;

-- Stock del producto concreto
SELECT id, name, stock_quantity FROM products WHERE id = '<PRODUCT_ID>' LIMIT 1;
```

Probar `process_sale` desde Node (ejemplo)

Crea un pequeño script `test_sale.js` (o ejecútalo en un REPL). Reemplaza `SUPABASE_URL` y `SUPABASE_ANON_KEY` por las tuyas.

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Id del usuario que actúa como cajero (opcional, null permitido si la función lo soporta)
  const cashierId = '<CASHIER_UUID>'; 

  const items = [
    { product_id: '<PRODUCT_UUID_1>', quantity: 1 },
    { product_id: '<PRODUCT_UUID_2>', quantity: 2 }
  ];

  const { data, error } = await supabase.rpc('process_sale', {
    p_cashier_id: cashierId,
    p_items: items,
    p_payment_method: 'cash',
    p_amount_paid: 100
  });

  if (error) console.error('RPC error:', error);
  else console.log('Venta registrada, sale id:', data);
}

run();
```

Probar `process_return` desde Node (ejemplo)

```js
const items = [ { product_id: '<PRODUCT_UUID_1>', quantity: 1 } ];
const { data, error } = await supabase.rpc('process_return', { p_cashier_id: '<CASHIER_UUID>', p_items: items, p_reason: 'Cliente devolvió' });
```

Notas importantes y soluciones a errores comunes
- Si `process_sale` falla con "Producto no encontrado" o "Stock insuficiente": verifica `products.is_active` y `stock_quantity`.
- Si la app cliente no puede insertar/upsert en `profiles` durante registro: asegúrate de aplicar `002_profiles_policy.sql` para permitir que el usuario cree su propio `profiles` (RLS).
- Si el RPC devuelve errores de permisos (políticas RLS): comprueba que la política `auth_update_product_stock` y las policies relacionadas estén aplicadas en `001_initial_schema.sql` y que el rol `authenticated` tenga los permisos necesarios para las operaciones usadas por la función.

Comprobaciones recomendadas después de pruebas
- Asegúrate de ver los cambios en `products.stock_quantity` y la fila correspondiente en `stock_movements`.
- Revisa `sales` y `sale_items` para confirmar registros y subtotales.

Automatización (opcional)
- Para entornos de CI/CD considera usar el `supabase` CLI o un pipeline que ejecute los scripts SQL en orden. Otra opción es gestionar migraciones con la herramienta oficial de Supabase Migrations.

Contacto / ayuda
- Si tienes errores específicos, copia el mensaje de error y las consultas SQL ejecutadas y pásalos por aquí; puedo ayudarte a interpretarlos y solucionar las policies necesarias.

-- Fin

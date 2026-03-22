# Despliegue de migraciones a Supabase y conexión de la BD

Este documento explica cómo desplegar las migraciones SQL `002_profiles_policy.sql` y `003_process_return.sql` en tu proyecto Supabase y cómo conectar la base de datos real con la app.

Requisitos
- Tener una cuenta y proyecto en Supabase.
- `supabase` CLI instalado (opcional, recomendable). Instalar con:

```bash
npm install -g supabase
```

- Tener variables de entorno para la app:
  - `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` (para cliente)
  - `SUPABASE_SERVICE_ROLE_KEY` (solo para scripts administrativos; mantener seguro)

Pasos manuales (SQL Editor)
1. Abre tu proyecto en app.supabase.com y ve a `SQL Editor`.
2. Abre `supabase/migrations/002_profiles_policy.sql` en el repo, copia todo su contenido y pégalo en una nueva query. Ejecuta (Run).
3. Haz lo mismo con `supabase/migrations/003_process_return.sql`.
4. Verifica que las políticas y funciones se hayan creado:

```sql
SELECT tablename FROM pg_tables WHERE schemaname='public';
SELECT proname FROM pg_proc WHERE proname IN ('process_sale','process_return');
SELECT * FROM pg_policies WHERE tablename='profiles';
```

Despliegue con `supabase` CLI (automatizado)

1. Autentica la CLI:

```bash
supabase login
```

2. Configura el proyecto (usa la URL del proyecto o el ref):

```bash
supabase link --project-ref <your-project-ref>
```

3. Ejecuta las migraciones (ejemplo, desde la carpeta `supabase/migrations`):

```bash
for f in supabase/migrations/*.sql; do supabase db query "\$(cat $f)"; done
```

Alternativa (Windows PowerShell):

```powershell
Get-ChildItem supabase\migrations\*.sql | ForEach-Object { supabase db query -f $_.FullName }
```

Nota: `supabase db query -f` ejecuta el archivo SQL en la base de datos vinculada al proyecto. Asegúrate de haber ejecutado `supabase link` y estar en el proyecto correcto.

Verificación post-despliegue
- Consulta `sales`, `sale_items`, `products` y `stock_movements` para confirmar que las tablas y funciones existen y tienen permisos.

Conectar la aplicación a la base de datos (variables de entorno)
1. En el panel de Supabase → Settings → API copia la `URL` y `anon key`.
2. En tu entorno local (.env), define:

```env
PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (solo para scripts server-side)
```

3. Reinicia tu app local (si está corriendo):

```bash
npm run dev
```

Probar ventas y devoluciones
- Desde la UI: entra a `/pos`, realiza una venta; luego verifica `products.stock_quantity` y `stock_movements`.
- Para devoluciones, ejecuta RPC `process_return` vía `supabase.rpc()` desde la app o con un script Node.

Script Node de ejemplo para `process_return` (usa `SUPABASE_SERVICE_ROLE_KEY` si necesitas privilegios):

```js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runReturn() {
  const items = [{ product_id: '<PRODUCT_UUID>', quantity: 1 }];
  const { data, error } = await supabase.rpc('process_return', { p_cashier_id: '<USER_UUID>', p_items: items, p_reason: 'Prueba devolución' });
  if (error) console.error(error);
  else console.log('Return id:', data);
}

run();
```

Seguridad y buenas prácticas
- No expongas `SERVICE_ROLE_KEY` en el cliente.
- Revisa las políticas RLS si encuentras errores de permisos al ejecutar RPC desde el cliente.

Soporte
- Si necesitas que ejecute las migraciones en tu proyecto Supabase, compárteme el `project-ref` y confirma que quieres que use la CLI desde este entorno (necesitaré que inicies sesión o proporciones credenciales seguras).

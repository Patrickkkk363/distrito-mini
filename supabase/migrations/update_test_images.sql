-- Ignorar RLS para estas actualizaciones temporales (si estás logueado como Admin en Supabase SQLEditor esto funcionará automáticamente)
-- Actualizando imágenes reales (Placeholder alta calidad Unsplash) para los productos ya ingresados.

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97' WHERE name = 'Coca Cola 500ml';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1623157406325-1e3df6a1bf58' WHERE name = 'Inca Kola 500ml';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1586201375761-83865001e31c' WHERE name = 'Arroz Costeño 1kg';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5' WHERE name = 'Aceite Primor Premium 1L';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1563636619-e9143da7973b' WHERE name = 'Leche Gloria Tarro Grande';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1571212515416-faff01ce8cae' WHERE name = 'Yogurt Gloria Fresa 1L';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35' WHERE name = 'Galletas Oreo Original';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1566478989037-e924e50259b3' WHERE name = 'Papas Lays Clásicas';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1585421514738-01798e348b17' WHERE name = 'Detergente Ariel 1kg';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1598373182133-52452f7691ef' WHERE name = 'Pan de Molde Bimbo Blanco';

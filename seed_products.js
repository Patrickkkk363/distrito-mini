// Script Temporal para Sembrar Productos Directamente a Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vlzmklypnjryhaqxuuxm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-sDE52YoawHoNgcvq05TTw_8tCMoJ6a';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MOCK_PRODUCTS = [
  { name: 'Coca Cola 500ml', barcode: '775123456001', purchase_price: 2.00, sale_price: 3.50, stock_quantity: 45, min_stock: 10, category_name: 'Bebidas' },
  { name: 'Inca Kola 500ml', barcode: '775123456002', purchase_price: 2.00, sale_price: 3.50, stock_quantity: 30, min_stock: 10, category_name: 'Bebidas' },
  { name: 'Arroz Costeño 1kg', barcode: '775123456003', purchase_price: 3.50, sale_price: 4.80, stock_quantity: 20, min_stock: 5, category_name: 'Abarrotes' },
  { name: 'Aceite Primor Premium 1L', barcode: '775123456004', purchase_price: 8.50, sale_price: 11.50, stock_quantity: 15, min_stock: 5, category_name: 'Abarrotes' },
  { name: 'Leche Gloria Tarro Grande', barcode: '775123456005', purchase_price: 3.20, sale_price: 4.50, stock_quantity: 40, min_stock: 12, category_name: 'Lácteos' },
  { name: 'Yogurt Gloria Fresa 1L', barcode: '775123456006', purchase_price: 5.50, sale_price: 7.20, stock_quantity: 10, min_stock: 4, category_name: 'Lácteos' },
  { name: 'Galletas Oreo Original', barcode: '775123456007', purchase_price: 1.20, sale_price: 1.80, stock_quantity: 50, min_stock: 15, category_name: 'Snacks' },
  { name: 'Papas Lays Clásicas', barcode: '775123456008', purchase_price: 1.50, sale_price: 2.50, stock_quantity: 25, min_stock: 8, category_name: 'Snacks' },
  { name: 'Detergente Ariel 1kg', barcode: '775123456009', purchase_price: 10.00, sale_price: 14.50, stock_quantity: 12, min_stock: 3, category_name: 'Limpieza' },
  { name: 'Pan de Molde Bimbo Blanco', barcode: '775123456010', purchase_price: 6.50, sale_price: 9.00, stock_quantity: 8, min_stock: 3, category_name: 'Panadería' },
];

async function seedData() {
  console.log('Obteniendo categorías...');
  
  // First, verify categories exist, if not create them
  const categoriesToCreate = ['Bebidas', 'Abarrotes', 'Lácteos', 'Snacks', 'Limpieza', 'Panadería'];
  
  for (const catName of categoriesToCreate) {
    const { data: existing } = await supabase.from('categories').select('id').eq('name', catName).single();
    if (!existing) {
       console.log('Creando categoría faltante:', catName);
       await supabase.from('categories').insert({ name: catName });
    }
  }

  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  
  if (catError || !categories) {
    console.error('Error obteniendo categorías', catError);
    return;
  }

  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.id;
    return acc;
  }, {});

  console.log('Insertando productos de prueba...');
  let inserted = 0;

  for (const prod of MOCK_PRODUCTS) {
    const catId = categoryMap[prod.category_name];

    // Check if exists
    const { data: existingProd } = await supabase.from('products').select('id').eq('barcode', prod.barcode).single();

    if (!existingProd) {
      const { error } = await supabase.from('products').insert({
        name: prod.name,
        barcode: prod.barcode,
        purchase_price: prod.purchase_price,
        sale_price: prod.sale_price,
        stock_quantity: prod.stock_quantity,
        min_stock: prod.min_stock,
        category_id: catId
      });

      if (error) {
         console.error(`Error insertando ${prod.name}:`, error.message);
      } else {
         inserted++;
         console.log(`+ Insertado: ${prod.name}`);
      }
    } else {
      console.log(`- Saltando ${prod.name} (ya existe)`);
    }
  }

  console.log(`\n¡Proceso completado! Se insertaron ${inserted} productos nuevos.`);
}

seedData();

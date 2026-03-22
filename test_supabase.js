import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Attempt to read .env manually if dotenv is not installed
let env = {};
try {
  const txt = fs.readFileSync('.env', 'utf8');
  txt.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) {
      const k = m[1];
      let v = m[2] || '';
      // remove surrounding quotes
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[k] = v;
    }
  });
} catch (e) {
  // ignore if no .env
}

const url = process.env.PUBLIC_SUPABASE_URL || env.PUBLIC_SUPABASE_URL;
const key = process.env.PUBLIC_SUPABASE_ANON_KEY || env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY not set in .env');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false }
});

async function listProducts() {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(10);
    if (error) {
      console.error('Supabase error:', error);
      process.exit(1);
    }
    console.log('Products (up to 10):');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

listProducts();

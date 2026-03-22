import React, { useState, useEffect } from 'react';
// Intentamos importar desde la ruta más probable
import { supabase } from '../../lib/supabase';

export default function POS() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Paleta de colores Dark Mode Profesional
  const theme = {
    bg: '#0f172a',        
    card: '#1e293b',      
    text: '#f8fafc',      
    textMuted: '#94a3b8', 
    accent: '#38bdf8',    
    success: '#22c55e',   
    border: '#334155',    
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').gt('stock', 0).order('name');
      if (error) throw error;
      if (data) setProducts(data);
    } catch (err) {
      console.error("Error en Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleFinalizeVenta = async () => {
    if (cart.length === 0) return;
    try {
      for (const item of cart) {
        const { error } = await supabase
          .from('products')
          .update({ stock: item.stock - 1 })
          .eq('id', item.id);
        if (error) throw error;
      }
      alert('✅ VENTA EXITOSA - STOCK ACTUALIZADO');
      setCart([]);
      loadProducts();
    } catch (err) {
      alert('❌ Error al descontar stock. Revisa la consola.');
    }
  };

  const total = cart.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

  if (loading) return <div style={{background: theme.bg, color: theme.text, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif'}}>Cargando Distrito Mini...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', background: theme.bg, color: theme.text, fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {/* SECCIÓN PRODUCTOS */}
      <div style={{ flex: 1, padding: '25px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px', color: theme.accent }}>Distrito Mini - POS v2.0</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {products.map((p) => (
            <div 
              key={p.id} 
              onClick={() => setCart([...cart, p])}
              style={{ background: theme.card, padding: '15px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${theme.border}`, transition: '0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.accent}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}
            >
              <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px', height: '35px', overflow: 'hidden' }}>{p.name}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: theme.accent, fontWeight: 'bold', fontSize: '18px' }}>S/ {p.price}</span>
                <span style={{ fontSize: '11px', color: theme.textMuted }}>Stock: {p.stock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN CARRITO */}
      <div style={{ width: '360px', background: theme.card, borderLeft: `1px solid ${theme.border}`, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: `1px solid ${theme.border}` }}>Carrito</h2>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${theme.border}`, fontSize: '14px' }}>
              <span style={{maxWidth: '70%'}}>{item.name}</span>
              <span style={{fontWeight: 'bold'}}>S/ {item.price}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '20px', borderTop: `2px solid ${theme.accent}`, paddingTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>
            <span>TOTAL</span>
            <span style={{color: theme.success}}>S/ {total.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleFinalizeVenta}
            disabled={cart.length === 0}
            style={{ width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: cart.length === 0 ? '#475569' : theme.success, color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
          >
            {cart.length === 0 ? 'AGREGA PRODUCTOS' : '⚡ COBRAR AHORA'}
          </button>
        </div>
      </div>
    </div>
  );
}
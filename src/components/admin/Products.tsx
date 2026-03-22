import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

  // FUNCIÓN PARA DEVOLUCIONES (Suma stock)
  const handleDevolucion = async (id: string, currentStock: number) => {
    const { error } = await supabase
      .from('products')
      .update({ stock: currentStock + 1 })
      .eq('id', id);
    
    if (error) alert("Error al devolver");
    else loadProducts();
  };

  // FUNCIÓN PARA RETIRAR ITEM (Elimina o marca como no ofrecido)
  const handleRetirar = async (id: string) => {
    if (confirm("¿Estás seguro de retirar este producto del sistema?")) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) alert("Error al retirar");
      else loadProducts();
    }
  };

  if (loading) return <div style={{padding: '20px', color: 'white'}}>Cargando Inventario...</div>;

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>Gestión de Inventario (Admin)</h1>
        <button onClick={loadProducts} style={{ padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>Refrescar</button>
      </div>

      <table style={{ width: '100%', background: 'white', borderRadius: '12px', overflow: 'hidden', borderCollapse: 'collapse', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <thead style={{ background: '#1e293b', color: 'white' }}>
          <tr>
            <th style={{ padding: '15px', textAlign: 'left' }}>Producto</th>
            <th style={{ padding: '15px' }}>Precio</th>
            <th style={{ padding: '15px' }}>Stock Actual</th>
            <th style={{ padding: '15px' }}>Acciones Especiales</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '15px', fontWeight: '500' }}>{p.name}</td>
              <td style={{ padding: '15px', textAlign: 'center' }}>S/ {p.price}</td>
              <td style={{ padding: '15px', textAlign: 'center' }}>
                <span style={{ padding: '4px 10px', borderRadius: '20px', background: p.stock < 5 ? '#fee2e2' : '#dcfce7', color: p.stock < 5 ? '#991b1b' : '#166534', fontWeight: 'bold' }}>
                  {p.stock} unid.
                </span>
              </td>
              <td style={{ padding: '15px', textAlign: 'center' }}>
                <button 
                  onClick={() => handleDevolucion(p.id, p.stock)}
                  style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontWeight: '600' }}
                >
                  + Devolución
                </button>
                <button 
                  onClick={() => handleRetirar(p.id)}
                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Retirar Item
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
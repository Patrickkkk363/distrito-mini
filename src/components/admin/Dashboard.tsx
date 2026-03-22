import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, DollarSign, Package } from 'lucide-react';

function EmptyState({ title, message, cta }: { title: string; message: string; cta?: { label: string; href: string } }) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto w-28 h-28 rounded-full bg-red-50 flex items-center justify-center mb-6 shadow-md">
        <ShoppingBag className="w-12 h-12 text-red-500" />
      </div>
      <h3 className="text-xl font-extrabold mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">{message}</p>
      {cta && (
        <a href={cta.href} className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-700 text-white font-bold shadow-lg hover:scale-105 transition-transform">
          {cta.label}
        </a>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ todaySales: 0, todayRevenue: 0, totalProducts: 0 });
  const [salesData, setSalesData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);
  // Refrescar dashboard cuando se complete una venta desde el POS
  useEffect(() => {
    const handler = () => { fetchData(); };
    window.addEventListener('sale:completed', handler);
    return () => window.removeEventListener('sale:completed', handler);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const start = new Date();
    start.setHours(0,0,0,0);
    const startISO = start.toISOString();

    // Traer últimas ventas (para gráfico), productos y ventas de hoy
    const [recentRes, prodRes, todayRes] = await Promise.all([
      supabase.from('sales').select('*').eq('status', 'completed').order('created_at', { ascending: false }).limit(6),
      supabase.from('products').select('id').eq('is_active', true),
      supabase.from('sales').select('total_amount').eq('status', 'completed').gte('created_at', startISO),
    ]);

    const recent = recentRes.data || [];
    const prods = prodRes.data || [];
    const today = todayRes.data || [];

    // Últimas 6 ventas para gráfico (invertir para mostrar cronológico)
    const chart = (recent as any[]).slice().reverse().map((s: any) => Number(s.total_amount || 0));
    setSalesData(chart.length ? chart : [0, 0, 0, 0, 0, 0]);

    const todayRevenue = (today as any[]).reduce((acc: number, row: any) => acc + Number(row.total_amount || 0), 0);
    setStats({ todaySales: (today as any[]).length, todayRevenue, totalProducts: prods.length });
    setLoading(false);
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  const hasData = stats.totalProducts > 0 || stats.todaySales > 0;

  return (
    <div className="p-10 space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold">Dashboard General</h2>
        <p className="text-[var(--text-muted)] mt-1">Monitorea el rendimiento de Distrito Mini visualmente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-[#FAF9F6] border border-white/10 p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-white shadow-sm"><ShoppingBag className="w-6 h-6 text-red-500" /></div>
            <div>
              <p className="text-2xl font-extrabold">{stats.todaySales}</p>
              <p className="text-sm text-[var(--text-muted)]">Ventas registradas (hoy)</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#FAF9F6] border border-white/10 p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-white shadow-sm"><DollarSign className="w-6 h-6 text-green-500" /></div>
            <div>
              <p className="text-2xl font-extrabold">S/ {stats.todayRevenue.toFixed(2)}</p>
              <p className="text-sm text-[var(--text-muted)]">Ingresos (hoy)</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#FAF9F6] border border-white/10 p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-white shadow-sm"><Package className="w-6 h-6 text-blue-500" /></div>
            <div>
              <p className="text-2xl font-extrabold">{stats.totalProducts}</p>
              <p className="text-sm text-[var(--text-muted)]">Productos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="rounded-xl bg-[#FAF9F6] border border-white/10 p-6 shadow-md">
        <h3 className="text-lg font-bold mb-4">Ventas Últimas Transacciones</h3>
        {hasData ? (
          <div className="w-full flex items-end gap-3 h-40">
            {salesData.map((v, i) => {
              const max = Math.max(...salesData, 1);
              const height = Math.round((v / max) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-red-100 rounded-t-md transition-all" style={{ height: `${Math.max(6, height)}%` }} />
                  <span className="text-xs mt-2">{v > 0 ? `S/ ${v}` : '-'}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Sin actividad" message="No hay ventas o productos aún. Comienza agregando productos o registrando una venta." cta={{ label: 'Agregar Producto', href: '/admin?view=products' }} />
        )}
        </div>
      </div>
    );
}

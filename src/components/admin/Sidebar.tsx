import React from 'react';
import { LayoutDashboard, Package, Tag, BarChart3, PackagePlus, Eye, ShoppingBag, Moon } from 'lucide-react';

type Props = {
  currentView: string;
  setCurrentView: (v: any) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (b: boolean) => void;
};

export default function Sidebar({ currentView, setCurrentView, sidebarCollapsed, setSidebarCollapsed }: Props) {
  const navItems: { key: string; icon: React.ReactNode; label: string }[] = [
    { key: 'dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { key: 'products', icon: <Package />, label: 'Productos' },
    { key: 'categories', icon: <Tag />, label: 'Categorías' },
    { key: 'inventory', icon: <Eye />, label: 'Inventario' },
    { key: 'stock-entry', icon: <PackagePlus />, label: 'Entrada Stock' },
    { key: 'sales', icon: <BarChart3 />, label: 'Ventas' },
  ];

  return (
    <aside className={`relative z-20 flex flex-col m-4 ${sidebarCollapsed ? 'w-20' : 'w-72'}`} style={{ background: '#1A202C', boxShadow: '0 12px 30px rgba(10,11,13,0.6)' }}>
      <div className="flex items-center gap-4 px-6 py-6 border-b border-white/6">
        <a href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-2xl">🏪</span>
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-lg font-extrabold text-white">Distrito Mini</h1>
              <p className="text-xs text-red-400 uppercase">Administrador</p>
            </div>
          )}
        </a>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setCurrentView(item.key)}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              currentView === item.key ? 'bg-white/8 text-white shadow-md border-l-4 border-red-500' : 'text-white/70 hover:bg-white/6'
            }`}
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${currentView === item.key ? 'bg-red-500/10 text-red-400' : 'text-white/60'}`}>
              {React.cloneElement(item.icon as any, { className: 'w-4 h-4' })}
            </div>
            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/6 space-y-2">
        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all">
          <Moon className="w-4 h-4" />
          <span> Cambiar Tema</span>
        </button>

        <a href="/pos" className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-400 text-white font-extrabold transition-all shadow-md">
          <ShoppingBag className="w-5 h-5" />
          <span>Abrir Punto de Venta</span>
        </a>
      </div>
    </aside>
  );
}

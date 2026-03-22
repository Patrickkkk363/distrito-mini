import React from 'react';
import { Search } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)]">
      <header className="w-full bg-transparent p-4 flex items-center justify-between">
        <div className="max-w-4xl w-full mx-auto flex items-center gap-4">
          <div className="flex-1">
            <div className="relative max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <input placeholder="Buscar productos, ventas, usuarios..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/6 border border-white/6 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-red-500 transition" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition">+ Nuevo</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">{children}</main>
    </div>
  );
}

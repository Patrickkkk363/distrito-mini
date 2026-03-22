import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthForm({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res.error) throw res.error;
      const user = res.data.user;
      if (!user) throw new Error('No se obtuvo usuario');
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      const role = profile?.role || 'cashier';
      window.location.href = role === 'admin' ? '/admin' : '/';
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (res.error) throw res.error;
      const user = res.data.user;
      if (!user) {
        // If email confirmation required, redirect to homepage with message
        window.location.href = '/';
        return;
      }
      // Try to insert profile (requires appropriate policy on DB)
      await supabase.from('profiles').upsert({ id: user.id, email: user.email, full_name: fullName, role: 'cashier' });
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 rounded-2xl bg-[var(--panel-bg)] border border-[var(--panel-border)] shadow-lg">
      <h2 className="text-2xl font-black mb-2">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">Accede con tu correo y contraseña</p>

      <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Nombre completo</label>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)]" />
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Correo electrónico</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)]" />
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--text-muted)] mb-2">Contraseña</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)]" />
        </div>

        {error && <div className="text-sm text-danger-500 font-bold">{error}</div>}

        <div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-primary-500 text-white font-bold">{loading ? 'Procesando...' : (mode === 'login' ? 'Entrar' : 'Registrarme')}</button>
        </div>
      </form>
    </div>
  );
}

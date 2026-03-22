import React from 'react';

export default function Navbar() {
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  const linkStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '8px 12px',
    fontFamily: 'sans-serif'
  };

  return (
    <nav style={{ 
      background: '#0f172a', 
      padding: '0 30px', 
      height: '70px',
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: '1px solid #334155'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {/* LOGO CON IMAGEN REAL DEL PROYECTO */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigateTo('/')}>
          <img src="/favicon.svg" alt="Logo" style={{ width: '35px', height: '35px' }} />
          <b style={{ color: '#38bdf8', fontSize: '18px', fontWeight: '900' }}>DISTRITO MINI 🧸</b>
        </div>
        
        <button onClick={() => navigateTo('/pos')} style={linkStyle}>Punto de Venta</button>
        <button onClick={() => navigateTo('/login')} style={linkStyle}>Entrar / Gestión</button>
        <button onClick={() => navigateTo('/register')} style={linkStyle}>Registro</button>
      </div>
      
      <div style={{ textAlign: 'right', color: 'white', fontFamily: 'sans-serif' }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Admin Principal</p>
        <p style={{ color: '#38bdf8', margin: 0, fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Rol: Administrador</p>
      </div>
    </nav>
  );
}
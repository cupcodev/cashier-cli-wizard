'use client';

import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(()=>{
    const token = localStorage.getItem('accessToken');
    const user  = localStorage.getItem('user');
    if(!token || !user) window.location.href='/login';
  },[]);

  const panelStyle: React.CSSProperties = { display:'grid', gridTemplateColumns:'240px 1fr', minHeight:'100vh', background:'#0f0f14', color:'#fff' };
  const glass: React.CSSProperties = { background:'rgba(255,255,255,.06)', backdropFilter:'blur(14px)', borderRight:'1px solid rgba(255,255,255,.08)' };

  return (
    <div style={panelStyle}>
      <aside style={{...glass, padding:16}}>
        <div style={{fontWeight:700, marginBottom:16}}>Cha$hier</div>
        <nav style={{display:'grid', gap:8}}>
          <a href="/admin" style={linkStyle}>Dashboard</a>
          <a href="/admin/customers" style={linkStyle}>Customers</a>
          <a href="/admin/invoices" style={linkStyle}>Invoices</a>
          <a href="/admin/finance" style={linkStyle}>Finance</a>
        </nav>
        <div style={{marginTop:'auto', position:'absolute', bottom:16}}>
          <button onClick={()=>{ localStorage.clear(); window.location.href='/login'; }} style={btnStyle}>Sair</button>
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}

const linkStyle: React.CSSProperties = { padding:'10px 12px', borderRadius:12, textDecoration:'none', color:'#fff', background:'rgba(255,255,255,.08)' };
const btnStyle: React.CSSProperties  = { padding:'8px 12px', borderRadius:12, background:'rgba(255,255,255,.12)', color:'#fff', border:'0' };

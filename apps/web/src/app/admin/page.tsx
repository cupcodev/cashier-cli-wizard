'use client';

import { useEffect, useState } from 'react';

export default function AdminPage(){
  const [user,setUser] = useState<{name:string, email:string, role:string}|null>(null);

  useEffect(()=>{
    const token = localStorage.getItem('accessToken');
    const u = localStorage.getItem('user');
    if(!token || !u){ window.location.href='/login'; return; }
    setUser(JSON.parse(u));
  },[]);

  if(!user){
    return <main style={{padding:24,color:'#fff',background:'#0f0f14'}}>Carregando…</main>
  }

  return (
    <main style={{minHeight:'100vh',background:'#0f0f14',color:'#fff'}}>
      <header style={{display:'flex',justifyContent:'space-between',padding:16,position:'sticky',top:0,backdropFilter:'blur(12px)',background:'rgba(255,255,255,0.06)'}}>
        <strong>Cha$hier — Admin</strong>
        <div>
          <span style={{opacity:.8, marginRight:12}}>{user.name} ({user.role})</span>
          <button onClick={()=>{ localStorage.clear(); window.location.href='/login'; }} style={{padding:'8px 12px',borderRadius:12,background:'rgba(255,255,255,.15)',color:'#fff'}}>Sair</button>
        </div>
      </header>

      <section style={{padding:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
        <div style={{padding:16,borderRadius:20,background:'rgba(255,255,255,.08)'}}>
          <div style={{opacity:.7, fontSize:12}}>Billed (mês)</div>
          <div style={{fontSize:28,fontWeight:700}}>R$ 0,00</div>
        </div>
        <div style={{padding:16,borderRadius:20,background:'rgba(255,255,255,.08)'}}>
          <div style={{opacity:.7, fontSize:12}}>Recebido</div>
          <div style={{fontSize:28,fontWeight:700}}>R$ 0,00</div>
        </div>
        <div style={{padding:16,borderRadius:20,background:'rgba(255,255,255,.08)'}}>
          <div style={{opacity:.7, fontSize:12}}>Overdue</div>
          <div style={{fontSize:28,fontWeight:700}}>R$ 0,00</div>
        </div>
        <div style={{padding:16,borderRadius:20,background:'rgba(255,255,255,.08)'}}>
          <div style={{opacity:.7, fontSize:12}}>Delinquência %</div>
          <div style={{fontSize:28,fontWeight:700}}>0%</div>
        </div>
      </section>
    </main>
  );
}

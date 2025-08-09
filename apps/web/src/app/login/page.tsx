'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email,setEmail] = useState('lauroroger@cupcode.com.br');
  const [password,setPassword] = useState('Temp#Cupcode2025');
  const [err,setErr] = useState<string|undefined>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/login`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      if(!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/admin';
    } catch (e: any) {
      setErr(e?.message || 'Falha no login');
    }
  }

  return (
    <main style={{display:'grid',placeItems:'center',minHeight:'100vh',background:'#0f0f14',color:'#fff'}}>
      <form onSubmit={onSubmit} style={{width:360,padding:24,borderRadius:24,background:'rgba(255,255,255,.08)',backdropFilter:'blur(16px)'}}>
        <h2 style={{marginTop:0}}>Entrar no Cha$hier</h2>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:10,borderRadius:12,margin:'6px 0 12px'}} />
        <label>Senha</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:10,borderRadius:12,margin:'6px 0 12px'}} />
        {err && <div style={{color:'#ff8b8b',marginBottom:8}}>{err}</div>}
        <button type="submit" style={{width:'100%',padding:12,borderRadius:14,background:'rgba(255,255,255,.15)',color:'#fff'}}>Entrar</button>
      </form>
    </main>
  );
}

'use client';
import { useEffect, useState } from 'react';

export default function AdminPage(){
  const [m,setM] = useState<any>(null);

  useEffect(()=>{
    const token = localStorage.getItem('accessToken');
    fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000'}/ops/metrics`,{
      headers:{ 'Authorization': `Bearer ${token}` }
    }).then(r=>r.json()).then(setM).catch(()=>setM(null));
  },[]);

  const card = (title:string, value:string) => (
    <div style={{padding:16,borderRadius:20,background:'rgba(255,255,255,.08)'}}>
      <div style={{opacity:.7, fontSize:12}}>{title}</div>
      <div style={{fontSize:28,fontWeight:700}}>{value}</div>
    </div>
  );

  const fmt = (c?:number) => typeof c==='number' ? `R$ ${(c/100).toLocaleString('pt-BR',{minimumFractionDigits:2})}` : '—';

  return (
    <main style={{padding:24}}>
      <h1 style={{fontSize:22, marginBottom:16}}>Dashboard</h1>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
        {card('Billed (mês)', fmt(m?.billedMonthCents))}
        {card('Recebido', fmt(m?.receivedMonthCents))}
        {card('Overdue', fmt(m?.overdueCents))}
        {card('Delinquência %', typeof m?.delinquencyPct==='number' ? `${m.delinquencyPct}%` : '—')}
      </section>
    </main>
  );
}

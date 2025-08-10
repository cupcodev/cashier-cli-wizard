'use client';
import { useEffect, useState } from 'react';

export default function InvoiceDetail({ params }: { params: { id: string } }){
  const [data,setData] = useState<any>(null);
  useEffect(()=>{
    const token = localStorage.getItem('accessToken');
    fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000'}/invoices/${params.id}`,{
      headers:{ 'Authorization': `Bearer ${token}` }
    }).then(r=>r.json()).then(setData);
  },[params.id]);

  if(!data) return <main style={{padding:24,color:'#fff'}}>Carregando…</main>;

  const fmt = (c:number)=>`R$ ${(c/100).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;

  return (
    <main style={{padding:24}}>
      <h1 style={{fontSize:20, marginBottom:12}}>Invoice {data.id}</h1>
      <div style={{padding:16, borderRadius:16, background:'rgba(255,255,255,.06)'}}>
        <div><strong>Cliente:</strong> {data.customer}</div>
        <div><strong>Vencimento:</strong> {new Date(data.due).toLocaleDateString('pt-BR')}</div>
        <div><strong>Status:</strong> {data.status}</div>
        <div style={{marginTop:12}}>
          <strong>Itens</strong>
          <ul>
            {data.items.map((it:any, i:number)=>(
              <li key={i}>{it.description} — {fmt(it.amountCents)}</li>
            ))}
          </ul>
        </div>
        {data.paymentLink && (
          <div style={{marginTop:12}}>
            <a href={data.paymentLink} target="_blank" style={{padding:'10px 14px',borderRadius:12, background:'rgba(255,255,255,.12)', color:'#fff', textDecoration:'none'}}>Abrir link de pagamento</a>
          </div>
        )}
      </div>
    </main>
  );
}

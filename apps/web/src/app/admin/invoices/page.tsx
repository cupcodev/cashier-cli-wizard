'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

type Invoice = {
  id: string;
  due_date: string;
  amount_cents: number;
  status: 'open'|'paid'|'overdue'|'cancelled';
  customer: { id:string; legal_name:string; email?:string } | null;
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function centsToBRL(cents:number){ return (cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

export default function InvoicesPage(){
  const { data, isLoading, error } = useQuery<Invoice[]>({
    queryKey:['invoices'],
    queryFn: async () => {
      const r = await fetch(`${API}/invoices`, { credentials:'include' });
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }
  });

  if (isLoading) return <div style={{padding:24}}>Carregando faturas…</div>;
  if (error) return <div style={{padding:24,color:'#ff8b8b'}}>Erro ao carregar faturas: {(error as Error).message}</div>;

  return (
    <div style={{padding:24}}>
      <h1 style={{fontSize:24, fontWeight:700, marginBottom:16}}>Faturas</h1>
      <div style={{overflowX:'auto', borderRadius:12, border:'1px solid rgba(255,255,255,.08)'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'rgba(255,255,255,.06)'}}>
              <th style={{textAlign:'left', padding:12}}>#</th>
              <th style={{textAlign:'left', padding:12}}>Cliente</th>
              <th style={{textAlign:'left', padding:12}}>Vencimento</th>
              <th style={{textAlign:'right', padding:12}}>Valor</th>
              <th style={{textAlign:'left', padding:12}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((inv) => (
              <tr key={inv.id} style={{borderTop:'1px solid rgba(255,255,255,.06)'}}>
                <td style={{padding:12}}>
                  <Link href={`/admin/invoices/${inv.id}`} style={{color:'#8ab4ff', textDecoration:'none'}}>{inv.id.slice(0,8)}</Link>
                </td>
                <td style={{padding:12}}>{inv.customer?.legal_name ?? '—'}</td>
                <td style={{padding:12}}>{new Date(inv.due_date+'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td style={{padding:12, textAlign:'right'}}>{centsToBRL(inv.amount_cents)}</td>
                <td style={{padding:12}}>{inv.status}</td>
              </tr>
            ))}
            {data!.length===0 && (
              <tr><td colSpan={5} style={{padding:24, textAlign:'center', opacity:.6}}>Sem faturas ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

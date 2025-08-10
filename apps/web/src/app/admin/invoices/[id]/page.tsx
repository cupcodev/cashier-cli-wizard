'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

type InvoiceItem = { id:string; description:string; amount_cents:number };
type Customer = { id:string; legal_name:string; tax_id?:string; email?:string };
type Invoice = {
  id: string;
  due_date: string;
  amount_cents: number;
  status: 'open'|'paid'|'overdue'|'cancelled';
  customer: Customer | null;
  items: InvoiceItem[];
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
function centsToBRL(cents:number){ return (cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

export default function InvoiceDetailPage(){
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();

  const { data, isLoading, error } = useQuery<Invoice>({
    queryKey:['invoice', id],
    queryFn: async () => {
      const r = await fetch(`${API}/invoices/${id}`, { credentials:'include' });
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    },
    enabled: !!id,
  });

  if (isLoading) return <div style={{padding:24}}>Carregando fatura…</div>;
  if (error) return <div style={{padding:24,color:'#ff8b8b'}}>Erro ao carregar fatura: {(error as Error).message}</div>;
  if (!data) return null;

  const subtotal = (data.items ?? []).reduce((s,i)=>s + (i.amount_cents||0), 0);

  return (
    <div style={{padding:24, display:'grid', gap:16}}>
      <button onClick={()=>router.back()} style={{width:'fit-content', padding:'6px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.06)', color:'#fff'}}>← Voltar</button>
      <h1 style={{fontSize:24, fontWeight:700}}>Fatura {data.id.slice(0,8)}</h1>
      <div style={{display:'grid', gap:12}}>
        <div>Cliente: <strong>{data.customer?.legal_name ?? '—'}</strong>{data.customer?.tax_id ? ` • ${data.customer.tax_id}` : ''}</div>
        <div>Vencimento: <strong>{new Date(data.due_date+'T00:00:00').toLocaleDateString('pt-BR')}</strong></div>
        <div>Status: <strong>{data.status}</strong></div>
      </div>

      <div style={{overflowX:'auto', borderRadius:12, border:'1px solid rgba(255,255,255,.08)'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'rgba(255,255,255,.06)'}}>
              <th style={{textAlign:'left', padding:12}}>Descrição</th>
              <th style={{textAlign:'right', padding:12}}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {(data.items ?? []).map((it) => (
              <tr key={it.id} style={{borderTop:'1px solid rgba(255,255,255,.06)'}}>
                <td style={{padding:12}}>{it.description}</td>
                <td style={{padding:12, textAlign:'right'}}>{centsToBRL(it.amount_cents)}</td>
              </tr>
            ))}
            {data.items?.length===0 && (
              <tr><td colSpan={2} style={{padding:24, textAlign:'center', opacity:.6}}>Sem itens.</td></tr>
            )}
            <tr style={{borderTop:'1px solid rgba(255,255,255,.12)'}}>
              <td style={{padding:12, textAlign:'right'}}><strong>Subtotal</strong></td>
              <td style={{padding:12, textAlign:'right'}}><strong>{centsToBRL(subtotal)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

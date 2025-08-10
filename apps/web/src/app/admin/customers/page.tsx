'use client';
import { useQuery } from '@tanstack/react-query';

type Customer = {
  id:string;
  legal_name:string;
  tax_id?:string;
  email?:string;
  status:'active'|'inactive';
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function CustomersPage(){
  const { data, isLoading, error } = useQuery<Customer[]>({
    queryKey:['customers'],
    queryFn: async () => {
      const r = await fetch(`${API}/customers`, { credentials:'include' });
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }
  });

  if (isLoading) return <div style={{padding:24}}>Carregando clientes…</div>;
  if (error) return <div style={{padding:24,color:'#ff8b8b'}}>Erro ao carregar clientes: {(error as Error).message}</div>;

  return (
    <div style={{padding:24}}>
      <h1 style={{fontSize:24, fontWeight:700, marginBottom:16}}>Clientes</h1>
      <div style={{overflowX:'auto', borderRadius:12, border:'1px solid rgba(255,255,255,.08)'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'rgba(255,255,255,.06)'}}>
              <th style={{textAlign:'left', padding:12}}>Nome</th>
              <th style={{textAlign:'left', padding:12}}>Documento</th>
              <th style={{textAlign:'left', padding:12}}>Email</th>
              <th style={{textAlign:'left', padding:12}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((c) => (
              <tr key={c.id} style={{borderTop:'1px solid rgba(255,255,255,.06)'}}>
                <td style={{padding:12}}>{c.legal_name ?? '—'}</td>
                <td style={{padding:12}}>{c.tax_id ?? '—'}</td>
                <td style={{padding:12}}>{c.email ?? '—'}</td>
                <td style={{padding:12}}>{c.status}</td>
              </tr>
            ))}
            {data!.length===0 && (
              <tr><td colSpan={4} style={{padding:24, textAlign:'center', opacity:.6}}>Sem clientes.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

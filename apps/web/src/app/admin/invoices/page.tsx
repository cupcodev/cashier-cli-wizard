'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

type Invoice = {
  id: string;
  due_date: string;
  amount_cents: number;
  status: 'open'|'paid'|'overdue'|'cancelled';
  customer: { id:string; legal_name:string; email?:string };
};

function centsToBRL(cents:number){ return (cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

export default function InvoicesPage(){
  const { data, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const r = await fetch(process.env.NEXT_PUBLIC_API_URL + '/invoices', { credentials:'include' });
      if(!r.ok) throw new Error('failed to load'); 
      return r.json();
    }
  });

  if (isLoading) return <div className="p-6">Carregando…</div>;
  if (error) return <div className="p-6 text-red-400">Erro ao carregar.</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Faturas</h1>
      <div className="overflow-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-3">#</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Vencimento</th>
              <th className="text-right p-3">Valor</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data!.map(inv => (
              <tr key={inv.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-3">
                  <Link href={`/admin/invoices/${inv.id}`} className="underline underline-offset-4">
                    {inv.id.slice(0,8)}
                  </Link>
                </td>
                <td className="p-3">{inv.customer?.legal_name ?? '—'}</td>
                <td className="p-3">{new Date(inv.due_date+'T00:00:00').toLocaleDateString('pt-BR')}</td>
                <td className="p-3 text-right">{centsToBRL(inv.amount_cents)}</td>
                <td className="p-3">{inv.status}</td>
              </tr>
            ))}
            {data!.length===0 && (
              <tr><td colSpan={5} className="p-6 text-center text-white/60">Sem faturas ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

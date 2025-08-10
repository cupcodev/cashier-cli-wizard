'use client';
import { useQuery } from '@tanstack/react-query';

type Customer = {
  id:string;
  legal_name:string;
  tax_id?:string;
  email?:string;
  status:'active'|'inactive';
};

export default function CustomersPage(){
  const { data, isLoading, error } = useQuery<Customer[]>({
    queryKey:['customers'],
    queryFn: async () => {
      const r = await fetch(process.env.NEXT_PUBLIC_API_URL + '/customers', { credentials:'include' });
      if(!r.ok) throw new Error('failed');
      return r.json();
    }
  });

  if (isLoading) return <div className="p-6">Carregando…</div>;
  if (error) return <div className="p-6 text-red-400">Erro ao carregar.</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Clientes</h1>
      <div className="overflow-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Documento</th>
              <th className="text-left p-3">E-mail</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data!.map(c => (
              <tr key={c.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-3">{c.legal_name}</td>
                <td className="p-3">{c.tax_id ?? '—'}</td>
                <td className="p-3">{c.email ?? '—'}</td>
                <td className="p-3">{c.status}</td>
              </tr>
            ))}
            {data!.length===0 && (
              <tr><td colSpan={4} className="p-6 text-center text-white/60">Sem clientes.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

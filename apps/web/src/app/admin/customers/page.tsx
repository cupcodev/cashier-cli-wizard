'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Customer = {
  id: string;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  cnpj?: string | null;
  cpf?: string | null;
  status_cliente?: 'Ativo' | 'Trial' | 'Pausado' | 'Inadimplente' | 'Encerrado';
  criado_em?: string;
  atualizado_em?: string;
};

type ListResponse = {
  total: number;
  items: Customer[];
  limit: number;
  offset: number;
};

function maskDoc(doc?: string | null) {
  if (!doc) return '';
  const d = doc.replace(/\D/g,'');
  if (d.length === 14) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  if (d.length === 11) return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  return doc;
}

export default function CustomersListPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [orderBy, setOrderBy] = useState<'razao_social'|'nome_fantasia'|'cnpj'|'cpf'|'status_cliente'|'criado_em'|'atualizado_em'>('razao_social');
  const [orderDir, setOrderDir] = useState<'ASC'|'DESC'>('ASC');
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<ListResponse>({ total: 0, items: [], limit, offset });
  const [loading, setLoading] = useState(false);

  const qs = useMemo(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    sp.set('limit', String(limit));
    sp.set('offset', String(offset));
    sp.set('orderBy', orderBy);
    sp.set('orderDir', orderDir);
    return sp.toString();
  }, [q, limit, offset, orderBy, orderDir]);

  const fetchList = async () => {
    setLoading(true);
    const r = await fetch(`/api/customers?${qs}`, { cache: 'no-store' });
    setLoading(false);
    if (!r.ok) { console.error(await r.text()); return; }
    const json = await r.json() as ListResponse;
    const items = status ? json.items.filter(i => i.status_cliente === status) : json.items;
    setData({ ...json, items });
  };

  useEffect(() => { fetchList(); /* eslint-disable-next-line */ }, [qs, status]);

  const next = () => setOffset(o => o + limit);
  const prev = () => setOffset(o => Math.max(0, o - limit));

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-gray-500">Busca, paginação e atalho para edição</p>
        </div>
        {/* ajuste o href do "Novo" quando implementar /admin/customers/new */}
        <Link href="#" className="px-4 py-2 rounded bg-black text-white opacity-60 pointer-events-none">+ Novo</Link>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="text-sm">Buscar</label>
          <input value={q} onChange={e=>{ setOffset(0); setQ(e.target.value); }} placeholder="Razão, fantasia, CNPJ, CPF, email, whatsapp..."
                 className="border rounded px-3 py-2 min-w-[280px]" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Status</label>
          <select value={status} onChange={e=>{ setOffset(0); setStatus(e.target.value); }} className="border rounded px-3 py-2">
            <option value="">Todos</option>
            {['Ativo','Trial','Pausado','Inadimplente','Encerrado'].map(s=> <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Ordenar por</label>
          <select value={orderBy} onChange={e=>setOrderBy(e.target.value as any)} className="border rounded px-3 py-2">
            <option value="razao_social">Razão Social</option>
            <option value="nome_fantasia">Nome Fantasia</option>
            <option value="cnpj">CNPJ</option>
            <option value="cpf">CPF</option>
            <option value="status_cliente">Status</option>
            <option value="criado_em">Criado em</option>
            <option value="atualizado_em">Atualizado em</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className={`px-3 py-2 border rounded ${orderDir==='ASC'?'bg-black text-white':''}`} onClick={()=>setOrderDir('ASC')}>ASC</button>
          <button className={`px-3 py-2 border rounded ${orderDir==='DESC'?'bg-black text-white':''}`} onClick={()=>setOrderDir('DESC')}>DESC</button>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 border rounded" disabled={offset===0 || loading} onClick={prev}>◀ Anterior</button>
          <button className="px-3 py-2 border rounded" disabled={offset+limit>=data.total || loading} onClick={next}>Próxima ▶</button>
          <span className="text-sm text-gray-500">Total: {data.total}</span>
        </div>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Razão Social</th>
              <th className="text-left p-2">Nome Fantasia</th>
              <th className="text-left p-2">Doc</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Carregando...</td></tr>
            )}
            {!loading && data.items.length===0 && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Sem resultados</td></tr>
            )}
            {!loading && data.items.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.razao_social || '-'}</td>
                <td className="p-2">{c.nome_fantasia || '-'}</td>
                <td className="p-2">{maskDoc(c.cnpj || c.cpf)}</td>
                <td className="p-2">{c.status_cliente}</td>
                <td className="p-2">
                  <Link href={`/admin/customers/${c.id}/edit`} className="px-3 py-1 border rounded">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
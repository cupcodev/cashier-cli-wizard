'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type AnyObj = Record<string, any>;
type Customer = AnyObj;

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [data, setData] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const fetchOne = async () => {
    setErr(null);
    const r = await fetch(`/api/customers/${id}`, { cache: 'no-store' });
    if (!r.ok) { setErr(await r.text()); return; }
    setData(await r.json());
  };

  useEffect(() => { fetchOne(); /* eslint-disable-next-line */ }, [id]);

  const set = (patch: Partial<Customer>) => setData(d => ({ ...(d||{}), ...patch }));

  const save = async () => {
    if (!data) return;
    setSaving(true); setErr(null); setOk(false);
    const payload = { ...data };

    if (payload?.cnpj) payload.cnpj = String(payload.cnpj).replace(/\D/g,'');
    if (payload?.cpf) payload.cpf = String(payload.cpf).replace(/\D/g,'');

    if (payload?.enderecos) {
      payload.enderecos = payload.enderecos.map((e:any)=>({
        ...e,
        cep: (e.cep||'').replace(/\D/g,'').replace(/(\d{5})(\d{3})/, '$1-$2')
      }));
    }

    const r = await fetch(`/api/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!r.ok) { setErr(await r.text()); return; }
    setOk(true);
    fetchOne();
  };

  const addContato = () => {
    const next = [...(data?.contatos||[]), {
      nome:'', cargo:'', email:'', telefone:'', whatsapp:'',
      canal_preferido:'', responsavel_financeiro:false, responsavel_tecnico:false
    }];
    set({ contatos: next });
  };
  const addEndereco = (tipo:'cobranca'|'operacional'='cobranca') => {
    const next = [...(data?.enderecos||[]), {
      tipo, logradouro:'', numero:'', complemento:'', bairro:'', cidade:'',
      uf:'', cep:'', codigo_ibge_municipio: null
    }];
    set({ enderecos: next });
  };

  if (!data) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers" className="text-sm px-3 py-1 border rounded">← Voltar</Link>
          <h1 className="text-2xl font-semibold">Editar Cliente</h1>
        </div>
        <div className="flex items-center gap-3">
          {ok && <span className="text-green-700 text-sm">Salvo ✔</span>}
          {err && <span className="text-red-700 text-sm max-w-[420px]">{err}</span>}
          <button disabled={saving} onClick={save} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </header>

      <nav className="sticky top-0 bg-white/70 backdrop-blur border-b z-10">
        <ul className="flex flex-wrap gap-4 p-3 text-sm">
          {['cadastro','contatos','enderecos','cobranca','pagamento','fiscal','nfse','dunning','kpis','contabilidade','portal','documentos','lgpd','integracoes'].map(id =>
            <li key={id}><a href={`#${id}`} className="hover:underline">{id.toUpperCase()}</a></li>
          )}
        </ul>
      </nav>

      {/* (mesmo conteúdo de edição que enviei antes, resumido para caber...) */}
      {/* 1) Identificação */}
      <section id="cadastro" className="space-y-3">
        <h2 className="text-xl font-medium">Identificação & Classificação</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex flex-col">
            <span>Tipo de pessoa</span>
            <select value={data.tipo_pessoa||'PJ'} onChange={e=>set({ tipo_pessoa:e.target.value })}>
              <option value="PJ">PJ</option><option value="PF">PF</option>
            </select>
          </label>
          <label className="flex flex-col">
            <span>Razão Social (PJ)</span>
            <input value={data.razao_social||''} onChange={e=>set({ razao_social:e.target.value })}/>
          </label>
          <label className="flex flex-col">
            <span>Nome Fantasia</span>
            <input value={data.nome_fantasia||''} onChange={e=>set({ nome_fantasia:e.target.value })}/>
          </label>
          <label className="flex flex-col">
            <span>CNPJ</span>
            <input value={data.cnpj||''} onChange={e=>set({ cnpj:e.target.value })} placeholder="00.000.000/0000-00"/>
          </label>
          <label className="flex flex-col">
            <span>CPF</span>
            <input value={data.cpf||''} onChange={e=>set({ cpf:e.target.value })} placeholder="000.000.000-00"/>
          </label>
        </div>
      </section>

      {/* 2) Contatos */}
      <section id="contatos" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Contatos & Responsáveis</h2>
          <button className="px-3 py-1 border rounded" onClick={addContato}>+ Adicionar contato</button>
        </div>
        <div className="space-y-4">
          {(data.contatos||[]).map((ct:any, i:number)=>(
            <div key={ct.id || `novo-${i}`} className="p-3 border rounded grid grid-cols-1 md:grid-cols-6 gap-3">
              <input className="md:col-span-2" placeholder="Nome" value={ct.nome||''}
                onChange={e=>{ const next=[...data.contatos]; next[i]={...ct, nome:e.target.value}; set({ contatos:next }); }}/>
              <input placeholder="Email" value={ct.email||''}
                onChange={e=>{ const next=[...data.contatos]; next[i]={...ct, email:e.target.value}; set({ contatos:next }); }}/>
              <input placeholder="WhatsApp +55..." value={ct.whatsapp||''}
                onChange={e=>{ const next=[...data.contatos]; next[i]={...ct, whatsapp:e.target.value}; set({ contatos:next }); }}/>
              <label className="md:col-span-3 flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <input type="checkbox" checked={!!ct.responsavel_financeiro}
                    onChange={e=>{ const next=[...data.contatos]; next[i]={...ct, responsavel_financeiro:e.target.checked}; set({ contatos:next }); }}/>
                  Financeiro
                </span>
                <span className="flex items-center gap-2">
                  <input type="checkbox" checked={!!ct.responsavel_tecnico}
                    onChange={e=>{ const next=[...data.contatos]; next[i]={...ct, responsavel_tecnico:e.target.checked}; set({ contatos:next }); }}/>
                  Técnico
                </span>
                <button className="ml-auto text-red-600"
                  onClick={()=>{ const next=[...(data.contatos||[])]; next.splice(i,1); set({ contatos: next }); }}>
                  Remover
                </button>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* 2b) Endereços (atalho) */}
      <section id="enderecos" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Endereços</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded" onClick={()=>addEndereco('cobranca')}>+ Cobrança</button>
            <button className="px-3 py-1 border rounded" onClick={()=>addEndereco('operacional')}>+ Operacional</button>
          </div>
        </div>
      </section>

      {/* … (demais blocos como antes) */}

    </div>
  );
}
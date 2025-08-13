import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface Customer {
  id: string
  legal_name: string
  trade_name: string
  cnpj: string
  cpf: string
  email: string
  phone: string
  status_cliente: string
  tipo_pessoa: 'PF' | 'PJ'
  created_at: string
}

export const ClientsPage = () => {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    if (user) {
      fetchCustomers()
    }
  }, [user])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewClient = () => {
    setSelectedCustomer(null)
    setShowForm(true)
  }

  const handleEditClient = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedCustomer(null)
    fetchCustomers()
  }

  const handleDeleteClient = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        fetchCustomers()
      } catch (error) {
        console.error('Erro ao excluir cliente:', error)
      }
    }
  }

  if (!user) {
    return <div>Carregando...</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-white">Carregando clientes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Clientes</h1>
          <button
            onClick={handleNewClient}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
          >
            Novo Cliente
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Documento</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white">
                      <div>
                        <div className="font-medium">{customer.legal_name || customer.trade_name}</div>
                        {customer.trade_name && customer.legal_name && (
                          <div className="text-sm text-white/60">{customer.trade_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.tipo_pessoa === 'PJ' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {customer.tipo_pessoa === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/80 font-mono">
                      {customer.cnpj || customer.cpf}
                    </td>
                    <td className="px-6 py-4 text-white/80">{customer.email}</td>
                    <td className="px-6 py-4 text-white/80">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.status_cliente === 'Ativo' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {customer.status_cliente}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClient(customer)}
                          className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-sm rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClient(customer.id)}
                          className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm rounded-lg transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {customers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-white/60 mb-4">Nenhum cliente encontrado</div>
              <button
                onClick={handleNewClient}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Adicionar primeiro cliente
              </button>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ClientFormModal
          customer={selectedCustomer}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}

interface ClientFormModalProps {
  customer: Customer | null
  onClose: () => void
}

const ClientFormModal = ({ customer, onClose }: ClientFormModalProps) => {
  const [formData, setFormData] = useState({
    tipo_pessoa: customer?.tipo_pessoa || 'PF' as 'PF' | 'PJ',
    legal_name: customer?.legal_name || '',
    trade_name: customer?.trade_name || '',
    cnpj: customer?.cnpj || '',
    cpf: customer?.cpf || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    status_cliente: customer?.status_cliente || 'Ativo'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        legal_name: formData.legal_name || null,
        trade_name: formData.trade_name || null,
        cnpj: formData.cnpj || null,
        cpf: formData.cpf || null
      }

      if (customer) {
        const { error } = await supabase
          .from('customers')
          .update(data)
          .eq('id', customer.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('customers')
          .insert(data)
        if (error) throw error
      }

      onClose()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      alert('Erro ao salvar cliente. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {customer ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tipo de Pessoa
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="PF"
                    checked={formData.tipo_pessoa === 'PF'}
                    onChange={(e) => setFormData({ ...formData, tipo_pessoa: e.target.value as 'PF' })}
                    className="mr-2"
                  />
                  <span className="text-white">Pessoa Física</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="PJ"
                    checked={formData.tipo_pessoa === 'PJ'}
                    onChange={(e) => setFormData({ ...formData, tipo_pessoa: e.target.value as 'PJ' })}
                    className="mr-2"
                  />
                  <span className="text-white">Pessoa Jurídica</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {formData.tipo_pessoa === 'PJ' ? 'Razão Social' : 'Nome Completo'}
                </label>
                <input
                  type="text"
                  value={formData.legal_name}
                  onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {formData.tipo_pessoa === 'PJ' && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    value={formData.trade_name}
                    onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.tipo_pessoa === 'PJ' ? (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">CNPJ</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">CPF</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000.000.000-00"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                <select
                  value={formData.status_cliente}
                  onChange={(e) => setFormData({ ...formData, status_cliente: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ativo" className="bg-slate-800">Ativo</option>
                  <option value="Inativo" className="bg-slate-800">Inativo</option>
                  <option value="Suspenso" className="bg-slate-800">Suspenso</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                {loading ? 'Salvando...' : customer ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
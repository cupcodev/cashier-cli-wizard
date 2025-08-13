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
    return <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-foreground">Carregando...</div>
    </div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="glass-card p-8 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-foreground">Carregando clientes...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-subtle border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </a>
              <div>
                <h1 className="heading-lg">Gerenciar Clientes</h1>
                <p className="text-muted-foreground">Cadastre e gerencie sua base de clientes</p>
              </div>
            </div>
            
            <button
              onClick={handleNewClient}
              className="btn-primary flex items-center space-x-2 hover:scale-105 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Novo Cliente</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
          {customers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="heading-md mb-4">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Comece cadastrando seu primeiro cliente para começar a gerenciar sua base.
              </p>
              <button
                onClick={handleNewClient}
                className="btn-primary"
              >
                Cadastrar Primeiro Cliente
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/20 border-b border-border/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Cliente</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Documento</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Contato</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {customers.map((customer, index) => (
                    <tr 
                      key={customer.id} 
                      className="hover:bg-muted/10 transition-colors animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-foreground">
                            {customer.legal_name || customer.trade_name}
                          </div>
                          {customer.trade_name && customer.legal_name && (
                            <div className="text-sm text-muted-foreground">{customer.trade_name}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          customer.tipo_pessoa === 'PJ' 
                            ? 'bg-primary/20 text-primary border border-primary/30' 
                            : 'bg-secondary/20 text-secondary border border-secondary/30'
                        }`}>
                          {customer.tipo_pessoa === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-foreground text-sm">
                          {customer.cnpj || customer.cpf || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-foreground">{customer.email || '—'}</div>
                          {customer.phone && (
                            <div className="text-muted-foreground">{customer.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          customer.status_cliente === 'Ativo' 
                            ? 'status-active' 
                            : customer.status_cliente === 'Inativo'
                            ? 'status-inactive'
                            : 'status-pending'
                        }`}>
                          {customer.status_cliente}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditClient(customer)}
                            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteClient(customer.id)}
                            className="px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
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
          )}
        </div>
      </main>

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl animate-scale-in">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="heading-lg mb-2">
                {customer ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <p className="text-muted-foreground">
                {customer ? 'Atualize as informações do cliente' : 'Preencha os dados para cadastrar um novo cliente'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-muted/20 hover:bg-muted/30 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tipo de Pessoa */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-4">Tipo de Pessoa</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.tipo_pessoa === 'PF' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-muted/10 hover:bg-muted/20'
                }`}>
                  <input
                    type="radio"
                    value="PF"
                    checked={formData.tipo_pessoa === 'PF'}
                    onChange={(e) => setFormData({ ...formData, tipo_pessoa: e.target.value as 'PF' })}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.tipo_pessoa === 'PF' ? 'border-primary' : 'border-muted-foreground'
                    }`}>
                      {formData.tipo_pessoa === 'PF' && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Pessoa Física</div>
                      <div className="text-sm text-muted-foreground">Para pessoas físicas</div>
                    </div>
                  </div>
                </label>
                
                <label className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.tipo_pessoa === 'PJ' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-muted/10 hover:bg-muted/20'
                }`}>
                  <input
                    type="radio"
                    value="PJ"
                    checked={formData.tipo_pessoa === 'PJ'}
                    onChange={(e) => setFormData({ ...formData, tipo_pessoa: e.target.value as 'PJ' })}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.tipo_pessoa === 'PJ' ? 'border-primary' : 'border-muted-foreground'
                    }`}>
                      {formData.tipo_pessoa === 'PJ' && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Pessoa Jurídica</div>
                      <div className="text-sm text-muted-foreground">Para empresas</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Informações Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  {formData.tipo_pessoa === 'PJ' ? 'Razão Social *' : 'Nome Completo *'}
                </label>
                <input
                  type="text"
                  value={formData.legal_name}
                  onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                  className="form-input w-full"
                  placeholder={formData.tipo_pessoa === 'PJ' ? 'Digite a razão social' : 'Digite o nome completo'}
                  required
                />
              </div>

              {formData.tipo_pessoa === 'PJ' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formData.trade_name}
                    onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                    className="form-input w-full"
                    placeholder="Digite o nome fantasia"
                  />
                </div>
              )}
            </div>

            {/* Documentos e Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {formData.tipo_pessoa === 'PJ' ? (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">CNPJ</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="form-input w-full"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">CPF</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="form-input w-full"
                    placeholder="000.000.000-00"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Status</label>
                <select
                  value={formData.status_cliente}
                  onChange={(e) => setFormData({ ...formData, status_cliente: e.target.value })}
                  className="form-input w-full"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Suspenso">Suspenso</option>
                </select>
              </div>
            </div>

            {/* Contatos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input w-full"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input w-full"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border/20">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-muted/20 hover:bg-muted/30 text-foreground border border-border rounded-xl transition-all duration-200 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                <span>{loading ? 'Salvando...' : customer ? 'Atualizar Cliente' : 'Criar Cliente'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Dashboard } from '@/components/Dashboard'
import { ClientsPage } from '@/pages/ClientsPage'

function HomePage() {
  const { user } = useAuth()
  
  if (user) {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="glass-card rounded-3xl p-12 max-w-2xl w-full text-center animate-fade-in">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
              <span className="text-3xl font-bold text-primary-foreground">C</span>
            </div>
            <h1 className="heading-xl mb-4">Cupcode Cha$hier</h1>
            <p className="text-xl text-muted-foreground mb-2">Sistema Financeiro Profissional</p>
            <div className="w-24 h-1 bg-gradient-primary rounded-full mx-auto"></div>
          </div>
          
          <div className="mb-10">
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Gerencie clientes, faturas e processos financeiros com eficiência e segurança.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-muted/20 rounded-xl text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse-slow"></div>
              API disponível em{' '}
              <code className="ml-1 px-2 py-1 bg-primary/10 rounded text-primary font-mono text-xs">
                localhost:4000/docs
              </code>
            </div>
          </div>
          
          <a 
            href="/login" 
            className="btn-primary inline-flex items-center justify-center group"
          >
            Acessar Sistema
            <svg className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </main>
    </div>
  )
}

function LoginPage() {
  const { signIn, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await signIn(email, password)
    
    if (signInError) {
      setError('Credenciais inválidas. Verifique seu email e senha.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-secondary/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="glass-card rounded-3xl p-12 w-full max-w-md animate-scale-in">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
              <span className="text-2xl font-bold text-primary-foreground">C</span>
            </div>
            <h2 className="heading-lg mb-3">Bem-vindo de volta</h2>
            <p className="text-muted-foreground">Entre com suas credenciais para acessar o sistema</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm animate-slide-up">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Email</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input w-full"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Senha</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input w-full"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              <span>{loading ? 'Entrando...' : 'Entrar no Sistema'}</span>
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <a href="#" className="text-sm text-primary hover:text-primary-light transition-colors duration-200">
              Esqueceu sua senha?
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/clients" 
          element={
            <ProtectedRoute>
              <ClientsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App

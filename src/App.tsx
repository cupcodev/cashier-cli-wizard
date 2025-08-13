
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
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center animate-fade-in relative z-10">
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Cupcode Cha$hier
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
        </div>
        
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Monorepo inicial pronto. API em{' '}
          <code className="px-2 py-1 bg-muted/50 rounded text-primary font-medium">
            http://localhost:4000/docs
          </code>
        </p>
        
        <a 
          href="/login" 
          className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105 group"
        >
          Ir para Login
          <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </main>
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
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-secondary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="glass-card rounded-3xl p-8 w-full max-w-md animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Entrar no Cha$hier
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Senha</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-primary hover:text-secondary transition-colors duration-200">
            Esqueceu sua senha?
          </a>
        </div>
      </div>
    </main>
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

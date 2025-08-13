import { useAuth } from '@/hooks/useAuth'

export function Dashboard() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="glass-card rounded-3xl p-8 max-w-2xl w-full text-center animate-fade-in relative z-10">
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Dashboard - Cupcode Cha$hier
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
        </div>
        
        <div className="mb-8">
          <p className="text-muted-foreground mb-4">
            Bem-vindo(a), <span className="text-primary font-medium">{user?.email}</span>!
          </p>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Você está logado no sistema. API disponível em{' '}
            <code className="px-2 py-1 bg-muted/50 rounded text-primary font-medium">
              http://localhost:4000/docs
            </code>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <a href="/clients" className="glass rounded-xl p-6 text-left hover:bg-white/10 transition-colors">
            <h3 className="text-lg font-semibold text-primary mb-2">Clientes</h3>
            <p className="text-muted-foreground text-sm">Gerencie seus clientes e contatos</p>
          </a>
          <div className="glass rounded-xl p-6 text-left">
            <h3 className="text-lg font-semibold text-primary mb-2">Faturas</h3>
            <p className="text-muted-foreground text-sm">Controle de faturas e pagamentos</p>
          </div>
        </div>
        
        <button 
          onClick={handleSignOut}
          className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 group"
        >
          Sair do Sistema
          <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </main>
  )
}
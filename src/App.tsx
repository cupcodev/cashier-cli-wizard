import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Import your existing pages
function HomePage() {
  return (
    <main style={{padding:24,background:'#0f0f14',color:'#fff',minHeight:'100vh'}}>
      <h1 style={{fontSize:28, fontWeight:700}}>Cupcode Cha$hier</h1>
      <p style={{opacity:.8,marginBottom:16}}>Monorepo inicial pronto. API em <code>http://localhost:4000/docs</code>.</p>
      <a href="/login" style={{display:'inline-block',padding:'10px 14px',borderRadius:14,background:'rgba(255,255,255,.15)',color:'#fff',textDecoration:'none'}}>Ir para Login</a>
    </main>
  )
}

function LoginPage() {
  // Your existing login component logic would go here
  return (
    <main style={{display:'grid',placeItems:'center',minHeight:'100vh',background:'#0f0f14',color:'#fff'}}>
      <div style={{width:360,padding:24,borderRadius:24,background:'rgba(255,255,255,.08)',backdropFilter:'blur(16px)'}}>
        <h2 style={{marginTop:0}}>Entrar no Cha$hier</h2>
        <p>Login page - connect this to your existing login logic</p>
      </div>
    </main>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
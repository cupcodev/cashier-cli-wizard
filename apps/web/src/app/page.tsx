export default function Home() {
  return (
    <main style={{padding:24,background:'#0f0f14',color:'#fff',minHeight:'100vh'}}>
      <h1 style={{fontSize:28, fontWeight:700}}>Cupcode Cha$hier</h1>
      <p style={{opacity:.8,marginBottom:16}}>Monorepo inicial pronto. API em <code>http://localhost:4000/docs</code>.</p>
      <a href="/login" style={{display:'inline-block',padding:'10px 14px',borderRadius:14,background:'rgba(255,255,255,.15)',color:'#fff',textDecoration:'none'}}>Ir para Login</a>
    </main>
  );
}

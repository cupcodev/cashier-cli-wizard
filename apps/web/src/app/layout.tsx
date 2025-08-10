import Providers from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{background:'#0f0f14',color:'#fff',fontFamily:'ui-sans-serif,system-ui'}}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

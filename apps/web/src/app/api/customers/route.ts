import { NextRequest, NextResponse } from 'next/server';

// URL da API Nest
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();

  // repassa cookies da requisição (se você usa auth baseada em cookie na API)
  const cookie = req.headers.get('cookie') ?? '';

  const upstream = await fetch(`${API}/customers?${qs}`, {
    headers: {
      'Accept': 'application/json',
      'Cookie': cookie,
    },
    // importante: não usar cache em listagem
    cache: 'no-store',
  });

  const body = await upstream.text();
  // devolve status e content-type originais
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });
} 
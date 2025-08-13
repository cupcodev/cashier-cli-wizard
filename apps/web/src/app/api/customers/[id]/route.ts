import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL;

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const res = await fetch(`${API}/customers/${params.id}`, {
    headers: { 'content-type': 'application/json' },
    cache: 'no-store',
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') || 'application/json' },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.text();
  const res = await fetch(`${API}/customers/${params.id}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      authorization: req.headers.get('authorization') || '',
    },
    body,
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') || 'application/json' },
  });
}

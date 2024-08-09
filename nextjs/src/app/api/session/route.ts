import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function POST(request: NextRequest) {
  console.log('POST /api/session', request.cookies);

  return Response.json({ ok: 'ok' });
}

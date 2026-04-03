import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';
const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const backendRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const response = NextResponse.json(data, { status: 200 });

  // Use response.cookies.set() — the only reliable way in Next.js 14 App Router
  const refreshToken: string | undefined = data?.data?.tokens?.refreshToken;
  if (refreshToken) {
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });
  }

  return response;
}

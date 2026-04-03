import { NextResponse } from 'next/server';

// Called when checkAuth fails — clears the stale httpOnly cookie server-side
export function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return response;
}

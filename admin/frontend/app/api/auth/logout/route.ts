import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

export async function POST(req: NextRequest) {
  const accessToken = req.headers.get('authorization') ?? '';

  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: accessToken },
  }).catch(() => {});

  // Clear the cookie on the Next.js domain regardless of backend response
  const response = NextResponse.json({ success: true });
  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';
const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json({ success: false, error: { code: 'NO_REFRESH_TOKEN', message: 'No session.' } }, { status: 401 });
  }

  const backendRes = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `refreshToken=${refreshToken}`,
    },
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    const response = NextResponse.json(data, { status: backendRes.status });
    response.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
    return response;
  }

  const response = NextResponse.json(data, { status: 200 });

  // Backend now returns the rotated refreshToken in the body
  const newRefreshToken: string | undefined = data?.data?.refreshToken;
  if (newRefreshToken) {
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
  }

  return response;
}

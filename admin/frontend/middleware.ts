import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = [
  '/dashboard', '/products', '/orders', '/customers',
  '/coupons', '/shipping', '/media', '/reports', '/settings',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const hasRefreshCookie = request.cookies.has('refreshToken');

  // Block unauthenticated access to protected routes only.
  // Never redirect cookie-holders away from /login — the token may be expired,
  // and doing so causes an infinite loop when checkAuth fails.
  if (isProtected && !hasRefreshCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

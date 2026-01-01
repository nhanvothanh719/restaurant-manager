import { ACCESS_TOKEN_COOKIE_KEY } from '@/constants/cookiesKey';
import { NextRequest, NextResponse } from 'next/server';

const PRIVATE_PATHS = ['/manage'];
const UNAUTH_PATHS = ['/login'];

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(
    request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value
  );

  if (
    PRIVATE_PATHS.some((path) => pathname.startsWith(path)) &&
    !isAuthenticated
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (
    UNAUTH_PATHS.some((path) => pathname.startsWith(path)) &&
    isAuthenticated
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/manage/:path*', '/login'],
};

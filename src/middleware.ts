import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED_PAGE_PREFIXES = [
  '/dashboard',
  '/students',
  '/groups',
  '/attendance',
  '/payments',
  '/exams',
  '/courses',
  '/teachers',
  '/reports',
  '/notifications',
  '/settings',
];

const PROTECTED_API_PREFIXES = [
  '/api/students',
  '/api/payments',
  '/api/groups',
  '/api/courses',
  '/api/exams',
  '/api/attendance',
  '/api/settings',
  '/api/reports',
  '/api/dashboard',
  '/api/notifications',
  '/api/search',
];

async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const secretKey = process.env.AUTH_SECRET;
    if (!secretKey) return false;
    const secret = new TextEncoder().encode(secretKey);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('infast_session')?.value;

  const isProtectedApi = PROTECTED_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedApi) {
    const valid = await isValidToken(token);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtectedPage) {
    const valid = await isValidToken(token);
    if (!valid) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect from login if already authenticated
  if (pathname === '/login') {
    const valid = await isValidToken(token);
    if (valid) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Root path redirect
  if (pathname === '/') {
    const valid = await isValidToken(token);
    if (valid) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/students/:path*',
    '/groups/:path*',
    '/attendance/:path*',
    '/payments/:path*',
    '/exams/:path*',
    '/courses/:path*',
    '/teachers/:path*',
    '/reports/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/api/students/:path*',
    '/api/payments/:path*',
    '/api/groups/:path*',
    '/api/courses/:path*',
    '/api/exams/:path*',
    '/api/attendance/:path*',
    '/api/settings/:path*',
    '/api/reports/:path*',
    '/api/dashboard/:path*',
    '/api/notifications/:path*',
    '/api/search/:path*',
  ],
};

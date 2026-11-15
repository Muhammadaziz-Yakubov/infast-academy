import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED_PAGE_PREFIXES = [
  '/dashboard',
  '/branches',
  '/marketing',
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
  '/employees',
  '/lms',
  '/shop',
  '/events',
  '/graduates',
];

const PROTECTED_API_PREFIXES = [
  '/api/branches',
  '/api/marketing',
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
  '/api/employees',
  '/api/lms',
  '/api/admin',
  '/api/graduates',
  '/api/lessons',
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

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

  // Handle CORS for Student App API routes
  const isStudentApi = pathname.startsWith('/api/student') || pathname.startsWith('/api/auth/student-login');
  if (isStudentApi) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }
  }

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

  const response = NextResponse.next();
  if (isStudentApi) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/branches/:path*',
    '/marketing/:path*',
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
    '/employees/:path*',
    '/lms/:path*',
    '/shop/:path*',
    '/events/:path*',
    '/graduates/:path*',
    '/api/branches/:path*',
    '/api/marketing/:path*',
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
    '/api/employees/:path*',
    '/api/lms/:path*',
    '/api/admin/:path*',
    '/api/graduates/:path*',
    '/api/lessons/:path*',
    '/api/student/:path*',
    '/api/auth/student-login',
  ],
};

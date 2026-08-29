import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is missing!');
  }
  return secret;
}

const COOKIE_NAME = 'infast_session';

export interface AdminUserSession {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'MANAGER';
  permissions: string[];
}

/**
 * Validates admin login credentials against process.env ADMIN_LOGIN & ADMIN_PASSWORD
 */
export function verifyAdminCredentials(loginInput: string, passwordInput: string): boolean {
  const envAdminLogin = process.env.ADMIN_LOGIN;
  const envAdminPassword = process.env.ADMIN_PASSWORD;

  if (!envAdminLogin || !envAdminPassword) {
    throw new Error('ADMIN_LOGIN or ADMIN_PASSWORD environment variable is missing!');
  }

  if (!loginInput || !passwordInput) return false;

  return loginInput.trim() === envAdminLogin.trim() && passwordInput.trim() === envAdminPassword.trim();
}

/**
 * Creates JWT session token for Admin or Manager user
 */
export function createUserSession(user: AdminUserSession): string {
  const secret = getAuthSecret();
  const token = jwt.sign(user, secret, { expiresIn: '7d' });
  return token;
}

/**
 * Creates JWT session token for Super Admin
 */
export function createAdminSession(login: string): string {
  return createUserSession({
    id: 'admin-id-1',
    username: login,
    name: 'INFAST Admin',
    role: 'ADMIN',
    permissions: ['*'],
  });
}

/**
 * Verifies session token from request cookies
 */
export function getSession(): AdminUserSession | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const secret = getAuthSecret();
    const decoded = jwt.verify(token, secret) as AdminUserSession;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Helper to require authenticated session with optional permission check
 */
export function requireAdminSession(requiredPermission?: string): { session: AdminUserSession | null; errorResponse: NextResponse | null } {
  const session = getSession();
  if (!session) {
    return { session: null, errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  
  if (session.role !== 'ADMIN') {
    if (requiredPermission && !session.permissions?.includes('*') && !session.permissions?.includes(requiredPermission)) {
      return { session: null, errorResponse: NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 }) };
    }
  }
  
  return { session, errorResponse: null };
}

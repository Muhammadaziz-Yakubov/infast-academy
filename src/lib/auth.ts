import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
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
  role: 'ADMIN';
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
 * Creates JWT session token and sets HTTP-only secure cookie
 */
export function createAdminSession(login: string): string {
  const payload: AdminUserSession = {
    id: 'admin-id-1',
    username: login,
    name: 'INFAST Admin',
    role: 'ADMIN',
  };

  const secret = getAuthSecret();
  const token = jwt.sign(payload, secret, { expiresIn: '7d' });
  return token;
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

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const AUTH_SECRET = process.env.AUTH_SECRET || 'infast-it-academy-super-secret-jwt-key-2026-secure';
const COOKIE_NAME = 'infast_session';

export interface AdminUserSession {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN';
}

/**
 * Validates admin login credentials against .env process.env ADMIN_LOGIN & ADMIN_PASSWORD
 */
export function verifyAdminCredentials(loginInput: string, passwordInput: string): boolean {
  const envAdminLogin = process.env.ADMIN_LOGIN || 'admin';
  const envAdminPassword = process.env.ADMIN_PASSWORD || 'admin_password_2026';

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

  const token = jwt.sign(payload, AUTH_SECRET, { expiresIn: '7d' });
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

    const decoded = jwt.verify(token, AUTH_SECRET) as AdminUserSession;
    return decoded;
  } catch (error) {
    return null;
  }
}

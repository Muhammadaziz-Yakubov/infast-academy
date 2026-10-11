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
  branchId?: string;
  permissions: string[];
}

export interface StudentUserSession {
  id: string; // studentId
  phone: string;
  firstName: string;
  lastName: string;
  courseId: string;
  groupId: string;
  branchId: string;
  role: 'STUDENT';
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
  * Creates JWT session token for Student
  */
export function createStudentSession(student: StudentUserSession): string {
  const secret = getAuthSecret();
  const token = jwt.sign(student, secret, { expiresIn: '30d' });
  return token;
}

/**
 * Verifies student token from Authorization Bearer header or cookies
 */
export function getStudentSession(authHeader?: string | null): StudentUserSession | null {
  try {
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      const cookieStore = cookies();
      token = cookieStore.get('infast_student_session')?.value || '';
    }

    if (!token) return null;

    const secret = getAuthSecret();
    const decoded = jwt.verify(token, secret) as StudentUserSession;
    if (decoded.role !== 'STUDENT') return null;
    return decoded;
  } catch {
    return null;
  }
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
 * Helper to get MongoDB branch filter based on user role & requested branchId
 */
export function getBranchFilter(
  session: AdminUserSession,
  queryBranchId?: string | null
): { filter: Record<string, any>; error?: string } {
  if (session.role === 'ADMIN') {
    if (queryBranchId && queryBranchId !== 'ALL' && queryBranchId !== 'undefined' && queryBranchId !== 'null') {
      return { filter: { branchId: queryBranchId } };
    }
    return { filter: {} };
  }

  // MANAGER role
  if (!session.branchId) {
    // If manager has no assigned branch, restrict to empty/null
    return { filter: { branchId: null } };
  }

  // If manager tries to request a different specific branchId, deny access
  if (queryBranchId && queryBranchId !== 'ALL' && queryBranchId !== 'undefined' && queryBranchId !== 'null' && queryBranchId !== session.branchId.toString()) {
    return { filter: {}, error: 'Siz faqat o\'zingizga biriktirilgan filial ma\'lumotlariga kira olasiz' };
  }

  return { filter: { branchId: session.branchId } };
}

/**
 * Checks if a session has a given permission
 */
export function hasPermission(session: AdminUserSession, permission?: string): boolean {
  if (session.role === 'ADMIN') return true;
  if (!permission) return false;
  if (session.permissions?.includes('*')) return true;
  return session.permissions?.includes(permission) || false;
}

/**
 * Helper to require authenticated session with strict permission check.
 * If requiredPermission is provided, checks if user has that permission (or is ADMIN with '*').
 * If requiredPermission is not provided, strictly requires ADMIN role.
 */
export function requireAdminSession(requiredPermission?: string): { session: AdminUserSession | null; errorResponse: NextResponse | null } {
  const session = getSession();
  if (!session) {
    return { session: null, errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  
  if (requiredPermission) {
    if (!hasPermission(session, requiredPermission)) {
      return {
        session: null,
        errorResponse: NextResponse.json(
          { error: `Ushbu amalni bajarish uchun "${requiredPermission}" ruxsati talab qilinadi` },
          { status: 403 }
        ),
      };
    }
  } else {
    if (session.role !== 'ADMIN') {
      return {
        session: null,
        errorResponse: NextResponse.json(
          { error: 'Faqat Super Admin (Bosh Administrator) kirishi mumkin' },
          { status: 403 }
        ),
      };
    }
  }
  
  return { session, errorResponse: null };
}

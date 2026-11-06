import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { requireAdminSession, getBranchFilter } from '@/lib/auth';

/**
 * Generates a cryptographically random string with no ambiguous characters (no 0, O, o, 1, l, I).
 */
function generateRandomPassword(length = 10): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
  const bytes = crypto.randomBytes(length * 2);
  let result = '';
  for (let i = 0; i < bytes.length && result.length < length; i++) {
    const charIndex = bytes[i] % chars.length;
    result += chars[charIndex];
  }
  return result;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { session, errorResponse } = requireAdminSession('students');
    if (errorResponse) {
      return errorResponse;
    }
    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const { id } = params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: "Talaba ID ko'rsatilmadi" }, { status: 400 });
    }

    await connectToDatabase();

    const branchFilter = getBranchFilter(session, null);
    if (branchFilter.error) {
      return NextResponse.json({ error: branchFilter.error }, { status: 403 });
    }

    const student = await Student.findOne({ _id: id, ...branchFilter.filter });
    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    const plainPassword = generateRandomPassword(10);
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    student.passwordHash = passwordHash;
    await student.save();

    // Plain password returned ONCE in response
    return NextResponse.json({
      success: true,
      password: plainPassword,
      message: "Yangi vaqtinchalik parol yaratildi",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

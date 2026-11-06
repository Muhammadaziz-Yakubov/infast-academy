import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { getStudentSession } from '@/lib/auth';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Amaldagi parolni kiriting"),
  newPassword: z.string().min(8, "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak"),
});

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const session = getStudentSession(authHeader);

    if (!session || session.role !== 'STUDENT') {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = changePasswordSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors[0]?.message || "Ma'lumotlar noto'g'ri kiritildi";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { currentPassword, newPassword } = parseResult.data;

    await connectToDatabase();

    const student = await Student.findById(session.id);
    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    // Verify current password
    if (!student.passwordHash) {
      return NextResponse.json(
        { error: "Akkauntda parol o'rnatilmagan. Administratorga murojaat qiling." },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, student.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Amaldagi parol noto'g'ri kiritildi" },
        { status: 400 }
      );
    }

    // Hash and save new password
    const newHash = await bcrypt.hash(newPassword, 10);
    student.passwordHash = newHash;
    await student.save();

    return NextResponse.json({
      success: true,
      message: "Parol muvaffaqiyatli o'zgartirildi",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

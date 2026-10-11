import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { getStudentSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const session = getStudentSession(authHeader);

    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { avatarUrl, currentPassword, newPassword } = body;

    const student = await Student.findById(session.id);
    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    // 1. Update Avatar if provided
    if (avatarUrl !== undefined) {
      student.avatarUrl = avatarUrl;
    }

    // 2. Change password if requested
    if (newPassword) {
      if (newPassword.length < 4) {
        return NextResponse.json(
          { error: "Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak" },
          { status: 400 }
        );
      }

      // If student already has a passwordHash, verify current password
      if (student.passwordHash) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: "Amaldagi parolni kiriting" },
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
      }

      const salt = await bcrypt.genSalt(10);
      student.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    await student.save();

    return NextResponse.json({
      success: true,
      message: newPassword ? "Parol va ma'lumotlar muvaffaqiyatli yangilandi" : "Profil yangilandi",
      student: {
        id: student._id.toString(),
        studentCode: student.studentCode,
        firstName: student.firstName,
        lastName: student.lastName,
        phone: student.phone,
        avatarUrl: student.avatarUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Profilni yangilashda xatolik" },
      { status: 500 }
    );
  }
}

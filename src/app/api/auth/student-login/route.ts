import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { createStudentSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, username, login, password } = body;
    const rawIdentifier = (phone || username || login || '').toString().trim();

    if (!rawIdentifier || !password) {
      return NextResponse.json({ error: "Telefon raqami (yoki Talaba ID) va parolni kiriting" }, { status: 400 });
    }

    await connectToDatabase();

    const cleanIdentifier = rawIdentifier.replace(/\s+/g, '');
    const cleanDigits = cleanIdentifier.replace(/\D/g, '');

    const student = await Student.findOne({
      $or: [
        { phone: cleanIdentifier },
        ...(cleanDigits ? [{ phone: cleanDigits }, { phone: `+${cleanDigits}` }] : []),
        { studentCode: cleanIdentifier.toUpperCase() },
      ],
      status: { $in: ['ACTIVE', 'PAUSED'] },
    })
      .populate('courseId', 'name price')
      .populate('groupId', 'name schedules')
      .populate('branchId', 'name code address phone');

    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi yoki hisob faol emas" }, { status: 401 });
    }

    // Default password '12345678' works automatically for everyone
    const isGlobalDefaultPassword = password === '12345678';
    let isPasswordValid = false;

    if (isGlobalDefaultPassword) {
      isPasswordValid = true;
    } else if (student.passwordHash) {
      isPasswordValid = await bcrypt.compare(password, student.passwordHash);
    } else {
      const defaultPassword = student.studentCode || cleanIdentifier.slice(-6);
      isPasswordValid = password === defaultPassword || password === '123456' || password === '12345678';
    }

    if (isPasswordValid && !student.passwordHash) {
      student.passwordHash = await bcrypt.hash(password, 10);
      await student.save();
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Telefon raqami yoki parol noto'g'ri" }, { status: 401 });
    }

    const token = createStudentSession({
      id: student._id.toString(),
      phone: student.phone,
      firstName: student.firstName,
      lastName: student.lastName,
      courseId: (student.courseId as any)?._id?.toString() || (student.courseId as any)?.toString(),
      groupId: (student.groupId as any)?._id?.toString() || (student.groupId as any)?.toString(),
      branchId: (student.branchId as any)?._id?.toString() || (student.branchId as any)?.toString(),
      role: 'STUDENT',
    });

    const studentProfile = {
      id: student._id,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
      avatarUrl: student.avatarUrl,
      bio: student.bio,
      status: student.status,
      course: student.courseId,
      group: student.groupId,
      branch: student.branchId,
      joinedDate: student.joinedDate,
    };

    const response = NextResponse.json({
      success: true,
      message: "Muvaffaqiyatli tizimga kirildi",
      token,
      student: studentProfile,
    });

    // Set HTTP-only cookie for web/browser compatibility as well
    response.cookies.set({
      name: 'infast_student_session',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Tizimga kirishda xatolik yuz berdi" }, { status: 500 });
  }
}

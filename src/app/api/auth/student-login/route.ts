import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { calculatePaymentPeriods } from '@/lib/calculations';
import { createStudentSession } from '@/lib/auth';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';
import bcrypt from 'bcryptjs';

const GENERIC_LOGIN_ERROR = "Telefon raqami yoki parol noto'g'ri";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, username, login, password } = body;
    const rawIdentifier = (phone || username || login || '').toString().trim();

    if (!rawIdentifier || !password) {
      return NextResponse.json({ error: "Telefon raqami (yoki Talaba ID) va parolni kiriting" }, { status: 400 });
    }

    const cleanIdentifier = rawIdentifier.replace(/\s+/g, '');
    const cleanDigits = cleanIdentifier.replace(/\D/g, '');

    // Rate limiting: 20 per 15 min per IP + 5 per 15 min per IP+identifier
    const clientIp = getClientIp(request);
    const ipLimiter = await checkRateLimit(`student-login-ip:${clientIp}`, 20, 15 * 60 * 1000);
    if (!ipLimiter.success && ipLimiter.response) {
      return ipLimiter.response;
    }

    const idLimiter = await checkRateLimit(
      `student-login-id:${clientIp}:${cleanIdentifier.toLowerCase()}`,
      5,
      15 * 60 * 1000
    );
    if (!idLimiter.success && idLimiter.response) {
      return idLimiter.response;
    }

    await connectToDatabase();

    const student = await Student.findOne({
      $or: [
        { phone: cleanIdentifier },
        ...(cleanDigits ? [{ phone: cleanDigits }, { phone: `+${cleanDigits}` }] : []),
        { studentCode: cleanIdentifier.toUpperCase() },
      ],
      status: { $in: ['ACTIVE', 'PAUSED', 'QARZDOR', 'BLOCKED', 'BLOCK'] },
    })
      .populate('courseId', 'name price')
      .populate('groupId', 'name schedules')
      .populate('branchId', 'name code address phone');

    if (!student) {
      return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
    }

    // Login succeeds only if student.passwordHash exists and bcrypt.compare passes
    if (!student.passwordHash) {
      return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, student.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
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

    // Calculate real-time payment / debtor status
    const studentPayments = await Payment.find({ studentId: student._id }).lean();
    const totalPaid = studentPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const fee = student.monthlyFee || (student.courseId as any)?.price || 0;
    const paymentInfo = calculatePaymentPeriods(
      student.joinedDate,
      fee,
      student.paymentDueDay || 5,
      totalPaid
    );

    let effectiveStatus = student.status;
    if (paymentInfo.paymentStatus === 'OVERDUE' && student.status === 'ACTIVE') {
      effectiveStatus = 'BLOCKED';
      await Student.findByIdAndUpdate(student._id, { status: 'BLOCKED' });
    }

    const isDebtor =
      effectiveStatus === 'BLOCKED' ||
      effectiveStatus === 'BLOCK' ||
      effectiveStatus === 'QARZDOR' ||
      paymentInfo.paymentStatus === 'OVERDUE' ||
      (paymentInfo.totalDebt > 0);

    const studentProfile = {
      id: student._id,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
      avatarUrl: student.avatarUrl,
      bio: student.bio,
      status: effectiveStatus,
      originalStatus: student.status,
      paymentStatus: paymentInfo.paymentStatus,
      totalDebt: paymentInfo.totalDebt,
      isDebtor: isDebtor,
      course: student.courseId,
      group: student.groupId,
      branch: student.branchId,
      joinedDate: student.joinedDate,
      monthlyFee: fee,
      paymentDueDay: student.paymentDueDay,
    };

    const response = NextResponse.json({
      success: true,
      message: "Muvaffaqiyatli tizimga kirildi",
      token,
      student: studentProfile,
    });

    // Set HTTP-only cookie
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
    console.error("Student login error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { calculatePaymentPeriods } from '@/lib/calculations';
import { rateLimit } from '@/lib/rateLimit';
import { escapeRegex } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const GENERIC_NOT_FOUND = "Ma'lumot topilmadi";

export async function GET(request: NextRequest) {
  try {
    const limiter = await rateLimit(request, 10, 60 * 1000);
    if (!limiter.success && limiter.response) {
      return limiter.response;
    }

    const { searchParams } = new URL(request.url);
    const rawCode = (searchParams.get('code') || searchParams.get('studentCode') || '').trim();
    const phoneLast4 = (searchParams.get('phoneLast4') || '').trim().replace(/\D/g, '');

    // Require BOTH code and phoneLast4 (must be exactly 4 digits)
    if (!rawCode || rawCode.length > 50 || phoneLast4.length !== 4) {
      return NextResponse.json({ error: GENERIC_NOT_FOUND }, { status: 404 });
    }

    await connectToDatabase();

    const cleanCode = escapeRegex(rawCode.toUpperCase());
    const numericPart = cleanCode.replace(/\D/g, '');

    const student = await Student.findOne({
      $or: [
        { studentCode: cleanCode },
        { studentCode: `INF-${cleanCode}` },
        ...(numericPart ? [{ studentCode: `INF-${numericPart}` }] : []),
      ],
    })
      .populate('courseId', 'name price')
      .populate('groupId', 'name');

    if (!student) {
      return NextResponse.json({ error: GENERIC_NOT_FOUND }, { status: 404 });
    }

    // Verify phoneLast4 matches student's phone
    const studentPhoneDigits = (student.phone || '').replace(/\D/g, '');
    if (!studentPhoneDigits.endsWith(phoneLast4)) {
      return NextResponse.json({ error: GENERIC_NOT_FOUND }, { status: 404 });
    }

    const payments = await Payment.find({ studentId: student._id });
    const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const fee = student.monthlyFee || (student.courseId as any)?.price || 0;
    const paymentInfo = calculatePaymentPeriods(student.joinedDate, fee, student.paymentDueDay || 5, totalPaid);

    // Return only: first name + last-name initial, courseName, groupName, paymentStatus
    const lastNameInitial = student.lastName ? ` ${student.lastName[0]}.` : '';
    const safeDisplayName = `${student.firstName}${lastNameInitial}`.trim();

    return NextResponse.json({
      success: true,
      student: {
        name: safeDisplayName,
        courseName: (student.courseId as any)?.name || '-',
        groupName: (student.groupId as any)?.name || '-',
        paymentStatus: paymentInfo.paymentStatus,
      },
    });
  } catch (error: any) {
    console.error("Public student lookup error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

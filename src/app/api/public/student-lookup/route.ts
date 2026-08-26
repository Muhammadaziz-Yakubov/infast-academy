import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { calculateCourseMonth, calculatePaymentPeriods } from '@/lib/calculations';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const rawCode = searchParams.get('code') || searchParams.get('studentCode') || searchParams.get('query') || '';

    if (!rawCode) {
      return NextResponse.json({ error: "Talaba kodi (ID) kiritilmadi" }, { status: 400 });
    }

    const cleanCode = rawCode.trim().toUpperCase();
    const numericPart = cleanCode.replace(/\D/g, ''); // e.g. "1001" from "INF-1001"

    // Search by exact code, or formatted INF-xxx, or regex
    const student = await Student.findOne({
      $or: [
        { studentCode: cleanCode },
        { studentCode: `INF-${cleanCode}` },
        { studentCode: `INF-${numericPart}` },
        { phone: cleanCode },
      ],
    })
      .populate('courseId', 'name price')
      .populate('groupId', 'name');

    if (!student) {
      return NextResponse.json({ error: `Code: ${cleanCode} bo'yicha talaba topilmadi` }, { status: 404 });
    }

    const payments = await Payment.find({ studentId: student._id });
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

    const fee = student.monthlyFee || (student.courseId as any)?.price || 0;
    const monthInfo = calculateCourseMonth(student.joinedDate);
    const paymentInfo = calculatePaymentPeriods(student.joinedDate, fee, student.paymentDueDay || 5, totalPaid);

    return NextResponse.json({
      success: true,
      student: {
        id: student._id,
        studentCode: student.studentCode,
        fullName: `${student.firstName} ${student.lastName}`,
        firstName: student.firstName,
        lastName: student.lastName,
        phone: student.phone,
        courseName: (student.courseId as any)?.name || '-',
        groupName: (student.groupId as any)?.name || '-',
        monthlyFee: fee,
        paymentStatus: paymentInfo.paymentStatus,
        totalDebt: paymentInfo.totalDebt,
        totalPaid: totalPaid,
        currentCourseMonth: monthInfo.label,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xatolik yuz berdi" }, { status: 500 });
  }
}

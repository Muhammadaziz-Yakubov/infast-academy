import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { Attendance } from '@/models/Attendance';
import { ExamResult } from '@/models/ExamResult';
import { Exam } from '@/models/Exam';
import { calculateCourseMonth, calculatePaymentPeriods } from '@/lib/calculations';

import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const student = await Student.findById(params.id)
      .populate('courseId', 'name price durationMonths')
      .populate('groupId', 'name room schedules');

    if (!student) {
      return NextResponse.json({ error: "Talaba topilmadi" }, { status: 404 });
    }

    const payments = await Payment.find({ studentId: params.id }).sort({ paymentDate: -1 });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const fee = student.monthlyFee || (student.courseId as any)?.price || 0;
    const monthInfo = calculateCourseMonth(student.joinedDate);
    const paymentInfo = calculatePaymentPeriods(student.joinedDate, fee, student.paymentDueDay || 5, totalPaid);

    // Attendance stats
    const attendances = await Attendance.find({ studentId: params.id }).sort({ date: -1 });
    const totalAttendanceCount = attendances.length;
    const presentCount = attendances.filter((a) => a.status === 'PRESENT').length;
    const attendancePercentage = totalAttendanceCount > 0 ? Math.round((presentCount / totalAttendanceCount) * 100) : 100;

    // Exam results
    const examResults = await ExamResult.find({ studentId: params.id })
      .populate({
        path: 'examId',
        select: 'name examDate maxScore passingScore',
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      student: {
        ...student.toObject(),
        currentCourseMonth: monthInfo.label,
        effectiveFee: fee,
        paymentStatus: paymentInfo.paymentStatus,
        totalDebt: paymentInfo.totalDebt,
        totalPaid,
        periods: paymentInfo.periods,
        nextPaymentDueDate: paymentInfo.nextPaymentDueDate,
      },
      payments,
      attendances,
      attendanceStats: {
        total: totalAttendanceCount,
        present: presentCount,
        absent: totalAttendanceCount - presentCount,
        percentage: attendancePercentage,
      },
      exams: examResults,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    function parseDateSafely(val: any): Date | undefined {
      if (!val) return undefined;
      if (typeof val === 'string' && val.trim() === '') return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    }

    const updateData: any = { ...body };
    if ('birthDate' in body) {
      updateData.birthDate = parseDateSafely(body.birthDate);
    }
    if ('joinedDate' in body && body.joinedDate) {
      const jd = parseDateSafely(body.joinedDate);
      if (jd) updateData.joinedDate = jd;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    if (!updatedStudent) {
      return NextResponse.json({ error: "Talaba topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Tahrirlashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    await Student.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Talaba o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "O'chirishda xatolik" }, { status: 500 });
  }
}

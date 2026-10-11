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
      .populate('groupId', 'name room schedules')
      .populate('branchId', 'name code');

    if (!student) {
      return NextResponse.json({ error: "Talaba topilmadi" }, { status: 404 });
    }

    // MANAGER can only view students from their own branch
    if (session.role === 'MANAGER') {
      if (!session.branchId || !student.branchId || (student.branchId as any)._id?.toString() !== session.branchId.toString() && student.branchId.toString() !== session.branchId.toString()) {
        return NextResponse.json({ error: "Siz faqat o'z filialingiz talabasi ma'lumotlarini ko'ra olasiz" }, { status: 403 });
      }
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

    if (session.role === 'ADMIN') {
      return NextResponse.json(
        { error: "Super admin o'quvchi ma'lumotlarini tahrirlay olmaydi. Bu harakat menejerga topshirilgan." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const existingStudent = await Student.findById(params.id);
    if (!existingStudent) {
      return NextResponse.json({ error: "Talaba topilmadi" }, { status: 404 });
    }

    // MANAGER can only edit students from their own branch
    if (session.role === 'MANAGER') {
      if (!session.branchId || !existingStudent.branchId || existingStudent.branchId.toString() !== session.branchId.toString()) {
        return NextResponse.json({ error: "Siz faqat o'z filialingiz talabasini tahrirlashingiz mumkin" }, { status: 403 });
      }
    }

    const body = await request.json();

    function parseDateSafely(val: any): Date | undefined {
      if (!val) return undefined;
      if (typeof val === 'string' && val.trim() === '') return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    }

    const updateData: any = { ...body };
    // Branch transfers must only be done through the transfer API
    delete updateData.branchId;

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

    if (session.role === 'ADMIN') {
      return NextResponse.json(
        { error: "Super admin o'quvchini o'chira olmaydi. Bu harakat menejerga topshirilgan." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const existingStudent = await Student.findById(params.id);
    if (!existingStudent) {
      return NextResponse.json({ error: "Talaba topilmadi" }, { status: 404 });
    }

    // MANAGER can only delete students from their own branch
    if (session.role === 'MANAGER') {
      if (!session.branchId || !existingStudent.branchId || existingStudent.branchId.toString() !== session.branchId.toString()) {
        return NextResponse.json({ error: "Siz faqat o'z filialingiz talabasini o'chira olasiz" }, { status: 403 });
      }
    }

    await Student.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Talaba o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "O'chirishda xatolik" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { Attendance } from '@/models/Attendance';
import { Exam } from '@/models/Exam';
import { ExamResult } from '@/models/ExamResult';
import { calculateCourseMonth, calculatePaymentPeriods } from '@/lib/calculations';

import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Student Breakdown
    const totalStudents = await Student.countDocuments({});
    const activeStudents = await Student.countDocuments({ status: 'ACTIVE' });
    const pausedStudents = await Student.countDocuments({ status: 'PAUSED' });
    const completedStudents = await Student.countDocuments({ status: 'COMPLETED' });
    const leftStudents = await Student.countDocuments({ status: 'LEFT' });

    // 2. Payments Breakdown & Total Debt Calculation
    const allPayments = await Payment.find({});
    const totalPaymentsSum = allPayments.reduce((sum, p) => sum + p.amount, 0);

    const activeSt = await Student.find({ status: 'ACTIVE' }).populate('courseId', 'price');
    const studentIds = activeSt.map((s) => s._id);
    const studentPayments = await Payment.find({ studentId: { $in: studentIds } });

    const paidMap = new Map<string, number>();
    studentPayments.forEach((p) => {
      const sId = p.studentId.toString();
      paidMap.set(sId, (paidMap.get(sId) || 0) + p.amount);
    });

    let calculatedTotalDebt = 0;
    activeSt.forEach((s) => {
      const fee = s.monthlyFee || (s.courseId as any)?.price || 0;
      const totalPaid = paidMap.get(s._id.toString()) || 0;
      const pInfo = calculatePaymentPeriods(s.joinedDate, fee, s.paymentDueDay || 5, totalPaid);
      calculatedTotalDebt += pInfo.totalDebt;
    });

    // 3. Attendance Breakdown
    const allAttendances = await Attendance.find({});
    const totalAttCount = allAttendances.length;
    const presentAttCount = allAttendances.filter((a) => a.status === 'PRESENT').length;
    const overallAttRate = totalAttCount > 0 ? Math.round((presentAttCount / totalAttCount) * 100) : 100;

    // 4. Exams Breakdown
    const totalExams = await Exam.countDocuments({});
    const allExamResults = await ExamResult.find({});
    const passedExams = allExamResults.filter((r) => r.status === 'PASSED').length;
    const failedExams = allExamResults.filter((r) => r.status === 'FAILED').length;
    const absentExams = allExamResults.filter((r) => r.status === 'ABSENT').length;

    const scoredResults = allExamResults.filter((r) => r.score !== null && r.score !== undefined);
    const avgExamScore = scoredResults.length > 0
      ? Math.round(scoredResults.reduce((sum, r) => sum + (r.score || 0), 0) / scoredResults.length)
      : 0;

    return NextResponse.json({
      students: {
        total: totalStudents,
        active: activeStudents,
        paused: pausedStudents,
        completed: completedStudents,
        left: leftStudents,
      },
      payments: {
        totalRevenue: totalPaymentsSum,
        totalDebt: calculatedTotalDebt,
      },
      attendance: {
        totalRecords: totalAttCount,
        presentRecords: presentAttCount,
        absentRecords: totalAttCount - presentAttCount,
        overallPercentage: overallAttRate,
      },
      exams: {
        totalExams,
        totalResults: allExamResults.length,
        passed: passedExams,
        failed: failedExams,
        absent: absentExams,
        averageScore: avgExamScore,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Hisobotlarni yuklashda xatolik" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { Notification } from '@/models/Notification';
import { calculatePaymentPeriods } from '@/lib/calculations';

import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const students = await Student.find({ status: 'ACTIVE' }).populate('courseId', 'price');
    const studentIds = students.map((s) => s._id);

    const payments = await Payment.find({ studentId: { $in: studentIds } });

    // Map total paid per student
    const paidMap = new Map<string, number>();
    payments.forEach((p) => {
      const sId = p.studentId.toString();
      paidMap.set(sId, (paidMap.get(sId) || 0) + p.amount);
    });

    let overdueCount = 0;
    let pendingCount = 0;
    let paidCount = 0;

    for (const student of students) {
      const fee = student.monthlyFee || (student.courseId as any)?.price || 0;
      const totalPaid = paidMap.get(student._id.toString()) || 0;

      const paymentInfo = calculatePaymentPeriods(
        student.joinedDate,
        fee,
        student.paymentDueDay || 5,
        totalPaid
      );

      if (paymentInfo.paymentStatus === 'OVERDUE') {
        overdueCount++;
      } else if (paymentInfo.paymentStatus === 'PARTIAL') {
        pendingCount++;
      } else {
        paidCount++;
      }
    }

    // Record notification in system center
    await Notification.create({
      title: "🔄 To'lovlar tekshirildi",
      message: `Tizimdagi barcha talabalarning to'lov sanalari qayta tekshirildi. ${overdueCount} ta qarzdor, ${pendingCount} ta kutilmoqda, ${paidCount} ta to'langan.`,
      type: overdueCount > 0 ? "WARNING" : "INFO",
    });

    return NextResponse.json({
      success: true,
      message: `Tekshiruv yakunlandi: ${overdueCount} ta Qarzdor, ${pendingCount} ta Kutilmoqda, ${paidCount} ta To'langan.`,
      counts: {
        total: students.length,
        overdue: overdueCount,
        pending: pendingCount,
        paid: paidCount,
      },
    });
  } catch (error: any) {
    console.error("Check Payments Error:", error);
    return NextResponse.json({ error: error.message || "To'lovlarni tekshirishda xatolik" }, { status: 500 });
  }
}

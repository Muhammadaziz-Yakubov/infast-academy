import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Payment } from '@/models/Payment';
import { Student } from '@/models/Student';
import { Notification } from '@/models/Notification';
import { formatMoneyUz } from '@/lib/utils';
import { format } from 'date-fns';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { studentIds, customAmount, paymentMethod, paymentDate, notes } = body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: "Kamida bitta talabani tanlang" }, { status: 400 });
    }

    const students = await Student.find({ _id: { $in: studentIds } }).populate('courseId', 'price');
    if (students.length === 0) {
      return NextResponse.json({ error: "Tanlangan talabalar topilmadi" }, { status: 404 });
    }

    const today = new Date();
    const pDate = paymentDate ? new Date(paymentDate) : today;
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const paymentsToCreate = [];
    let totalBatchAmount = 0;

    for (const student of students) {
      const fee = customAmount ? Number(customAmount) : (student.monthlyFee || (student.courseId as any)?.price || 0);

      paymentsToCreate.push({
        studentId: student._id,
        amount: fee,
        paymentDate: pDate,
        periodStartDate: periodStart,
        periodEndDate: periodEnd,
        paymentMethod: paymentMethod || "CASH",
        notes: notes ? notes.trim() : "Ommaviy to'lov (Bulk Payment)",
      });

      totalBatchAmount += fee;
    }

    await Payment.insertMany(paymentsToCreate);

    // Create Notification
    await Notification.create({
      title: "🟢 Ommaviy to'lov qabul qilindi",
      message: `${students.length} ta talaba uchun jami ${formatMoneyUz(totalBatchAmount)} to'lov qabul qilindi.`,
      type: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `${students.length} ta talaba uchun to'lov saqlandi`,
      count: students.length,
      totalAmount: totalBatchAmount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Ommaviy to'lovni saqlashda xatolik" }, { status: 500 });
  }
}

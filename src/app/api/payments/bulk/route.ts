import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Payment } from '@/models/Payment';
import { Student } from '@/models/Student';
import { Notification } from '@/models/Notification';
import { formatMoneyUz } from '@/lib/utils';
import { format } from 'date-fns';

import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'ADMIN') {
      return NextResponse.json(
        { error: "Super admin to'lov qabul qila olmaydi. To'lov qabul qilish menejerga topshirilgan." },
        { status: 403 }
      );
    }

    if (session.role === 'MANAGER' && !session.branchId) {
      return NextResponse.json(
        { error: "Sizga filial biriktirilmagan. To'lov qabul qila olmaysiz." },
        { status: 403 }
      );
    }

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

    if (students.length !== studentIds.length) {
      return NextResponse.json({ error: "Ayrim talabalar bazadan topilmadi" }, { status: 400 });
    }

    // Verify all students belong to the authorized manager branch
    if (session.role === 'MANAGER' && session.branchId) {
      const foreignStudent = students.find(
        (s) => !s.branchId || s.branchId.toString() !== session.branchId!.toString()
      );
      if (foreignStudent) {
        return NextResponse.json(
          {
            error: `Siz faqat o'z filialingiz talabalari uchun to'lov qabul qila olasiz. "${foreignStudent.firstName} ${foreignStudent.lastName}" boshqa filialga tegishli.`,
          },
          { status: 403 }
        );
      }
    }

    const today = new Date();
    const pDate = paymentDate ? new Date(paymentDate) : today;
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const paymentsToCreate = [];
    let totalBatchAmount = 0;

    for (const student of students) {
      const fee = customAmount ? Number(customAmount) : (student.monthlyFee || (student.courseId as any)?.price || 0);
      const studentBranchId = student.branchId || session.branchId;

      paymentsToCreate.push({
        studentId: student._id,
        branchId: studentBranchId,
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
      branchId: session.branchId,
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

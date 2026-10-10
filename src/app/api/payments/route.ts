import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Payment } from '@/models/Payment';
import { Student } from '@/models/Student';
import { Notification } from '@/models/Notification';
import { formatMoneyUz } from '@/lib/utils';

import { getSession, getBranchFilter } from '@/lib/auth';
import { Branch } from '@/models/Branch';

export async function GET(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const branchIdParam = searchParams.get('branchId');

    const branchAccess = getBranchFilter(session, branchIdParam);
    if (branchAccess.error) {
      return NextResponse.json({ error: branchAccess.error }, { status: 403 });
    }

    let query: any = { ...branchAccess.filter };
    if (studentId) query.studentId = studentId;

    const payments = await Payment.find(query)
      .populate({
        path: 'studentId',
        select: 'firstName lastName phone courseId groupId branchId',
        populate: [
          { path: 'courseId', select: 'name' },
          { path: 'groupId', select: 'name' },
          { path: 'branchId', select: 'name code' },
        ],
      })
      .populate('branchId', 'name code')
      .sort({ paymentDate: -1 });

    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "To'lovlarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const { studentId, amount, paymentDate, periodStartDate, periodEndDate, paymentMethod, notes, branchId } = body;

    if (!studentId || !amount || !periodStartDate || !periodEndDate) {
      return NextResponse.json({ error: "Barcha majburiy maydonlarni kiriting" }, { status: 400 });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Talaba topilmadi" }, { status: 404 });
    }

    // Determine branchId for payment: body.branchId || student.branchId || session.branchId
    let paymentBranchId = branchId || student.branchId;
    if (!paymentBranchId) {
      if (session.branchId) {
        paymentBranchId = session.branchId;
      } else {
        const defaultBranch = await Branch.findOne({ status: 'active' });
        paymentBranchId = defaultBranch?._id;
      }
    }

    if (session.role === 'MANAGER' && session.branchId) {
      if (paymentBranchId && paymentBranchId.toString() !== session.branchId.toString()) {
        return NextResponse.json({ error: "Siz faqat o'z filialingiz talabasi uchun to'lov kiritishingiz mumkin" }, { status: 403 });
      }
    }

    const payment = await Payment.create({
      studentId,
      branchId: paymentBranchId,
      amount: Number(amount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      periodStartDate: new Date(periodStartDate),
      periodEndDate: new Date(periodEndDate),
      paymentMethod: paymentMethod || "CASH",
      notes,
    });

    // Create Notification in Notification Center
    await Notification.create({
      title: "🟢 To'lov qabul qilindi",
      message: `${student.firstName} ${student.lastName} dan ${formatMoneyUz(amount)} to'lov qabul qilindi.`,
      type: "SUCCESS",
      branchId: paymentBranchId,
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "To'lovni saqlashda xatolik" }, { status: 500 });
  }
}

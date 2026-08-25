import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Course } from '@/models/Course';
import { Group } from '@/models/Group';
import { Payment } from '@/models/Payment';
import { calculateCourseMonth, calculatePaymentPeriods } from '@/lib/calculations';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const courseId = searchParams.get('courseId');
    const groupId = searchParams.get('groupId');
    const status = searchParams.get('status');
    const paymentStatusFilter = searchParams.get('paymentStatus');

    let query: any = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (courseId) query.courseId = courseId;
    if (groupId) query.groupId = groupId;
    if (status) query.status = status;

    const rawStudents = await Student.find(query)
      .populate('courseId', 'name price')
      .populate('groupId', 'name')
      .sort({ createdAt: -1 });

    const studentIds = rawStudents.map((s) => s._id);
    const payments = await Payment.find({ studentId: { $in: studentIds } });

    // Map total paid per student
    const paidMap = new Map<string, number>();
    payments.forEach((p) => {
      const sId = p.studentId.toString();
      paidMap.set(sId, (paidMap.get(sId) || 0) + p.amount);
    });

    const students = rawStudents.map((s) => {
      const sObj = s.toObject();
      const monthInfo = calculateCourseMonth(s.joinedDate);
      const fee = s.monthlyFee || (s.courseId as any)?.price || 0;
      const totalPaid = paidMap.get(s._id.toString()) || 0;

      const paymentInfo = calculatePaymentPeriods(s.joinedDate, fee, s.paymentDueDay || 5, totalPaid);

      return {
        ...sObj,
        currentCourseMonth: monthInfo.label,
        monthNumber: monthInfo.monthNumber,
        effectiveFee: fee,
        paymentStatus: paymentInfo.paymentStatus,
        totalDebt: paymentInfo.totalDebt,
        totalPaid,
      };
    });

    let filteredStudents = students;
    if (paymentStatusFilter) {
      filteredStudents = students.filter((s) => s.paymentStatus === paymentStatusFilter);
    }

    return NextResponse.json({ students: filteredStudents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Talabalarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      firstName,
      lastName,
      phone,
      parentPhone,
      birthDate,
      courseId,
      groupId,
      joinedDate,
      monthlyFee,
      paymentDueDay,
      status,
    } = body;

    if (!firstName || !lastName || !phone || !courseId || !groupId) {
      return NextResponse.json({ error: "Barcha majburiy maydonlarni to'ldiring" }, { status: 400 });
    }

    // Verify course & group exist
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Tanlangan kurs topilmadi" }, { status: 400 });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: "Tanlangan guruh topilmadi" }, { status: 400 });
    }

    function parseDateSafely(val: any): Date | undefined {
      if (!val) return undefined;
      if (typeof val === 'string' && val.trim() === '') return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    }

    const parsedBirthDate = parseDateSafely(birthDate);
    const parsedJoinedDate = parseDateSafely(joinedDate) || new Date();

    const newStudent = await Student.create({
      firstName,
      lastName,
      phone,
      parentPhone,
      birthDate: parsedBirthDate,
      courseId,
      groupId,
      joinedDate: parsedJoinedDate,
      monthlyFee: monthlyFee ? Number(monthlyFee) : undefined,
      paymentDueDay: paymentDueDay ? Number(paymentDueDay) : 5,
      status: status || "ACTIVE",
    });

    return NextResponse.json({ success: true, student: newStudent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Talaba qo'shishda xatolik" }, { status: 500 });
  }
}

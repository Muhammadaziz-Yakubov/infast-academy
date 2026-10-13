import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Course } from '@/models/Course';
import { Group } from '@/models/Group';
import { Payment } from '@/models/Payment';
import { calculateCourseMonth, calculatePaymentPeriods } from '@/lib/calculations';
import { generateNextStudentCode } from '@/lib/studentCode';
import { getSession, getBranchFilter } from '@/lib/auth';
import { escapeRegex } from '@/lib/utils';
import { Branch } from '@/models/Branch';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const courseId = searchParams.get('courseId');
    const groupId = searchParams.get('groupId');
    const branchIdParam = searchParams.get('branchId');
    const status = searchParams.get('status');
    const paymentStatusFilter = searchParams.get('paymentStatus');

    const branchAccess = getBranchFilter(session, branchIdParam);
    if (branchAccess.error) {
      return NextResponse.json({ error: branchAccess.error }, { status: 403 });
    }

    let query: any = { ...branchAccess.filter };

    if (search) {
      if (search.length > 100) {
        return NextResponse.json({ error: "Qidiruv so'rovi juda uzun (max 100 belgi)" }, { status: 400 });
      }
      const safeSearch = escapeRegex(search);
      query.$or = [
        { studentCode: { $regex: safeSearch, $options: 'i' } },
        { firstName: { $regex: safeSearch, $options: 'i' } },
        { lastName: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (courseId) query.courseId = courseId;
    if (groupId) query.groupId = groupId;
    if (status) query.status = status;

    const rawStudents = await Student.find(query)
      .populate('courseId', 'name price')
      .populate('groupId', 'name')
      .populate('branchId', 'name code')
      .sort({ createdAt: 1 });

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
        nextPaymentDueDate: paymentInfo.nextPaymentDueDate,
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
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      branchId,
      joinedDate,
      monthlyFee,
      paymentDueDay,
      status,
      password,
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

    // Determine branchId: body.branchId || group.branchId || session.branchId || default active branch
    let targetBranchId = branchId;
    if (!targetBranchId) {
      if (group.branchId) {
        targetBranchId = group.branchId;
      } else if (session.branchId) {
        targetBranchId = session.branchId;
      } else {
        const defaultBranch = await Branch.findOne({ status: 'active' });
        targetBranchId = defaultBranch?._id;
      }
    }

    if (!targetBranchId) {
      return NextResponse.json({ error: "Talaba biriktiriladigan filial aniqlanmadi" }, { status: 400 });
    }

    // Check MANAGER permission
    if (session.role === 'MANAGER' && session.branchId) {
      if (targetBranchId && targetBranchId.toString() !== session.branchId.toString()) {
        return NextResponse.json({ error: "Siz faqat o'z filialingizga talaba qo'sha olasiz" }, { status: 403 });
      }
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const existingStudentByPhone = await Student.findOne({
      phone: cleanPhone,
      branchId: targetBranchId,
      status: 'ACTIVE',
    });

    if (existingStudentByPhone) {
      return NextResponse.json(
        {
          error: `Ushbu telefon raqami bilan "${existingStudentByPhone.firstName} ${existingStudentByPhone.lastName}" nomli faol talaba allaqachon ushbu filialda mavjud`,
        },
        { status: 400 }
      );
    }

    function parseDateSafely(val: any): Date | undefined {
      if (!val) return undefined;
      if (typeof val === 'string' && val.trim() === '') return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    }

    const parsedBirthDate = parseDateSafely(birthDate);
    const parsedJoinedDate = parseDateSafely(joinedDate) || new Date();

    const studentCode = body.studentCode || (await generateNextStudentCode());

    const initialPassword = (password && typeof password === 'string' && password.trim().length > 0)
      ? password.trim()
      : '12345678';
    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const newStudent = await Student.create({
      studentCode,
      firstName,
      lastName,
      phone,
      parentPhone,
      birthDate: parsedBirthDate,
      courseId,
      groupId,
      branchId: targetBranchId,
      joinedDate: parsedJoinedDate,
      monthlyFee: monthlyFee ? Number(monthlyFee) : undefined,
      paymentDueDay: paymentDueDay ? Number(paymentDueDay) : 5,
      status: status || "ACTIVE",
      passwordHash,
    });

    return NextResponse.json({ success: true, student: newStudent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Talaba qo'shishda xatolik" }, { status: 500 });
  }
}

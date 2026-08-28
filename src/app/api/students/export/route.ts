import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { generateStudentsExportBuffer } from '@/lib/excel';

import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const courseId = searchParams.get('courseId');
    const groupId = searchParams.get('groupId');
    const status = searchParams.get('status');

    let query: any = {};
    if (courseId) query.courseId = courseId;
    if (groupId) query.groupId = groupId;
    if (status) query.status = status;

    const rawStudents = await Student.find(query)
      .populate('courseId', 'name price')
      .populate('groupId', 'name');

    const studentIds = rawStudents.map((s) => s._id);
    const payments = await Payment.find({ studentId: { $in: studentIds } });

    const paidMap = new Map<string, number>();
    payments.forEach((p) => {
      const sId = p.studentId.toString();
      paidMap.set(sId, (paidMap.get(sId) || 0) + p.amount);
    });

    const students = rawStudents.map((s) => {
      const sObj = s.toObject();
      return {
        ...sObj,
        totalPaid: paidMap.get(s._id.toString()) || 0,
      };
    });

    const buffer = generateStudentsExportBuffer(students);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="InFast_Talabalar_${Date.now()}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Export qilishda xatolik" }, { status: 500 });
  }
}

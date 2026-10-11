import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { StudentActivity } from '@/models/StudentActivity';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const student = await Student.findById(params.id).lean();
    if (!student) {
      return NextResponse.json({ error: 'Talaba topilmadi' }, { status: 404 });
    }

    // Branch isolation for manager
    if (session.role === 'MANAGER') {
      const studentBranchId = (student.branchId as any)?.toString();
      if (session.branchId && studentBranchId !== session.branchId.toString()) {
        return NextResponse.json(
          { error: "Siz faqat o'zingizga biriktirilgan filial talabasining faoliyat tarixini ko'ra olasiz" },
          { status: 403 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { studentId: student._id };
    if (typeFilter && typeFilter !== 'ALL') {
      query.type = typeFilter;
    }

    const [activities, total] = await Promise.all([
      StudentActivity.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      StudentActivity.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      activities,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Faoliyat tarixini olishda xatolik" }, { status: 500 });
  }
}

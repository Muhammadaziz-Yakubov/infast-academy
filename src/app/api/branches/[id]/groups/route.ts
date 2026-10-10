import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Group } from '@/models/Group';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'MANAGER' && session.branchId !== params.id) {
      return NextResponse.json({ error: 'Siz faqat o\'zingizga biriktirilgan filial ma\'lumotlariga kira olasiz' }, { status: 403 });
    }

    await connectToDatabase();
    const groups = await Group.find({ branchId: params.id, status: 'ACTIVE' })
      .populate('courseId', 'name price')
      .sort({ name: 1 });

    return NextResponse.json({ groups });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Filial guruhlarini yuklashda xatolik' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
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
    const users = await User.find({ branchId: params.id, active: true }).select('-passwordHash');

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Filial xodimlarini yuklashda xatolik' }, { status: 500 });
  }
}

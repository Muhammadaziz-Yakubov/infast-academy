import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Branch } from '@/models/Branch';
import { User } from '@/models/User';
import { Student } from '@/models/Student';
import { Group } from '@/models/Group';
import { Payment } from '@/models/Payment';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let query: any = {};
    if (statusFilter) {
      query.status = statusFilter;
    }

    // MANAGER can only see their assigned branch unless they are ADMIN
    if (session.role === 'MANAGER') {
      if (!session.branchId) {
        return NextResponse.json({ branches: [] });
      }
      query._id = session.branchId;
    }

    const branches = await Branch.find(query)
      .populate('managerId', 'name username role')
      .sort({ createdAt: -1 });

    // Calculate live counts for each branch
    const branchList = await Promise.all(
      branches.map(async (b) => {
        const bObj = b.toObject();
        const activeStudentsCount = await Student.countDocuments({ branchId: b._id, status: 'ACTIVE' });
        const activeGroupsCount = await Group.countDocuments({ branchId: b._id, status: 'ACTIVE' });

        // Sum total revenue
        const payments = await Payment.aggregate([
          { $match: { branchId: b._id } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalRevenue = payments.length > 0 ? payments[0].total : 0;

        return {
          ...bObj,
          activeStudentsCount,
          activeGroupsCount,
          totalRevenue,
        };
      })
    );

    return NextResponse.json({ branches: branchList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Filiallarni yuklashda xatolik' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN can create branches
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Faqat administrator yangi filial yarata oladi' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();

    const { name, code, address, phone, managerId, status } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Filial nomi va kodi majburiy' }, { status: 400 });
    }

    const cleanCode = code.trim().toLowerCase();
    const existing = await Branch.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ error: 'Bunday kodli filial allaqachon mavjud' }, { status: 400 });
    }

    let parsedManagerId = undefined;
    if (managerId && managerId !== 'NONE' && managerId !== '') {
      const manager = await User.findById(managerId);
      if (!manager) {
        return NextResponse.json({ error: 'Tanlangan menejer topilmadi' }, { status: 400 });
      }
      parsedManagerId = manager._id;
    }

    const newBranch = await Branch.create({
      name: name.trim(),
      code: cleanCode,
      address: address ? address.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      managerId: parsedManagerId,
      status: status || 'active',
    });

    // If manager was assigned, update manager's branchId
    if (parsedManagerId) {
      await User.updateOne({ _id: parsedManagerId }, { $set: { branchId: newBranch._id } });
    }

    return NextResponse.json({ success: true, branch: newBranch }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Filial yaratishda xatolik' }, { status: 500 });
  }
}

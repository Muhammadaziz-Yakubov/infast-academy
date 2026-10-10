import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Branch } from '@/models/Branch';
import { User } from '@/models/User';
import { Student } from '@/models/Student';
import { Group } from '@/models/Group';
import { Payment } from '@/models/Payment';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role verification
    if (session.role === 'MANAGER' && session.branchId !== params.id) {
      return NextResponse.json({ error: 'Siz faqat o\'zingizga biriktirilgan filial ma\'lumotlarini ko\'ra olasiz' }, { status: 403 });
    }

    await connectToDatabase();
    const branch = await Branch.findById(params.id).populate('managerId', 'name username email role');

    if (!branch) {
      return NextResponse.json({ error: 'Filial topilmadi' }, { status: 404 });
    }

    const activeStudentsCount = await Student.countDocuments({ branchId: branch._id, status: 'ACTIVE' });
    const totalStudentsCount = await Student.countDocuments({ branchId: branch._id });
    const activeGroupsCount = await Group.countDocuments({ branchId: branch._id, status: 'ACTIVE' });
    
    const payments = await Payment.aggregate([
      { $match: { branchId: branch._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = payments.length > 0 ? payments[0].total : 0;

    return NextResponse.json({
      branch: {
        ...branch.toObject(),
        activeStudentsCount,
        totalStudentsCount,
        activeGroupsCount,
        totalRevenue,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Filial ma\'lumotini yuklashda xatolik' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Faqat administrator filial ma\'lumotlarini tahrirlay oladi' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { name, code, address, phone, managerId, status } = body;

    const branch = await Branch.findById(params.id);
    if (!branch) {
      return NextResponse.json({ error: 'Filial topilmadi' }, { status: 404 });
    }

    if (name) branch.name = name.trim();
    if (code) {
      const cleanCode = code.trim().toLowerCase();
      const existing = await Branch.findOne({ code: cleanCode, _id: { $ne: branch._id } });
      if (existing) {
        return NextResponse.json({ error: 'Bunday kodli boshqa filial allaqachon mavjud' }, { status: 400 });
      }
      branch.code = cleanCode;
    }
    if (address !== undefined) branch.address = address.trim();
    if (phone !== undefined) branch.phone = phone.trim();
    if (status && ['active', 'inactive'].includes(status)) branch.status = status;

    if (managerId !== undefined) {
      if (managerId && managerId !== 'NONE' && managerId !== '') {
        const manager = await User.findById(managerId);
        if (!manager) {
          return NextResponse.json({ error: 'Tanlangan menejer topilmadi' }, { status: 400 });
        }
        branch.managerId = manager._id;
        await User.updateOne({ _id: manager._id }, { $set: { branchId: branch._id } });
      } else {
        branch.managerId = undefined;
      }
    }

    await branch.save();
    return NextResponse.json({ success: true, branch });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Filialni tahrirlashda xatolik' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Faqat administrator filialni o\'chira oladi' }, { status: 403 });
    }

    await connectToDatabase();
    const branch = await Branch.findById(params.id);
    if (!branch) {
      return NextResponse.json({ error: 'Filial topilmadi' }, { status: 404 });
    }

    // Check if historical or active records exist
    const studentCount = await Student.countDocuments({ branchId: branch._id });
    const groupCount = await Group.countDocuments({ branchId: branch._id });
    const paymentCount = await Payment.countDocuments({ branchId: branch._id });

    if (studentCount > 0 || groupCount > 0 || paymentCount > 0) {
      // Safe deactivation instead of physical delete
      branch.status = 'inactive';
      await branch.save();
      return NextResponse.json({
        success: true,
        message: 'Filialda ma\'lumotlar (o\'quvchilar/guruhlar/to\'lovlar) saqlanib qolganligi sababli u inactive (faolsiz) holatiga o\'tkazildi.',
        branch,
      });
    }

    await Branch.findByIdAndDelete(branch._id);
    return NextResponse.json({ success: true, message: 'Filial muvaffaqiyatli o\'chirildi' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Filialni o\'chirishda xatolik' }, { status: 500 });
  }
}

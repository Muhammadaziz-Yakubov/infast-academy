import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Branch } from '@/models/Branch';
import { Group } from '@/models/Group';
import { StudentTransfer } from '@/models/StudentTransfer';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'ADMIN') {
      return NextResponse.json(
        { error: "Super admin talabani filialga ko'chira olmaydi. Bu harakat menejerga topshirilgan." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await request.json();
    const { toBranchId, toGroupId, reason } = body;

    if (!toBranchId) {
      return NextResponse.json({ error: 'Yangi filial (toBranchId) kiritilishi shart' }, { status: 400 });
    }

    const student = await Student.findById(params.id);
    if (!student) {
      return NextResponse.json({ error: 'O\'quvchi topilmadi' }, { status: 404 });
    }

    const fromBranchId = student.branchId;

    // Check user permission
    if (session.role === 'MANAGER') {
      if (!session.branchId || (fromBranchId && fromBranchId.toString() !== session.branchId.toString())) {
        return NextResponse.json({ error: 'Siz faqat o\'z filialingizdagi o\'quvchini ko\'chira olasiz' }, { status: 403 });
      }
    }

    // Target branch validation
    const targetBranch = await Branch.findById(toBranchId);
    if (!targetBranch) {
      return NextResponse.json({ error: 'Mo\'ljallangan filial topilmadi' }, { status: 400 });
    }

    if (targetBranch.status !== 'active') {
      return NextResponse.json({ error: 'Faol bo\'lmagan (inactive) filialga o\'quvchi biriktirib bo\'lmaydi' }, { status: 400 });
    }

    // Target group validation if provided
    let verifiedToGroupId: mongoose.Types.ObjectId | undefined = undefined;
    if (toGroupId) {
      const targetGroup = await Group.findById(toGroupId);
      if (!targetGroup) {
        return NextResponse.json({ error: 'Tanlangan guruh topilmadi' }, { status: 400 });
      }
      if (targetGroup.branchId && targetGroup.branchId.toString() !== targetBranch._id.toString()) {
        return NextResponse.json({ error: 'Tanlangan guruh ko\'chirilayotgan filialga tegishli emas' }, { status: 400 });
      }
      verifiedToGroupId = targetGroup._id;
    }

    // Idempotency check: If student is already in targetBranch & targetGroup
    if (
      fromBranchId &&
      fromBranchId.toString() === targetBranch._id.toString() &&
      ((!toGroupId && !student.groupId) || (toGroupId && student.groupId?.toString() === toGroupId))
    ) {
      return NextResponse.json({
        success: true,
        message: 'O\'quvchi allaqachon ushbu filial va guruhda joylashgan',
        student,
      });
    }

    const fromGroupId = student.groupId;

    const prevBranchId = student.branchId;
    const prevGroupId = student.groupId;

    // 1. Update Student first
    student.branchId = targetBranch._id;
    if (verifiedToGroupId) {
      student.groupId = verifiedToGroupId;
    }
    await student.save();

    // 2. Create transfer log with rollback guarantee
    let transferLog;
    try {
      let transferredByUserId: mongoose.Types.ObjectId | undefined = undefined;
      if (session.id && mongoose.Types.ObjectId.isValid(session.id)) {
        transferredByUserId = new mongoose.Types.ObjectId(session.id);
      }

      transferLog = await StudentTransfer.create({
        studentId: student._id,
        fromBranchId: fromBranchId || targetBranch._id,
        toBranchId: targetBranch._id,
        fromGroupId,
        toGroupId: verifiedToGroupId,
        transferredAt: new Date(),
        transferredBy: transferredByUserId,
        reason: reason ? reason.trim() : 'Filiallar o\'rtasida ko\'chirish',
      });
    } catch (logError: any) {
      // Rollback student update if logging fails
      student.branchId = prevBranchId;
      student.groupId = prevGroupId;
      await student.save();
      throw new Error(`Ko'chirish jurnalini yaratishda xatolik: ${logError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `O'quvchi ${targetBranch.name} filialiga muvaffaqiyatli ko'chirildi`,
      student,
      transfer: transferLog,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'O\'quvchini ko\'chirishda xatolik yuz berdi' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const student = await Student.findById(params.id);
    if (!student) {
      return NextResponse.json({ error: 'O\'quvchi topilmadi' }, { status: 404 });
    }

    // MANAGER can only view transfer history if they belong to student's current branch
    if (session.role === 'MANAGER') {
      if (!session.branchId || !student.branchId || student.branchId.toString() !== session.branchId.toString()) {
        return NextResponse.json({ error: "Siz faqat o'z filialingiz talabasi ko'chirish tarixini ko'ra olasiz" }, { status: 403 });
      }
    }

    const transfers = await StudentTransfer.find({ studentId: params.id })
      .populate('fromBranchId', 'name code')
      .populate('toBranchId', 'name code')
      .populate('fromGroupId', 'name')
      .populate('toGroupId', 'name')
      .sort({ transferredAt: -1 });

    return NextResponse.json({ transfers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ko\'chirish tarixini yuklashda xatolik' }, { status: 500 });
  }
}

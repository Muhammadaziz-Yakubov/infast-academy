import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Referral } from '@/models/Referral';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { getSession, requireAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const referrals = await Referral.find({})
      .populate('referrerStudentId', 'firstName lastName studentCode phone')
      .populate('leadId', 'fullName phone status')
      .populate('referredStudentId', 'firstName lastName studentCode courseId')
      .sort({ createdAt: -1 });

    const totalReferrals = referrals.length;
    const confirmedCount = referrals.filter((r) => r.rewardStatus === 'TASDIQLANGAN' || r.rewardStatus === 'MUKOFOT_BERILGAN').length;
    const totalRewards = referrals.reduce((sum, r) => sum + (r.rewardValue || 0), 0);

    return NextResponse.json({
      success: true,
      referrals,
      stats: {
        totalReferrals,
        confirmedCount,
        totalRewards,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    const { referrerStudentId, leadId, referredStudentId, rewardType, rewardValue, rewardStatus, notes } = body;

    if (!referrerStudentId) {
      return NextResponse.json({ error: "Tavsiya qiluvchi talaba majburiy" }, { status: 400 });
    }

    const referral = await Referral.create({
      referrerStudentId,
      leadId: leadId || undefined,
      referredStudentId: referredStudentId || undefined,
      rewardType: rewardType || 'Chegirma',
      rewardValue: rewardValue ? Number(rewardValue) : 100000,
      rewardStatus: rewardStatus || 'KUTILMOQDA',
      notes,
    });

    return NextResponse.json({ success: true, referral }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Tavsiya kiritishda xatolik' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { session, errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();
    const { id, rewardStatus, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Referral ID topilmadi" }, { status: 400 });
    }

    const updated = await Referral.findByIdAndUpdate(id, { rewardStatus, notes }, { new: true });
    return NextResponse.json({ success: true, referral: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Tahrirlashda xatolik' }, { status: 500 });
  }
}

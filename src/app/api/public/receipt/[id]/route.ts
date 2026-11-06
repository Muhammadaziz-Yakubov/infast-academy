import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Payment } from '@/models/Payment';
import { rateLimit } from '@/lib/rateLimit';
import '@/models/Branch';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const limiter = await rateLimit(request, 20, 60 * 1000);
    if (!limiter.success && limiter.response) {
      return limiter.response;
    }

    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "To'lov topilmadi" }, { status: 404 });
    }

    await connectToDatabase();

    const payment = await Payment.findById(id)
      .populate({
        path: 'studentId',
        select: 'firstName lastName phone studentCode courseId groupId',
        populate: [
          { path: 'courseId', select: 'name price' },
          { path: 'groupId', select: 'name room' },
        ],
      })
      .populate('branchId', 'name address phone')
      .lean();

    if (!payment) {
      return NextResponse.json({ error: "To'lov topilmadi" }, { status: 404 });
    }

    // Mask phone number to avoid leaking full phone in public receipt
    if (payment.studentId && (payment.studentId as any).phone) {
      const rawPhone = (payment.studentId as any).phone.toString().trim();
      if (rawPhone.length >= 7) {
        (payment.studentId as any).phone = `${rawPhone.slice(0, 4)} *** ** ${rawPhone.slice(-2)}`;
      }
    }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error("Public receipt error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

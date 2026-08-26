import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Payment } from '@/models/Payment';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "To'lov ID ko'rsatilmadi" }, { status: 400 });
    }

    const payment = await Payment.findById(id).populate({
      path: 'studentId',
      select: 'firstName lastName phone courseId groupId',
      populate: [
        { path: 'courseId', select: 'name price' },
        { path: 'groupId', select: 'name room' },
      ],
    });

    if (!payment) {
      return NextResponse.json({ error: "To'lov topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xatolik yuz berdi" }, { status: 500 });
  }
}

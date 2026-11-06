import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MarketingExpense } from '@/models/MarketingExpense';
import { requireAdminSession } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    await MarketingExpense.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Xarajat o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

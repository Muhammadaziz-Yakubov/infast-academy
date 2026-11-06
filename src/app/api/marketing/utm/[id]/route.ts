import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UTMLink } from '@/models/UTMLink';
import { requireAdminSession } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    await UTMLink.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "UTM havola o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

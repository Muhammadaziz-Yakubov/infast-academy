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
    return NextResponse.json({ success: true, message: "Forma o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    const link = await UTMLink.findById(params.id);
    if (!link) {
      return NextResponse.json({ error: "Forma topilmadi" }, { status: 404 });
    }

    if (body.name) link.name = body.name.trim();
    if (body.pageTitle !== undefined) link.pageTitle = body.pageTitle.trim();
    if (body.pageDescription !== undefined) link.pageDescription = body.pageDescription.trim();
    if (body.utmSource) link.utmSource = body.utmSource.trim();
    if (body.utmMedium) link.utmMedium = body.utmMedium.trim();
    if (Array.isArray(body.customFields)) link.customFields = body.customFields;

    await link.save();
    return NextResponse.json({ success: true, link });
  } catch (error: any) {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

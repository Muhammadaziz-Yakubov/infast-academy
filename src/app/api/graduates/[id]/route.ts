import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Graduate } from '@/models/Graduate';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = params;

    const graduate = await Graduate.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { graduateId: id }, { certificateId: id }],
    });

    if (!graduate) {
      return NextResponse.json(
        { success: false, error: 'Bitiruvchi topilmadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, graduate });
  } catch (error: any) {
    console.error('Error fetching graduate:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    const graduate = await Graduate.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { graduateId: id }, { certificateId: id }],
    });

    if (!graduate) {
      return NextResponse.json(
        { success: false, error: 'Bitiruvchi topilmadi' },
        { status: 404 }
      );
    }

    // Update fields while preserving IDs
    if (body.firstName !== undefined) graduate.firstName = body.firstName.trim();
    if (body.lastName !== undefined) graduate.lastName = body.lastName.trim();
    if (body.middleName !== undefined) graduate.middleName = body.middleName.trim();
    
    const parts = [graduate.lastName, graduate.firstName, graduate.middleName].filter(Boolean);
    graduate.fullName = body.fullName || parts.join(' ').trim();

    if (body.birthDate !== undefined) graduate.birthDate = body.birthDate;
    if (body.phone !== undefined) graduate.phone = body.phone;
    if (body.photoUrl !== undefined) graduate.photoUrl = body.photoUrl;
    if (body.track !== undefined) graduate.track = body.track;
    if (body.courseName !== undefined) graduate.courseName = body.courseName;
    if (body.duration !== undefined) graduate.duration = body.duration;
    if (body.startDate !== undefined) graduate.startDate = body.startDate;
    if (body.endDate !== undefined) graduate.endDate = body.endDate;
    if (body.mentor !== undefined) graduate.mentor = body.mentor;
    if (body.director !== undefined) graduate.director = body.director;
    if (body.nomination !== undefined) graduate.nomination = body.nomination;
    if (body.issuedDate !== undefined) graduate.issuedDate = body.issuedDate;
    if (body.notes !== undefined) graduate.notes = body.notes;

    // Status management (Revoke / Activate)
    if (body.status !== undefined) {
      graduate.status = body.status;
      if (body.status === 'revoked') {
        graduate.revokedReason = body.revokedReason || 'Administrator tomonidan bekor qilindi';
        graduate.revokedAt = new Date();
      } else {
        graduate.revokedReason = '';
        graduate.revokedAt = undefined;
      }
    }

    await graduate.save();

    return NextResponse.json({
      success: true,
      message: "Bitiruvchi ma'lumotlari yangilandi!",
      graduate,
    });
  } catch (error: any) {
    console.error('Error updating graduate:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Yangilashda xatolik' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { id } = params;

    const deleted = await Graduate.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { graduateId: id }, { certificateId: id }],
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Bitiruvchi topilmadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bitiruvchi muvaffaqiyatli o'chirildi",
    });
  } catch (error: any) {
    console.error('Error deleting graduate:', error);
    return NextResponse.json(
      { success: false, error: error.message || "O'chirishda xatolik" },
      { status: 500 }
    );
  }
}

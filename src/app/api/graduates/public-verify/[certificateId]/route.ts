import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Graduate } from '@/models/Graduate';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    await connectToDatabase();
    const { certificateId } = params;

    if (!certificateId) {
      return NextResponse.json(
        { success: false, error: 'Sertifikat raqami ko‘rsatilmadi' },
        { status: 400 }
      );
    }

    const cleanId = certificateId.trim();

    const graduate = await Graduate.findOne({
      $or: [
        { certificateId: cleanId },
        { awardId: cleanId },
        { graduateId: cleanId },
      ],
    }).lean();

    if (!graduate) {
      return NextResponse.json(
        { success: false, error: 'Bunday sertifikat topilmadi' },
        { status: 404 }
      );
    }

    // Only expose safe public verification fields
    const isAwardQuery = graduate.awardId === cleanId;

    const publicData = {
      fullName: graduate.fullName,
      track: graduate.track,
      courseName: graduate.courseName,
      duration: graduate.duration,
      startDate: graduate.startDate,
      endDate: graduate.endDate,
      certificateId: graduate.certificateId,
      awardId: graduate.awardId,
      nomination: graduate.nomination,
      issuedDate: graduate.issuedDate,
      mentor: graduate.mentor,
      director: graduate.director,
      status: graduate.status, // 'active' | 'revoked'
      isAward: isAwardQuery,
      queryId: cleanId,
      revokedReason: graduate.status === 'revoked' ? graduate.revokedReason : undefined,
    };

    return NextResponse.json({
      success: true,
      data: publicData,
    });
  } catch (error: any) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json(
      { success: false, error: 'Server xatosi yuz berdi' },
      { status: 500 }
    );
  }
}

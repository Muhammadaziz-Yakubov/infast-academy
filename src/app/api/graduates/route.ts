import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Graduate } from '@/models/Graduate';
import { requireAdminSession } from '@/lib/auth';
import { formatGraduateId, formatAwardId } from '@/lib/certificateUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const track = searchParams.get('track') || '';

    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (track && track !== 'all') {
      filter.track = track;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { graduateId: { $regex: search, $options: 'i' } },
        { certificateId: { $regex: search, $options: 'i' } },
        { nomination: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const graduates = await Graduate.find(filter).sort({ createdAt: -1 });

    // Aggregate statistics
    const totalGraduates = await Graduate.countDocuments();
    const activeCertificates = await Graduate.countDocuments({ status: 'active' });
    const totalNominations = await Graduate.countDocuments({ nomination: { $exists: true, $ne: '' } });
    const revokedCount = await Graduate.countDocuments({ status: 'revoked' });

    return NextResponse.json({
      success: true,
      graduates,
      stats: {
        totalGraduates,
        activeCertificates,
        totalNominations,
        revokedCount,
        ceremonyDate: '02.10.2026',
      },
    });
  } catch (error: any) {
    console.error('Error fetching graduates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi yuz berdi' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    const {
      firstName,
      lastName,
      middleName = '',
      birthDate = '',
      phone = '',
      photoUrl = '',
      track = 'Full-Stack Development',
      courseName = 'Full-Stack Development',
      duration = '15 oy',
      startDate = '01.07.2025',
      endDate = '02.10.2026',
      mentor = 'M. Yakubov',
      director = 'N. Yakubova',
      nomination = 'Best Full-Stack Developer',
      issuedDate = '02.10.2026',
      notes = '',
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Ism va Familiya kiritilishi majburiy!' },
        { status: 400 }
      );
    }

    const fullNameParts = [lastName.trim(), firstName.trim(), middleName.trim()].filter(Boolean);
    const fullName = fullNameParts.join(' ');

    // Determine next sequence ID
    const count = await Graduate.countDocuments();
    const sequence = count + 1;
    const year = 2026;

    let graduateId = body.graduateId || formatGraduateId(sequence, year);
    let certificateId = body.certificateId || graduateId;
    let awardId = body.awardId || formatAwardId(sequence, year);

    // Verify uniqueness
    let exists = await Graduate.findOne({
      $or: [{ graduateId }, { certificateId }, { awardId }],
    });

    let extraIncrement = 1;
    while (exists) {
      const nextSeq = sequence + extraIncrement;
      graduateId = formatGraduateId(nextSeq, year);
      certificateId = graduateId;
      awardId = formatAwardId(nextSeq, year);
      exists = await Graduate.findOne({
        $or: [{ graduateId }, { certificateId }, { awardId }],
      });
      extraIncrement++;
    }

    const newGraduate = await Graduate.create({
      graduateId,
      certificateId,
      awardId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleName: middleName.trim(),
      fullName,
      birthDate,
      phone,
      photoUrl,
      track,
      courseName,
      duration,
      startDate,
      endDate,
      mentor,
      director,
      status: 'active',
      nomination,
      issuedDate,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: 'Bitiruvchi va sertifikatlar muvaffaqiyatli yaratildi!',
      graduate: newGraduate,
    });
  } catch (error: any) {
    console.error('Error creating graduate:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Saqlashda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

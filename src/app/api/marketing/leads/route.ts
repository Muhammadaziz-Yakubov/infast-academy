import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Lead } from '@/models/Lead';
import { Student } from '@/models/Student';
import { Course } from '@/models/Course';
import { MarketingCampaign } from '@/models/MarketingCampaign';
import { getSession, requireAdminSession } from '@/lib/auth';
import { escapeRegex } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const search = (searchParams.get('q') || '').trim();
    const status = searchParams.get('status') || '';
    const campaignId = searchParams.get('campaignId') || '';
    const source = searchParams.get('source') || '';

    const filter: any = {};
    if (status) filter.status = status;
    if (campaignId) filter.utmCampaignId = campaignId;
    if (source) filter.utmSource = { $regex: escapeRegex(source), $options: 'i' };

    if (search) {
      if (search.length > 100) {
        return NextResponse.json({ error: 'Search query too long' }, { status: 400 });
      }
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { fullName: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
        { utmSource: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(filter)
      .populate('courseId', 'name price')
      .populate('utmCampaignId', 'name platform')
      .populate('referralStudentId', 'firstName lastName studentCode')
      .populate('convertedStudentId', 'firstName lastName studentCode')
      .sort({ createdAt: -1 });

    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'YANGI').length;
    const contactedLeads = leads.filter((l) => l.status === 'BOG‘LANILDI').length;
    const trialLeads = leads.filter((l) => l.status === 'SINOV_DARSI').length;
    const convertedLeads = leads.filter((l) => l.status === 'TALABA_BO‘LDI').length;
    const rejectedLeads = leads.filter((l) => l.status === 'RAD_ETILDI').length;

    return NextResponse.json({
      success: true,
      leads,
      stats: {
        totalLeads,
        newLeads,
        contactedLeads,
        trialLeads,
        convertedLeads,
        rejectedLeads,
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

    const { fullName, phone, email, courseId, utmSource, utmMedium, utmCampaignId, utmContent, utmTerm, notes } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ error: "Ism va telefon raqami majburiy" }, { status: 400 });
    }

    const lead = await Lead.create({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      courseId: courseId || undefined,
      status: 'YANGI',
      utmSource: utmSource ? utmSource.trim() : 'Manual',
      utmMedium: utmMedium ? utmMedium.trim() : undefined,
      utmCampaignId: utmCampaignId || undefined,
      utmContent: utmContent ? utmContent.trim() : undefined,
      utmTerm: utmTerm ? utmTerm.trim() : undefined,
      notes: notes ? notes.trim() : undefined,
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lead yaratishda xatolik' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MarketingCampaign } from '@/models/MarketingCampaign';
import { MarketingExpense } from '@/models/MarketingExpense';
import { Lead } from '@/models/Lead';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
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
    const platform = searchParams.get('platform') || '';

    const filter: any = {};
    if (status) filter.status = status;
    if (platform) filter.platform = platform;

    if (search) {
      if (search.length > 100) {
        return NextResponse.json({ error: 'Search query too long' }, { status: 400 });
      }
      const safeSearch = escapeRegex(search);
      filter.name = { $regex: safeSearch, $options: 'i' };
    }

    const campaigns = await MarketingCampaign.find(filter)
      .populate('courseId', 'name price')
      .sort({ createdAt: -1 });

    const campaignIds = campaigns.map((c) => c._id);

    // Fetch Expenses, Leads, Students & Payments for attribution stats
    const [expenses, leads, students] = await Promise.all([
      MarketingExpense.find({ campaignId: { $in: campaignIds } }),
      Lead.find({ utmCampaignId: { $in: campaignIds } }),
      Student.find({ campaignId: { $in: campaignIds } }),
    ]);

    const studentIds = students.map((s) => s._id);
    const payments = await Payment.find({ studentId: { $in: studentIds } });

    // Map revenue per student
    const studentRevenueMap = new Map<string, number>();
    payments.forEach((p) => {
      const sId = p.studentId.toString();
      studentRevenueMap.set(sId, (studentRevenueMap.get(sId) || 0) + (p.amount || 0));
    });

    const campaignList = campaigns.map((c) => {
      const cIdStr = c._id.toString();

      // Calculated ad spend
      const directSpend = expenses
        .filter((e) => e.campaignId && e.campaignId.toString() === cIdStr)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const totalSpend = directSpend > 0 ? directSpend : c.budget || 0;

      // Calculated leads
      const campaignLeads = leads.filter(
        (l) => l.utmCampaignId && l.utmCampaignId.toString() === cIdStr
      );
      const leadsCount = campaignLeads.length;

      // Calculated students
      const campaignStudents = students.filter(
        (s) => s.campaignId && s.campaignId.toString() === cIdStr
      );
      const studentsCount = campaignStudents.length;

      // Calculated revenue
      let revenue = 0;
      campaignStudents.forEach((s) => {
        revenue += studentRevenueMap.get(s._id.toString()) || 0;
      });

      // Formulas (safe division)
      const cpl = leadsCount > 0 ? Math.round(totalSpend / leadsCount) : 0;
      const cac = studentsCount > 0 ? Math.round(totalSpend / studentsCount) : 0;
      const conversionRate =
        leadsCount > 0 ? Math.round((studentsCount / leadsCount) * 1000) / 10 : 0;
      const roi =
        totalSpend > 0 ? Math.round(((revenue - totalSpend) / totalSpend) * 1000) / 10 : 0;

      return {
        ...c.toObject(),
        spend: totalSpend,
        leadsCount,
        studentsCount,
        revenue,
        cpl,
        cac,
        conversionRate,
        roi,
      };
    });

    return NextResponse.json({ success: true, campaigns: campaignList });
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

    const { name, description, objective, status, startDate, endDate, budget, platform, courseId, branch } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Kampaniya nomini kiriting" }, { status: 400 });
    }

    const existing = await MarketingCampaign.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json({ error: "Bunday nomli kampaniya allaqachon mavjud" }, { status: 400 });
    }

    const campaign = await MarketingCampaign.create({
      name: name.trim(),
      description,
      objective: objective || 'LEAD_YIG‘ISH',
      status: status || 'FAOL',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      budget: budget ? Number(budget) : 0,
      platform: platform || 'Instagram',
      courseId: courseId || undefined,
      branch: branch ? branch.trim() : undefined,
    });

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Kampaniya yaratishda xatolik' }, { status: 500 });
  }
}

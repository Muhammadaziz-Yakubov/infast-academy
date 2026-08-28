import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MarketingCampaign } from '@/models/MarketingCampaign';
import { MarketingExpense } from '@/models/MarketingExpense';
import { Lead } from '@/models/Lead';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { UTMLink } from '@/models/UTMLink';
import { getSession, requireAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const campaign = await MarketingCampaign.findById(params.id).populate('courseId', 'name price');

    if (!campaign) {
      return NextResponse.json({ error: "Kampaniya topilmadi" }, { status: 404 });
    }

    const cIdStr = campaign._id.toString();

    const [expenses, leads, students, utmLinks] = await Promise.all([
      MarketingExpense.find({ campaignId: params.id }).sort({ date: -1 }),
      Lead.find({ utmCampaignId: params.id }).populate('courseId', 'name').sort({ createdAt: -1 }),
      Student.find({ campaignId: params.id }).populate('courseId', 'name').populate('groupId', 'name').sort({ createdAt: -1 }),
      UTMLink.find({ utmCampaignId: params.id }).sort({ createdAt: -1 }),
    ]);

    const studentIds = students.map((s) => s._id);
    const payments = await Payment.find({ studentId: { $in: studentIds } }).sort({ paymentDate: -1 });

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const directSpend = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalSpend = directSpend > 0 ? directSpend : campaign.budget || 0;

    const leadsCount = leads.length;
    const studentsCount = students.length;

    const cpl = leadsCount > 0 ? Math.round(totalSpend / leadsCount) : 0;
    const cac = studentsCount > 0 ? Math.round(totalSpend / studentsCount) : 0;
    const conversionRate = leadsCount > 0 ? Math.round((studentsCount / leadsCount) * 1000) / 10 : 0;
    const roi = totalSpend > 0 ? Math.round(((totalRevenue - totalSpend) / totalSpend) * 1000) / 10 : 0;

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign.toObject(),
        spend: totalSpend,
        leadsCount,
        studentsCount,
        revenue: totalRevenue,
        cpl,
        cac,
        conversionRate,
        roi,
      },
      expenses,
      leads,
      students,
      payments,
      utmLinks,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    const updated = await MarketingCampaign.findByIdAndUpdate(params.id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Kampaniya topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Tahrirlashda xatolik' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session, errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    await MarketingCampaign.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Kampaniya o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "O'chirishda xatolik" }, { status: 500 });
  }
}

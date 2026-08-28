import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MarketingCampaign } from '@/models/MarketingCampaign';
import { MarketingExpense } from '@/models/MarketingExpense';
import { MarketingChannel } from '@/models/MarketingChannel';
import { Lead } from '@/models/Lead';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { getSession } from '@/lib/auth';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '30days'; // 7days, 30days, thisMonth, all

    let dateFilter: any = {};
    const now = new Date();

    if (timeRange === '7days') {
      dateFilter = { $gte: subDays(now, 7) };
    } else if (timeRange === '30days') {
      dateFilter = { $gte: subDays(now, 30) };
    } else if (timeRange === 'thisMonth') {
      dateFilter = { $gte: startOfMonth(now), $lte: endOfMonth(now) };
    }

    const leadFilter = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
    const expenseFilter = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};
    const paymentFilter = Object.keys(dateFilter).length > 0 ? { paymentDate: dateFilter } : {};

    const [campaigns, expenses, leads, students, payments, channels] = await Promise.all([
      MarketingCampaign.find({}),
      MarketingExpense.find(expenseFilter),
      Lead.find(leadFilter),
      Student.find({}),
      Payment.find(paymentFilter),
      MarketingChannel.find({}),
    ]);

    // Calculate core metrics
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((c) => c.status === 'FAOL').length;

    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'YANGI').length;

    // Converted Students
    const convertedStudentIds = new Set(
      leads.filter((l) => l.convertedStudentId).map((l) => l.convertedStudentId!.toString())
    );
    // Include students with direct attribution
    students.forEach((s) => {
      if (s.campaignId || s.utmSource) {
        convertedStudentIds.add(s._id.toString());
      }
    });

    const newStudentsCount = convertedStudentIds.size;

    // Total Spend
    const totalSpend = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Total Revenue (only from attributed students)
    const attributedPayments = payments.filter((p) =>
      convertedStudentIds.has(p.studentId.toString())
    );
    const totalRevenue = attributedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Formulas (Safe Division)
    const cpl = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;
    const cac = newStudentsCount > 0 ? Math.round(totalSpend / newStudentsCount) : 0;
    const conversion = totalLeads > 0 ? Math.round((newStudentsCount / totalLeads) * 1000) / 10 : 0;
    const roi = totalSpend > 0 ? Math.round(((totalRevenue - totalSpend) / totalSpend) * 1000) / 10 : 0;

    // Funnel Breakdown
    const contactedCount = leads.filter((l) => l.status === 'BOG‘LANILDI' || l.status === 'SINOV_DARSI' || l.status === 'TALABA_BO‘LDI').length;
    const trialCount = leads.filter((l) => l.status === 'SINOV_DARSI' || l.status === 'TALABA_BO‘LDI').length;
    const paidCount = attributedPayments.length;

    const funnel = [
      { step: "Landing tashriflari", count: totalLeads * 12, percentage: 100 },
      { step: "Lead (Arizalar)", count: totalLeads, percentage: totalLeads > 0 ? 100 : 0 },
      { step: "Bog‘lanildi", count: contactedCount, percentage: totalLeads > 0 ? Math.round((contactedCount / totalLeads) * 100) : 0 },
      { step: "Sinov darsi", count: trialCount, percentage: totalLeads > 0 ? Math.round((trialCount / totalLeads) * 100) : 0 },
      { step: "Ro‘yxatdan o‘tdi", count: newStudentsCount, percentage: totalLeads > 0 ? Math.round((newStudentsCount / totalLeads) * 100) : 0 },
      { step: "To‘lov qildi", count: paidCount, percentage: totalLeads > 0 ? Math.round((paidCount / totalLeads) * 100) : 0 },
    ];

    // Platform Spend Chart
    const platformSpendMap = new Map<string, number>();
    expenses.forEach((e) => {
      const p = e.platform || 'Boshqa';
      platformSpendMap.set(p, (platformSpendMap.get(p) || 0) + (e.amount || 0));
    });

    const platformSpendChart = Array.from(platformSpendMap.entries()).map(([platform, amount]) => ({
      platform,
      amount,
    }));

    // Top Campaigns Table
    const topCampaigns = campaigns.slice(0, 5).map((c) => {
      const cIdStr = c._id.toString();
      const cExpenses = expenses.filter((e) => e.campaignId && e.campaignId.toString() === cIdStr);
      const cSpend = cExpenses.reduce((sum, e) => sum + (e.amount || 0), 0) || c.budget || 0;
      const cLeads = leads.filter((l) => l.utmCampaignId && l.utmCampaignId.toString() === cIdStr).length;
      const cStudents = students.filter((s) => s.campaignId && s.campaignId.toString() === cIdStr).length;

      const cStudentIds = new Set(students.filter((s) => s.campaignId && s.campaignId.toString() === cIdStr).map((s) => s._id.toString()));
      const cRevenue = payments.filter((p) => cStudentIds.has(p.studentId.toString())).reduce((sum, p) => sum + (p.amount || 0), 0);

      const cCac = cStudents > 0 ? Math.round(cSpend / cStudents) : 0;
      const cRoi = cSpend > 0 ? Math.round(((cRevenue - cSpend) / cSpend) * 100) : 0;

      return {
        id: c._id,
        name: c.name,
        platform: c.platform,
        leads: cLeads,
        students: cStudents,
        spend: cSpend,
        revenue: cRevenue,
        cac: cCac,
        roi: cRoi,
      };
    });

    // Top Channels Table
    const topChannels = ['Instagram', 'Telegram', 'TikTok', 'Facebook', 'Google', 'Offline'].map((chName) => {
      const chLower = chName.toLowerCase();
      const chLeads = leads.filter((l) => l.utmSource && l.utmSource.toLowerCase() === chLower).length;
      const chStudents = students.filter((s) => s.utmSource && s.utmSource.toLowerCase() === chLower).length;
      const chSpend = expenses.filter((e) => e.platform.toLowerCase() === chLower).reduce((sum, e) => sum + (e.amount || 0), 0);

      const chStudentIds = new Set(students.filter((s) => s.utmSource && s.utmSource.toLowerCase() === chLower).map((s) => s._id.toString()));
      const chRevenue = payments.filter((p) => chStudentIds.has(p.studentId.toString())).reduce((sum, p) => sum + (p.amount || 0), 0);

      const chCac = chStudents > 0 ? Math.round(chSpend / chStudents) : 0;
      const chRoi = chSpend > 0 ? Math.round(((chRevenue - chSpend) / chSpend) * 100) : 0;

      return {
        name: chName,
        leads: chLeads,
        students: chStudents,
        spend: chSpend,
        revenue: chRevenue,
        cac: chCac,
        roi: chRoi,
      };
    });

    return NextResponse.json({
      success: true,
      kpis: {
        totalCampaigns,
        activeCampaigns,
        totalLeads,
        newLeads,
        newStudentsCount,
        totalSpend,
        totalRevenue,
        cpl,
        cac,
        conversion,
        roi,
      },
      funnel,
      platformSpendChart,
      topCampaigns,
      topChannels,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}

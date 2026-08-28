import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MarketingChannel } from '@/models/MarketingChannel';
import { MarketingExpense } from '@/models/MarketingExpense';
import { Lead } from '@/models/Lead';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { getSession, requireAdminSession } from '@/lib/auth';

const DEFAULT_CHANNELS = [
  'Instagram',
  'Telegram',
  'TikTok',
  'Facebook',
  'Google',
  'YouTube',
  'Veb-sayt',
  'Tavsiya',
  'Offline',
  'Boshqa',
];

export async function GET() {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Auto-seed default channels if empty
    const existingCount = await MarketingChannel.countDocuments({});
    if (existingCount === 0) {
      for (const name of DEFAULT_CHANNELS) {
        await MarketingChannel.create({ name, status: 'FAOL' });
      }
    }

    const channels = await MarketingChannel.find({}).sort({ createdAt: 1 });
    const [expenses, leads, students] = await Promise.all([
      MarketingExpense.find({}),
      Lead.find({}),
      Student.find({}),
    ]);

    const studentIds = students.map((s) => s._id);
    const payments = await Payment.find({ studentId: { $in: studentIds } });

    const studentRevenueMap = new Map<string, number>();
    payments.forEach((p) => {
      const sId = p.studentId.toString();
      studentRevenueMap.set(sId, (studentRevenueMap.get(sId) || 0) + (p.amount || 0));
    });

    const channelStats = channels.map((ch) => {
      const chNameLower = ch.name.toLowerCase();

      const chExpenses = expenses.filter((e) => e.platform.toLowerCase() === chNameLower);
      const spend = chExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      const chLeads = leads.filter(
        (l) => l.utmSource && l.utmSource.toLowerCase() === chNameLower
      );
      const leadsCount = chLeads.length;

      const chStudents = students.filter(
        (s) => s.utmSource && s.utmSource.toLowerCase() === chNameLower
      );
      const studentsCount = chStudents.length;

      let revenue = 0;
      chStudents.forEach((s) => {
        revenue += studentRevenueMap.get(s._id.toString()) || 0;
      });

      const cpl = leadsCount > 0 ? Math.round(spend / leadsCount) : 0;
      const cac = studentsCount > 0 ? Math.round(spend / studentsCount) : 0;
      const conversionRate =
        leadsCount > 0 ? Math.round((studentsCount / leadsCount) * 1000) / 10 : 0;
      const roi = spend > 0 ? Math.round(((revenue - spend) / spend) * 1000) / 10 : 0;

      return {
        ...ch.toObject(),
        spend,
        leadsCount,
        studentsCount,
        revenue,
        cpl,
        cac,
        conversionRate,
        roi,
      };
    });

    return NextResponse.json({ success: true, channels: channelStats });
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

    const { name, description } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Kanal nomini kiriting" }, { status: 400 });
    }

    const channel = await MarketingChannel.create({
      name: name.trim(),
      description,
      status: 'FAOL',
    });

    return NextResponse.json({ success: true, channel }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Kanal yaratishda xatolik' }, { status: 500 });
  }
}

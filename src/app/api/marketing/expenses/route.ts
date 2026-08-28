import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MarketingExpense } from '@/models/MarketingExpense';
import { getSession, requireAdminSession } from '@/lib/auth';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const campaignId = searchParams.get('campaignId');
    const platform = searchParams.get('platform');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filter: any = {};
    if (campaignId) filter.campaignId = campaignId;
    if (platform) filter.platform = platform;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await MarketingExpense.find(filter)
      .populate('campaignId', 'name platform')
      .sort({ date: -1 });

    const now = new Date();
    const todayExpenses = await MarketingExpense.find({
      date: { $gte: startOfDay(now), $lte: endOfDay(now) },
    });
    const weekExpenses = await MarketingExpense.find({
      date: { $gte: startOfWeek(now), $lte: endOfWeek(now) },
    });
    const monthExpenses = await MarketingExpense.find({
      date: { $gte: startOfMonth(now), $lte: endOfMonth(now) },
    });

    const summary = {
      todaySpend: todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      weekSpend: weekExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      monthSpend: monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
      totalSpend: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    };

    return NextResponse.json({ success: true, expenses, summary });
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

    const { campaignId, platform, amount, date, description } = body;

    if (!platform || !amount) {
      return NextResponse.json({ error: "Platforma va summa majburiy" }, { status: 400 });
    }

    const expense = await MarketingExpense.create({
      campaignId: campaignId || undefined,
      platform: platform.trim(),
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      description,
    });

    return NextResponse.json({ success: true, expense }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Xarajat saqlashda xatolik' }, { status: 500 });
  }
}

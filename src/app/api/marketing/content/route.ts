import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MarketingContent } from '@/models/MarketingContent';
import { getSession, requireAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const campaignId = searchParams.get('campaignId');

    const filter: any = {};
    if (platform) filter.platform = platform;
    if (status) filter.status = status;
    if (campaignId) filter.campaignId = campaignId;

    const contents = await MarketingContent.find(filter)
      .populate('campaignId', 'name platform')
      .sort({ scheduledAt: 1, createdAt: -1 });

    return NextResponse.json({ success: true, contents });
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

    const { title, description, platform, type, status, scheduledAt, campaignId, responsibleUser } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Kontent sarlavhasi majburiy" }, { status: 400 });
    }

    const content = await MarketingContent.create({
      title: title.trim(),
      description,
      platform: platform || 'Instagram',
      type: type || 'Post',
      status: status || 'G‘OYA',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      campaignId: campaignId || undefined,
      responsibleUser,
    });

    return NextResponse.json({ success: true, content }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Kontent yaratishda xatolik' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { session, errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Kontent ID topilmadi" }, { status: 400 });
    }

    const updated = await MarketingContent.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, content: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Tahrirlashda xatolik' }, { status: 500 });
  }
}

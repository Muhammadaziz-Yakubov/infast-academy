import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MarketingAsset } from '@/models/MarketingAsset';
import { getSession, requireAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type');
    const campaignId = searchParams.get('campaignId');

    const filter: any = {};
    if (type) filter.type = type;
    if (campaignId) filter.campaignId = campaignId;

    const assets = await MarketingAsset.find(filter)
      .populate('campaignId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, assets });
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

    const { name, type, url, thumbnailUrl, tags, campaignId, sizeBytes } = body;

    if (!name || !url) {
      return NextResponse.json({ error: "Nomi va fayl havolasi majburiy" }, { status: 400 });
    }

    const asset = await MarketingAsset.create({
      name: name.trim(),
      type: type || 'Rasm',
      url,
      thumbnailUrl,
      tags: Array.isArray(tags) ? tags : [],
      campaignId: campaignId || undefined,
      createdBy: session?.name || 'Admin',
      sizeBytes: sizeBytes ? Number(sizeBytes) : undefined,
    });

    return NextResponse.json({ success: true, asset }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Material saqlashda xatolik' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { session, errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Asset ID topilmadi" }, { status: 400 });
    }

    await MarketingAsset.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Material o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "O'chirishda xatolik" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UTMLink } from '@/models/UTMLink';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    // Find by ID or Slug
    let link = await UTMLink.findById(params.id).populate('utmCampaignId', 'name platform');
    if (!link) {
      link = await UTMLink.findOne({ slug: params.id }).populate('utmCampaignId', 'name platform');
    }

    if (!link) {
      return NextResponse.json({ error: "Havola topilmadi" }, { status: 404 });
    }

    // Increment clicks count silently
    link.clicksCount = (link.clicksCount || 0) + 1;
    await link.save();

    return NextResponse.json({
      success: true,
      link: {
        _id: link._id,
        name: link.name,
        pageTitle: link.pageTitle || link.name,
        pageDescription: link.pageDescription,
        utmSource: link.utmSource,
        utmMedium: link.utmMedium,
        utmCampaignId: link.utmCampaignId,
        utmContent: link.utmContent,
        utmTerm: link.utmTerm,
        customFields: link.customFields || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

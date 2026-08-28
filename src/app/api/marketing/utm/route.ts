import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UTMLink } from '@/models/UTMLink';
import { MarketingCampaign } from '@/models/MarketingCampaign';
import { getSession, requireAdminSession } from '@/lib/auth';
import { escapeRegex } from '@/lib/utils';

function sanitizeParam(param?: string): string {
  if (!param) return '';
  return param.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '').substring(0, 100);
}

function isValidUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const search = (searchParams.get('q') || '').trim();
    const campaignId = searchParams.get('campaignId') || '';

    const filter: any = {};
    if (campaignId) filter.utmCampaignId = campaignId;

    if (search) {
      if (search.length > 100) {
        return NextResponse.json({ error: 'Search query too long' }, { status: 400 });
      }
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { utmSource: { $regex: safeSearch, $options: 'i' } },
        { utmMedium: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const links = await UTMLink.find(filter)
      .populate('utmCampaignId', 'name platform')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, links });
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

    const { name, utmSource, utmMedium, utmCampaignId, utmContent, utmTerm, landingUrl } = body;

    if (!name || !utmSource || !utmMedium || !landingUrl) {
      return NextResponse.json({ error: "Nomi, Manba (source), Kanal (medium) va Landing URL majburiy" }, { status: 400 });
    }

    if (!isValidUrl(landingUrl)) {
      return NextResponse.json({ error: "Yaroqsiz Landing URL (http:// yoki https:// bilan boshlanishi kerak)" }, { status: 400 });
    }

    const safeSource = sanitizeParam(utmSource);
    const safeMedium = sanitizeParam(utmMedium);
    const safeContent = sanitizeParam(utmContent);
    const safeTerm = sanitizeParam(utmTerm);

    let campaignName = '';
    if (utmCampaignId) {
      const camp = await MarketingCampaign.findById(utmCampaignId);
      if (camp) {
        campaignName = sanitizeParam(camp.name.replace(/\s+/g, '_').toLowerCase());
      }
    }

    const urlObj = new URL(landingUrl);
    urlObj.searchParams.set('utm_source', safeSource);
    urlObj.searchParams.set('utm_medium', safeMedium);
    if (campaignName) urlObj.searchParams.set('utm_campaign', campaignName);
    if (safeContent) urlObj.searchParams.set('utm_content', safeContent);
    if (safeTerm) urlObj.searchParams.set('utm_term', safeTerm);

    const fullUrl = urlObj.toString();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullUrl)}`;

    const link = await UTMLink.create({
      name: name.trim(),
      utmSource: safeSource,
      utmMedium: safeMedium,
      utmCampaignId: utmCampaignId || undefined,
      utmContent: safeContent || undefined,
      utmTerm: safeTerm || undefined,
      landingUrl,
      fullUrl,
      qrCodeUrl,
    });

    return NextResponse.json({ success: true, link }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'UTM havola yaratishda xatolik' }, { status: 500 });
  }
}

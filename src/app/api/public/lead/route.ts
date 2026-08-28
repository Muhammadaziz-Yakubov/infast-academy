import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Lead } from '@/models/Lead';
import { MarketingCampaign } from '@/models/MarketingCampaign';
import { LandingPage } from '@/models/LandingPage';
import { rateLimit } from '@/lib/rateLimit';

function sanitizeText(str?: string, maxLen: number = 100): string {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '').substring(0, maxLen);
}

export async function POST(req: NextRequest) {
  try {
    const limiter = rateLimit(req, 10, 60 * 1000);
    if (!limiter.success && limiter.response) {
      return limiter.response;
    }

    await connectToDatabase();
    const body = await req.json();

    const { fullName, phone, email, courseId, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, landingSlug, notes } = body;

    const safeName = sanitizeText(fullName, 80);
    const safePhone = sanitizeText(phone, 30);

    if (!safeName || !safePhone) {
      return NextResponse.json({ error: "Ismingiz va telefon raqamingizni kiriting" }, { status: 400 });
    }

    const safeSource = sanitizeText(utmSource, 50) || 'Website Direct';
    const safeMedium = sanitizeText(utmMedium, 50) || 'organic';
    const safeContent = sanitizeText(utmContent, 50);
    const safeTerm = sanitizeText(utmTerm, 50);

    let campaignId: string | undefined = undefined;
    if (utmCampaign) {
      const cleanCampaignName = sanitizeText(utmCampaign, 80);
      const camp = await MarketingCampaign.findOne({
        name: { $regex: new RegExp(`^${cleanCampaignName.replace(/_/g, ' ')}$`, 'i') },
      });
      if (camp) {
        campaignId = camp._id.toString();
      }
    }

    let landingPageId: string | undefined = undefined;
    if (landingSlug) {
      const landing = await LandingPage.findOne({ slug: sanitizeText(landingSlug, 80) });
      if (landing) {
        landingPageId = landing._id.toString();
        landing.leadsCount = (landing.leadsCount || 0) + 1;
        await landing.save();
      }
    }

    const newLead = await Lead.create({
      fullName: safeName,
      phone: safePhone,
      email: email ? sanitizeText(email, 80) : undefined,
      courseId: courseId || undefined,
      status: 'YANGI',
      utmSource: safeSource,
      utmMedium: safeMedium,
      utmCampaignId: campaignId || undefined,
      utmContent: safeContent || undefined,
      utmTerm: safeTerm || undefined,
      landingPageId: landingPageId || undefined,
      notes: notes ? sanitizeText(notes, 200) : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Arizangiz muvaffaqiyatli qabul qilindi. Tez orada siz bilan bog'lanamiz!",
        leadId: newLead._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: "So'rovni qayta ishlashda xatolik yuz berdi" }, { status: 500 });
  }
}

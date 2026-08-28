import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MarketingPromotion } from '@/models/MarketingPromotion';
import { getSession, requireAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const promotions = await MarketingPromotion.find({})
      .populate('courseIds', 'name price')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, promotions });
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

    const { name, code, description, discountType, discountValue, startDate, endDate, usageLimit, courseIds } = body;

    if (!name || !code || !discountValue) {
      return NextResponse.json({ error: "Nomi, kodi va chegirma qiymati majburiy" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await MarketingPromotion.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ error: "Bunday promo kod allaqachon mavjud" }, { status: 400 });
    }

    const promotion = await MarketingPromotion.create({
      name: name.trim(),
      code: cleanCode,
      description,
      discountType: discountType || 'FOIZ',
      discountValue: Number(discountValue),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      courseIds: Array.isArray(courseIds) ? courseIds : [],
      status: 'FAOL',
    });

    return NextResponse.json({ success: true, promotion }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Aksiya yaratishda xatolik' }, { status: 500 });
  }
}

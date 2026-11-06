import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SystemSetting } from '@/models/SystemSetting';

import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const settings = await SystemSetting.find({});
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      academyName: settingsMap['academyName'] || 'INFAST IT-ACADEMY',
      phone: settingsMap['phone'] || '+998 90 271 00 27',
      address: settingsMap['address'] || "Buloqboshi tumani, Yangi Hokimiyat",
      telegramBotTokenConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
    });
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        await SystemSetting.findOneAndUpdate(
          { key },
          { value },
          { upsert: true, new: true }
        );
      }
    }

    return NextResponse.json({ success: true, message: "Sozlamalar saqlandi" });
  } catch (error: any) {
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

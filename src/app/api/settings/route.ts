import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SystemSetting } from '@/models/SystemSetting';

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await SystemSetting.find({});
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      academyName: settingsMap['academyName'] || 'INFAST IT-ACADEMY',
      phone: settingsMap['phone'] || '+998 71 200 00 00',
      address: settingsMap['address'] || "Toshkent sh., Yunusobod t., 4-mavze",
      telegramBotTokenConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Sozlamalarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
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
    return NextResponse.json({ error: error.message || "Saqlashda xatolik" }, { status: 500 });
  }
}

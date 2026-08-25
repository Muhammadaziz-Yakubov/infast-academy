import { NextResponse } from 'next/server';
import { testTelegramBotConnection, sendTelegramMessage } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { chatId } = body;

    const testRes = await testTelegramBotConnection();
    if (!testRes.success) {
      return NextResponse.json({ success: false, error: testRes.error || "Bot bilan ulanish bo'lmadi" }, { status: 400 });
    }

    if (chatId) {
      const messageText = `🤖 <b>INFAST IT-ACADEMY CRM</b>\n\n🟢 <b>Sinov xabari:</b> Bot guruh bilan muvaffaqiyatli bog'landi!\n\n<i>Dars eslatmalari va imtihon natijalari ushbu guruhga yuborib boriladi.</i>`;
      const sendRes = await sendTelegramMessage(chatId, messageText);
      if (sendRes.success) {
        return NextResponse.json({
          success: true,
          botName: testRes.botName,
          message: `Bot @${testRes.botName} muvaffaqiyatli ishlamoqda va guruhga (${chatId}) sinov xabari yuborildi! 🚀`,
        });
      } else {
        return NextResponse.json({
          success: false,
          botName: testRes.botName,
          error: `Bot faol, lekin guruhga xabar yuborib bo'lmadi: ${sendRes.error}`,
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      botName: testRes.botName,
      message: `Bot muvaffaqiyatli ulandi: @${testRes.botName}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Xatolik" }, { status: 500 });
  }
}

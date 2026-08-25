import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const update = await request.json();

    // Check if update contains a message
    const message = update.message || update.edited_message;
    if (message && message.chat && message.chat.id) {
      const chatId = message.chat.id.toString();
      const text = message.text || '';

      // Respond to /start or any text
      if (text.startsWith('/start') || text.startsWith('/help') || text.toLowerCase().includes('bot')) {
        const replyText = `🤖 <b>INFAST IT-ACADEMY CRM Bot</b>\n\nBot ishlamoqda, faol! 🟢\n\nTizim orqali guruhlarga dars eslatmalari va imtihon natijalari avtomatik yuboriladi. 🚀`;
        await sendTelegramMessage(chatId, replyText);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ status: 'error', error: error.message }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'INFAST IT-ACADEMY Telegram Webhook endpoint active. 🟢 Bot ishlamoqda, faol!',
  });
}

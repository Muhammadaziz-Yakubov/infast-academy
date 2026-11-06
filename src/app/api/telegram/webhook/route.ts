import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendTelegramMessage } from '@/lib/telegram';

function verifyWebhookSecret(request: Request): boolean {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expectedSecret) return false;

  const headerSecret = request.headers.get('x-telegram-bot-api-secret-token');
  if (!headerSecret) return false;

  const hashA = crypto.createHash('sha256').update(headerSecret).digest();
  const hashB = crypto.createHash('sha256').update(expectedSecret).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export async function POST(request: Request) {
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'INFAST IT-ACADEMY Telegram Webhook endpoint active. 🟢 Bot ishlamoqda, faol!',
  });
}

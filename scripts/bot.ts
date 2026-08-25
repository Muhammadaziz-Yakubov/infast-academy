import dotenv from 'dotenv';
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

if (!TELEGRAM_BOT_TOKEN) {
  console.error("❌ Telegram Bot Token is missing in .env!");
  process.exit(1);
}

console.log("🤖 INFAST Telegram Bot Service initializing...");

let offset = 0;

async function sendMessage(chatId: string | number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (err) {
    console.error("Error sending Telegram message:", err);
  }
}

async function pollUpdates() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=10`);
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          const msg = update.message || update.edited_message;
          if (msg && msg.chat && msg.chat.id) {
            const text = msg.text || '';
            console.log(`📩 Incoming message from ${msg.chat.first_name || msg.chat.title || 'User'} (${msg.chat.id}): ${text}`);

            if (text.startsWith('/start') || text.startsWith('/help') || text.toLowerCase().includes('bot')) {
              const reply = `🤖 <b>INFAST IT-ACADEMY CRM Bot</b>\n\nBot ishlamoqda, faol! 🟢\n\nTizim orqali guruhlarga dars eslatmalari va imtihon natijalari avtomatik yuboriladi. 🚀`;
              await sendMessage(msg.chat.id, reply);
            }
          }
        }
      }
    }
  } catch (err) {
    // Silent catch on network blips
  }

  setTimeout(pollUpdates, 1000);
}

// Start polling
pollUpdates();
console.log("🟢 Telegram Bot active & listening for /start commands!");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

/**
 * Normalizes Telegram Chat ID (adds leading - if missing for groups/supergroups)
 */
export function normalizeChatId(rawChatId: string): string {
  let cleaned = rawChatId.trim();
  if (!cleaned) return '';

  // If user pasted "1001234567890", format to "-1001234567890"
  if (/^100\d+$/.test(cleaned)) {
    return `-${cleaned}`;
  }
  // If numeric and positive (like 12345678), leave as is (private chat) or if group missing minus, format correctly
  return cleaned;
}

/**
 * Sends message to Telegram group or chat using bot token
 */
export async function sendTelegramMessage(chatIdInput: string, text: string): Promise<{ success: boolean; error?: string }> {
  if (!TELEGRAM_BOT_TOKEN) {
    return { success: false, error: "Telegram bot token sozlangan emas (.env)" };
  }

  const chatId = normalizeChatId(chatIdInput);
  if (!chatId) {
    return { success: false, error: "Telegram Chat ID kiritilmagan" };
  }

  try {
    let response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    let data = await response.json();

    // Fallback: If HTML entity parsing fails, retry with plain text
    if (!data.ok && data.description?.toLowerCase().includes("parse")) {
      response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      });
      data = await response.json();
    }

    if (!response.ok || !data.ok) {
      let desc = data.description || "Telegram API xatoligi";
      if (desc.includes("chat not found")) {
        desc = "Chat ID topilmadi. Bot guruhga a'zo qilinganiga va Chat ID to'g'riligiga ishonch hosil qiling.";
      } else if (desc.includes("bot was kicked") || desc.includes("not a member")) {
        desc = "Bot ushbu guruhga qo'shilmagan yoki chiqarib yuborilgan. Botni guruhga admin qilib qo'shing.";
      }
      return { success: false, error: desc };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Ulanish xatosi" };
  }
}

/**
 * Tests Telegram bot connection
 */
export async function testTelegramBotConnection(): Promise<{ success: boolean; botName?: string; error?: string }> {
  if (!TELEGRAM_BOT_TOKEN) {
    return { success: false, error: "Bot token kiritilmagan" };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const data = await response.json();

    if (response.ok && data.ok) {
      return { success: true, botName: data.result.first_name || data.result.username };
    } else {
      return { success: false, error: data.description || "Noto'g'ri bot token" };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Tarmoq xatosi" };
  }
}

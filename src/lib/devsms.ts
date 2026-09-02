const DEVSMS_BASE_URL = 'https://devsms.uz/api';
const DEFAULT_TOKEN = '7fc4003f7842594240f1c802f052eb1d03554285510a7c9084c779372c81ce55';

export function getDevSmsToken(): string {
  return process.env.DEVSMS_API_TOKEN || DEFAULT_TOKEN;
}

/**
 * Normalizes phone numbers to standard 12-digit format without + prefix (e.g. 998901234567)
 */
export function cleanPhoneNumber(phone: string | undefined | null): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    cleaned = '998' + cleaned;
  }
  return cleaned;
}

/**
 * Formats debt amount nicely for SMS (e.g. 600000 -> "600.000" or 32456.74 -> "32 456.74")
 */
export function formatDebtMoneyForSms(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  
  // Check if has decimals
  if (Number.isInteger(amount)) {
    return new Intl.NumberFormat('fr-FR').format(amount).replace(/\s/g, '.');
  }
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export interface SendSmsResponse {
  success: boolean;
  message?: string;
  data?: {
    sms_id?: number;
    request_id?: string;
    status?: string;
    parts_count?: number;
    total_cost?: number;
    balance?: number;
    type?: string;
  };
  error?: string;
}

/**
 * Sends a single SMS via DevSMS API
 */
export async function sendDevSms(phone: string, message: string): Promise<SendSmsResponse> {
  const token = getDevSmsToken();
  const normalizedPhone = cleanPhoneNumber(phone);

  if (!normalizedPhone || normalizedPhone.length !== 12) {
    return {
      success: false,
      error: `Noto'g'ri telefon raqami formati: ${phone}`,
    };
  }

  try {
    const res = await fetch(`${DEVSMS_BASE_URL}/send_sms.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        message,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "DevSMS serveriga ulanishda xatolik yuz berdi",
    };
  }
}

/**
 * Gets the current DevSMS balance and pricing info
 */
export async function getDevSmsBalance() {
  const token = getDevSmsToken();
  try {
    const res = await fetch(`${DEVSMS_BASE_URL}/get_balance.php`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "DevSMS balansini olishda xatolik",
    };
  }
}

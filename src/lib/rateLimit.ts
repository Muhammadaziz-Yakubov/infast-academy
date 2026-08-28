import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitRecord>();

/**
 * In-memory IP rate limiter helper
 * @param req NextRequest
 * @param limit Max allowed requests within window (default: 10)
 * @param windowMs Window duration in milliseconds (default: 60000ms / 1 min)
 */
export function rateLimit(
  req: NextRequest,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { success: boolean; response?: NextResponse } {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');

  const now = Date.now();
  const record = ipMap.get(ip);

  // Clean up expired entry or set new
  if (!record || now > record.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (record.count >= limit) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Too Many Requests. Please try again later.' },
        { status: 429 }
      ),
    };
  }

  record.count += 1;
  return { success: true };
}

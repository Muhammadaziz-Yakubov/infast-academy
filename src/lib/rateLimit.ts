import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { RateLimit } from '@/models/RateLimit';

/**
 * Extracts client IP safely:
 * Prefers x-vercel-forwarded-for / x-real-ip, falls back to the first entry in x-forwarded-for.
 */
export function getClientIp(req: Request | NextRequest): string {
  const vercelIp = req.headers.get('x-vercel-forwarded-for');
  if (vercelIp && vercelIp.trim()) {
    return vercelIp.trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return '127.0.0.1';
}

export interface RateLimitResult {
  success: boolean;
  response?: NextResponse;
  count?: number;
  remaining?: number;
  resetAt?: Date;
}

/**
 * Atomic MongoDB-backed rate limiter.
 *
 * @param key Unique key for limiting (e.g. `login:${ip}:${username}` or `ip:${ip}`)
 * @param limit Max allowed requests within window
 * @param windowMs Window duration in milliseconds (default: 60000ms / 1 min)
 */
export async function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): Promise<RateLimitResult> {
  try {
    await connectToDatabase();

    const now = new Date();
    const newResetAt = new Date(now.getTime() + windowMs);

    // Try to atomically increment if an active window already exists
    let doc = await RateLimit.findOneAndUpdate(
      { key, resetAt: { $gt: now } },
      { $inc: { count: 1 } },
      { new: true }
    );

    // If window expired or document didn't exist yet, reset/upsert
    if (!doc) {
      try {
        doc = await RateLimit.findOneAndUpdate(
          { key },
          { $set: { count: 1, resetAt: newResetAt } },
          { upsert: true, new: true }
        );
      } catch {
        // Handle race condition on concurrent upsert
        doc = await RateLimit.findOneAndUpdate(
          { key },
          { $inc: { count: 1 } },
          { new: true }
        );
      }
    }

    const currentCount = doc ? doc.count : 1;

    if (currentCount > limit) {
      return {
        success: false,
        count: currentCount,
        remaining: 0,
        resetAt: doc?.resetAt,
        response: NextResponse.json(
          { error: "So'rovlar soni me'yoridan oshdi. Iltimos, birozdan keyin qayta urinib ko'ring." },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil(windowMs / 1000).toString(),
            },
          }
        ),
      };
    }

    return {
      success: true,
      count: currentCount,
      remaining: Math.max(0, limit - currentCount),
      resetAt: doc?.resetAt,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // In case of unexpected DB error, fail open to avoid breaking all traffic
    return { success: true };
  }
}

/**
 * Convenience helper to rate limit directly by Request + optional key suffix.
 */
export async function rateLimit(
  req: Request | NextRequest,
  limit: number = 10,
  windowMs: number = 60 * 1000,
  keySuffix: string = ''
): Promise<RateLimitResult> {
  const ip = getClientIp(req);
  const key = keySuffix ? `${ip}:${keySuffix}` : ip;
  return checkRateLimit(key, limit, windowMs);
}

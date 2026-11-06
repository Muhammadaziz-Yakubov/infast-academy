import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import { Group, Course } from '@/models';
import { isGroupScheduledOnDate, getUzbekDayNameForDate } from '@/lib/calculations';
import { sendTelegramMessage } from '@/lib/telegram';
import { getSession } from '@/lib/auth';

function verifyCronAuth(request: Request): boolean {
  // 1. Check if user is logged in as an ADMIN
  const session = getSession();
  if (session && session.role === 'ADMIN') {
    return true;
  }

  // 2. Check secret token strictly from headers (query string is disallowed to prevent leak in logs)
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return false;

  const headerSecret = request.headers.get('x-cron-secret');
  const authHeader = request.headers.get('authorization');
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  const providedSecret = headerSecret || bearerSecret;
  if (!providedSecret) return false;

  const hashProvided = crypto.createHash('sha256').update(providedSecret).digest();
  const hashExpected = crypto.createHash('sha256').update(expectedSecret).digest();
  return crypto.timingSafeEqual(hashProvided, hashExpected);
}

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { error: "Ruxsat berilmadi. Maxfiy cron kaliti yoki admin autentifikatsiyasi talab qilinadi." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === 'true';
  return handleCronNotification(force);
}

export async function POST(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { error: "Ruxsat berilmadi. Maxfiy cron kaliti yoki admin autentifikatsiyasi talab qilinadi." },
      { status: 401 }
    );
  }

  let force = false;
  try {
    const body = await request.json().catch(() => ({}));
    force = body.force === true;
  } catch (e) {}
  return handleCronNotification(force);
}

async function handleCronNotification(force = false) {
  try {
    await connectToDatabase();
    // Guarantee Course model is registered in Mongoose schema registry
    if (Course && Course.modelName) {
      // Model touched
    }
    const today = new Date();
    const uzbekDayName = getUzbekDayNameForDate(today);

    const activeGroups = await Group.find({ status: 'ACTIVE' }).populate('courseId', 'name');

    const notificationResults = [];
    const skippedGroups = [];

    for (const group of activeGroups) {
      if (!group.telegramChatId) {
        skippedGroups.push({ groupName: group.name, reason: "Telegram Chat ID kiritilmagan" });
        continue;
      }

      const isScheduledToday = isGroupScheduledOnDate(group.schedules, today);

      if (isScheduledToday || force) {
        // Find matching schedules for today
        const todaySchedules = (group.schedules || []).filter((s) => {
          if (!s || !s.dayOfWeek) return false;
          return isGroupScheduledOnDate([s], today);
        });

        const timeStr = todaySchedules.length > 0
          ? todaySchedules.map((s) => `${s.startTime} - ${s.endTime}`).join(", ")
          : group.schedules?.[0]
          ? `${group.schedules[0].startTime} - ${group.schedules[0].endTime}`
          : "Belgilangan vaqtda";

        const courseName = (group.courseId as any)?.name || "Kurs";
        const roomInfo = group.room ? `\n📍 <b>Xona:</b> ${group.room}` : '';

        const messageText = `🔔 <b>DIQQAT, DARS ESLATMASI!</b>\n\n` +
          `Assalomu alaykum, hurmatli o'quvchilar! Bugun <b>${uzbekDayName}</b> kuni guruhimizda navbatdagi dars bo'lib o'tadi.\n\n` +
          `📚 <b>Kurs:</b> ${courseName}\n` +
          `👥 <b>Guruh:</b> ${group.name}\n` +
          `⏰ <b>Vaqt:</b> ${timeStr}${roomInfo}\n\n` +
          `⚡️ <i>Iltimos, darsga o'z vaqtida kelishingizni va kerakli o'quv qurollarini olib olishingizni so'raymiz. Kuting, yangi bilimlarni birgalikda o'rganamiz!</i> 🚀`;

        const sendResult = await sendTelegramMessage(group.telegramChatId, messageText);

        notificationResults.push({
          groupId: group._id,
          groupName: group.name,
          chatId: group.telegramChatId,
          success: sendResult.success,
          error: sendResult.error,
        });
      } else {
        skippedGroups.push({
          groupName: group.name,
          reason: `Bugun (${uzbekDayName}) guruh jadvalida dars yo'q`,
        });
      }
    }

    const successfulCount = notificationResults.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `${successfulCount} ta guruhga bugungi dars xabarnomalari muvaffaqiyatli yuborildi`,
      sentCount: successfulCount,
      totalGroupsProcessed: activeGroups.length,
      details: notificationResults,
      skipped: skippedGroups,
    });
  } catch (error: any) {
    console.error("Telegram cron error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

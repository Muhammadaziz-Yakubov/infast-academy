import { NextResponse } from 'next/server';
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

  // 2. Check secret token
  const expectedSecret = process.env.CRON_SECRET;
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const headerSecret = request.headers.get('x-cron-secret');
  const authHeader = request.headers.get('authorization');
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const providedSecret = querySecret || headerSecret || bearerSecret;

  if (expectedSecret && providedSecret && providedSecret === expectedSecret) {
    return true;
  }

  // If CRON_SECRET is not set in env yet, require ADMIN session
  return false;
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

        const messageText = `🔔 <b>BUGUNGI DARS ESLATMASI</b>\n\n` +
          `📚 <b>Kurs:</b> ${courseName}\n` +
          `👥 <b>Guruh:</b> ${group.name}${roomInfo}\n` +
          `🗓 <b>Kun:</b> ${uzbekDayName}\n` +
          `🕐 <b>Vaqt:</b> ${timeStr}\n\n` +
          `<i>Hurmatli talabalar, bugun darsingiz bor! Darsga o'z vaqtida kelishingizni so'raymiz. 🚀</i>`;

        const res = await sendTelegramMessage(group.telegramChatId, messageText);
        notificationResults.push({
          groupName: group.name,
          chatId: group.telegramChatId,
          sent: res.success,
          error: res.error,
        });
      } else {
        skippedGroups.push({ groupName: group.name, reason: `Bugunga (${uzbekDayName}) dars rejalashtirilmagan` });
      }
    }

    const successfulCount = notificationResults.filter((r) => r.sent).length;

    return NextResponse.json({
      success: true,
      uzbekDayName,
      message: `${successfulCount} ta guruhga bugungi dars xabarnomalari muvaffaqiyatli yuborildi`,
      sentCount: successfulCount,
      totalGroupsProcessed: activeGroups.length,
      details: notificationResults,
      skipped: skippedGroups,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xabarnoma yuborishda xatolik" }, { status: 500 });
  }
}

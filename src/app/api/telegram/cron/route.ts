import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Group, Course } from '@/models';
import { isGroupScheduledOnDate, getUzbekDayNameForDate } from '@/lib/calculations';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === 'true';
  return handleCronNotification(force);
}

export async function POST(request: Request) {
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

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Group } from '@/models/Group';
import { Course } from '@/models/Course';
import { isGroupScheduledOnDate } from '@/lib/calculations';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET() {
  return handleCronNotification();
}

export async function POST() {
  return handleCronNotification();
}

async function handleCronNotification() {
  try {
    await connectToDatabase();
    const today = new Date();

    const activeGroups = await Group.find({ status: 'ACTIVE' }).populate('courseId', 'name');

    const notificationResults = [];

    for (const group of activeGroups) {
      if (!group.telegramChatId) continue;

      if (isGroupScheduledOnDate(group.schedules, today)) {
        const schedule = group.schedules.find((s) => isGroupScheduledOnDate([s], today));
        const timeStr = schedule ? `${schedule.startTime} - ${schedule.endTime}` : "Belgilangan vaqtda";
        const courseName = (group.courseId as any)?.name || "Kurs";

        const messageText = `🔔 <b>BUGUNGI DARS</b>\n\n📚 <b>Kurs:</b> ${courseName}\n👥 <b>Guruh:</b> ${group.name}\n🕐 <b>Vaqt:</b> ${timeStr}\n\nIltimos, darsga o'z vaqtida keling. 🚀`;

        const res = await sendTelegramMessage(group.telegramChatId, messageText);
        notificationResults.push({
          groupName: group.name,
          chatId: group.telegramChatId,
          sent: res.success,
          error: res.error,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${notificationResults.length} ta guruhga bugungi dars xabarnomalari yuborildi`,
      details: notificationResults,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xabarnoma yuborishda xatolik" }, { status: 500 });
  }
}

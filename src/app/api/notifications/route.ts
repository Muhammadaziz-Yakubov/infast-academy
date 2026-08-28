import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';

import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ isRead: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xabarlarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      await Notification.updateMany({ isRead: false }, { isRead: true });
      return NextResponse.json({ success: true, message: "Barcha xabarlar o'qildi deb belgilandi" });
    }

    if (id) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Nojo'ya so'rov" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xatolik yuz berdi" }, { status: 500 });
  }
}

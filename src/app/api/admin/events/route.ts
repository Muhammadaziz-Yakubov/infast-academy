import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { StudentProgress } from '@/models/StudentProgress';
import { StudentActivity } from '@/models/StudentActivity';
import { getSession } from '@/lib/auth';

// GET all events with participants list for Admin
export async function GET(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();

    const events = await Event.find()
      .populate({
        path: 'registrations.studentId',
        select: 'firstName lastName phone studentCode branchId groupId avatarUrl',
        populate: [
          { path: 'branchId', select: 'name' },
          { path: 'groupId', select: 'name' },
        ],
      })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Tadbirlarni olishda xatolik" },
      { status: 500 }
    );
  }
}

// POST create new Event
export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { title, description, imageUrl, date, location, maxParticipants, coinReward, coinPenalty } = body;

    if (!title || !date || !location) {
      return NextResponse.json(
        { error: "Tadbir nomi, sanasi va manzili kiritilishi shart" },
        { status: 400 }
      );
    }

    const event = await Event.create({
      title,
      description: description || 'InFast IT-Academy maxsus tadbiri',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
      date: new Date(date),
      location,
      maxParticipants: Number(maxParticipants || 100),
      coinReward: Number(coinReward || 500),
      coinPenalty: Number(coinPenalty || 500),
      status: 'UPCOMING',
      registrations: [],
    });

    return NextResponse.json({
      success: true,
      message: "Yangi tadbir muvaffaqiyatli e'lon qilindi!",
      event,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Tadbir yaratishda xatolik" },
      { status: 500 }
    );
  }
}

// PATCH mark attendance (ATTENDED -> +500 coin, ABSENT -> -500 coin)
export async function PATCH(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { eventId, studentId, status } = body; // status: 'ATTENDED' | 'ABSENT'

    if (!eventId || !studentId || !status) {
      return NextResponse.json(
        { error: "Tadbir, talaba va davomat holati ko'rsatilishi shart" },
        { status: 400 }
      );
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Tadbir topilmadi" }, { status: 404 });
    }

    const reg = event.registrations.find(
      (r) => r.studentId.toString() === studentId.toString()
    );

    if (!reg) {
      return NextResponse.json(
        { error: "Talaba ushbu tadbirga ro'yxatdan o'tmagan" },
        { status: 400 }
      );
    }

    const oldStatus = reg.status;
    reg.status = status;

    // Coins processing logic
    const rewardCoins = event.coinReward || 500;
    const penaltyCoins = event.coinPenalty || 500;

    // Process coins only if status changed
    if (oldStatus !== status) {
      let deltaCoins = 0;
      if (status === 'ATTENDED') {
        // If was absent before, reverse penalty (-500) and add reward (+500) = +1000
        deltaCoins = oldStatus === 'ABSENT' ? rewardCoins + penaltyCoins : rewardCoins;
      } else if (status === 'ABSENT') {
        // If was attended before, reverse reward (+500) and subtract penalty (-500) = -1000
        deltaCoins = oldStatus === 'ATTENDED' ? -(rewardCoins + penaltyCoins) : -penaltyCoins;
      }

      if (deltaCoins !== 0) {
        await StudentProgress.findOneAndUpdate(
          { studentId },
          { $inc: { xcoin: deltaCoins } },
          { upsert: true }
        );

        await StudentActivity.create({
          studentId,
          type: status === 'ATTENDED' ? 'EVENT_ATTENDED' : 'EVENT_ABSENT',
          title: `Tadbir davomati: ${event.title}`,
          description:
            status === 'ATTENDED'
              ? `Tadbirda qatnashgani uchun +${rewardCoins} XCoin mukofotlandi!`
              : `Tadbirga kelmaganligi sababli -${penaltyCoins} XCoin jarima berildi.`,
          rewardXCoin: deltaCoins,
          metadata: { eventId: event._id, status },
        });

        reg.coinsProcessed = true;
        reg.processedAt = new Date();
      }
    }

    await event.save();

    return NextResponse.json({
      success: true,
      message:
        status === 'ATTENDED'
          ? `Keldi deb belgilandi (+${rewardCoins} XCoin berildi)`
          : `Kelmadi deb belgilandi (-${penaltyCoins} XCoin jarima qilindi)`,
      event,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Tadbir davomatini belgilashda xatolik" },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { getStudentSession } from '@/lib/auth';

// GET list of events for Student App
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const session = getStudentSession(authHeader);

    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();

    const rawEvents = await Event.find({ status: { $ne: 'CANCELLED' } })
      .sort({ date: 1 })
      .lean();

    const events = rawEvents.map((evt: any) => {
      const myReg = (evt.registrations || []).find(
        (r: any) => r.studentId.toString() === session.id
      );

      return {
        _id: evt._id.toString(),
        title: evt.title,
        description: evt.description,
        imageUrl: evt.imageUrl,
        date: evt.date,
        location: evt.location,
        coinReward: evt.coinReward || 500,
        coinPenalty: evt.coinPenalty || 500,
        maxParticipants: evt.maxParticipants || 100,
        participantsCount: (evt.registrations || []).length,
        status: evt.status,
        isRegistered: !!myReg,
        myAttendanceStatus: myReg ? myReg.status : null,
      };
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Tadbirlarni yuklashda xatolik" },
      { status: 500 }
    );
  }
}

// POST register or unregister student to Event
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const session = getStudentSession(authHeader);

    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { eventId, action } = body; // action: 'REGISTER' | 'UNREGISTER'

    if (!eventId) {
      return NextResponse.json({ error: "Tadbir tanlanmadi" }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Tadbir topilmadi" }, { status: 404 });
    }

    const existingIdx = event.registrations.findIndex(
      (r) => r.studentId.toString() === session.id
    );

    if (action === 'UNREGISTER') {
      if (existingIdx === -1) {
        return NextResponse.json({ error: "Siz ushbu tadbirga yozilmagansiz" }, { status: 400 });
      }

      event.registrations.splice(existingIdx, 1);
      await event.save();

      return NextResponse.json({
        success: true,
        message: "Tadbirdan ro'yxatdan o'tish bekor qilindi.",
      });
    }

    // Default: REGISTER
    if (existingIdx !== -1) {
      return NextResponse.json({ error: "Siz allaqachon ushbu tadbirga yozilgansiz!" }, { status: 400 });
    }

    if (event.registrations.length >= (event.maxParticipants || 100)) {
      return NextResponse.json({ error: "Kechirasiz, tadbirda bo'sh joy qolmagan" }, { status: 400 });
    }

    event.registrations.push({
      studentId: session.id as any,
      registeredAt: new Date(),
      status: "REGISTERED",
      coinsProcessed: false,
    });

    await event.save();

    return NextResponse.json({
      success: true,
      message: "🎉 Tadbirga muvaffaqiyatli yozildingiz! Tadbirga o'z vaqtida kelishingizni kutamiz.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Tadbirga yozilishda xatolik" },
      { status: 500 }
    );
  }
}

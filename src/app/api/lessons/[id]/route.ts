import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Lesson } from '@/models/Lesson';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const lesson = await Lesson.findById(params.id)
      .populate('courseId', 'name')
      .populate('moduleId', 'title')
      .lean();

    if (!lesson) {
      return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lesson });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Darsni olishda xatolik" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    // Prevent any videoUrl injection (no video lesson architecture)
    if ('videoUrl' in body) {
      delete body.videoUrl;
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(params.id, body, { new: true });

    if (!updatedLesson) {
      return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lesson: updatedLesson });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Darsni yangilashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const deleted = await Lesson.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Dars muvaffaqiyatli o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Darsni o'chirishda xatolik" }, { status: 500 });
  }
}

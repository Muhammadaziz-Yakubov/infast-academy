import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Module } from '@/models/Module';
import { Lesson } from '@/models/Lesson';
import { Course } from '@/models/Course';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const course = await Course.findById(params.id).lean();
    if (!course) {
      return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    }

    const modules = await Module.find({ courseId: params.id }).sort({ order: 1 }).lean();

    // Attach lesson counts
    const moduleIds = modules.map((m: any) => m._id);
    const lessonCounts = await Lesson.aggregate([
      { $match: { moduleId: { $in: moduleIds } } },
      { $group: { _id: '$moduleId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(lessonCounts.map((lc) => [lc._id.toString(), lc.count]));

    const enrichedModules = modules.map((m: any) => ({
      ...m,
      lessonCount: countMap.get(m._id.toString()) || 0,
    }));

    return NextResponse.json({ success: true, modules: enrichedModules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Modullarni olishda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, order, status } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Modul nomi kiritilishi shart" }, { status: 400 });
    }

    // Determine order if not specified
    let targetOrder = Number(order);
    if (isNaN(targetOrder) || targetOrder < 1) {
      const highestModule = await Module.findOne({ courseId: params.id }).sort({ order: -1 });
      targetOrder = highestModule ? highestModule.order + 1 : 1;
    }

    const newModule = await Module.create({
      courseId: params.id,
      title: title.trim(),
      description: description?.trim() || '',
      order: targetOrder,
      status: status || 'ACTIVE',
    });

    return NextResponse.json({ success: true, module: newModule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Modul yaratishda xatolik" }, { status: 500 });
  }
}

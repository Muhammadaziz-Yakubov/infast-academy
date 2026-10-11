import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Module } from '@/models/Module';
import { Lesson } from '@/models/Lesson';
import { getSession } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const updatedModule = await Module.findOneAndUpdate(
      { _id: params.moduleId, courseId: params.id },
      body,
      { new: true }
    );

    if (!updatedModule) {
      return NextResponse.json({ error: "Modul topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, module: updatedModule });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Modulni tahrirlashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const deletedModule = await Module.findOneAndDelete({
      _id: params.moduleId,
      courseId: params.id,
    });

    if (!deletedModule) {
      return NextResponse.json({ error: "Modul topilmadi" }, { status: 404 });
    }

    // Cascade delete lessons belonging to this module
    await Lesson.deleteMany({ moduleId: params.moduleId });

    return NextResponse.json({
      success: true,
      message: "Modul va unga tegishli barcha darslar o'chirildi",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Modulni o'chirishda xatolik" }, { status: 500 });
  }
}

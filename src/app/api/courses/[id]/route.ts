import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Course } from '@/models/Course';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const updatedCourse = await Course.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedCourse) {
      return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Tahrirlashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    await Course.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Kurs o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "O'chirishda xatolik" }, { status: 500 });
  }
}

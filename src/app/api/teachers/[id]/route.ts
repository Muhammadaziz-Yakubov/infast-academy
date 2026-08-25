import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Teacher } from '@/models/Teacher';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const updatedTeacher = await Teacher.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedTeacher) {
      return NextResponse.json({ error: "O'qituvchi topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, teacher: updatedTeacher });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Tahrirlashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    await Teacher.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "O'qituvchi o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "O'chirishda xatolik" }, { status: 500 });
  }
}

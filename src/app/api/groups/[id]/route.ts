import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Group } from '@/models/Group';
import { Student } from '@/models/Student';
import { Attendance } from '@/models/Attendance';
import { Payment } from '@/models/Payment';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const group = await Group.findById(params.id)
      .populate('courseId', 'name price durationMonths')
      .populate('teacherId', 'firstName lastName phone');

    if (!group) {
      return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });
    }

    const students = await Student.find({ groupId: params.id }).sort({ firstName: 1 });
    const studentIds = students.map((s) => s._id);

    // Read-only attendance for this group
    const attendances = await Attendance.find({ groupId: params.id }).sort({ date: -1 });

    // Payments for this group
    const payments = await Payment.find({ studentId: { $in: studentIds } }).sort({ paymentDate: -1 });

    return NextResponse.json({
      group,
      students,
      studentCount: students.length,
      attendances, // Read-Only in group detail
      payments,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const updatedGroup = await Group.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedGroup) {
      return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, group: updatedGroup });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Tahrirlashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    await Group.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Guruh o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "O'chirishda xatolik" }, { status: 500 });
  }
}

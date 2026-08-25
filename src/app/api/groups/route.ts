import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Group } from '@/models/Group';
import { Student } from '@/models/Student';
import { Course } from '@/models/Course';
import { Teacher } from '@/models/Teacher';

export async function GET() {
  try {
    await connectToDatabase();

    const groups = await Group.find({})
      .populate('courseId', 'name price')
      .populate('teacherId', 'firstName lastName phone')
      .sort({ createdAt: -1 });

    const groupIds = groups.map((g) => g._id);

    // Count enrolled active students
    const studentCounts = await Student.aggregate([
      { $match: { groupId: { $in: groupIds }, status: 'ACTIVE' } },
      { $group: { _id: '$groupId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(studentCounts.map((sc) => [sc._id.toString(), sc.count]));

    const result = groups.map((g) => ({
      ...g.toObject(),
      studentCount: countMap.get(g._id.toString()) || 0,
    }));

    return NextResponse.json({ groups: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Guruhlarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { name, courseId, teacherId, room, telegramChatId, schedules, status } = body;

    if (!name || !courseId || !teacherId || !room || !schedules || schedules.length === 0) {
      return NextResponse.json({ error: "Barcha majburiy maydonlar va jadvalni to'ldiring" }, { status: 400 });
    }

    const existingGroup = await Group.findOne({ name: name.trim() });
    if (existingGroup) {
      return NextResponse.json({ error: "Bunday nomli guruh mavjud" }, { status: 400 });
    }

    const newGroup = await Group.create({
      name: name.trim(),
      courseId,
      teacherId,
      room,
      telegramChatId: telegramChatId ? telegramChatId.trim() : undefined,
      schedules,
      status: status || "ACTIVE",
    });

    return NextResponse.json({ success: true, group: newGroup }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Guruh yaratishda xatolik" }, { status: 500 });
  }
}

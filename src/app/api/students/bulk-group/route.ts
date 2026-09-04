import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Group } from '@/models/Group';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const { studentIds, groupId } = body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "Kamida bitta talaba tanlanishi kerak" },
        { status: 400 }
      );
    }

    if (!groupId) {
      return NextResponse.json(
        { error: "Yangi guruh tanlanishi kerak" },
        { status: 400 }
      );
    }

    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json(
        { error: "Tanlangan guruh topilmadi" },
        { status: 400 }
      );
    }

    // Update only the groupId for the selected students
    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { groupId } }
    );

    return NextResponse.json({
      success: true,
      count: result.modifiedCount,
      message: `${result.modifiedCount} ta talabaning guruhi "${group.name}" guruhiga o'zgartirildi`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Guruhni o'zgartirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

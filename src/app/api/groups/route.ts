import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Group } from '@/models/Group';
import { Student } from '@/models/Student';
import { Course } from '@/models/Course';

import { getSession, getBranchFilter } from '@/lib/auth';
import { Branch } from '@/models/Branch';

export async function GET(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const branchIdParam = searchParams.get('branchId');

    const branchAccess = getBranchFilter(session, branchIdParam);
    if (branchAccess.error) {
      return NextResponse.json({ error: branchAccess.error }, { status: 403 });
    }

    const groups = await Group.find(branchAccess.filter)
      .populate('courseId', 'name price')
      .populate('branchId', 'name code')
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
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const { name, courseId, room, telegramChatId, schedules, status, branchId } = body;

    if (!name || !courseId || !room || !schedules || schedules.length === 0) {
      return NextResponse.json({ error: "Barcha majburiy maydonlar va jadvalni to'ldiring" }, { status: 400 });
    }

    const existingGroup = await Group.findOne({ name: name.trim() });
    if (existingGroup) {
      return NextResponse.json({ error: "Bunday nomli guruh mavjud" }, { status: 400 });
    }

    let targetBranchId = branchId;
    if (!targetBranchId) {
      if (session.branchId) {
        targetBranchId = session.branchId;
      } else {
        const defaultBranch = await Branch.findOne({ status: 'active' });
        targetBranchId = defaultBranch?._id;
      }
    }

    if (session.role === 'MANAGER' && session.branchId) {
      if (targetBranchId && targetBranchId.toString() !== session.branchId.toString()) {
        return NextResponse.json({ error: "Siz faqat o'z filialingizda guruh yarata olasiz" }, { status: 403 });
      }
    }

    const newGroup = await Group.create({
      name: name.trim(),
      courseId,
      branchId: targetBranchId,
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

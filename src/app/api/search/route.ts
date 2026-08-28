import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Group } from '@/models/Group';
import { Course } from '@/models/Course';
import { getSession } from '@/lib/auth';
import { escapeRegex } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = (searchParams.get('q') || '').trim();

    if (!rawQuery || rawQuery.length < 2) {
      return NextResponse.json({
        students: [],
        groups: [],
        courses: [],
      });
    }

    if (rawQuery.length > 100) {
      return NextResponse.json({ error: "Qidiruv so'rovi juda uzun (max 100 belgi)" }, { status: 400 });
    }

    await connectToDatabase();
    const safeQuery = escapeRegex(rawQuery);
    const regex = new RegExp(safeQuery, 'i');

    const [students, groups, courses] = await Promise.all([
      Student.find({
        $or: [
          { studentCode: regex },
          { firstName: regex },
          { lastName: regex },
          { phone: regex },
        ],
      })
        .populate('courseId', 'name')
        .populate('groupId', 'name')
        .limit(6),

      Group.find({
        $or: [
          { name: regex },
          { room: regex },
        ],
      })
        .populate('courseId', 'name')
        .limit(6),

      Course.find({
        name: regex,
      }).limit(5),
    ]);

    return NextResponse.json({
      students,
      groups,
      courses,
    });
  } catch (error: any) {
    console.error("Global Search API Error:", error);
    return NextResponse.json({ error: "Qidiruvda xatolik yuz berdi" }, { status: 500 });
  }
}

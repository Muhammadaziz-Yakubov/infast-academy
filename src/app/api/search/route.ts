import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Group } from '@/models/Group';
import { Course } from '@/models/Course';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        students: [],
        groups: [],
        courses: [],
      });
    }

    await connectToDatabase();
    const regex = new RegExp(query, 'i');

    const [students, groups, courses] = await Promise.all([
      Student.find({
        $or: [
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

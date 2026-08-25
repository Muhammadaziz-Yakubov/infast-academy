import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Group } from '@/models/Group';
import { Course } from '@/models/Course';
import { Teacher } from '@/models/Teacher';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        students: [],
        groups: [],
        courses: [],
        teachers: [],
      });
    }

    await connectToDatabase();
    const regex = new RegExp(query, 'i');

    const [students, groups, courses, teachers] = await Promise.all([
      // Search Students
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

      // Search Groups
      Group.find({
        $or: [
          { name: regex },
          { room: regex },
        ],
      })
        .populate('courseId', 'name')
        .populate('teacherId', 'firstName lastName')
        .limit(6),

      // Search Courses
      Course.find({
        name: regex,
      }).limit(5),

      // Search Teachers
      Teacher.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { phone: regex },
        ],
      }).limit(5),
    ]);

    return NextResponse.json({
      students,
      groups,
      courses,
      teachers,
    });
  } catch (error: any) {
    console.error("Global Search API Error:", error);
    return NextResponse.json({ error: "Qidiruvda xatolik yuz berdi" }, { status: 500 });
  }
}

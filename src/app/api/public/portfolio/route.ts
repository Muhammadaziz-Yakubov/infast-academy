import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Course } from '@/models/Course';
import { Group } from '@/models/Group';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    // Ensure models registered
    const _c = Course;
    const _g = Group;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';
    const courseId = searchParams.get('courseId') || '';

    const filter: any = {
      isPublicPortfolio: { $ne: false },
    };

    if (courseId) {
      filter.courseId = courseId;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter)
      .select('firstName lastName studentCode avatarUrl bio skills githubUrl linkedinUrl telegramUsername projects slug status courseId groupId joinedDate')
      .populate('courseId', 'name')
      .populate('groupId', 'name')
      .sort({ updatedAt: -1 })
      .limit(50);

    const talents = students.map((s) => ({
      id: s._id,
      slug: s.slug || s._id,
      name: `${s.firstName} ${s.lastName}`,
      studentCode: s.studentCode,
      avatarUrl: s.avatarUrl,
      bio: s.bio || "InFAST IT-Academy o'quvchisi",
      skills: s.skills || [],
      githubUrl: s.githubUrl,
      linkedinUrl: s.linkedinUrl,
      projectsCount: (s.projects || []).length,
      courseName: (s.courseId as any)?.name || 'IT Kursi',
      groupName: (s.groupId as any)?.name || 'Guruh',
      status: s.status,
    }));

    return NextResponse.json({ success: true, count: talents.length, talents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xatolik yuz berdi" }, { status: 500 });
  }
}

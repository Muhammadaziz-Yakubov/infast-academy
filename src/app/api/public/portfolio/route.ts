import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Course } from '@/models/Course';
import { Group } from '@/models/Group';
import { escapeRegex } from '@/lib/utils';

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
      if (search.length > 100) {
        return NextResponse.json({ error: "Qidiruv so'rovi juda uzun (max 100 belgi)" }, { status: 400 });
      }
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { firstName: { $regex: safeSearch, $options: 'i' } },
        { lastName: { $regex: safeSearch, $options: 'i' } },
        { skills: { $in: [new RegExp(safeSearch, 'i')] } },
        { bio: { $regex: safeSearch, $options: 'i' } },
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
      firstName: s.firstName,
      lastName: s.lastName,
      studentCode: s.studentCode,
      avatarUrl: s.avatarUrl,
      bio: s.bio || "InFAST IT-Academy bitiruvchisi / iqtidorli talabasi",
      skills: s.skills || [],
      githubUrl: s.githubUrl,
      linkedinUrl: s.linkedinUrl,
      telegramUsername: s.telegramUsername,
      projectsCount: (s.projects || []).length,
      featuredProjects: (s.projects || []).slice(0, 2).map((p) => ({
        title: p.title,
        description: p.description,
        technologies: p.technologies || [],
        githubRepo: p.githubRepo,
        liveDemo: p.liveDemo,
      })),
      courseName: (s.courseId as any)?.name || 'IT Kursi',
      groupName: (s.groupId as any)?.name || 'Guruh',
      status: s.status,
    }));

    return NextResponse.json({ success: true, count: talents.length, talents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xatolik yuz berdi" }, { status: 500 });
  }
}

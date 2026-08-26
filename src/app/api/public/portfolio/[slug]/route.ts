import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Attendance } from '@/models/Attendance';
import { ExamResult } from '@/models/ExamResult';
import { Course } from '@/models/Course';
import { Group } from '@/models/Group';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();
    // Ensure models registered
    const _c = Course;
    const _g = Group;

    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ error: "Slug ko'rsatilmadi" }, { status: 400 });
    }

    // Try finding by slug first, fallback to ObjectId
    let student = await Student.findOne({
      $or: [{ slug: slug.toLowerCase() }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
    })
      .populate('courseId', 'name description price durationMonths')
      .populate('groupId', 'name room schedules');

    if (!student) {
      return NextResponse.json({ error: "Talaba portfoliosi topilmadi" }, { status: 404 });
    }

    if (student.isPublicPortfolio === false) {
      return NextResponse.json({ error: "Ushbu portfolio shaxsiy rejimga o'tkazilgan" }, { status: 403 });
    }

    // Attendance stats
    const attendances = await Attendance.find({ studentId: student._id });
    const totalAttendanceCount = attendances.length;
    const presentCount = attendances.filter((a) => a.status === 'PRESENT').length;
    const attendancePercentage = totalAttendanceCount > 0
      ? Math.round((presentCount / totalAttendanceCount) * 100)
      : 100;

    // Exam stats & scores
    const examResults = await ExamResult.find({ studentId: student._id })
      .populate({ path: 'examId', select: 'name maxScore passingScore' })
      .sort({ createdAt: -1 });

    const totalExamScore = examResults.reduce((acc, r) => acc + (r.score || 0), 0);
    const totalMaxScore = examResults.reduce((acc, r) => acc + ((r.examId as any)?.maxScore || 100), 0);
    const avgExamPercentage = examResults.length > 0 && totalMaxScore > 0
      ? Math.round((totalExamScore / totalMaxScore) * 100)
      : 100;

    return NextResponse.json({
      success: true,
      portfolio: {
        id: student._id,
        slug: student.slug || student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentCode: student.studentCode,
        avatarUrl: student.avatarUrl,
        bio: student.bio || "InFAST IT-Academy o'quvchisi",
        skills: student.skills || [],
        githubUrl: student.githubUrl || '',
        linkedinUrl: student.linkedinUrl || '',
        telegramUsername: student.telegramUsername || '',
        projects: student.projects || [],
        joinedDate: student.joinedDate,
        status: student.status,
        course: student.courseId,
        group: student.groupId,
        stats: {
          attendancePercentage,
          avgExamPercentage,
          totalExamsPassed: examResults.filter((r) => r.isPassed).length,
          completedProjectsCount: (student.projects || []).length,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xatolik yuz berdi" }, { status: 500 });
  }
}

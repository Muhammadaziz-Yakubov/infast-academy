import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Course } from '@/models/Course';
import { Module } from '@/models/Module';
import { Lesson } from '@/models/Lesson';
import { StudentProgress, ILessonState } from '@/models/StudentProgress';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const student = await Student.findById(params.id).populate('branchId', 'name').lean();
    if (!student) {
      return NextResponse.json({ error: 'Talaba topilmadi' }, { status: 404 });
    }

    // Branch isolation for manager
    if (session.role === 'MANAGER') {
      const studentBranchId = (student.branchId as any)?._id?.toString() || (student.branchId as any)?.toString();
      if (session.branchId && studentBranchId !== session.branchId.toString()) {
        return NextResponse.json(
          { error: "Siz faqat o'zingizga biriktirilgan filial talabasining ma'lumotlarini ko'rishingiz mumkin" },
          { status: 403 }
        );
      }
    }

    if (!student.courseId) {
      return NextResponse.json({ error: "Talaba hech qanday kursga biriktirilmagan" }, { status: 400 });
    }

    const courseId = student.courseId;

    // Fetch or create StudentProgress
    let progress = await StudentProgress.findOne({ studentId: student._id, courseId });

    // Fetch all active modules and lessons for this course
    const modules = await Module.find({ courseId, status: 'ACTIVE' }).sort({ order: 1 }).lean();
    const moduleIds = modules.map((m: any) => m._id);
    const lessons = await Lesson.find({ moduleId: { $in: moduleIds }, status: 'ACTIVE' })
      .sort({ moduleId: 1, order: 1 })
      .lean();

    // If progress doesn't exist yet, initialize it
    if (!progress) {
      const firstLesson = lessons[0];
      progress = await StudentProgress.create({
        studentId: student._id,
        courseId,
        startingLessonId: firstLesson ? firstLesson._id : undefined,
        currentLessonId: firstLesson ? firstLesson._id : undefined,
        unlockedLessonIds: firstLesson ? [firstLesson._id] : [],
        completedLessonIds: [],
        lessonStates: firstLesson
          ? [
              {
                lessonId: firstLesson._id,
                status: 'UNLOCKED',
                theoryRead: false,
                testPassed: false,
                testScore: 0,
                testAttempts: 0,
                practiceCompleted: false,
                updatedAt: new Date(),
              },
            ]
          : [],
        xp: 0,
        xcoin: 0,
        level: 1,
      });
    }

    // Build lookup maps for fast state matching
    const completedSet = new Set(
      (progress.completedLessonIds || []).map((id: any) => id.toString())
    );
    const unlockedSet = new Set(
      (progress.unlockedLessonIds || []).map((id: any) => id.toString())
    );
    const stateMap = new Map<string, ILessonState>();
    (progress.lessonStates || []).forEach((st: any) => {
      stateMap.set(st.lessonId.toString(), st);
    });

    const startingLessonIdStr = progress.startingLessonId?.toString();
    const currentLessonIdStr = progress.currentLessonId?.toString();

    // Group lessons by module
    const lessonsByModule = new Map<string, any[]>();
    for (let idx = 0; idx < lessons.length; idx++) {
      const l = lessons[idx];
      const lIdStr = l._id.toString();
      const mIdStr = l.moduleId.toString();
      const st = stateMap.get(lIdStr);

      let status = 'LOCKED';
      if (completedSet.has(lIdStr)) {
        status = 'COMPLETED';
      } else if (unlockedSet.has(lIdStr)) {
        status = st?.theoryRead || st?.testPassed ? 'IN_PROGRESS' : 'UNLOCKED';
      }

      // Check prerequisite: previous lesson must be completed
      let prerequisiteMet = true;
      if (idx > 0) {
        const startingIdx = startingLessonIdStr
          ? lessons.findIndex((les: any) => les._id.toString() === startingLessonIdStr)
          : 0;
        if (idx > Math.max(0, startingIdx)) {
          const prevLessonId = lessons[idx - 1]._id.toString();
          prerequisiteMet = completedSet.has(prevLessonId);
        }
      }

      const lessonSummary = {
        _id: l._id,
        moduleId: l.moduleId,
        title: l.title,
        order: l.order,
        description: l.description,
        status,
        prerequisiteMet,
        isStarting: lIdStr === startingLessonIdStr,
        isCurrent: lIdStr === currentLessonIdStr,
        theoryRead: st?.theoryRead || false,
        testPassed: st?.testPassed || false,
        testScore: st?.testScore || 0,
        testAttempts: st?.testAttempts || 0,
        practiceCompleted: st?.practiceCompleted || false,
        xpReward: l.xpReward,
        xcoinReward: l.xcoinReward,
        totalQuestions: l.testQuestions?.length || 9,
      };

      if (!lessonsByModule.has(mIdStr)) {
        lessonsByModule.set(mIdStr, []);
      }
      lessonsByModule.get(mIdStr)!.push(lessonSummary);
    }

    const structuredModules = modules.map((m: any) => {
      const moduleLessons = lessonsByModule.get(m._id.toString()) || [];
      const completedCount = moduleLessons.filter((l) => l.status === 'COMPLETED').length;
      return {
        ...m,
        lessons: moduleLessons,
        completedCount,
        totalCount: moduleLessons.length,
        completionPercent:
          moduleLessons.length > 0 ? Math.round((completedCount / moduleLessons.length) * 100) : 0,
      };
    });

    const totalLessonsCount = lessons.length;
    const totalCompletedCount = completedSet.size;
    const overallPercentage =
      totalLessonsCount > 0 ? Math.round((totalCompletedCount / totalLessonsCount) * 100) : 0;
    const calculatedLevel = Math.floor(progress.xp / 100) + 1;

    return NextResponse.json({
      success: true,
      progress: {
        _id: progress._id,
        xp: progress.xp,
        xcoin: progress.xcoin,
        level: Math.max(progress.level || 1, calculatedLevel),
        startingLessonId: progress.startingLessonId,
        currentLessonId: progress.currentLessonId,
        completedCount: totalCompletedCount,
        totalCount: totalLessonsCount,
        percentage: overallPercentage,
      },
      modules: structuredModules,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Progress ma'lumotlarini olishda xatolik" }, { status: 500 });
  }
}

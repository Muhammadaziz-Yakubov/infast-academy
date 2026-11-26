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

    // Fetch all active modules and lessons for this course in exact curriculum order
    const modules = await Module.find({ courseId, status: 'ACTIVE' }).sort({ order: 1 }).lean();
    const moduleOrderMap = new Map<string, number>();
    modules.forEach((m: any, idx: number) => {
      moduleOrderMap.set(m._id.toString(), m.order ?? idx);
    });

    const moduleIds = modules.map((m: any) => m._id);
    const lessons = await Lesson.find({ moduleId: { $in: moduleIds }, status: 'ACTIVE' }).lean();
    lessons.sort((a: any, b: any) => {
      const modA = moduleOrderMap.get(a.moduleId.toString()) ?? 0;
      const modB = moduleOrderMap.get(b.moduleId.toString()) ?? 0;
      if (modA !== modB) return modA - modB;
      return (a.order || 0) - (b.order || 0);
    });

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

    const startingLessonIdStr = progress.startingLessonId?.toString();
    const startingIdx = startingLessonIdStr
      ? lessons.findIndex((les: any) => les._id.toString() === startingLessonIdStr)
      : 0;

    // Self-healing: if startingIdx > 0 and unlockedLessonIds or completedLessonIds contains prior lessons, clean them up
    if (startingIdx > 0) {
      const priorIds = new Set(lessons.slice(0, startingIdx).map((l: any) => l._id.toString()));
      let needsSave = false;

      const filteredUnlocked = (progress.unlockedLessonIds || []).filter(
        (id: any) => !priorIds.has(id.toString())
      );
      if (filteredUnlocked.length !== (progress.unlockedLessonIds || []).length) {
        progress.unlockedLessonIds = filteredUnlocked;
        needsSave = true;
      }

      const filteredCompleted = (progress.completedLessonIds || []).filter(
        (id: any) => !priorIds.has(id.toString())
      );
      if (filteredCompleted.length !== (progress.completedLessonIds || []).length) {
        progress.completedLessonIds = filteredCompleted;
        needsSave = true;
      }

      if (!progress.unlockedLessonIds.some((id: any) => id.toString() === startingLessonIdStr)) {
        progress.unlockedLessonIds.push(lessons[startingIdx]._id);
        needsSave = true;
      }

      if (needsSave) {
        progress.save().catch((err: any) => console.error("Self-healing progress save error:", err));
      }
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

    const currentLessonIdStr = progress.currentLessonId?.toString();

    // Group lessons by module
    const lessonsByModule = new Map<string, any[]>();
    for (let idx = 0; idx < lessons.length; idx++) {
      const l = lessons[idx];
      const lIdStr = l._id.toString();
      const mIdStr = l.moduleId.toString();
      const st = stateMap.get(lIdStr);

      let status = 'LOCKED';
      let prerequisiteMet = false;

      if (startingIdx > 0 && idx < startingIdx) {
        // Strictly LOCKED for all lessons prior to starting lesson
        status = 'LOCKED';
        prerequisiteMet = false;
      } else {
        if (completedSet.has(lIdStr)) {
          status = 'COMPLETED';
          prerequisiteMet = true;
        } else if (unlockedSet.has(lIdStr) || idx === startingIdx) {
          status = st?.theoryRead || st?.testPassed ? 'IN_PROGRESS' : 'UNLOCKED';
        }

        // Prerequisite check: starting lesson is always met; subsequent lessons require previous completed
        if (idx === startingIdx) {
          prerequisiteMet = true;
        } else if (idx > startingIdx) {
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
        interactiveActivity: l.interactiveActivity,
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
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

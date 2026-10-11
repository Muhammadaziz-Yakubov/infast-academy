import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Course } from '@/models/Course';
import { Module } from '@/models/Module';
import { Lesson } from '@/models/Lesson';
import { StudentProgress, ILessonState } from '@/models/StudentProgress';
import { getStudentSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const session = getStudentSession(authHeader);

    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();

    const student = await Student.findById(session.id).lean();
    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    const courseId = student.courseId;
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    }

    // Fetch all modules for this course
    const modules = await Module.find({ courseId }).sort({ order: 1 }).lean();

    // Fetch all active lessons
    const lessons = await Lesson.find({ courseId, status: 'ACTIVE' }).sort({ moduleId: 1, order: 1 }).lean();

    // Fetch or create progress
    let progress = await StudentProgress.findOne({ studentId: student._id, courseId });
    if (!progress) {
      const firstLesson = lessons[0];
      progress = await StudentProgress.create({
        studentId: student._id,
        courseId,
        startingLessonId: firstLesson?._id,
        currentLessonId: firstLesson?._id,
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

    const completedSet = new Set((progress.completedLessonIds || []).map((id: any) => id.toString()));
    const unlockedSet = new Set((progress.unlockedLessonIds || []).map((id: any) => id.toString()));
    const stateMap = new Map<string, any>();
    (progress.lessonStates || []).forEach((st: any) => {
      stateMap.set(st.lessonId.toString(), st);
    });

    const startingLessonIdStr = progress.startingLessonId?.toString();

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

      // Prerequisite check: previous lesson must be completed
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

      const lessonItem = {
        _id: l._id,
        moduleId: l.moduleId,
        title: l.title,
        order: l.order,
        description: l.description,
        status,
        prerequisiteMet,
        isStarting: lIdStr === startingLessonIdStr,
        theoryRead: st?.theoryRead || false,
        testPassed: st?.testPassed || false,
        testScore: st?.testScore || 0,
        testAttempts: st?.testAttempts || 0,
        practiceCompleted: st?.practiceCompleted || false,
        xpReward: l.xpReward,
        xcoinReward: l.xcoinReward,
        totalQuestions: l.testQuestions?.length || 9,
        activityType: l.interactiveActivity?.type || 'MATCH_PAIRS',
        activityTitle: l.interactiveActivity?.title || "Interaktiv mashg'ulot",
      };

      if (!lessonsByModule.has(mIdStr)) {
        lessonsByModule.set(mIdStr, []);
      }
      lessonsByModule.get(mIdStr)!.push(lessonItem);
    }

    const structuredModules = modules.map((m: any) => {
      const modLessons = lessonsByModule.get(m._id.toString()) || [];
      const completedCount = modLessons.filter((l) => l.status === 'COMPLETED').length;
      const totalCount = modLessons.length;
      return {
        _id: m._id,
        title: m.title,
        order: m.order,
        description: m.description,
        lessons: modLessons,
        completedCount,
        totalCount,
        completionPercent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      };
    });

    return NextResponse.json({
      success: true,
      course: {
        _id: course._id,
        name: course.name,
        description: course.description,
      },
      progress: {
        xp: progress.xp,
        xcoin: progress.xcoin,
        level: progress.level,
        completedLessonCount: completedSet.size,
        totalLessonCount: lessons.length,
      },
      modules: structuredModules,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "O'quv rejasini olishda xatolik" }, { status: 500 });
  }
}

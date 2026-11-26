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

    // Fetch all active modules for this course
    const modules = await Module.find({ courseId, status: 'ACTIVE' }).sort({ order: 1 }).lean();
    const moduleOrderMap = new Map<string, number>();
    modules.forEach((m: any, idx: number) => {
      moduleOrderMap.set(m._id.toString(), m.order ?? idx);
    });

    // Fetch all active lessons in curriculum sequence
    const lessons = await Lesson.find({ courseId, status: 'ACTIVE' }).lean();
    lessons.sort((a: any, b: any) => {
      const modA = moduleOrderMap.get(a.moduleId.toString()) ?? 0;
      const modB = moduleOrderMap.get(b.moduleId.toString()) ?? 0;
      if (modA !== modB) return modA - modB;
      return (a.order || 0) - (b.order || 0);
    });

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

    const startingLessonIdStr = progress.startingLessonId?.toString();
    const startingIdx = startingLessonIdStr
      ? lessons.findIndex((les: any) => les._id.toString() === startingLessonIdStr)
      : 0;

    // Self-healing: if startingIdx > 0, ensure prior lessons are purged from unlockedLessonIds in DB
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

    const completedSet = new Set((progress.completedLessonIds || []).map((id: any) => id.toString()));
    const unlockedSet = new Set((progress.unlockedLessonIds || []).map((id: any) => id.toString()));
    const stateMap = new Map<string, any>();
    (progress.lessonStates || []).forEach((st: any) => {
      stateMap.set(st.lessonId.toString(), st);
    });

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
        // All lessons prior to designated starting lesson are strictly LOCKED
        status = 'LOCKED';
        prerequisiteMet = false;
      } else {
        if (completedSet.has(lIdStr)) {
          status = 'COMPLETED';
          prerequisiteMet = true;
        } else if (unlockedSet.has(lIdStr) || idx === startingIdx) {
          status = st?.theoryRead || st?.testPassed ? 'IN_PROGRESS' : 'UNLOCKED';
        }

        if (idx === startingIdx) {
          prerequisiteMet = true;
        } else if (idx > startingIdx) {
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
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Lesson } from '@/models/Lesson';
import { Module } from '@/models/Module';
import { StudentProgress } from '@/models/StudentProgress';
import { getStudentSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    const session = getStudentSession(authHeader);

    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();

    const lesson = await Lesson.findById(params.id)
      .populate('courseId', 'name')
      .populate('moduleId', 'title')
      .lean();

    if (!lesson) {
      return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
    }

    // Verify student belongs to this course
    const student = await Student.findById(session.id).select('courseId').lean();
    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    const lessonCourseId = (lesson.courseId as any)?._id?.toString() || (lesson.courseId as any)?.toString();
    const studentCourseId = student.courseId?.toString() || session.courseId;

    if (lessonCourseId !== studentCourseId) {
      return NextResponse.json({ error: "Ushbu dars sizning kursingizga tegishli emas" }, { status: 403 });
    }

    // Fetch modules and sort all active lessons in curriculum sequence
    const modules = await Module.find({ courseId: studentCourseId, status: 'ACTIVE' }).sort({ order: 1 }).lean();
    const moduleOrderMap = new Map<string, number>();
    modules.forEach((m: any, idx: number) => {
      moduleOrderMap.set(m._id.toString(), m.order ?? idx);
    });

    const allLessons = await Lesson.find({ courseId: studentCourseId, status: 'ACTIVE' }).lean();
    allLessons.sort((a: any, b: any) => {
      const modA = moduleOrderMap.get(a.moduleId.toString()) ?? 0;
      const modB = moduleOrderMap.get(b.moduleId.toString()) ?? 0;
      if (modA !== modB) return modA - modB;
      return (a.order || 0) - (b.order || 0);
    });

    // Fetch progress and verify unlock status
    let progress = await StudentProgress.findOne({
      studentId: session.id,
      courseId: studentCourseId,
    });

    if (!progress) {
      const firstLesson = allLessons[0];
      progress = await StudentProgress.create({
        studentId: session.id,
        courseId: studentCourseId,
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

    const requestedIdx = allLessons.findIndex((l: any) => l._id.toString() === params.id);
    const startingLessonIdStr = progress.startingLessonId?.toString();
    const startingIdx = startingLessonIdStr
      ? allLessons.findIndex((l: any) => l._id.toString() === startingLessonIdStr)
      : 0;

    // Critical: If the requested lesson is before the starting lesson, it is strictly LOCKED
    if (startingIdx > 0 && requestedIdx >= 0 && requestedIdx < startingIdx) {
      return NextResponse.json(
        { error: "Ushbu dars sizning boshlang'ich darsingizdan oldin joylashgan va yopiq." },
        { status: 403 }
      );
    }

    const isUnlocked =
      (progress.unlockedLessonIds || []).some((id: any) => id.toString() === params.id) ||
      (requestedIdx === startingIdx);

    if (!isUnlocked) {
      return NextResponse.json(
        { error: "Ushbu dars hali siz uchun ochilmagan. O'qituvchi tomonidan ochilishini kuting." },
        { status: 403 }
      );
    }

    const state = (progress.lessonStates || []).find(
      (st: any) => st.lessonId.toString() === params.id
    );

    // Omit correctAnswerIndex from client to prevent cheating before test completion
    const safeQuestions = (lesson.testQuestions || []).map((q: any, idx: number) => ({
      round: q.round || Math.floor(idx / 3) + 1,
      question: q.question,
      options: q.options,
      // Only include explanation if test is already passed
      explanation: state?.testPassed ? q.explanation : undefined,
    }));

    return NextResponse.json({
      success: true,
      lesson: {
        _id: lesson._id,
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        title: lesson.title,
        order: lesson.order,
        description: lesson.description,
        theoryContent: lesson.theoryContent,
        testQuestions: safeQuestions,
        interactiveActivity: lesson.interactiveActivity || {
          type: 'MATCH_PAIRS',
          title: "Interaktiv mashg'ulot",
          instructions: "Berilgan topshiriqni bajaring",
          pairs: [],
        },
        xpReward: lesson.xpReward,
        xcoinReward: lesson.xcoinReward,
      },
      userState: {
        theoryRead: state?.theoryRead || false,
        testPassed: state?.testPassed || false,
        testScore: state?.testScore || 0,
        testAttempts: state?.testAttempts || 0,
        testAnswers: state?.testAnswers || [],
        testResultDetails: state?.testResultDetails || null,
        practiceCompleted: state?.practiceCompleted || false,
        status: state?.status || 'UNLOCKED',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

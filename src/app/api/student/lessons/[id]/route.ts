import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Lesson } from '@/models/Lesson';
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
    if (lesson.courseId._id.toString() !== session.courseId) {
      return NextResponse.json({ error: "Ushbu dars sizning kursingizga tegishli emas" }, { status: 403 });
    }

    // Fetch progress and verify unlock status
    const progress = await StudentProgress.findOne({
      studentId: session.id,
      courseId: session.courseId,
    }).lean();

    const isUnlocked = (progress?.unlockedLessonIds || []).some(
      (id: any) => id.toString() === params.id
    );

    if (!isUnlocked) {
      return NextResponse.json(
        { error: "Ushbu dars hali siz uchun ochilmagan. O'qituvchi tomonidan ochilishini kuting." },
        { status: 403 }
      );
    }

    const state = (progress?.lessonStates || []).find(
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
        practiceCompleted: state?.practiceCompleted || false,
        status: state?.status || 'UNLOCKED',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Dars ma'lumotlarini olishda xatolik" }, { status: 500 });
  }
}

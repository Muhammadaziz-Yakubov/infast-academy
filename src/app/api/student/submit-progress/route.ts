import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { StudentProgress } from '@/models/StudentProgress';
import { Lesson } from '@/models/Lesson';
import { StudentActivity } from '@/models/StudentActivity';
import { getStudentSession } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const session = getStudentSession(authHeader);

    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { lessonId, markTheoryRead, testAnswers, interactiveSubmission, markInteractiveCompleted } = body;

    if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ error: "Yaroqli dars identifikatori talab qilinadi" }, { status: 400 });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
    }

    const student = await Student.findById(session.id).select('courseId branchId').lean();
    if (!student) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    const lessonCourseId = (lesson.courseId as any)?._id?.toString() || (lesson.courseId as any)?.toString();
    const studentCourseId = student.courseId?.toString() || session.courseId;

    if (lessonCourseId !== studentCourseId) {
      return NextResponse.json({ error: "Dars sizning kursingizga tegishli emas" }, { status: 403 });
    }

    let progress = await StudentProgress.findOne({
      studentId: session.id,
      courseId: studentCourseId,
    });

    if (!progress) {
      progress = await StudentProgress.create({
        studentId: session.id,
        courseId: studentCourseId,
        startingLessonId: lesson._id,
        currentLessonId: lesson._id,
        unlockedLessonIds: [lesson._id],
        completedLessonIds: [],
        lessonStates: [],
        xp: 0,
        xcoin: 0,
        level: 1,
      });
    }

    // Check if lesson is unlocked
    const isUnlocked = progress.unlockedLessonIds.some((id: any) => id.toString() === lessonId);
    if (!isUnlocked) {
      return NextResponse.json({ error: "Ushbu dars siz uchun hali ochilmagan" }, { status: 403 });
    }

    // Check prerequisite
    const allCourseLessons = await Lesson.find({ courseId: lesson.courseId, status: 'ACTIVE' })
      .sort({ moduleId: 1, order: 1 })
      .lean();

    const currentLessonIdx = allCourseLessons.findIndex((l: any) => l._id.toString() === lessonId);
    if (currentLessonIdx > 0) {
      const startingLessonIdStr = progress.startingLessonId?.toString();
      const startingIdx = startingLessonIdStr
        ? allCourseLessons.findIndex((l: any) => l._id.toString() === startingLessonIdStr)
        : 0;

      if (currentLessonIdx > Math.max(0, startingIdx)) {
        const prevLesson = allCourseLessons[currentLessonIdx - 1];
        const isPrevCompleted = progress.completedLessonIds.some(
          (id: any) => id.toString() === prevLesson._id.toString()
        );
        if (!isPrevCompleted) {
          return NextResponse.json(
            { error: `Oldingi dars (${prevLesson.order}-dars) hali to'liq yakunlanmagan!` },
            { status: 400 }
          );
        }
      }
    }

    // Locate or create lesson state
    const lessonObjId = new mongoose.Types.ObjectId(lessonId);
    let stateIndex = progress.lessonStates.findIndex(
      (st: any) => st.lessonId.toString() === lessonId
    );

    if (stateIndex < 0) {
      progress.lessonStates.push({
        lessonId: lessonObjId,
        status: 'UNLOCKED',
        theoryRead: false,
        testPassed: false,
        testScore: 0,
        testAttempts: 0,
        practiceCompleted: false,
        updatedAt: new Date(),
      });
      stateIndex = progress.lessonStates.length - 1;
    }

    const state = progress.lessonStates[stateIndex];

    // ACTION A: Mark Theory Read
    if (markTheoryRead) {
      state.theoryRead = true;
      if (state.status !== 'COMPLETED') state.status = 'IN_PROGRESS';
      await StudentActivity.create({
        studentId: session.id,
        branchId: student.branchId || session.branchId,
        type: 'THEORY_READ',
        title: `Nazariya o'qib chiqildi: ${lesson.title}`,
        metadata: { lessonId: lesson._id },
      });
    }

    // ACTION B: Submit Test Answers
    let testEvaluationResult: any = null;
    if (Array.isArray(testAnswers)) {
      const questions = lesson.testQuestions || [];
      const totalQuestions = questions.length || 9;
      let correctCount = 0;

      const details = questions.map((q: any, idx: number) => {
        const ans = testAnswers[idx];
        const isCorrect = typeof ans === 'number' && ans === q.correctAnswerIndex;
        if (isCorrect) correctCount += 1;
        return {
          questionIndex: idx,
          isCorrect,
          correctAnswerIndex: q.correctAnswerIndex,
          explanation: q.explanation || '',
        };
      });

      state.testAttempts = (state.testAttempts || 0) + 1;
      state.testScore = correctCount;
      state.testAnswers = testAnswers;
      state.testResultDetails = {
        score: correctCount,
        maxScore: totalQuestions,
        percentage: Math.round((correctCount / totalQuestions) * 100),
        details,
      };

      // Proportional XP calculation
      const baseXp = lesson.xpReward || 50;
      const calculatedXp = Math.round((correctCount / totalQuestions) * baseXp);
      const earnedXp = Math.max(5, calculatedXp); // Kamida 5 XP rag'batlantirish uchun
      const earnedXcoin = Math.round((correctCount / totalQuestions) * (lesson.xcoinReward || 10));

      if (!state.testPassed) {
        state.testPassed = true;
        progress.xp = (progress.xp || 0) + earnedXp;
        progress.xcoin = (progress.xcoin || 0) + earnedXcoin;
        progress.level = Math.floor(progress.xp / 100) + 1;

        await StudentActivity.create({
          studentId: session.id,
          branchId: student.branchId || session.branchId,
          type: 'TEST_PASSED',
          title: `Test topshirildi: ${correctCount}/${totalQuestions}`,
          description: `"${lesson.title}" darsi testi yakunlandi. To'plangan ball: ${correctCount}/${totalQuestions} (+${earnedXp} XP).`,
          rewardXP: earnedXp,
          rewardXCoin: earnedXcoin,
          metadata: { lessonId: lesson._id, score: correctCount, xpEarned: earnedXp, xcoinEarned: earnedXcoin },
        });
      }

      testEvaluationResult = {
        passed: true,
        score: correctCount,
        maxScore: totalQuestions,
        earnedXp,
        earnedXcoin,
        percentage: Math.round((correctCount / totalQuestions) * 100),
        details,
      };
    }

    // ACTION C: Complete Interactive Activity & Finish Lesson
    let completedLesson = false;
    if (interactiveSubmission || markInteractiveCompleted) {
      if (!state.testPassed) {
        state.testPassed = true;
      }

      const wasAlreadyCompleted = state.status === 'COMPLETED';
      state.practiceCompleted = true;
      state.practiceSubmission = typeof interactiveSubmission === 'string' ? interactiveSubmission : JSON.stringify(interactiveSubmission);
      state.status = 'COMPLETED';
      state.completedAt = state.completedAt || new Date();

      const inCompletedList = progress.completedLessonIds.some((id: any) => id.toString() === lessonId);
      if (!inCompletedList) {
        progress.completedLessonIds.push(lessonObjId);
      }

      if (!wasAlreadyCompleted) {
        const bonusXp = 25;
        progress.xp = (progress.xp || 0) + bonusXp;
        progress.level = Math.floor(progress.xp / 100) + 1;
        completedLesson = true;

        // Auto unlock the next lesson in course order
        if (currentLessonIdx >= 0 && currentLessonIdx + 1 < allCourseLessons.length) {
          const nextLesson = allCourseLessons[currentLessonIdx + 1];
          const nextLessonIdStr = nextLesson._id.toString();
          const isNextUnlocked = progress.unlockedLessonIds.some(
            (id: any) => id.toString() === nextLessonIdStr
          );
          if (!isNextUnlocked) {
            progress.unlockedLessonIds.push(nextLesson._id);
          }
          // Also set as current lesson if needed
          progress.currentLessonId = nextLesson._id;
        }

        await StudentActivity.create({
          studentId: session.id,
          branchId: student.branchId || session.branchId,
          type: 'LESSON_COMPLETED',
          title: `Dars to'liq yakunlandi: ${lesson.title}`,
          description: `Barcha 3 bosqich (Nazariya, Test, Mashg'ulot) bajarildi! (+${bonusXp} XP)`,
          rewardXP: bonusXp,
          metadata: { lessonId: lesson._id, bonusXp },
        });
      }
    }

    state.updatedAt = new Date();
    await progress.save();

    return NextResponse.json({
      success: true,
      userState: {
        theoryRead: state.theoryRead,
        testPassed: state.testPassed,
        testScore: state.testScore,
        testAttempts: state.testAttempts,
        practiceCompleted: state.practiceCompleted,
        status: state.status,
      },
      testResult: testEvaluationResult,
      completedLesson,
      totalXp: progress.xp,
      totalXcoin: progress.xcoin,
      level: progress.level,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

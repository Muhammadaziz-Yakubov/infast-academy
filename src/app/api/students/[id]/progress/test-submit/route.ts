import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Lesson } from '@/models/Lesson';
import { StudentProgress } from '@/models/StudentProgress';
import { StudentActivity } from '@/models/StudentActivity';
import { getSession } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const student = await Student.findById(params.id);
    if (!student) {
      return NextResponse.json({ error: 'Talaba topilmadi' }, { status: 404 });
    }

    // Branch isolation for manager
    if (session.role === 'MANAGER') {
      const studentBranchId = student.branchId?.toString();
      if (session.branchId && studentBranchId !== session.branchId.toString()) {
        return NextResponse.json(
          { error: "Siz faqat o'zingizga biriktirilgan filial talabasining testini tekshira olasiz" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { lessonId, answers, markTheoryRead } = body;

    if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ error: "Yaroqli dars identifikatori (lessonId) talab qilinadi" }, { status: 400 });
    }

    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: "Test javoblari massiv (answers) shaklida bo'lishi shart" }, { status: 400 });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
    }

    if (lesson.courseId.toString() !== student.courseId.toString()) {
      return NextResponse.json({ error: "Ushbu dars talabaning kursiga tegishli emas" }, { status: 400 });
    }

    let progress = await StudentProgress.findOne({ studentId: student._id, courseId: student.courseId });
    if (!progress) {
      progress = await StudentProgress.create({
        studentId: student._id,
        courseId: student.courseId,
        unlockedLessonIds: [lesson._id],
        completedLessonIds: [],
        lessonStates: [],
        xp: 0,
        xcoin: 0,
        level: 1,
      });
    }

    // Check if lesson is unlocked for this student
    const isUnlocked = progress.unlockedLessonIds.some((id: any) => id.toString() === lessonId);
    if (!isUnlocked) {
      return NextResponse.json(
        { error: "Ushbu dars talaba uchun hali ochilmagan. Avval o'qituvchi darsni ochishi lozim." },
        { status: 403 }
      );
    }

    // Evaluate answers strictly on server
    const questions = lesson.testQuestions || [];
    const totalQuestions = questions.length || 9;
    let correctCount = 0;
    const roundScores: Record<number, { total: number; correct: number }> = {
      1: { total: 0, correct: 0 },
      2: { total: 0, correct: 0 },
      3: { total: 0, correct: 0 },
    };

    const details = questions.map((q: any, idx: number) => {
      const studentAnswer = answers[idx];
      const isCorrect = typeof studentAnswer === 'number' && studentAnswer === q.correctAnswerIndex;
      const round = (q.round || (Math.floor(idx / 3) + 1)) as 1 | 2 | 3;

      if (!roundScores[round]) {
        roundScores[round] = { total: 0, correct: 0 };
      }
      roundScores[round].total += 1;

      if (isCorrect) {
        correctCount += 1;
        roundScores[round].correct += 1;
      }

      return {
        questionIndex: idx,
        round,
        isCorrect,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation || '',
      };
    });

    // Pass threshold: strictly >= 8 / 9 (or >= 88% if customized questions count)
    const passingThreshold = Math.min(8, totalQuestions);
    const passed = correctCount >= passingThreshold;

    // Locate lesson state
    const lessonObjId = new mongoose.Types.ObjectId(lessonId);
    let stateIndex = progress.lessonStates.findIndex(
      (st: any) => st.lessonId.toString() === lessonId
    );

    if (stateIndex < 0) {
      progress.lessonStates.push({
        lessonId: lessonObjId,
        status: 'UNLOCKED',
        theoryRead: Boolean(markTheoryRead),
        testPassed: false,
        testScore: 0,
        testAttempts: 0,
        practiceCompleted: false,
        updatedAt: new Date(),
      });
      stateIndex = progress.lessonStates.length - 1;
    }

    const state = progress.lessonStates[stateIndex];
    state.testAttempts = (state.testAttempts || 0) + 1;
    state.updatedAt = new Date();
    if (markTheoryRead) {
      state.theoryRead = true;
    }

    let xpEarned = 0;
    let xcoinEarned = 0;

    if (passed) {
      const wasAlreadyPassed = state.testPassed;
      state.testPassed = true;
      state.testScore = Math.max(state.testScore || 0, correctCount);

      if (state.status !== 'COMPLETED') {
        state.status = 'IN_PROGRESS';
      }

      // First time passing bonus
      if (!wasAlreadyPassed) {
        xpEarned = lesson.xpReward || 50;
        xcoinEarned = lesson.xcoinReward || 10;
        progress.xp = (progress.xp || 0) + xpEarned;
        progress.xcoin = (progress.xcoin || 0) + xcoinEarned;
        progress.level = Math.floor(progress.xp / 100) + 1;
      }

      await progress.save();

      // Log activity
      await StudentActivity.create({
        studentId: student._id,
        branchId: student.branchId,
        type: 'TEST_PASSED',
        title: `Test muvaffaqiyatli topshirildi: ${correctCount}/${totalQuestions}`,
        description: `"${lesson.title}" darsi bo'yicha test sinovi topshirildi va me'yor (>= 8/9) bajarildi.`,
        metadata: {
          lessonId: lesson._id,
          lessonTitle: lesson.title,
          score: correctCount,
          maxScore: totalQuestions,
          passed: true,
          roundScores,
          xpEarned,
          xcoinEarned,
        },
      });

      if (xpEarned > 0) {
        await StudentActivity.create({
          studentId: student._id,
          branchId: student.branchId,
          type: 'XP_EARNED',
          title: `+${xpEarned} XP qo'shildi`,
          description: `"${lesson.title}" testini a'lo topshirgani uchun`,
          metadata: { xp: xpEarned, newTotalXp: progress.xp },
        });
      }
    } else {
      // Failed test attempt
      state.testScore = Math.max(state.testScore || 0, correctCount);
      await progress.save();

      await StudentActivity.create({
        studentId: student._id,
        branchId: student.branchId,
        type: 'TEST_ATTEMPT',
        title: `Test natijasi: ${correctCount}/${totalQuestions} (Yetarli emas)`,
        description: `O'tish uchun kamida 8/9 to'g'ri javob talab etiladi. Qayta urinib ko'ring.`,
        metadata: {
          lessonId: lesson._id,
          lessonTitle: lesson.title,
          score: correctCount,
          maxScore: totalQuestions,
          passed: false,
          roundScores,
        },
      });
    }

    return NextResponse.json({
      success: true,
      passed,
      score: correctCount,
      maxScore: totalQuestions,
      passingThreshold,
      roundScores: [
        roundScores[1]?.correct || 0,
        roundScores[2]?.correct || 0,
        roundScores[3]?.correct || 0,
      ],
      details,
      xpEarned,
      xcoinEarned,
      totalXp: progress.xp,
      totalXcoin: progress.xcoin,
      message: passed
        ? `Tabriklaymiz! Testdan muvaffaqiyatli o'tdingiz (${correctCount}/${totalQuestions})!`
        : `Natija: ${correctCount}/${totalQuestions}. O'tish bali: kamida ${passingThreshold} ta. Qayta urinib ko'ring.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Testni tekshirishda xatolik" }, { status: 500 });
  }
}

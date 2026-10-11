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
          { error: "Siz faqat o'zingizga biriktirilgan filial talabasi amaliyotini tekshira olasiz" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { lessonId, submissionText, bypassTestCheck } = body;

    if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ error: "Yaroqli dars identifikatori (lessonId) talab qilinadi" }, { status: 400 });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });
    }

    let progress = await StudentProgress.findOne({ studentId: student._id, courseId: student.courseId });
    if (!progress) {
      return NextResponse.json({ error: "Talaba progress yozuvi topilmadi" }, { status: 404 });
    }

    const lessonObjId = new mongoose.Types.ObjectId(lessonId);
    let stateIndex = progress.lessonStates.findIndex(
      (st: any) => st.lessonId.toString() === lessonId
    );

    if (stateIndex < 0) {
      return NextResponse.json(
        { error: "Dars holati topilmadi. Avval dars ochilishi kerak." },
        { status: 400 }
      );
    }

    const state = progress.lessonStates[stateIndex];

    // Verify test passed unless manager/admin explicitly approves
    if (!state.testPassed && !bypassTestCheck) {
      return NextResponse.json(
        { error: "Amaliy vazifani yakunlashdan avval 9 savollik testdan kamida 8 ta to'g'ri javob bilan o'tish lozim." },
        { status: 400 }
      );
    }

    const wasAlreadyCompleted = state.status === 'COMPLETED';

    state.practiceCompleted = true;
    state.practiceSubmission = submissionText || 'Vazifa topshirildi va tasdiqlandi';
    state.status = 'COMPLETED';
    state.completedAt = state.completedAt || new Date();
    state.updatedAt = new Date();

    // Idempotently add to completedLessonIds
    const isCompletedInList = progress.completedLessonIds.some((id: any) => id.toString() === lessonId);
    if (!isCompletedInList) {
      progress.completedLessonIds.push(lessonObjId);
    }

    // Completion bonus (if not previously completed)
    let bonusXp = 0;
    if (!wasAlreadyCompleted) {
      bonusXp = 25; // Bonus for finishing all 3 stages: Theory + Test + Practice
      progress.xp = (progress.xp || 0) + bonusXp;
      progress.level = Math.floor(progress.xp / 100) + 1;
    }

    await progress.save();

    // Log StudentActivity
    await StudentActivity.create({
      studentId: student._id,
      branchId: student.branchId,
      type: 'LESSON_COMPLETED',
      title: `Dars to'liq yakunlandi: ${lesson.title}`,
      description: `Nazariya, test va amaliyot to'liq bajarildi.`,
      metadata: {
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        submission: submissionText,
        bonusXp,
      },
    });

    return NextResponse.json({
      success: true,
      message: `"${lesson.title}" darsi muvaffaqiyatli yakunlandi!`,
      status: 'COMPLETED',
      completedCount: progress.completedLessonIds.length,
      totalXp: progress.xp,
      totalXcoin: progress.xcoin,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Amaliyotni topshirishda xatolik" }, { status: 500 });
  }
}

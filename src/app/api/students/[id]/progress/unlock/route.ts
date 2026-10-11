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
          { error: "Siz faqat o'zingizga biriktirilgan filial talabasining darslarini ocha olasiz" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ error: "Yaroqli dars identifikatori (lessonId) talab qilinadi" }, { status: 400 });
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
        unlockedLessonIds: [],
        completedLessonIds: [],
        lessonStates: [],
        xp: 0,
        xcoin: 0,
        level: 1,
      });
    }

    const lessonObjId = new mongoose.Types.ObjectId(lessonId);
    const isAlreadyCompleted = progress.completedLessonIds.some((id: any) => id.toString() === lessonId);
    const isAlreadyUnlocked = progress.unlockedLessonIds.some((id: any) => id.toString() === lessonId);

    // If already unlocked and already present, idempotent return
    if (isAlreadyUnlocked && !isAlreadyCompleted) {
      return NextResponse.json({
        success: true,
        message: "Dars allaqachon ochiq holatda",
        unlockedLessonIds: progress.unlockedLessonIds,
      });
    }

    if (!isAlreadyUnlocked) {
      progress.unlockedLessonIds.push(lessonObjId);
    }

    // Update or add state in lessonStates
    const stateIndex = progress.lessonStates.findIndex(
      (st: any) => st.lessonId.toString() === lessonId
    );

    if (stateIndex >= 0) {
      if (progress.lessonStates[stateIndex].status === 'LOCKED') {
        progress.lessonStates[stateIndex].status = 'UNLOCKED';
      }
    } else {
      progress.lessonStates.push({
        lessonId: lessonObjId,
        status: isAlreadyCompleted ? 'COMPLETED' : 'UNLOCKED',
        theoryRead: false,
        testPassed: false,
        testScore: 0,
        testAttempts: 0,
        practiceCompleted: false,
        updatedAt: new Date(),
      });
    }

    await progress.save();

    // Create auditable StudentActivity record
    await StudentActivity.create({
      studentId: student._id,
      branchId: student.branchId,
      type: 'LESSON_UNLOCKED',
      title: `Dars ochildi: ${lesson.title}`,
      description: `${session.name || session.username} tomonidan dars talaba uchun ochildi`,
      metadata: {
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        unlockedBy: session.username,
      },
    });

    return NextResponse.json({
      success: true,
      message: `"${lesson.title}" darsi muvaffaqiyatli ochildi`,
      unlockedLessonIds: progress.unlockedLessonIds,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Darsni ochishda xatolik" }, { status: 500 });
  }
}

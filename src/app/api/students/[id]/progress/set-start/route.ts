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
          { error: "Siz faqat o'zingizga biriktirilgan filial talabasi darsini o'zgartira olasiz" },
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
        startingLessonId: lesson._id,
        currentLessonId: lesson._id,
        unlockedLessonIds: [lesson._id],
        completedLessonIds: [],
        lessonStates: [],
        xp: 0,
        xcoin: 0,
        level: 1,
      });
    } else {
      progress.startingLessonId = lesson._id;
      progress.currentLessonId = lesson._id;

      // Ensure this starting lesson is unlocked
      const lessonObjId = new mongoose.Types.ObjectId(lessonId);
      const isUnlocked = progress.unlockedLessonIds.some((id: any) => id.toString() === lessonId);
      if (!isUnlocked) {
        progress.unlockedLessonIds.push(lessonObjId);
      }

      // NOTE: Earlier lessons are explicitly NOT retroactively marked as completed.
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
          status: 'UNLOCKED',
          theoryRead: false,
          testPassed: false,
          testScore: 0,
          testAttempts: 0,
          practiceCompleted: false,
          updatedAt: new Date(),
        });
      }

      await progress.save();
    }

    await StudentActivity.create({
      studentId: student._id,
      branchId: student.branchId,
      type: 'LESSON_UNLOCKED',
      title: `Boshlang'ich dars belgilandi: ${lesson.title}`,
      description: `${session.name || session.username} tomonidan yangi boshlang'ich dars o'rnatildi`,
      metadata: {
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        setBy: session.username,
      },
    });

    return NextResponse.json({
      success: true,
      message: `"${lesson.title}" darsi boshlang'ich nuqta sifatida belgilandi`,
      startingLessonId: progress.startingLessonId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Boshlang'ich darsni belgilashda xatolik" }, { status: 500 });
  }
}

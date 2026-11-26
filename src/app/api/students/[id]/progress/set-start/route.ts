import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Lesson } from '@/models/Lesson';
import { Module } from '@/models/Module';
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

    // Fetch course modules and lessons in exact curriculum order
    const modules = await Module.find({ courseId: student.courseId, status: 'ACTIVE' }).sort({ order: 1 }).lean();
    const moduleOrderMap = new Map<string, number>();
    modules.forEach((m: any, idx: number) => {
      moduleOrderMap.set(m._id.toString(), m.order ?? idx);
    });

    const allLessons = await Lesson.find({ courseId: student.courseId, status: 'ACTIVE' }).lean();
    allLessons.sort((a: any, b: any) => {
      const modA = moduleOrderMap.get(a.moduleId.toString()) ?? 0;
      const modB = moduleOrderMap.get(b.moduleId.toString()) ?? 0;
      if (modA !== modB) return modA - modB;
      return (a.order || 0) - (b.order || 0);
    });

    const newStartIdx = allLessons.findIndex((l: any) => l._id.toString() === lessonId);
    if (newStartIdx < 0) {
      return NextResponse.json({ error: "Dars kurs o'quv dasturidan topilmadi" }, { status: 404 });
    }

    // Set of all lesson IDs that come strictly before the new starting lesson
    const priorLessonIds = new Set(allLessons.slice(0, newStartIdx).map((l: any) => l._id.toString()));
    const lessonObjId = new mongoose.Types.ObjectId(lessonId);

    let progress = await StudentProgress.findOne({ studentId: student._id, courseId: student.courseId });
    if (!progress) {
      progress = await StudentProgress.create({
        studentId: student._id,
        courseId: student.courseId,
        startingLessonId: lesson._id,
        currentLessonId: lesson._id,
        unlockedLessonIds: [lessonObjId],
        completedLessonIds: [],
        lessonStates: [
          {
            lessonId: lessonObjId,
            status: 'UNLOCKED',
            theoryRead: false,
            testPassed: false,
            testScore: 0,
            testAttempts: 0,
            practiceCompleted: false,
            updatedAt: new Date(),
          },
        ],
        xp: 0,
        xcoin: 0,
        level: 1,
      });
    } else {
      progress.startingLessonId = lesson._id;
      progress.currentLessonId = lesson._id;

      // Filter out prior lessons from unlockedLessonIds so lessons 1 to (newStartIdx - 1) are strictly locked!
      progress.unlockedLessonIds = (progress.unlockedLessonIds || []).filter(
        (id: any) => !priorLessonIds.has(id.toString())
      );
      // Ensure the designated starting lesson is unlocked
      if (!progress.unlockedLessonIds.some((id: any) => id.toString() === lessonId)) {
        progress.unlockedLessonIds.push(lessonObjId);
      }

      // Filter out prior lessons from completedLessonIds
      progress.completedLessonIds = (progress.completedLessonIds || []).filter(
        (id: any) => !priorLessonIds.has(id.toString())
      );

      // Lock all prior lesson states and reset their attempt flags
      const stateMap = new Map<string, any>();
      (progress.lessonStates || []).forEach((st: any) => {
        stateMap.set(st.lessonId.toString(), st);
      });

      priorLessonIds.forEach((pId) => {
        const existing = stateMap.get(pId);
        if (existing) {
          existing.status = 'LOCKED';
          existing.theoryRead = false;
          existing.testPassed = false;
          existing.testScore = 0;
          existing.testAttempts = 0;
          existing.practiceCompleted = false;
          existing.updatedAt = new Date();
        }
      });

      // Ensure starting lesson is UNLOCKED in lessonStates
      const startState = stateMap.get(lessonId);
      if (startState) {
        if (startState.status === 'LOCKED') {
          startState.status = 'UNLOCKED';
        }
        startState.updatedAt = new Date();
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
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

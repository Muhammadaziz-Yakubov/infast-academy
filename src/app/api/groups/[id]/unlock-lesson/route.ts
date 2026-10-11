import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Group } from '@/models/Group';
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

    const group = await Group.findById(params.id);
    if (!group) {
      return NextResponse.json({ error: 'Guruh topilmadi' }, { status: 404 });
    }

    // Branch check for manager
    if (session.role === 'MANAGER' && session.branchId) {
      if (group.branchId && group.branchId.toString() !== session.branchId.toString()) {
        return NextResponse.json({ error: "Siz faqat o'z filialingiz guruhiga dars ocha olasiz" }, { status: 403 });
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

    // Find all active students in this group
    const students = await Student.find({ groupId: group._id, status: 'ACTIVE' });
    const lessonObjId = new mongoose.Types.ObjectId(lessonId);
    let unlockedCount = 0;

    for (const student of students) {
      let progress = await StudentProgress.findOne({ studentId: student._id, courseId: student.courseId });
      if (!progress) {
        progress = await StudentProgress.create({
          studentId: student._id,
          courseId: student.courseId,
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
        unlockedCount++;
      } else {
        const isAlreadyUnlocked = progress.unlockedLessonIds.some((id: any) => id.toString() === lessonId);
        if (!isAlreadyUnlocked) {
          progress.unlockedLessonIds.push(lessonObjId);
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
          unlockedCount++;
        }
      }

      // Log activity
      await StudentActivity.create({
        studentId: student._id,
        branchId: student.branchId,
        type: 'LESSON_UNLOCKED',
        title: `Guruh darsi ochildi: ${lesson.title}`,
        description: `Guruh (${group.name}) uchun ${session.name || session.username} tomonidan dars ochildi`,
        metadata: {
          lessonId: lesson._id,
          lessonTitle: lesson.title,
          groupId: group._id,
          groupName: group.name,
          unlockedBy: session.username,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `"${lesson.title}" darsi guruhdagi ${unlockedCount} ta talaba uchun muvaffaqiyatli ochildi`,
      totalStudents: students.length,
      unlockedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Guruhga dars ochishda xatolik" }, { status: 500 });
  }
}

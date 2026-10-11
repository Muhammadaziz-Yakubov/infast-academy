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

    // Branch isolation check for manager
    if (session.role === 'MANAGER' && session.branchId) {
      if (group.branchId && group.branchId.toString() !== session.branchId.toString()) {
        return NextResponse.json({ error: "Siz faqat o'z filialingiz guruhiga dars ocha olasiz" }, { status: 403 });
      }
    }

    if (!group.courseId) {
      return NextResponse.json({ error: "Guruhga kurs biriktirilmagan" }, { status: 400 });
    }

    // Fetch all active lessons of this course in curriculum order
    const allLessons = await Lesson.find({ courseId: group.courseId, status: 'ACTIVE' })
      .sort({ moduleId: 1, order: 1 })
      .lean();

    if (allLessons.length === 0) {
      return NextResponse.json(
        { error: "Ushbu guruhning kursida hali darslar mavjud emas. Avval LMS bo'limida darslar yarating." },
        { status: 400 }
      );
    }

    // Find all active students in this group
    const students = await Student.find({ groupId: group._id, status: 'ACTIVE' });
    if (students.length === 0) {
      return NextResponse.json({ error: "Guruhda faol talabalar topilmadi" }, { status: 400 });
    }

    // Find all student progress records
    const studentIds = students.map((s) => s._id);
    const progresses = await StudentProgress.find({
      studentId: { $in: studentIds },
      courseId: group.courseId,
    });

    const progressMap = new Map(progresses.map((p) => [p.studentId.toString(), p]));

    // Determine the next lesson index to unlock for the group
    // Find the highest unlocked lesson index across students
    let highestUnlockedIdx = -1;
    for (const prog of progresses) {
      const unlockedSet = new Set((prog.unlockedLessonIds || []).map((id: any) => id.toString()));
      for (let i = allLessons.length - 1; i >= 0; i--) {
        if (unlockedSet.has(allLessons[i]._id.toString())) {
          if (i > highestUnlockedIdx) highestUnlockedIdx = i;
          break;
        }
      }
    }

    // Target the next lesson in sequence
    const nextLessonIdx = highestUnlockedIdx + 1;
    if (nextLessonIdx >= allLessons.length) {
      return NextResponse.json({
        success: false,
        message: "Ushbu guruh uchun kursdagi barcha darslar allaqachon ochilgan!",
      });
    }

    const nextLesson = allLessons[nextLessonIdx];
    const lessonObjId = new mongoose.Types.ObjectId(nextLesson._id);
    let unlockedStudentsCount = 0;

    for (const student of students) {
      let progress = progressMap.get(student._id.toString());
      if (!progress) {
        progress = await StudentProgress.create({
          studentId: student._id,
          courseId: group.courseId,
          startingLessonId: allLessons[0]._id,
          currentLessonId: nextLesson._id,
          unlockedLessonIds: [allLessons[0]._id, lessonObjId],
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
        unlockedStudentsCount++;
      } else {
        const isAlreadyUnlocked = (progress.unlockedLessonIds || []).some(
          (id: any) => id.toString() === nextLesson._id.toString()
        );

        if (!isAlreadyUnlocked) {
          progress.unlockedLessonIds.push(lessonObjId);
          progress.currentLessonId = lessonObjId;

          const stateIndex = progress.lessonStates.findIndex(
            (st: any) => st.lessonId.toString() === nextLesson._id.toString()
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
          unlockedStudentsCount++;
        }
      }

      // Log auditable event
      await StudentActivity.create({
        studentId: student._id,
        branchId: student.branchId,
        type: 'LESSON_UNLOCKED',
        title: `Keyingi dars ochildi: ${nextLesson.title}`,
        description: `Guruh (${group.name}) uchun ${session.name || session.username} tomonidan navbatdagi ${nextLesson.order}-dars ochildi`,
        metadata: {
          lessonId: nextLesson._id,
          lessonTitle: nextLesson.title,
          lessonOrder: nextLesson.order,
          groupId: group._id,
          groupName: group.name,
          unlockedBy: session.username,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `"${nextLesson.title}" (${nextLesson.order}-dars) guruhdagi barcha o'quvchilarga muvaffaqiyatli ochildi!`,
      nextLesson: {
        _id: nextLesson._id,
        title: nextLesson.title,
        order: nextLesson.order,
      },
      unlockedStudentsCount,
      totalStudents: students.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Keyingi darsni ochishda xatolik" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { StudentProgress } from '@/models/StudentProgress';
import { StudentActivity } from '@/models/StudentActivity';
import { getSession } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { groupId, branchId, studentId, confirmReset } = body;

    if (!confirmReset) {
      return NextResponse.json(
        { error: "Tasdiqlash kodi kiritilmadi (confirmReset: true talab qilinadi)" },
        { status: 400 }
      );
    }

    // Build student query
    const studentQuery: Record<string, any> = { status: 'ACTIVE' };

    if (studentId) {
      studentQuery._id = studentId;
    } else if (groupId && groupId !== 'ALL') {
      studentQuery.groupId = groupId;
    } else if (branchId && branchId !== 'ALL') {
      studentQuery.branchId = branchId;
    }

    // Manager branch isolation
    if (session.role === 'MANAGER' && session.branchId) {
      studentQuery.branchId = session.branchId;
    }

    const students = await Student.find(studentQuery).select('_id branchId firstName lastName');
    const studentIds = students.map((s) => s._id);

    if (studentIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Tanlangan parametr bo'yicha talabalar topilmadi",
      });
    }

    // Reset progress for these students:
    // XP -> 0, xcoin -> 0, level -> 1, startingLessonId -> null, currentLessonId -> null,
    // unlockedLessonIds -> [], completedLessonIds -> [], lessonStates -> []
    const updateResult = await StudentProgress.updateMany(
      { studentId: { $in: studentIds } },
      {
        $set: {
          xp: 0,
          xcoin: 0,
          level: 1,
          startingLessonId: null,
          currentLessonId: null,
          unlockedLessonIds: [],
          completedLessonIds: [],
          lessonStates: [],
          updatedAt: new Date(),
        },
      }
    );

    // Also create audit activity for each student
    const activitiesToInsert = students.map((s) => ({
      studentId: s._id,
      branchId: s.branchId,
      type: 'LESSON_UNLOCKED',
      title: "O'quv progressi to'liq qayta tiklandi (Reset)",
      description: `${session.name || session.username} tomonidan barcha XP, XCoin, daraja va ochilgan darslar nollashtirildi (xuddi yangi o'quvchi kabi).`,
      metadata: {
        resetBy: session.username,
        resetAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    if (activitiesToInsert.length > 0) {
      await StudentActivity.insertMany(activitiesToInsert);
    }

    return NextResponse.json({
      success: true,
      message: `${students.length} ta o'quvchining progressi, darajasi, XP va darslari to'liq nollashtirildi (Reset qilindi)`,
      resetCount: students.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Progressni qayta tiklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

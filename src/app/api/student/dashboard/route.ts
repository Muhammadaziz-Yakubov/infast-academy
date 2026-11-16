import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { StudentProgress } from '@/models/StudentProgress';
import { Lesson } from '@/models/Lesson';
import { Module } from '@/models/Module';
import { Course } from '@/models/Course';
import { Payment } from '@/models/Payment';
import { Attendance } from '@/models/Attendance';
import { Notification } from '@/models/Notification';
import { getStudentSession } from '@/lib/auth';
import { calculatePaymentPeriods } from '@/lib/calculations';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const session = getStudentSession(authHeader);

    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();

    const student = await Student.findById(session.id)
      .populate('courseId', 'name description duration price')
      .populate('groupId', 'name schedules branchId')
      .populate('branchId', 'name code address phone')
      .lean();

    if (!student) {
      return NextResponse.json({ error: "O'quvchi ma'lumotlari topilmadi" }, { status: 404 });
    }

    // Fetch or create student progress
    let progress = await StudentProgress.findOne({
      studentId: student._id,
      courseId: student.courseId,
    }).lean();

    // Fetch all lessons for course to determine total lessons & current lesson
    const courseLessons = await Lesson.find({
      courseId: student.courseId,
      status: 'ACTIVE',
    })
      .populate('moduleId', 'title order')
      .sort({ moduleId: 1, order: 1 })
      .lean();

    const totalLessonsCount = courseLessons.length;
    const completedLessonIds = (progress?.completedLessonIds || []).map((id: any) => id.toString());
    const unlockedLessonIds = (progress?.unlockedLessonIds || []).map((id: any) => id.toString());

    // Determine current lesson
    let currentLesson: any = null;
    if (courseLessons.length > 0) {
      // Find first unlocked but not completed lesson
      currentLesson = courseLessons.find(
        (l: any) => unlockedLessonIds.includes(l._id.toString()) && !completedLessonIds.includes(l._id.toString())
      );
      if (!currentLesson && courseLessons.length > 0) {
        currentLesson = courseLessons[0];
      }
    }

    // Find student's ranking in their group (exact match with Leaderboard 'group' scope)
    let groupRank = 1;
    if (student.groupId) {
      const groupStudents = await Student.find({
        groupId: student.groupId,
        $or: [
          { status: { $in: ['ACTIVE', 'COMPLETED'] } },
          { _id: student._id },
        ],
      })
        .select('_id')
        .lean();

      const groupStudentIds = groupStudents.map((s: any) => s._id);
      const groupProgressList = await StudentProgress.find({
        studentId: { $in: groupStudentIds },
      })
        .select('studentId xp xcoin')
        .lean();

      const progressMap = new Map<string, { xp: number; xcoin: number }>();
      groupProgressList.forEach((p: any) => {
        progressMap.set(p.studentId.toString(), {
          xp: p.xp || 0,
          xcoin: p.xcoin || 0,
        });
      });

      const sortedGroup = groupStudents
        .map((s: any) => {
          const pr = progressMap.get(s._id.toString()) || { xp: 0, xcoin: 0 };
          return { id: s._id.toString(), xp: pr.xp, xcoin: pr.xcoin };
        })
        .sort((a, b) => {
          if (b.xp !== a.xp) return b.xp - a.xp;
          return b.xcoin - a.xcoin;
        });

      const foundIndex = sortedGroup.findIndex((entry) => entry.id === student._id.toString());
      groupRank = foundIndex !== -1 ? foundIndex + 1 : 1;
    }

    // Overall course ranking
    const allProgressInCourse = await StudentProgress.find({ courseId: student.courseId })
      .sort({ xp: -1, xcoin: -1 })
      .select('studentId xp level')
      .lean();

    const courseRank = allProgressInCourse.findIndex((p: any) => p.studentId.toString() === student._id.toString()) + 1 || 1;
    const rank = groupRank;

    // Recent notifications / announcements
    const announcements = await Notification.find({
      $or: [
        { branchId: student.branchId },
        { branchId: null },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Calculate payment info and debt
    const allStudentPayments = await Payment.find({ studentId: student._id }).lean();
    const totalPaid = allStudentPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const fee = student.monthlyFee || (student.courseId as any)?.price || 0;
    const paymentInfo = calculatePaymentPeriods(
      student.joinedDate,
      fee,
      student.paymentDueDay || 5,
      totalPaid
    );

    let effectiveStatus = student.status;
    if (paymentInfo.paymentStatus === 'OVERDUE' && student.status === 'ACTIVE') {
      effectiveStatus = 'BLOCKED';
      await Student.findByIdAndUpdate(student._id, { status: 'BLOCKED' });
    }

    const isDebtor =
      effectiveStatus === 'BLOCKED' ||
      effectiveStatus === 'BLOCK' ||
      effectiveStatus === 'QARZDOR' ||
      paymentInfo.paymentStatus === 'OVERDUE' ||
      (paymentInfo.totalDebt > 0);

    // Recent payments summary
    const payments = await Payment.find({ studentId: student._id })
      .sort({ paymentDate: -1 })
      .limit(5)
      .lean();

    // Attendance summary
    const attendances = await Attendance.find({ studentId: student._id })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    const presentCount = await Attendance.countDocuments({ studentId: student._id, status: 'PRESENT' });
    const totalAttendanceCount = await Attendance.countDocuments({ studentId: student._id });

    return NextResponse.json({
      success: true,
      student: {
        id: student._id,
        studentCode: student.studentCode,
        firstName: student.firstName,
        lastName: student.lastName,
        phone: student.phone,
        avatarUrl: student.avatarUrl,
        bio: student.bio,
        course: student.courseId,
        group: student.groupId,
        branch: student.branchId,
        joinedDate: student.joinedDate,
        monthlyFee: student.monthlyFee || fee,
        paymentDueDay: student.paymentDueDay,
        status: effectiveStatus,
        originalStatus: student.status,
        paymentStatus: paymentInfo.paymentStatus,
        totalDebt: paymentInfo.totalDebt,
        isDebtor: isDebtor,
      },
      progress: {
        xp: progress?.xp || 0,
        xcoin: progress?.xcoin || 0,
        level: progress?.level || 1,
        completedCount: completedLessonIds.length,
        totalLessonsCount,
        percent: totalLessonsCount > 0 ? Math.round((completedLessonIds.length / totalLessonsCount) * 100) : 0,
        rank,
        groupRank,
        courseRank,
        currentLesson: currentLesson
          ? {
              _id: currentLesson._id,
              moduleId: (currentLesson.moduleId as any)?._id || currentLesson.moduleId,
              module: (currentLesson.moduleId && typeof currentLesson.moduleId === 'object') ? currentLesson.moduleId : undefined,
              title: currentLesson.title,
              order: currentLesson.order,
              xpReward: currentLesson.xpReward,
              xcoinReward: currentLesson.xcoinReward,
            }
          : null,
      },
      announcements,
      payments,
      attendanceSummary: {
        presentCount,
        totalCount: totalAttendanceCount,
        percent: totalAttendanceCount > 0 ? Math.round((presentCount / totalAttendanceCount) * 100) : 100,
        recent: attendances,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

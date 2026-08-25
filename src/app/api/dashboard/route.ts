import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Group } from '@/models/Group';
import { Course } from '@/models/Course';
import { Payment } from '@/models/Payment';
import { Attendance } from '@/models/Attendance';
import { Exam } from '@/models/Exam';
import { Teacher } from '@/models/Teacher';
import { calculateCourseMonth, calculatePaymentPeriods, isGroupScheduledOnDate } from '@/lib/calculations';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // 1. Core Counts
    const totalStudents = await Student.countDocuments({});
    const activeStudents = await Student.countDocuments({ status: 'ACTIVE' });
    const totalGroups = await Group.countDocuments({ status: 'ACTIVE' });

    // 2. Revenue Calculations
    const todayPayments = await Payment.find({
      paymentDate: { $gte: startOfDay(today), $lte: endOfDay(today) },
    });
    const todayRevenue = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const monthPayments = await Payment.find({
      paymentDate: { $gte: startOfMonth(today), $lte: endOfMonth(today) },
    });
    const monthlyRevenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // 3. Student Debts & Status Breakdown
    const students = await Student.find({ status: 'ACTIVE' })
      .populate('courseId', 'name price')
      .populate('groupId', 'name');

    const studentIds = students.map((s) => s._id);
    const payments = await Payment.find({ studentId: { $in: studentIds } });

    const paidMap = new Map<string, number>();
    payments.forEach((p) => {
      if (p.studentId) {
        const sId = p.studentId.toString();
        paidMap.set(sId, (paidMap.get(sId) || 0) + (p.amount || 0));
      }
    });

    let totalDebt = 0;
    const debtorList: any[] = [];
    let paidCount = 0;
    let overdueCount = 0;
    let pendingCount = 0;

    students.forEach((s) => {
      const fee = s.monthlyFee || (s.courseId as any)?.price || 0;
      const totalPaid = paidMap.get(s._id.toString()) || 0;
      const pInfo = calculatePaymentPeriods(s.joinedDate, fee, s.paymentDueDay || 5, totalPaid);

      if (pInfo.paymentStatus === 'PAID') paidCount++;
      else if (pInfo.paymentStatus === 'OVERDUE') overdueCount++;
      else pendingCount++;

      if (pInfo.totalDebt > 0) {
        totalDebt += pInfo.totalDebt;
        debtorList.push({
          id: s._id.toString(),
          studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          phone: s.phone || '',
          groupName: (s.groupId as any)?.name || '-',
          debtAmount: pInfo.totalDebt,
          dueDate: `${s.paymentDueDay || 5}-sana`,
          status: pInfo.paymentStatus,
        });
      }
    });

    // 4. Today's Attendance
    const todayAtt = await Attendance.find({ date: todayStr });
    const todayPresent = todayAtt.filter((a) => a.status === 'PRESENT').length;
    const todayAbsent = todayAtt.filter((a) => a.status === 'ABSENT').length;

    // 5. Today's Scheduled Classes
    const allGroups = await Group.find({ status: 'ACTIVE' })
      .populate('courseId', 'name')
      .populate('teacherId', 'firstName lastName');

    const todayClasses: any[] = [];
    allGroups.forEach((g) => {
      if (g.schedules && Array.isArray(g.schedules) && isGroupScheduledOnDate(g.schedules, today)) {
        const sched = g.schedules.find((s: any) => isGroupScheduledOnDate([s], today));
        todayClasses.push({
          id: g._id.toString(),
          groupName: g.name,
          courseName: (g.courseId as any)?.name || '-',
          teacherName: (g.teacherId as any) ? `${(g.teacherId as any).firstName || ''} ${(g.teacherId as any).lastName || ''}`.trim() : '-',
          time: sched ? `${sched.startTime || '14:00'} - ${sched.endTime || '16:00'}` : '-',
          room: g.room || '-',
        });
      }
    });

    // 6. Upcoming Exams
    const upcomingExams = await Exam.find({ examDate: { $gte: startOfDay(today) } })
      .populate('courseId', 'name')
      .populate('groupId', 'name')
      .sort({ examDate: 1 })
      .limit(5);

    // 7. Chart Data: Students by Course
    const courses = await Course.find({});
    const studentsByCourse = courses.map((c) => {
      const count = students.filter((s) => {
        if (!s.courseId) return false;
        const cId = (s.courseId as any)._id ? (s.courseId as any)._id.toString() : s.courseId.toString();
        return cId === c._id.toString();
      }).length;
      return {
        name: c.name,
        count,
      };
    });

    // 8. Payment Status Distribution Chart
    const paymentStatusChart = [
      { name: "To'langan", value: paidCount, color: "#22c55e" },
      { name: "Qarzdor", value: overdueCount, color: "#ef4444" },
      { name: "Kutilmoqda", value: pendingCount, color: "#eab308" },
    ];

    return NextResponse.json({
      metrics: {
        totalStudents,
        activeStudents,
        totalGroups,
        todayRevenue,
        monthlyRevenue,
        totalDebt,
        todayAttendance: {
          present: todayPresent,
          total: todayAtt.length,
          rate: todayAtt.length > 0 ? Math.round((todayPresent / todayAtt.length) * 100) : 0,
        },
        todayAbsent,
      },
      debtors: debtorList.slice(0, 10),
      todayClasses,
      upcomingExams,
      charts: {
        studentsByCourse,
        paymentStatusChart,
      },
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message || "Dashboard ma'lumotlarini yuklashda xatolik" }, { status: 500 });
  }
}

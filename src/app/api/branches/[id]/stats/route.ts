import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Branch } from '@/models/Branch';
import { Student } from '@/models/Student';
import { Group } from '@/models/Group';
import { Payment } from '@/models/Payment';
import { Attendance } from '@/models/Attendance';
import { Lead } from '@/models/Lead';
import { getSession } from '@/lib/auth';
import { calculateCourseMonth, calculatePaymentPeriods } from '@/lib/calculations';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'MANAGER' && session.branchId !== params.id) {
      return NextResponse.json({ error: 'Siz faqat o\'zingizga biriktirilgan filial ma\'lumotlariga kira olasiz' }, { status: 403 });
    }

    await connectToDatabase();
    const branch = await Branch.findById(params.id);
    if (!branch) {
      return NextResponse.json({ error: 'Filial topilmadi' }, { status: 404 });
    }

    const activeStudents = await Student.find({ branchId: branch._id, status: 'ACTIVE' })
      .populate('courseId', 'price');
    const totalStudentsCount = await Student.countDocuments({ branchId: branch._id });

    const activeGroupsCount = await Group.countDocuments({ branchId: branch._id, status: 'ACTIVE' });
    const totalGroupsCount = await Group.countDocuments({ branchId: branch._id });

    // Revenue
    const payments = await Payment.aggregate([
      { $match: { branchId: branch._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = payments.length > 0 ? payments[0].total : 0;

    // Debt calculation
    const studentIds = activeStudents.map((s) => s._id);
    const studentPayments = await Payment.find({ studentId: { $in: studentIds } });
    const paidMap = new Map<string, number>();
    studentPayments.forEach((p) => {
      const sId = p.studentId.toString();
      paidMap.set(sId, (paidMap.get(sId) || 0) + p.amount);
    });

    let totalDebt = 0;
    activeStudents.forEach((s) => {
      const fee = s.monthlyFee || (s.courseId as any)?.price || 0;
      const paid = paidMap.get(s._id.toString()) || 0;
      const paymentInfo = calculatePaymentPeriods(s.joinedDate, fee, s.paymentDueDay || 5, paid);
      totalDebt += paymentInfo.totalDebt;
    });

    // Attendance rate
    const totalAttendanceRecords = await Attendance.countDocuments({ branchId: branch._id });
    const presentAttendanceRecords = await Attendance.countDocuments({ branchId: branch._id, status: 'PRESENT' });
    const attendancePercentage = totalAttendanceRecords > 0
      ? Math.round((presentAttendanceRecords / totalAttendanceRecords) * 100)
      : 100;

    // Leads count
    const leadsCount = await Lead.countDocuments({ branchId: branch._id });
    const newLeadsCount = await Lead.countDocuments({ branchId: branch._id, status: 'YANGI' });

    return NextResponse.json({
      branchId: branch._id,
      branchName: branch.name,
      activeStudentsCount: activeStudents.length,
      totalStudentsCount,
      activeGroupsCount,
      totalGroupsCount,
      totalRevenue,
      totalDebt,
      attendancePercentage,
      leadsCount,
      newLeadsCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Filial statistikasini yuklashda xatolik' }, { status: 500 });
  }
}

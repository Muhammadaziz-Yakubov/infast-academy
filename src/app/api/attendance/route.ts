import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Attendance } from '@/models/Attendance';
import { Group } from '@/models/Group';
import { Student } from '@/models/Student';
import { isGroupScheduledOnDate, isDateInFuture } from '@/lib/calculations';
import { format } from 'date-fns';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const groupId = searchParams.get('groupId');
    const dateStr = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');

    if (!groupId) {
      return NextResponse.json({ error: "Guruhni tanlang" }, { status: 400 });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });
    }

    // Check BUSINESS RULE 4: Future date lock
    const inFuture = isDateInFuture(dateStr);

    // Check BUSINESS RULE 2 & 3: Scheduled lesson day check
    const isScheduledDay = isGroupScheduledOnDate(group.schedules, dateStr);

    // Fetch active students in group
    const students = await Student.find({ groupId, status: 'ACTIVE' }).sort({ firstName: 1 });

    // Fetch existing attendance records for dateStr
    const existingAttendances = await Attendance.find({ groupId, date: dateStr });
    const attendanceMap = new Map(existingAttendances.map((a) => [a.studentId.toString(), a.status]));

    const studentList = students.map((s) => ({
      _id: s._id.toString(),
      firstName: s.firstName,
      lastName: s.lastName,
      phone: s.phone,
      status: attendanceMap.get(s._id.toString()) || null, // PRESENT, ABSENT, or null
    }));

    return NextResponse.json({
      date: dateStr,
      groupId,
      groupName: group.name,
      isScheduledDay,
      inFuture,
      students: studentList,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Davomatni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { groupId, date: dateStr, studentId, status } = body;

    if (!groupId || !dateStr || !studentId || !status) {
      return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
    }

    // BUSINESS RULE 4: Future date lock check
    if (isDateInFuture(dateStr)) {
      return NextResponse.json(
        { error: "🔒 Davomat hali ochilmadi. Kelgusi sanalar uchun davomat belgilab bo'lmaydi." },
        { status: 400 }
      );
    }

    // BUSINESS RULE 2 & 3: Scheduled day check
    const group = await Group.findById(groupId);
    if (!group || !isGroupScheduledOnDate(group.schedules, dateStr)) {
      return NextResponse.json(
        { error: "Ushbu dars kunida dars rejalashtirilmagan." },
        { status: 400 }
      );
    }

    // Upsert Attendance record
    const attendance = await Attendance.findOneAndUpdate(
      { studentId, groupId, date: dateStr },
      { status },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, attendance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Davomatni saqlashda xatolik" }, { status: 500 });
  }
}

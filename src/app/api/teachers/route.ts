import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Teacher } from '@/models/Teacher';
import { Group } from '@/models/Group';
import { Student } from '@/models/Student';
import { Attendance } from '@/models/Attendance';

export async function GET() {
  try {
    await connectToDatabase();
    const teachers = await Teacher.find({}).sort({ createdAt: -1 });

    const teacherIds = teachers.map((t) => t._id);
    const groups = await Group.find({ teacherId: { $in: teacherIds } });
    const groupIds = groups.map((g) => g._id);
    const students = await Student.find({ groupId: { $in: groupIds }, status: 'ACTIVE' });
    const attendances = await Attendance.find({ groupId: { $in: groupIds } });

    const result = teachers.map((t) => {
      const tIdStr = t._id.toString();
      const assignedGroups = groups.filter((g) => g.teacherId.toString() === tIdStr);
      const assignedGroupIds = new Set(assignedGroups.map((g) => g._id.toString()));

      const studentCount = students.filter((s) => assignedGroupIds.has(s.groupId.toString())).length;

      const teacherAttendances = attendances.filter((a) => assignedGroupIds.has(a.groupId.toString()));
      const totalAtt = teacherAttendances.length;
      const presentAtt = teacherAttendances.filter((a) => a.status === 'PRESENT').length;
      const attRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

      return {
        ...t.toObject(),
        groups: assignedGroups.map((g) => g.name),
        groupCount: assignedGroups.length,
        studentCount,
        attendanceRate: attRate,
      };
    });

    return NextResponse.json({ teachers: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "O'qituvchilarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { firstName, lastName, phone, status } = body;

    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ error: "Ism, familiya va telefon raqamini kiriting" }, { status: 400 });
    }

    const newTeacher = await Teacher.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      status: status || "ACTIVE",
    });

    return NextResponse.json({ success: true, teacher: newTeacher }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "O'qituvchi yaratishda xatolik" }, { status: 500 });
  }
}

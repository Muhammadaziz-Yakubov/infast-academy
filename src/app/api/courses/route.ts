import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Course } from '@/models/Course';
import { Student } from '@/models/Student';
import { Group } from '@/models/Group';

import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const courses = await Course.find({}).sort({ createdAt: -1 });

    const courseIds = courses.map((c) => c._id);
    const groups = await Group.find({ courseId: { $in: courseIds } });
    const students = await Student.find({ courseId: { $in: courseIds }, status: 'ACTIVE' });

    const result = courses.map((c) => {
      const cIdStr = c._id.toString();
      const groupCount = groups.filter((g) => g.courseId.toString() === cIdStr).length;
      const studentCount = students.filter((s) => s.courseId.toString() === cIdStr).length;

      return {
        ...c.toObject(),
        groupCount,
        studentCount,
      };
    });

    return NextResponse.json({ courses: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Kurslarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { name, price, durationMonths, description, status } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Kurs nomi va narxini kiriting" }, { status: 400 });
    }

    const newCourse = await Course.create({
      name: name.trim(),
      price: Number(price),
      durationMonths: durationMonths ? Number(durationMonths) : 6,
      description,
      status: status || "ACTIVE",
    });

    return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Kurs yaratishda xatolik" }, { status: 500 });
  }
}

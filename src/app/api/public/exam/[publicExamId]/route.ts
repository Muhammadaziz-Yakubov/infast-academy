import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Exam } from '@/models/Exam';
import { ExamResult } from '@/models/ExamResult';
import { Student } from '@/models/Student';
import { Course } from '@/models/Course';

export async function POST(request: Request, { params }: { params: { publicExamId: string } }) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: "Telefon raqamingizni kiriting" }, { status: 400 });
    }

    const exam = await Exam.findOne({ publicExamId: params.publicExamId }).populate('courseId', 'name');

    if (!exam) {
      return NextResponse.json({ error: "Imtihon topilmadi yoki havola noto'g'ri" }, { status: 404 });
    }

    if (!exam.isPublished) {
      return NextResponse.json({ error: "Ushbu imtihon natijalari hali e'lon qilinmagan" }, { status: 403 });
    }

    // Clean phone number for matching
    const cleanInputPhone = phone.replace(/\D/g, '');

    const groupStudents = await Student.find({ groupId: exam.groupId });
    const matchedStudent = groupStudents.find((s) => s.phone.replace(/\D/g, '').endsWith(cleanInputPhone.slice(-9)));

    if (!matchedStudent) {
      return NextResponse.json(
        { error: "Kiritilgan telefon raqami ushbu imtihon qatnashchilari ro'yxatida topilmadi." },
        { status: 404 }
      );
    }

    const result = await ExamResult.findOne({ examId: exam._id, studentId: matchedStudent._id });

    return NextResponse.json({
      success: true,
      examInfo: {
        name: exam.name,
        courseName: (exam.courseId as any)?.name || "Kurs",
        examDate: exam.examDate,
        maxScore: exam.maxScore,
        passingScore: exam.passingScore,
      },
      studentResult: {
        studentName: `${matchedStudent.firstName} ${matchedStudent.lastName}`,
        score: result ? result.score : null,
        status: result ? result.status : "ABSENT",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Tekshirishda xatolik" }, { status: 500 });
  }
}

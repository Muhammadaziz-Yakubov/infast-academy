import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Exam } from '@/models/Exam';
import { ExamResult } from '@/models/ExamResult';
import { Student } from '@/models/Student';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(request: Request, { params }: { params: { publicExamId: string } }) {
  try {
    const limiter = await rateLimit(request, 20, 60 * 1000);
    if (!limiter.success && limiter.response) {
      return limiter.response;
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    const exam = await Exam.findOne({ publicExamId: params.publicExamId })
      .populate('courseId', 'name')
      .populate('groupId', 'name');

    if (!exam) {
      return NextResponse.json({ error: "Imtihon topilmadi yoki havola noto'g'ri" }, { status: 404 });
    }

    // Sanitize questions to remove correctAnswerIndex for security
    const sanitizedQuestions = (exam.questions || []).map((q: any) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      points: q.points || 10,
    }));

    const examInfo = {
      _id: exam._id,
      name: exam.name,
      courseName: (exam.courseId as any)?.name || "Kurs",
      groupName: (exam.groupId as any)?.name || "Guruh",
      examDate: exam.examDate,
      durationMinutes: exam.durationMinutes || 30,
      maxScore: exam.maxScore,
      passingScore: exam.passingScore,
      questionsCount: sanitizedQuestions.length,
      questions: sanitizedQuestions,
      isPublished: exam.isPublished,
    };

    if (!phone) {
      return NextResponse.json({ success: true, exam: examInfo });
    }

    // Clean phone number for verification
    const cleanInputPhone = phone.replace(/\D/g, '');
    const groupStudents = await Student.find({ groupId: exam.groupId, status: 'ACTIVE' });
    const matchedStudent = groupStudents.find((s) => s.phone.replace(/\D/g, '').endsWith(cleanInputPhone.slice(-9)));

    if (!matchedStudent) {
      return NextResponse.json(
        { error: "Kiritilgan telefon raqami ushbu guruh o'quvchilari ro'yxatida topilmadi" },
        { status: 404 }
      );
    }

    const existingResult = await ExamResult.findOne({ examId: exam._id, studentId: matchedStudent._id });

    const rawPhone = matchedStudent.phone || '';
    const maskedPhone = rawPhone.length >= 7 ? `${rawPhone.slice(0, 4)} *** ** ${rawPhone.slice(-2)}` : rawPhone;

    return NextResponse.json({
      success: true,
      exam: examInfo,
      student: {
        _id: matchedStudent._id,
        firstName: matchedStudent.firstName,
        lastName: matchedStudent.lastName,
        phone: maskedPhone,
      },
      alreadySubmitted: existingResult?.isSubmitted || false,
    });
  } catch (error: any) {
    console.error("Take exam error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { publicExamId: string } }) {
  try {
    const limiter = await rateLimit(request, 20, 60 * 1000);
    if (!limiter.success && limiter.response) {
      return limiter.response;
    }

    await connectToDatabase();
    const body = await request.json();
    const { phone, answers } = body;

    if (!phone) {
      return NextResponse.json({ error: "Telefon raqamini kiriting" }, { status: 400 });
    }

    const exam = await Exam.findOne({ publicExamId: params.publicExamId });
    if (!exam) {
      return NextResponse.json({ error: "Imtihon topilmadi" }, { status: 404 });
    }

    const cleanInputPhone = phone.replace(/\D/g, '');
    const groupStudents = await Student.find({ groupId: exam.groupId, status: 'ACTIVE' });
    const matchedStudent = groupStudents.find((s) => s.phone.replace(/\D/g, '').endsWith(cleanInputPhone.slice(-9)));

    if (!matchedStudent) {
      return NextResponse.json(
        { error: "Kiritilgan telefon raqami ushbu guruh o'quvchilari ro'yxatida topilmadi" },
        { status: 404 }
      );
    }

    // Check if already submitted
    const existingResult = await ExamResult.findOne({ examId: exam._id, studentId: matchedStudent._id });
    if (existingResult?.isSubmitted) {
      return NextResponse.json(
        { error: "Siz ushbu testni allaqachon topshirib bo'lgansiz." },
        { status: 400 }
      );
    }

    // Auto-calculate score
    let calculatedScore = 0;
    const questions = exam.questions || [];

    for (const q of questions) {
      const studentAnswer = answers ? answers[q.id] : undefined;
      if (studentAnswer !== undefined && studentAnswer === q.correctAnswerIndex) {
        calculatedScore += q.points || 10;
      }
    }

    const isPassed = calculatedScore >= (exam.passingScore || 60);

    await ExamResult.findOneAndUpdate(
      { examId: exam._id, studentId: matchedStudent._id },
      {
        score: calculatedScore,
        status: isPassed ? 'PASSED' : 'FAILED',
        isSubmitted: true,
        submittedAt: new Date(),
        answers: answers || {},
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Test muvaffaqiyatli topshirildi!",
      isPublished: exam.isPublished,
    });
  } catch (error: any) {
    console.error("Submit exam error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi"}, { status: 500 });
  }
}

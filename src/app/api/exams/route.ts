import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Exam } from '@/models/Exam';
import { ExamResult } from '@/models/ExamResult';
import { Student } from '@/models/Student';
import { Course } from '@/models/Course';
import { Group } from '@/models/Group';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET() {
  try {
    await connectToDatabase();
    const exams = await Exam.find({})
      .populate('courseId', 'name')
      .populate('groupId', 'name')
      .sort({ examDate: -1 });

    const examIds = exams.map((e) => e._id);
    const results = await ExamResult.find({ examId: { $in: examIds } });

    const examList = exams.map((exam) => {
      const eIdStr = exam._id.toString();
      const examRes = results.filter((r) => r.examId.toString() === eIdStr);

      const totalStudents = examRes.length;
      const passedCount = examRes.filter((r) => r.status === 'PASSED').length;
      const failedCount = examRes.filter((r) => r.status === 'FAILED').length;
      const absentCount = examRes.filter((r) => r.status === 'ABSENT').length;

      const scoredRes = examRes.filter((r) => r.score !== null && r.score !== undefined);
      const avgScore = scoredRes.length > 0
        ? Math.round(scoredRes.reduce((sum, r) => sum + (r.score || 0), 0) / scoredRes.length)
        : 0;

      return {
        ...exam.toObject(),
        stats: {
          totalStudents,
          passedCount,
          failedCount,
          absentCount,
          avgScore,
        },
      };
    });

    return NextResponse.json({ exams: examList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Imtihonlarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { name, courseId, groupId, examDate, startTime, endTime, room, maxScore, passingScore, description } = body;

    if (!name || !courseId || !groupId || !examDate || !startTime || !endTime || !room) {
      return NextResponse.json({ error: "Barcha majburiy maydonlarni to'ldiring" }, { status: 400 });
    }

    const publicExamId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

    const newExam = await Exam.create({
      name: name.trim(),
      courseId,
      groupId,
      examDate: new Date(examDate),
      startTime,
      endTime,
      room,
      maxScore: maxScore ? Number(maxScore) : 100,
      passingScore: passingScore ? Number(passingScore) : 60,
      description,
      isPublished: false,
      publicExamId,
    });

    // Auto-create initial ExamResult entries for all students in group
    const groupStudents = await Student.find({ groupId, status: 'ACTIVE' });
    for (const student of groupStudents) {
      await ExamResult.create({
        examId: newExam._id,
        studentId: student._id,
        score: null,
        status: "ABSENT",
      });
    }

    // Send Telegram notification to group if telegramChatId exists
    const targetGroup = await Group.findById(groupId);
    const targetCourse = await Course.findById(courseId);

    if (targetGroup && targetGroup.telegramChatId) {
      const formattedDate = new Date(examDate).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
      const courseName = targetCourse?.name || "Kurs";

      const messageText = `📝 <b>YANGI IMTIHON E'LON QILINDI</b>\n\n📚 <b>Kurs:</b> ${courseName}\n👥 <b>Guruh:</b> ${targetGroup.name}\n📌 <b>Imtihon nomi:</b> ${newExam.name}\n📅 <b>Sana:</b> ${formattedDate}\n🕐 <b>Vaqt:</b> ${startTime} - ${endTime}\n📍 <b>Xona:</b> ${room}\n🎯 <b>Maksimal ball:</b> ${newExam.maxScore} (O'tish balli: ${newExam.passingScore})\n\n<i>Barcha talabalarga imtihonda omad tilaymiz! 🚀</i>`;

      await sendTelegramMessage(targetGroup.telegramChatId, messageText);
    }

    return NextResponse.json({ success: true, exam: newExam }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Imtihon yaratishda xatolik" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Exam } from '@/models/Exam';
import { ExamResult } from '@/models/ExamResult';
import { Student } from '@/models/Student';
import { Group } from '@/models/Group';
import { Notification } from '@/models/Notification';
import { sendTelegramMessage } from '@/lib/telegram';

import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const exam = await Exam.findById(params.id)
      .populate('courseId', 'name')
      .populate('groupId', 'name');

    if (!exam) {
      return NextResponse.json({ error: "Imtihon topilmadi" }, { status: 404 });
    }

    const actualGroupId = (exam.groupId as any)._id || exam.groupId;
    const groupStudents = await Student.find({ groupId: actualGroupId, status: 'ACTIVE' }).sort({ firstName: 1 });
    const results = await ExamResult.find({ examId: params.id }).populate('studentId', 'firstName lastName phone');

    const resultMap = new Map(
      results.map((r) => {
        const sId = r.studentId?._id ? r.studentId._id.toString() : r.studentId?.toString() || '';
        return [sId, r];
      })
    );

    const studentResults = groupStudents.map((s) => {
      const existingRes = resultMap.get(s._id.toString());
      return {
        studentId: s._id.toString(),
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        score: existingRes ? existingRes.score : null,
        status: existingRes ? existingRes.status : "ABSENT",
      };
    });

    return NextResponse.json({ exam, results: studentResults });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Imtihon tafsilotlarini yuklashda xatolik" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { action, scores, isPublished } = body;

    const exam = await Exam.findById(params.id);
    if (!exam) {
      return NextResponse.json({ error: "Imtihon topilmadi" }, { status: 404 });
    }

    // Action 1: Save Scores Matrix
    if (action === 'save_scores' && Array.isArray(scores)) {
      for (const item of scores) {
        const { studentId, score } = item;
        let status: "PASSED" | "FAILED" | "ABSENT";

        if (score === null || score === undefined || score === '') {
          status = "ABSENT";
        } else {
          const numericScore = Number(score);
          status = numericScore >= exam.passingScore ? "PASSED" : "FAILED";
        }

        await ExamResult.findOneAndUpdate(
          { examId: params.id, studentId },
          { score: (score === null || score === undefined || score === '') ? null : Number(score), status },
          { upsert: true, new: true }
        );
      }

      return NextResponse.json({ success: true, message: "Natijalar saqlandi" });
    }

    // Action 2: Publish Results Toggle
    if (action === 'publish') {
      exam.isPublished = true;
      await exam.save();

      // Send CRM notification
      await Notification.create({
        title: "📝 Imtihon natijalari e'lon qilindi",
        message: `"${exam.name}" imtihoni natijalari ochiq havola orqali e'lon qilindi.`,
        type: "INFO",
      });

      // Send Telegram notification to group if telegramChatId exists
      const targetGroup = await Group.findById(exam.groupId);
      if (targetGroup && targetGroup.telegramChatId) {
        const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
        const proto = request.headers.get('x-forwarded-proto') || 'https';
        const dynamicUrl = host ? `${proto}://${host}` : 'http://localhost:3000';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || dynamicUrl;
        const publicResultUrl = `${appUrl}/result/${exam.publicExamId}`;
        const messageText = `📢 <b>IMTIHON NATIJALARI E'LON QILINDI!</b>\n\n👥 <b>Guruh:</b> ${targetGroup.name}\n📌 <b>Imtihon:</b> ${exam.name}\n\nO'z natijangizni ko'rish va sertifikat yuklab olish uchun quyidagi havola orqali o'ting:\n🔗 ${publicResultUrl}`;

        await sendTelegramMessage(targetGroup.telegramChatId, messageText);
      }

      return NextResponse.json({
        success: true,
        message: "Natijalar muvaffaqiyatli e'lon qilindi va guruhga yuborildi!",
        publicUrl: `/result/${exam.publicExamId}`,
      });
    }

    // Default field updates
    const updatedExam = await Exam.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, exam: updatedExam });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Saqlashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const exam = await Exam.findById(params.id);
    if (!exam) {
      return NextResponse.json({ error: "Imtihon topilmadi" }, { status: 404 });
    }

    await ExamResult.deleteMany({ examId: params.id });
    await Exam.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, message: "Imtihon o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "O'chirishda xatolik" }, { status: 500 });
  }
}


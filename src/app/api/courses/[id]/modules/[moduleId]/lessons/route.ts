import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Module } from '@/models/Module';
import { Lesson, ITestQuestion } from '@/models/Lesson';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const lessons = await Lesson.find({
      courseId: params.id,
      moduleId: params.moduleId,
    })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ success: true, lessons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Darslarni olishda xatolik" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const moduleDoc = await Module.findOne({ _id: params.moduleId, courseId: params.id });
    if (!moduleDoc) {
      return NextResponse.json({ error: "Modul topilmadi" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      order,
      theoryContent,
      testQuestions,
      practiceTask,
      interactiveActivity,
      xpReward,
      xcoinReward,
      status,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Dars nomi kiritilishi shart" }, { status: 400 });
    }

    let targetOrder = Number(order);
    if (isNaN(targetOrder) || targetOrder < 1) {
      const highestLesson = await Lesson.findOne({ moduleId: params.moduleId }).sort({ order: -1 });
      targetOrder = highestLesson ? highestLesson.order + 1 : 1;
    }

    // Prepare default test questions if not provided: 3 rounds x 3 questions = 9 questions
    let finalQuestions: ITestQuestion[] = [];
    if (Array.isArray(testQuestions) && testQuestions.length > 0) {
      finalQuestions = testQuestions.map((q: any, idx: number) => {
        const roundNum = q.round || (Math.floor(idx / 3) + 1);
        return {
          round: (roundNum >= 1 && roundNum <= 3 ? roundNum : 1) as 1 | 2 | 3,
          question: q.question || `Savol #${idx + 1}`,
          options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['A variant', 'B variant', 'C variant', 'D variant'],
          correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
          explanation: q.explanation || '',
        };
      });
    } else {
      // Generate default 9 questions (3 rounds x 3 questions)
      for (let r = 1; r <= 3; r++) {
        for (let q = 1; q <= 3; q++) {
          finalQuestions.push({
            round: r as 1 | 2 | 3,
            question: `${r}-Bosqich, ${q}-Savol: Mavzu bo'yicha tushunchangizni tekshiring`,
            options: ['To\'g\'ri javob', 'Noto\'g\'ri variant 1', 'Noto\'g\'ri variant 2', 'Noto\'g\'ri variant 3'],
            correctAnswerIndex: 0,
            explanation: 'To\'g\'ri javob tushuntirishi',
          });
        }
      }
    }

    const newLesson = await Lesson.create({
      courseId: params.id,
      moduleId: params.moduleId,
      title: title.trim(),
      description: description?.trim() || '',
      order: targetOrder,
      theoryContent: theoryContent || `# ${title.trim()}\n\nNazariy ma'lumotlar bu yerda keltiriladi. Videodarslar o'rniga matnli qo'llanma, kod namunalari va tushuntirishlar taqdim etiladi.`,
      testQuestions: finalQuestions,
      practiceTask: practiceTask || {
        title: "Amaliy topshiriq",
        instructions: "Ushbu darsda o'rganilgan nazariyani amalda qo'llang.",
        starterCode: "// Boshlang'ich kod",
        hints: ["Birinchi navbatda talablarni o'rganing"],
        expectedOutput: "Kutilayotgan natija",
      },
      interactiveActivity: interactiveActivity || {
        type: "MATCH_PAIRS",
        title: "Tushunchalar juftligini toping",
        instructions: "Chap tomondagi tushunchani o'ng tomondagi to'g'ri ta'rif bilan moslashtiring.",
        pairs: [
          { left: "const", right: "O'zgarmas o'zgaruvchi" },
          { left: "let", right: "O'zgaruvchan qiymat" },
          { left: "function", right: "Qayta ishlatiluvchi funksiya" },
        ],
      },
      xpReward: typeof xpReward === 'number' ? xpReward : 50,
      xcoinReward: typeof xcoinReward === 'number' ? xcoinReward : 10,
      status: status || 'ACTIVE',
    });

    return NextResponse.json({ success: true, lesson: newLesson }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Dars yaratishda xatolik" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Module } from '@/models/Module';
import { Lesson, ITestQuestion, IInteractiveActivity, IPracticeTask } from '@/models/Lesson';
import { Course } from '@/models/Course';
import { getSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json({ error: "Kurs topilmadi" }, { status: 404 });
    }

    const body = await request.json();
    const { mode = 'append', rawData } = body;

    let modulesList: any[] = [];
    if (Array.isArray(body)) {
      modulesList = body;
    } else if (Array.isArray(body.modules)) {
      modulesList = body.modules;
    } else if (rawData) {
      const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      modulesList = Array.isArray(parsed) ? parsed : (parsed.modules || []);
    }

    if (!Array.isArray(modulesList) || modulesList.length === 0) {
      return NextResponse.json(
        { error: "JSON formatida 'modules' massivi topilmadi yoki bo'sh" },
        { status: 400 }
      );
    }

    // If replace mode, clear existing modules and lessons for this course
    if (mode === 'replace') {
      await Lesson.deleteMany({ courseId: params.id });
      await Module.deleteMany({ courseId: params.id });
    }

    // Determine starting order for modules if appending
    let baseModuleOrder = 0;
    if (mode === 'append') {
      const highestModule = await Module.findOne({ courseId: params.id }).sort({ order: -1 });
      baseModuleOrder = highestModule ? highestModule.order : 0;
    }

    let createdModulesCount = 0;
    let createdLessonsCount = 0;

    for (let mIdx = 0; mIdx < modulesList.length; mIdx++) {
      const modData = modulesList[mIdx];
      const modTitle = (modData.title || `Modul ${mIdx + 1}`).trim();
      const modOrder = typeof modData.order === 'number' ? modData.order : baseModuleOrder + mIdx + 1;
      const modDesc = modData.description || '';

      const newModule = await Module.create({
        courseId: params.id,
        title: modTitle,
        order: modOrder,
        description: modDesc,
        status: modData.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      createdModulesCount++;

      const lessonsList = Array.isArray(modData.lessons) ? modData.lessons : [];
      for (let lIdx = 0; lIdx < lessonsList.length; lIdx++) {
        const lessData = lessonsList[lIdx];
        const lessTitle = (lessData.title || `Dars ${lIdx + 1}`).trim();
        const lessOrder = typeof lessData.order === 'number' ? lessData.order : lIdx + 1;
        const lessDesc = lessData.description || '';
        const theoryContent = lessData.theoryContent || '';

        // Format and validate testQuestions
        const rawTests = Array.isArray(lessData.testQuestions) ? lessData.testQuestions : [];
        const formattedTests: ITestQuestion[] = rawTests.map((q: any, qIdx: number) => {
          let roundNum: 1 | 2 | 3 = 1;
          if (q.round === 1 || q.round === 2 || q.round === 3) {
            roundNum = q.round;
          } else {
            // Auto group by index: 0..2 -> 1, 3..5 -> 2, 6+ -> 3
            if (qIdx < 3) roundNum = 1;
            else if (qIdx < 6) roundNum = 2;
            else roundNum = 3;
          }

          let options = Array.isArray(q.options) ? q.options.map((o: any) => String(o)) : [];
          while (options.length < 4) {
            options.push(`Variant ${options.length + 1}`);
          }
          if (options.length > 4) {
            options = options.slice(0, 4);
          }

          let correctIdx = Number(q.correctAnswerIndex);
          if (isNaN(correctIdx) || correctIdx < 0 || correctIdx > 3) {
            correctIdx = 0;
          }

          return {
            round: roundNum,
            question: q.question || `Savol ${qIdx + 1}`,
            options,
            correctAnswerIndex: correctIdx,
            explanation: q.explanation || '',
          };
        });

        // Practice Task
        const practiceTask: IPracticeTask = {
          title: lessData.practiceTask?.title || "Amaliy topshiriq",
          instructions: lessData.practiceTask?.instructions || "Berilgan mavzuni amalda mustahkamlang.",
          starterCode: lessData.practiceTask?.starterCode || "",
          hints: Array.isArray(lessData.practiceTask?.hints) ? lessData.practiceTask.hints : [],
          expectedOutput: lessData.practiceTask?.expectedOutput || "",
        };

        // Interactive Activity
        let interactiveActivity: IInteractiveActivity | undefined = undefined;
        if (lessData.interactiveActivity && lessData.interactiveActivity.type) {
          interactiveActivity = {
            type: lessData.interactiveActivity.type,
            title: lessData.interactiveActivity.title || "Interaktiv mashg'ulot",
            instructions: lessData.interactiveActivity.instructions || "Vazifani bajaring",
            pairs: Array.isArray(lessData.interactiveActivity.pairs) ? lessData.interactiveActivity.pairs : [],
            steps: Array.isArray(lessData.interactiveActivity.steps) ? lessData.interactiveActivity.steps : [],
            bugTask: lessData.interactiveActivity.bugTask,
            fillBlanks: lessData.interactiveActivity.fillBlanks,
            quickQuiz: Array.isArray(lessData.interactiveActivity.quickQuiz) ? lessData.interactiveActivity.quickQuiz : [],
          };
        }

        await Lesson.create({
          courseId: params.id,
          moduleId: newModule._id,
          title: lessTitle,
          order: lessOrder,
          description: lessDesc,
          theoryContent,
          testQuestions: formattedTests,
          practiceTask,
          interactiveActivity,
          xpReward: typeof lessData.xpReward === 'number' ? lessData.xpReward : 50,
          xcoinReward: typeof lessData.xcoinReward === 'number' ? lessData.xcoinReward : 10,
          status: lessData.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        });
        createdLessonsCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Muvaffaqiyatli yuklandi: ${createdModulesCount} ta modul va ${createdLessonsCount} ta dars yaratildi!`,
      modulesCount: createdModulesCount,
      lessonsCount: createdLessonsCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "JSON import qilishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

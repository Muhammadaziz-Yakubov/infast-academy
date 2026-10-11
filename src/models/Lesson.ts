import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITestQuestion {
  round: 1 | 2 | 3;
  question: string;
  options: string[]; // exactly 4 options
  correctAnswerIndex: number; // 0, 1, 2, or 3
  explanation?: string;
}

export interface IPracticeTask {
  title: string;
  instructions: string;
  starterCode?: string;
  hints?: string[];
  expectedOutput?: string;
}

export type InteractiveActivityType =
  | "MATCH_PAIRS"
  | "ORDER_STEPS"
  | "FIND_BUG"
  | "FILL_BLANKS"
  | "QUICK_QUIZ";

export interface IMatchPair {
  left: string;
  right: string;
}

export interface IOrderStep {
  id: string;
  text: string;
  correctOrder: number;
}

export interface IBugTask {
  code: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface IFillBlank {
  textWithBlanks: string; // e.g. "const name = {blank1};"
  missingWords: string[];
}

export interface IQuickQuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface IInteractiveActivity {
  type: InteractiveActivityType;
  title: string;
  instructions: string;
  pairs?: IMatchPair[];
  steps?: IOrderStep[];
  bugTask?: IBugTask;
  fillBlanks?: IFillBlank;
  quickQuiz?: IQuickQuizQuestion[];
}

export interface ILesson extends Document {
  courseId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  title: string;
  order: number;
  description?: string;
  theoryContent: string; // Markdown or rich text. Explicitly NO video support.
  testQuestions: ITestQuestion[]; // 3 rounds x 3 questions = 9 questions total
  practiceTask: IPracticeTask;
  interactiveActivity?: IInteractiveActivity;
  xpReward: number;
  xcoinReward: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const TestQuestionSchema = new Schema<ITestQuestion>(
  {
    round: { type: Number, required: true, enum: [1, 2, 3] },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String },
  },
  { _id: true }
);

const PracticeTaskSchema = new Schema<IPracticeTask>(
  {
    title: { type: String, required: true },
    instructions: { type: String, required: true },
    starterCode: { type: String },
    hints: [{ type: String }],
    expectedOutput: { type: String },
  },
  { _id: false }
);

const InteractiveActivitySchema = new Schema<IInteractiveActivity>(
  {
    type: {
      type: String,
      required: true,
      enum: ["MATCH_PAIRS", "ORDER_STEPS", "FIND_BUG", "FILL_BLANKS", "QUICK_QUIZ"],
      default: "MATCH_PAIRS",
    },
    title: { type: String, required: true, default: "Interaktiv mashg'ulot" },
    instructions: { type: String, required: true, default: "Vazifani bajaring" },
    pairs: [
      {
        left: { type: String, required: true },
        right: { type: String, required: true },
      },
    ],
    steps: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        correctOrder: { type: Number, required: true },
      },
    ],
    bugTask: {
      code: { type: String },
      options: [{ type: String }],
      correctOptionIndex: { type: Number, default: 0 },
      explanation: { type: String },
    },
    fillBlanks: {
      textWithBlanks: { type: String },
      missingWords: [{ type: String }],
    },
    quickQuiz: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctOptionIndex: { type: Number, required: true, default: 0 },
      },
    ],
  },
  { _id: false }
);

const LessonSchema: Schema<ILesson> = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, required: true, default: 1 },
    description: { type: String },
    theoryContent: { type: String, required: true, default: "" },
    testQuestions: [TestQuestionSchema],
    practiceTask: {
      type: PracticeTaskSchema,
      default: () => ({
        title: "Amaliy topshiriq",
        instructions: "Berilgan vazifani amalda bajaring va natijani tekshiring.",
      }),
    },
    interactiveActivity: {
      type: InteractiveActivitySchema,
      default: () => ({
        type: "MATCH_PAIRS",
        title: "Tushunchalar juftligini toping",
        instructions: "Chap tomondagi tushunchani o'ng tomondagi to'g'ri ta'rif yoki natija bilan moslashtiring.",
        pairs: [
          { left: "const", right: "O'zgarmas o'zgaruvchi e'loni" },
          { left: "let", right: "O'zgaruvchan qiymat e'loni" },
          { left: "function", right: "Qayta ishlatiluvchi kod bloki" },
        ],
      }),
    },
    xpReward: { type: Number, default: 50 },
    xcoinReward: { type: Number, default: 10 },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

LessonSchema.index({ moduleId: 1, order: 1 });
LessonSchema.index({ courseId: 1, order: 1 });

export const Lesson: Model<ILesson> = mongoose.models.Lesson || mongoose.model<ILesson>("Lesson", LessonSchema);

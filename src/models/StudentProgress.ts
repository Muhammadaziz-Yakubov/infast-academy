import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILessonState {
  lessonId: mongoose.Types.ObjectId;
  status: "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "COMPLETED";
  theoryRead: boolean;
  testPassed: boolean;
  testScore: number; // e.g. 8 or 9 out of 9
  testAttempts: number;
  practiceCompleted: boolean;
  practiceSubmission?: string;
  completedAt?: Date;
  updatedAt: Date;
}

export interface IStudentProgress extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  startingLessonId?: mongoose.Types.ObjectId;
  currentLessonId?: mongoose.Types.ObjectId;
  unlockedLessonIds: mongoose.Types.ObjectId[];
  completedLessonIds: mongoose.Types.ObjectId[];
  lessonStates: ILessonState[];
  xp: number;
  xcoin: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonStateSchema = new Schema<ILessonState>(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    status: {
      type: String,
      enum: ["LOCKED", "UNLOCKED", "IN_PROGRESS", "COMPLETED"],
      default: "LOCKED",
    },
    theoryRead: { type: Boolean, default: false },
    testPassed: { type: Boolean, default: false },
    testScore: { type: Number, default: 0 },
    testAttempts: { type: Number, default: 0 },
    practiceCompleted: { type: Boolean, default: false },
    practiceSubmission: { type: String },
    completedAt: { type: Date },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StudentProgressSchema: Schema<IStudentProgress> = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    startingLessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
    currentLessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
    unlockedLessonIds: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    completedLessonIds: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    lessonStates: [LessonStateSchema],
    xp: { type: Number, default: 0 },
    xcoin: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
  },
  { timestamps: true }
);

StudentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const StudentProgress: Model<IStudentProgress> =
  mongoose.models.StudentProgress || mongoose.model<IStudentProgress>("StudentProgress", StudentProgressSchema);

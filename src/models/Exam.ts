import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExam extends Document {
  name: string;
  courseId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  examDate: Date;
  startTime: string;
  endTime: string;
  room: string;
  maxScore: number;
  passingScore: number;
  description?: string;
  isPublished: boolean;
  publicExamId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema: Schema<IExam> = new Schema(
  {
    name: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    examDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, required: true },
    maxScore: { type: Number, required: true, default: 100 },
    passingScore: { type: Number, required: true, default: 60 },
    description: { type: String },
    isPublished: { type: Boolean, default: false },
    publicExamId: { type: String, required: true, unique: true, index: true, default: () => Math.random().toString(36).substring(2, 15) },
  },
  { timestamps: true }
);

export const Exam: Model<IExam> = mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);

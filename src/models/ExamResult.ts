import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExamResult extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  score?: number | null; // null means ABSENT
  status: "PASSED" | "FAILED" | "ABSENT";
  createdAt: Date;
  updatedAt: Date;
}

const ExamResultSchema: Schema<IExamResult> = new Schema(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    score: { type: Number, default: null },
    status: { type: String, enum: ["PASSED", "FAILED", "ABSENT"], required: true },
  },
  { timestamps: true }
);

ExamResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export const ExamResult: Model<IExamResult> = mongoose.models.ExamResult || mongoose.model<IExamResult>("ExamResult", ExamResultSchema);

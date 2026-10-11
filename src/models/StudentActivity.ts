import mongoose, { Schema, Document, Model } from "mongoose";

export type StudentActivityType =
  | "LESSON_UNLOCKED"
  | "THEORY_READ"
  | "TEST_ATTEMPT"
  | "TEST_PASSED"
  | "PRACTICE_SUBMITTED"
  | "LESSON_COMPLETED"
  | "XP_EARNED"
  | "COIN_EARNED"
  | "PAYMENT_MADE"
  | "BRANCH_TRANSFERRED"
  | "ATTENDANCE_MARKED";

export interface IStudentActivity extends Document {
  studentId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  type: StudentActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const StudentActivitySchema: Schema<IStudentActivity> = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", index: true },
    type: {
      type: String,
      required: true,
      enum: [
        "LESSON_UNLOCKED",
        "THEORY_READ",
        "TEST_ATTEMPT",
        "TEST_PASSED",
        "PRACTICE_SUBMITTED",
        "LESSON_COMPLETED",
        "XP_EARNED",
        "COIN_EARNED",
        "PAYMENT_MADE",
        "BRANCH_TRANSFERRED",
        "ATTENDANCE_MARKED",
      ],
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

StudentActivitySchema.index({ studentId: 1, createdAt: -1 });

export const StudentActivity: Model<IStudentActivity> =
  mongoose.models.StudentActivity || mongoose.model<IStudentActivity>("StudentActivity", StudentActivitySchema);

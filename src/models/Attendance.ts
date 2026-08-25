import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  status: "PRESENT" | "ABSENT";
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema<IAttendance> = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    date: { type: String, required: true, index: true },
    status: { type: String, enum: ["PRESENT", "ABSENT"], required: true },
  },
  { timestamps: true }
);

AttendanceSchema.index({ studentId: 1, groupId: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);

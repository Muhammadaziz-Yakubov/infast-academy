import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGroupSchedule {
  dayOfWeek: string; // Dushanba, Seshanba, Chorshanba, Payshanba, Juma, Shanba, Yakshanba
  startTime: string; // e.g. "14:00"
  endTime: string;   // e.g. "15:30"
}

export interface IGroup extends Document {
  name: string;
  courseId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  room: string;
  telegramChatId?: string;
  schedules: IGroupSchedule[];
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  createdAt: Date;
  updatedAt: Date;
}

const GroupScheduleSchema = new Schema<IGroupSchedule>(
  {
    dayOfWeek: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const GroupSchema: Schema<IGroup> = new Schema(
  {
    name: { type: String, required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", index: true },
    room: { type: String, required: true },
    telegramChatId: { type: String, index: true },
    schedules: [GroupScheduleSchema],
    status: { type: String, enum: ["ACTIVE", "COMPLETED", "PAUSED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

GroupSchema.index({ branchId: 1, name: 1 }, { unique: true, sparse: true });

export const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>("Group", GroupSchema);

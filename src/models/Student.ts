import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  parentPhone?: string;
  birthDate?: Date;
  courseId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  joinedDate: Date;
  monthlyFee?: number;
  paymentDueDay: number;
  status: "ACTIVE" | "PAUSED" | "LEFT" | "COMPLETED";
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema<IStudent> = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    parentPhone: { type: String },
    birthDate: { type: Date },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    joinedDate: { type: Date, required: true, default: Date.now },
    monthlyFee: { type: Number },
    paymentDueDay: { type: Number, required: true, default: 5 },
    status: { type: String, enum: ["ACTIVE", "PAUSED", "LEFT", "COMPLETED"], default: "ACTIVE", index: true },
  },
  { timestamps: true }
);

export const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

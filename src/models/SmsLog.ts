import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISmsLog extends Document {
  studentId?: mongoose.Types.ObjectId;
  studentName?: string;
  phone: string;
  message: string;
  status: "SENT" | "FAILED" | "PENDING";
  devsmsId?: number | string;
  totalCost?: number;
  errorDetails?: string;
  sentBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SmsLogSchema: Schema<ISmsLog> = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", index: true },
    studentName: { type: String },
    phone: { type: String, required: true, index: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["SENT", "FAILED", "PENDING"], default: "PENDING", index: true },
    devsmsId: { type: Schema.Types.Mixed },
    totalCost: { type: Number, default: 0 },
    errorDetails: { type: String },
    sentBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const SmsLog: Model<ISmsLog> = mongoose.models.SmsLog || mongoose.model<ISmsLog>("SmsLog", SmsLogSchema);

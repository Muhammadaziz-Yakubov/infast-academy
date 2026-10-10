import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudentTransfer extends Document {
  studentId: mongoose.Types.ObjectId;
  fromBranchId: mongoose.Types.ObjectId;
  toBranchId: mongoose.Types.ObjectId;
  fromGroupId?: mongoose.Types.ObjectId;
  toGroupId?: mongoose.Types.ObjectId;
  transferredAt: Date;
  transferredBy?: mongoose.Types.ObjectId;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentTransferSchema: Schema<IStudentTransfer> = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    fromBranchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
    toBranchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
    fromGroupId: { type: Schema.Types.ObjectId, ref: "Group", index: true },
    toGroupId: { type: Schema.Types.ObjectId, ref: "Group", index: true },
    transferredAt: { type: Date, required: true, default: Date.now, index: true },
    transferredBy: { type: Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, trim: true },
  },
  { timestamps: true }
);

export const StudentTransfer: Model<IStudentTransfer> =
  mongoose.models.StudentTransfer || mongoose.model<IStudentTransfer>("StudentTransfer", StudentTransferSchema);
export default StudentTransfer;

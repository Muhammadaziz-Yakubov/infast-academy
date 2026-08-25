import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  studentId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  periodStartDate: Date;
  periodEndDate: Date;
  paymentMethod: "CASH" | "CARD" | "CLICK" | "PAYME" | "OTHER";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true, default: Date.now },
    periodStartDate: { type: Date, required: true },
    periodEndDate: { type: Date, required: true },
    paymentMethod: { type: String, enum: ["CASH", "CARD", "CLICK", "PAYME", "OTHER"], default: "CASH" },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

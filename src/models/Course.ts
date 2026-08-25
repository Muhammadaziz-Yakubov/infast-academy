import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourse extends Document {
  name: string;
  price: number;
  durationMonths: number;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema<ICourse> = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true },
    durationMonths: { type: Number, required: true, default: 6 },
    description: { type: String },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

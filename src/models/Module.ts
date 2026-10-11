import mongoose, { Schema, Document, Model } from "mongoose";

export interface IModule extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  order: number;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema: Schema<IModule> = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, required: true, default: 1 },
    description: { type: String },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

ModuleSchema.index({ courseId: 1, order: 1 });

export const Module: Model<IModule> = mongoose.models.Module || mongoose.model<IModule>("Module", ModuleSchema);

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeacher extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema: Schema<ITeacher> = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export const Teacher: Model<ITeacher> = mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);

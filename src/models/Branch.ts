import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBranch extends Document {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  managerId?: mongoose.Types.ObjectId;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema: Schema<IBranch> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    managerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true }
);

export const Branch: Model<IBranch> =
  mongoose.models.Branch || mongoose.model<IBranch>("Branch", BranchSchema);
export default Branch;

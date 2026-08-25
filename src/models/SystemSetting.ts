import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISystemSetting extends Document {
  key: string;
  value: string;
  updatedAt: Date;
}

const SystemSettingSchema: Schema<ISystemSetting> = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

export const SystemSetting: Model<ISystemSetting> = mongoose.models.SystemSetting || mongoose.model<ISystemSetting>("SystemSetting", SystemSettingSchema);

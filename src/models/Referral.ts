import mongoose, { Schema, Document, Model } from 'mongoose';

export type RewardStatus = 'KUTILMOQDA' | 'TASDIQLANGAN' | 'MUKOFOT_BERILGAN' | 'BEKOR_QILINGAN';

export interface IReferral extends Document {
  referrerStudentId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  referredStudentId?: mongoose.Types.ObjectId;
  rewardType: string;
  rewardValue: number;
  rewardStatus: RewardStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerStudentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', index: true },
    referredStudentId: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    rewardType: { type: String, required: true, default: 'Chegirma' },
    rewardValue: { type: Number, required: true, default: 100000 },
    rewardStatus: {
      type: String,
      enum: ['KUTILMOQDA', 'TASDIQLANGAN', 'MUKOFOT_BERILGAN', 'BEKOR_QILINGAN'],
      default: 'KUTILMOQDA',
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Referral: Model<IReferral> =
  mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);

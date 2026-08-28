import mongoose, { Schema, Document, Model } from 'mongoose';

export type CampaignStatus = 'REJALASHTIRILGAN' | 'FAOL' | 'TO‘XTATILGAN' | 'YAKUNLANGAN' | 'ARXIV';
export type CampaignObjective = 'LEAD_YIG‘ISH' | 'SOTUV' | 'BRAND' | 'KURS_TARG‘IBOTI' | 'EVENT';

export interface IMarketingCampaign extends Document {
  name: string;
  description?: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  startDate: Date;
  endDate?: Date;
  budget: number;
  platform: string;
  courseId?: mongoose.Types.ObjectId;
  branch?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingCampaignSchema = new Schema<IMarketingCampaign>(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    objective: {
      type: String,
      enum: ['LEAD_YIG‘ISH', 'SOTUV', 'BRAND', 'KURS_TARG‘IBOTI', 'EVENT'],
      default: 'LEAD_YIG‘ISH',
    },
    status: {
      type: String,
      enum: ['REJALASHTIRILGAN', 'FAOL', 'TO‘XTATILGAN', 'YAKUNLANGAN', 'ARXIV'],
      default: 'FAOL',
      index: true,
    },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date },
    budget: { type: Number, required: true, default: 0 },
    platform: { type: String, required: true, default: 'Instagram' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    branch: { type: String },
  },
  { timestamps: true }
);

export const MarketingCampaign: Model<IMarketingCampaign> =
  mongoose.models.MarketingCampaign ||
  mongoose.model<IMarketingCampaign>('MarketingCampaign', MarketingCampaignSchema);

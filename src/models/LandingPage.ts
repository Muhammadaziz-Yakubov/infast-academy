import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILandingPage extends Document {
  name: string;
  slug: string;
  url: string;
  campaignId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  status: 'FAOL' | 'NOFAOL';
  visitorsCount: number;
  uniqueVisitorsCount: number;
  leadsCount: number;
  studentsCount: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const LandingPageSchema = new Schema<ILandingPage>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'MarketingCampaign', index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    status: { type: String, enum: ['FAOL', 'NOFAOL'], default: 'FAOL', index: true },
    visitorsCount: { type: Number, default: 0 },
    uniqueVisitorsCount: { type: Number, default: 0 },
    leadsCount: { type: Number, default: 0 },
    studentsCount: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LandingPage: Model<ILandingPage> =
  mongoose.models.LandingPage || mongoose.model<ILandingPage>('LandingPage', LandingPageSchema);

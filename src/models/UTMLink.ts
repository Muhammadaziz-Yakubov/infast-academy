import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUTMLink extends Document {
  name: string;
  utmSource: string;
  utmMedium: string;
  utmCampaignId?: mongoose.Types.ObjectId;
  utmContent?: string;
  utmTerm?: string;
  landingUrl: string;
  fullUrl: string;
  qrCodeUrl?: string;
  clicksCount: number;
  leadsCount: number;
  studentsCount: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const UTMLinkSchema = new Schema<IUTMLink>(
  {
    name: { type: String, required: true, index: true },
    utmSource: { type: String, required: true, index: true },
    utmMedium: { type: String, required: true },
    utmCampaignId: { type: Schema.Types.ObjectId, ref: 'MarketingCampaign', index: true },
    utmContent: { type: String },
    utmTerm: { type: String },
    landingUrl: { type: String, required: true },
    fullUrl: { type: String, required: true },
    qrCodeUrl: { type: String },
    clicksCount: { type: Number, default: 0 },
    leadsCount: { type: Number, default: 0 },
    studentsCount: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UTMLink: Model<IUTMLink> =
  mongoose.models.UTMLink || mongoose.model<IUTMLink>('UTMLink', UTMLinkSchema);

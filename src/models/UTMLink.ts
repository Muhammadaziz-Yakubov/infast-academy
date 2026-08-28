import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomFormField {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'number' | 'select' | 'checkbox' | 'textarea';
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface IUTMLink extends Document {
  name: string;
  slug?: string;
  pageTitle?: string;
  pageDescription?: string;
  utmSource: string;
  utmMedium: string;
  utmCampaignId?: mongoose.Types.ObjectId;
  utmContent?: string;
  utmTerm?: string;
  landingUrl: string;
  fullUrl: string;
  qrCodeUrl?: string;
  customFields?: ICustomFormField[];
  clicksCount: number;
  leadsCount: number;
  studentsCount: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomFormFieldSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'tel', 'number', 'select', 'checkbox', 'textarea'],
    default: 'text',
  },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
});

const UTMLinkSchema = new Schema<IUTMLink>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, index: true },
    pageTitle: { type: String },
    pageDescription: { type: String },
    utmSource: { type: String, required: true, index: true },
    utmMedium: { type: String, required: true },
    utmCampaignId: { type: Schema.Types.ObjectId, ref: 'MarketingCampaign', index: true },
    utmContent: { type: String },
    utmTerm: { type: String },
    landingUrl: { type: String, required: true },
    fullUrl: { type: String, required: true },
    qrCodeUrl: { type: String },
    customFields: [CustomFormFieldSchema],
    clicksCount: { type: Number, default: 0 },
    leadsCount: { type: Number, default: 0 },
    studentsCount: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UTMLink: Model<IUTMLink> =
  mongoose.models.UTMLink || mongoose.model<IUTMLink>('UTMLink', UTMLinkSchema);

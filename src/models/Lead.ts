import mongoose, { Schema, Document, Model } from 'mongoose';

export type LeadStatus = 'YANGI' | 'BOG‘LANILDI' | 'SINOV_DARSI' | 'TALABA_BO‘LDI' | 'RAD_ETILDI';

export interface ILead extends Document {
  fullName: string;
  phone: string;
  email?: string;
  courseId?: mongoose.Types.ObjectId;
  status: LeadStatus;
  utmSource?: string;
  utmMedium?: string;
  utmCampaignId?: mongoose.Types.ObjectId;
  utmContent?: string;
  utmTerm?: string;
  landingPageId?: mongoose.Types.ObjectId;
  referralStudentId?: mongoose.Types.ObjectId;
  convertedStudentId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    fullName: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    email: { type: String },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    status: {
      type: String,
      enum: ['YANGI', 'BOG‘LANILDI', 'SINOV_DARSI', 'TALABA_BO‘LDI', 'RAD_ETILDI'],
      default: 'YANGI',
      index: true,
    },
    utmSource: { type: String, index: true },
    utmMedium: { type: String },
    utmCampaignId: { type: Schema.Types.ObjectId, ref: 'MarketingCampaign', index: true },
    utmContent: { type: String },
    utmTerm: { type: String },
    landingPageId: { type: Schema.Types.ObjectId, ref: 'LandingPage', index: true },
    referralStudentId: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    convertedStudentId: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

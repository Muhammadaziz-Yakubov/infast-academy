import mongoose, { Schema, Document, Model } from 'mongoose';

export type ContentStatus = 'G‘OYA' | 'REJALASHTIRILGAN' | 'TAYYORLANMOQDA' | 'TAYYOR' | 'E’LON_QILINGAN';
export type ContentType = 'Reels' | 'Post' | 'Story' | 'Video' | 'Banner' | 'Maqola' | 'Live' | 'Boshqa';

export interface IMarketingContent extends Document {
  title: string;
  description?: string;
  platform: string;
  type: ContentType;
  status: ContentStatus;
  scheduledAt?: Date;
  campaignId?: mongoose.Types.ObjectId;
  responsibleUser?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingContentSchema = new Schema<IMarketingContent>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String },
    platform: { type: String, required: true, default: 'Instagram' },
    type: {
      type: String,
      enum: ['Reels', 'Post', 'Story', 'Video', 'Banner', 'Maqola', 'Live', 'Boshqa'],
      default: 'Post',
    },
    status: {
      type: String,
      enum: ['G‘OYA', 'REJALASHTIRILGAN', 'TAYYORLANMOQDA', 'TAYYOR', 'E’LON_QILINGAN'],
      default: 'G‘OYA',
      index: true,
    },
    scheduledAt: { type: Date },
    campaignId: { type: Schema.Types.ObjectId, ref: 'MarketingCampaign', index: true },
    responsibleUser: { type: String },
  },
  { timestamps: true }
);

export const MarketingContent: Model<IMarketingContent> =
  mongoose.models.MarketingContent ||
  mongoose.model<IMarketingContent>('MarketingContent', MarketingContentSchema);

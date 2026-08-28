import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMarketingChannel extends Document {
  name: string;
  description?: string;
  status: 'FAOL' | 'NOFAOL';
  createdAt: Date;
  updatedAt: Date;
}

const MarketingChannelSchema = new Schema<IMarketingChannel>(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    status: { type: String, enum: ['FAOL', 'NOFAOL'], default: 'FAOL' },
  },
  { timestamps: true }
);

export const MarketingChannel: Model<IMarketingChannel> =
  mongoose.models.MarketingChannel ||
  mongoose.model<IMarketingChannel>('MarketingChannel', MarketingChannelSchema);

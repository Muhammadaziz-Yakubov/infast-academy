import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMarketingExpense extends Document {
  campaignId?: mongoose.Types.ObjectId;
  platform: string;
  amount: number;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingExpenseSchema = new Schema<IMarketingExpense>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'MarketingCampaign', index: true },
    platform: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now, index: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const MarketingExpense: Model<IMarketingExpense> =
  mongoose.models.MarketingExpense ||
  mongoose.model<IMarketingExpense>('MarketingExpense', MarketingExpenseSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';

export type DiscountType = 'FOIZ' | 'QAT’IY_SUMMA';

export interface IMarketingPromotion extends Document {
  name: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate?: Date;
  usageLimit?: number;
  usageCount: number;
  courseIds?: mongoose.Types.ObjectId[];
  status: 'FAOL' | 'YAKUNLANGAN' | 'REJALASHTIRILGAN';
  createdAt: Date;
  updatedAt: Date;
}

const MarketingPromotionSchema = new Schema<IMarketingPromotion>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: { type: String },
    discountType: { type: String, enum: ['FOIZ', 'QAT’IY_SUMMA'], default: 'FOIZ' },
    discountValue: { type: Number, required: true },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    courseIds: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    status: { type: String, enum: ['FAOL', 'YAKUNLANGAN', 'REJALASHTIRILGAN'], default: 'FAOL', index: true },
  },
  { timestamps: true }
);

export const MarketingPromotion: Model<IMarketingPromotion> =
  mongoose.models.MarketingPromotion ||
  mongoose.model<IMarketingPromotion>('MarketingPromotion', MarketingPromotionSchema);

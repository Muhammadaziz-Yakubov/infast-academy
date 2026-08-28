import mongoose, { Schema, Document, Model } from 'mongoose';

export type AssetType = 'Video' | 'Rasm' | 'Banner' | 'Caption' | 'Creative' | 'Logo' | 'PDF' | 'Boshqa';

export interface IMarketingAsset extends Document {
  name: string;
  type: AssetType;
  url: string;
  thumbnailUrl?: string;
  tags?: string[];
  campaignId?: mongoose.Types.ObjectId;
  createdBy?: string;
  sizeBytes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingAssetSchema = new Schema<IMarketingAsset>(
  {
    name: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['Video', 'Rasm', 'Banner', 'Caption', 'Creative', 'Logo', 'PDF', 'Boshqa'],
      default: 'Rasm',
    },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    tags: [{ type: String }],
    campaignId: { type: Schema.Types.ObjectId, ref: 'MarketingCampaign', index: true },
    createdBy: { type: String },
    sizeBytes: { type: Number },
  },
  { timestamps: true }
);

export const MarketingAsset: Model<IMarketingAsset> =
  mongoose.models.MarketingAsset ||
  mongoose.model<IMarketingAsset>('MarketingAsset', MarketingAssetSchema);

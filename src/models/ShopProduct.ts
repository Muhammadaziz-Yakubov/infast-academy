import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShopProduct extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  priceXCoin: number;
  stock: number;
  category: "MERCH" | "TECH" | "ACCESSORY" | "SPECIAL";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShopProductSchema: Schema<IShopProduct> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    priceXCoin: { type: Number, required: true, min: 1 },
    stock: { type: Number, required: true, default: 10 },
    category: {
      type: String,
      enum: ["MERCH", "TECH", "ACCESSORY", "SPECIAL"],
      default: "MERCH",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ShopProduct: Model<IShopProduct> =
  mongoose.models.ShopProduct || mongoose.model<IShopProduct>("ShopProduct", ShopProductSchema);

export interface IShopOrder extends Document {
  studentId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  priceXCoin: number;
  status: "PENDING" | "FULFILLED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const ShopOrderSchema: Schema<IShopOrder> = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "ShopProduct", required: true },
    priceXCoin: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "FULFILLED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const ShopOrder: Model<IShopOrder> =
  mongoose.models.ShopOrder || mongoose.model<IShopOrder>("ShopOrder", ShopOrderSchema);

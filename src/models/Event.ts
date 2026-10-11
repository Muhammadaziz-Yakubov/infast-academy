import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEventRegistration {
  studentId: mongoose.Types.ObjectId;
  registeredAt: Date;
  status: "REGISTERED" | "ATTENDED" | "ABSENT";
  coinsProcessed: boolean; // whether +500 or -500 was added/deducted
  processedAt?: Date;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  date: Date;
  location: string;
  branchId?: mongoose.Types.ObjectId;
  maxParticipants?: number;
  coinReward: number; // default 500
  coinPenalty: number; // default 500
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  registrations: IEventRegistration[];
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    registeredAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["REGISTERED", "ATTENDED", "ABSENT"],
      default: "REGISTERED",
    },
    coinsProcessed: { type: Boolean, default: false },
    processedAt: { type: Date },
  },
  { _id: true }
);

const EventSchema: Schema<IEvent> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    maxParticipants: { type: Number, default: 100 },
    coinReward: { type: Number, default: 500 },
    coinPenalty: { type: Number, default: 500 },
    status: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
    registrations: [EventRegistrationSchema],
  },
  { timestamps: true }
);

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

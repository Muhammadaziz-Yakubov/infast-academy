import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudentProject {
  title: string;
  description: string;
  githubRepo?: string;
  liveDemo?: string;
  technologies: string[];
}

export interface IStudent extends Document {
  studentCode?: string;
  firstName: string;
  lastName: string;
  phone: string;
  parentPhone?: string;
  birthDate?: Date;
  courseId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  joinedDate: Date;
  monthlyFee?: number;
  paymentDueDay: number;
  status: "ACTIVE" | "PAUSED" | "LEFT" | "COMPLETED";

  // Portfolio & Resume fields
  slug?: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  telegramUsername?: string;
  projects?: IStudentProject[];
  isPublicPortfolio?: boolean;

  // Marketing & Lead Attribution fields (Optional)
  leadId?: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;

  createdAt: Date;
  updatedAt: Date;
}

const StudentProjectSchema = new Schema<IStudentProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    githubRepo: { type: String },
    liveDemo: { type: String },
    technologies: [{ type: String }],
  },
  { _id: true }
);

const StudentSchema: Schema<IStudent> = new Schema(
  {
    studentCode: { type: String, unique: true, sparse: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    parentPhone: { type: String },
    birthDate: { type: Date },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    joinedDate: { type: Date, required: true, default: Date.now },
    monthlyFee: { type: Number },
    paymentDueDay: { type: Number, required: true, default: 5 },
    status: { type: String, enum: ["ACTIVE", "PAUSED", "LEFT", "COMPLETED"], default: "ACTIVE", index: true },

    // Portfolio fields
    slug: { type: String, unique: true, sparse: true, index: true },
    avatarUrl: { type: String },
    bio: { type: String },
    skills: [{ type: String }],
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    telegramUsername: { type: String },
    projects: [StudentProjectSchema],
    isPublicPortfolio: { type: Boolean, default: true },

    // Marketing Attribution
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "MarketingCampaign", index: true },
    utmSource: { type: String, index: true },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    utmContent: { type: String },
    utmTerm: { type: String },
  },
  { timestamps: true }
);

export const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

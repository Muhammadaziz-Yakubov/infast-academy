import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGraduate extends Document {
  graduateId: string; // e.g. IF-GRAD-2026-001
  certificateId: string; // e.g. IF-GRAD-2026-001
  awardId: string; // e.g. IF-AWARD-2026-001
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName: string;
  birthDate?: string;
  phone?: string;
  photoUrl?: string;
  track: string; // "Full-Stack Development"
  courseName: string; // "Full-Stack Development"
  duration: string; // "15 oy"
  startDate: string; // "01.07.2025"
  endDate: string; // "02.10.2026"
  mentor: string; // "M. Yakubov"
  director: string; // "N. Yakubova"
  status: 'active' | 'revoked';
  nomination: string; // e.g. "Best Full-Stack Developer"
  issuedDate: string; // "02.10.2026"
  notes?: string;
  revokedReason?: string;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GraduateSchema = new Schema<IGraduate>(
  {
    graduateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    awardId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
      default: '',
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    birthDate: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    photoUrl: {
      type: String,
      default: '',
    },
    track: {
      type: String,
      default: 'Full-Stack Development',
      trim: true,
    },
    courseName: {
      type: String,
      default: 'Full-Stack Development',
      trim: true,
    },
    duration: {
      type: String,
      default: '15 oy',
      trim: true,
    },
    startDate: {
      type: String,
      default: '01.07.2025',
      trim: true,
    },
    endDate: {
      type: String,
      default: '02.10.2026',
      trim: true,
    },
    mentor: {
      type: String,
      default: 'M. Yakubov',
      trim: true,
    },
    director: {
      type: String,
      default: 'N. Yakubova',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
      index: true,
    },
    nomination: {
      type: String,
      default: 'Best Full-Stack Developer',
      trim: true,
    },
    issuedDate: {
      type: String,
      default: '02.10.2026',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    revokedReason: {
      type: String,
      default: '',
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to format full name if not explicitly set
GraduateSchema.pre<IGraduate>('save', function (next) {
  if (!this.fullName || this.fullName.trim() === '') {
    const parts = [this.lastName, this.firstName, this.middleName].filter(Boolean);
    this.fullName = parts.join(' ').trim();
  }
  next();
});

export const Graduate: Model<IGraduate> =
  mongoose.models.Graduate || mongoose.model<IGraduate>('Graduate', GraduateSchema);
export default Graduate;

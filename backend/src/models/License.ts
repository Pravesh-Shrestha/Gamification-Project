import mongoose, { Schema, Document } from 'mongoose';

export interface ILicenseDoc extends Document {
  schoolId: mongoose.Types.ObjectId;
  maxStaff: number;
  maxStudents: number;
  expiresAt?: Date;
}

const licenseSchema = new Schema<ILicenseDoc>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    maxStaff: { type: Number, default: 50 },
    maxStudents: { type: Number, default: 500 },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

const License = mongoose.model<ILicenseDoc>('License', licenseSchema);

export default License;

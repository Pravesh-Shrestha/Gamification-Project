import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDoc extends Document {
  email: string;
  name: string;
  role: 'superadmin' | 'school_admin' | 'staff' | 'student';
  schoolId?: mongoose.Types.ObjectId;
  externalId?: string;
  password?: string;
}

const userSchema = new Schema<IUserDoc>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ['superadmin', 'school_admin', 'staff', 'student'] },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School' },
    externalId: { type: String, index: true },
    password: { type: String, select: false },
  },
  { timestamps: true }
);

const User = mongoose.model<IUserDoc>('User', userSchema);

export default User;

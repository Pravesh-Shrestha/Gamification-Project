import mongoose, { Schema, Document } from 'mongoose';

export interface IEngagementEventDoc extends Document {
  studentId?: mongoose.Types.ObjectId;
  schoolId?: mongoose.Types.ObjectId;
  type: string;
  payload?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const engagementEventSchema = new Schema<IEngagementEventDoc>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School' },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const EngagementEvent = mongoose.model<IEngagementEventDoc>('EngagementEvent', engagementEventSchema);

export default EngagementEvent;

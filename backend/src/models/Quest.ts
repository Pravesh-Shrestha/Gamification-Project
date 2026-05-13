import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestDoc extends Document {
  title: string;
  description?: string;
  schoolId: mongoose.Types.ObjectId;
  authorId?: mongoose.Types.ObjectId;
  pointsReward?: number;
  metadata?: Record<string, any>;
}

const questSchema = new Schema<IQuestDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    pointsReward: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Quest = mongoose.model<IQuestDoc>('Quest', questSchema);

export default Quest;

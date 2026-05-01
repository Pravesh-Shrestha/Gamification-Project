import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProgressDoc extends Document {
  studentId: Types.ObjectId;
  taskId: Types.ObjectId;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  pointsEarned: number;
  attempts: number;
  startedAt: Date;
  completedAt?: Date;
}

const progressSchema = new Schema<IProgressDoc>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required'],
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    pointsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Progress = mongoose.model<IProgressDoc>('Progress', progressSchema);

export default Progress;

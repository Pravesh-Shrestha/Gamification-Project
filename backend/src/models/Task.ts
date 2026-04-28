import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskDoc extends Document {
  title: string;
  description: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pointsReward: number;
  module: string;
  dueDate: Date;
}

const taskSchema = new Schema<ITaskDoc>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Art', 'Computer Science'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: ['easy', 'medium', 'hard'],
    },
    pointsReward: {
      type: Number,
      required: [true, 'Points reward is required'],
      min: 1,
      max: 1000,
    },
    module: {
      type: String,
      required: [true, 'Module name is required'],
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model<ITaskDoc>('Task', taskSchema);

export default Task;

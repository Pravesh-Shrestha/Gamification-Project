import { Types } from 'mongoose';

export interface IStudent {
  _id?: Types.ObjectId | string;
  name: string;
  email: string;
  password: string;
  school: string;
  grade: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITask {
  _id?: Types.ObjectId | string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pointsReward: number;
  module: string;
  dueDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProgress {
  _id?: Types.ObjectId | string;
  studentId: Types.ObjectId | string;
  taskId: Types.ObjectId | string;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  pointsEarned: number;
  attempts: number;
  startedAt: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

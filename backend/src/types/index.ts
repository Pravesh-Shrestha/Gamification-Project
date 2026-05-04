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

export interface ISchool {
  _id?: Types.ObjectId | string;
  name: string;
  domain?: string;
  license?: Types.ObjectId | string;
  adminIds?: Array<Types.ObjectId | string>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILicense {
  _id?: Types.ObjectId | string;
  schoolId: Types.ObjectId | string;
  maxStaff: number;
  maxStudents: number;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser {
  _id?: Types.ObjectId | string;
  email: string;
  name: string;
  role: 'superadmin' | 'school_admin' | 'staff' | 'student';
  schoolId?: Types.ObjectId | string;
  externalId?: string; // admin-created ID for students/staff
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISection {
  _id?: Types.ObjectId | string;
  name: string;
  schoolId: Types.ObjectId | string;
  staffIds: Array<Types.ObjectId | string>;
  studentIds: Array<Types.ObjectId | string>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuest {
  _id?: Types.ObjectId | string;
  title: string;
  description?: string;
  schoolId: Types.ObjectId | string;
  authorId?: Types.ObjectId | string;
  pointsReward?: number;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEngagementEvent {
  _id?: Types.ObjectId | string;
  studentId?: Types.ObjectId | string;
  schoolId?: Types.ObjectId | string;
  type: string;
  payload?: Record<string, any>;
  createdAt?: Date;
}

import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentDoc extends Document {
  name: string;
  email: string;
  password: string;
  school: string;
  grade: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
}

const studentSchema = new Schema<IStudentDoc>(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    school: {
      type: String,
      required: [true, 'School name is required'],
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model<IStudentDoc>('Student', studentSchema);

export default Student;

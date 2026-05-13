import Student from '../models/Student';
import { IStudent } from '../types';
import { NotFoundError } from '../errors/AppError';

export class StudentRepository {
  async create(studentData: Partial<IStudent>): Promise<IStudent> {
    const student = await Student.create(studentData);
    return student.toObject();
  }

  async findById(id: string): Promise<IStudent | null> {
    const student = await Student.findById(id).lean();
    return student;
  }

  async findByEmail(email: string): Promise<IStudent | null> {
    const student = await Student.findOne({ email }).lean();
    return student;
  }

  // Returns student including the password field (select '+password')
  async findByEmailWithPassword(email: string): Promise<IStudent | null> {
    const student = await Student.findOne({ email }).select('+password').lean();
    return student;
  }

  async findAll(): Promise<IStudent[]> {
    const students = await Student.find().lean();
    return students;
  }

  async update(id: string, updateData: Partial<IStudent>): Promise<IStudent> {
    const student = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!student) {
      throw new NotFoundError('Student');
    }

    return student;
  }

  async delete(id: string): Promise<void> {
    const result = await Student.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Student');
    }
  }

  async incrementPoints(id: string, points: number): Promise<IStudent> {
    const student = await Student.findByIdAndUpdate(
      id,
      { $inc: { totalPoints: points } },
      { new: true, runValidators: true }
    ).lean();

    if (!student) {
      throw new NotFoundError('Student');
    }

    return student;
  }

  async updateStreak(id: string, streak: number, longestStreak: number): Promise<IStudent> {
    const student = await Student.findByIdAndUpdate(
      id,
      {
        currentStreak: streak,
        longestStreak: Math.max(streak, longestStreak),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!student) {
      throw new NotFoundError('Student');
    }

    return student;
  }
}

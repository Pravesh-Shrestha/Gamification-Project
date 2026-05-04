import User from '../models/User';
import mongoose from 'mongoose';
import { IUser } from '../types';
import { NotFoundError } from '../errors/AppError';

export class UserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    const doc = await User.create(data);
    return doc.toObject();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).lean();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).lean();
  }

  // Returns user including the password field (select '+password')
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password').lean();
  }

  async findByExternalId(externalId: string): Promise<IUser | null> {
    return User.findOne({ externalId }).lean();
  }

  async findAllBySchool(schoolId: string): Promise<IUser[]> {
    // validate schoolId before querying to avoid Cast to ObjectId errors
    if (!schoolId || typeof schoolId !== 'string' || !mongoose.Types.ObjectId.isValid(String(schoolId))) {
      return [];
    }
    return User.find({ schoolId }).lean();
  }

  async findAll(): Promise<IUser[]> {
    return User.find().lean();
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async delete(id: string): Promise<void> {
    const res = await User.findByIdAndDelete(id);
    if (!res) throw new NotFoundError('User');
  }
}

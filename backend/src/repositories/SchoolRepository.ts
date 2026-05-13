import School from '../models/School';
import { ISchool } from '../types';
import { NotFoundError } from '../errors/AppError';

export class SchoolRepository {
  async create(data: Partial<ISchool>): Promise<ISchool> {
    const doc = await School.create(data);
    return doc.toObject();
  }

  async findById(id: string): Promise<ISchool | null> {
    return School.findById(id).lean();
  }

  async findAll(): Promise<ISchool[]> {
    return School.find().lean();
  }

  async update(id: string, updateData: Partial<ISchool>): Promise<ISchool> {
    const school = await School.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    if (!school) throw new NotFoundError('School');
    return school;
  }

  async delete(id: string): Promise<void> {
    const res = await School.findByIdAndDelete(id);
    if (!res) throw new NotFoundError('School');
  }
}

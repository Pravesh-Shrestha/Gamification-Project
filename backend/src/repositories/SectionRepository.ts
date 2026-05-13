import Section from '../models/Section';
import { ISection } from '../types';
import { NotFoundError } from '../errors/AppError';

export class SectionRepository {
  async create(data: Partial<ISection>): Promise<ISection> {
    const doc = await Section.create(data);
    return doc.toObject();
  }

  async findById(id: string): Promise<ISection | null> {
    return Section.findById(id).lean();
  }

  async findBySchool(schoolId: string): Promise<ISection[]> {
    return Section.find({ schoolId }).lean();
  }

  async update(id: string, updateData: Partial<ISection>): Promise<ISection> {
    const s = await Section.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    if (!s) throw new NotFoundError('Section');
    return s;
  }

  async delete(id: string): Promise<void> {
    const res = await Section.findByIdAndDelete(id);
    if (!res) throw new NotFoundError('Section');
  }
}

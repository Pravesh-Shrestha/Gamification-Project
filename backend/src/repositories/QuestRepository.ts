import Quest from '../models/Quest';
import { IQuest } from '../types';
import { NotFoundError } from '../errors/AppError';

export class QuestRepository {
  async create(data: Partial<IQuest>): Promise<IQuest> {
    const doc = await Quest.create(data);
    return doc.toObject();
  }

  async findById(id: string): Promise<IQuest | null> {
    return Quest.findById(id).lean();
  }

  async findBySchool(schoolId: string): Promise<IQuest[]> {
    return Quest.find({ schoolId }).lean();
  }

  async update(id: string, updateData: Partial<IQuest>): Promise<IQuest> {
    const q = await Quest.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    if (!q) throw new NotFoundError('Quest');
    return q;
  }

  async delete(id: string): Promise<void> {
    const res = await Quest.findByIdAndDelete(id);
    if (!res) throw new NotFoundError('Quest');
  }
}

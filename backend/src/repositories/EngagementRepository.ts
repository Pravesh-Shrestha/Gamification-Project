import EngagementEvent from '../models/EngagementEvent';
import { IEngagementEvent } from '../types';

export class EngagementRepository {
  async create(data: Partial<IEngagementEvent>): Promise<IEngagementEvent> {
    const doc = await EngagementEvent.create(data);
    return doc.toObject();
  }

  async findRecentBySchool(schoolId: string, limit = 100): Promise<IEngagementEvent[]> {
    return EngagementEvent.find({ schoolId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async findRecentByStudent(studentId: string, limit = 100): Promise<IEngagementEvent[]> {
    return EngagementEvent.find({ studentId }).sort({ createdAt: -1 }).limit(limit).lean();
  }
}

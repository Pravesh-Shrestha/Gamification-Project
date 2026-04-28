import Progress from '../models/Progress';
import { IProgress } from '../types';
import { NotFoundError } from '../errors/AppError';

export class ProgressRepository {
  async create(progressData: Partial<IProgress>): Promise<IProgress> {
    const progress = await Progress.create(progressData);
    return progress.toObject();
  }

  async findById(id: string): Promise<IProgress | null> {
    const progress = await Progress.findById(id).lean().populate('studentId taskId');
    return progress;
  }

  async findByStudentId(studentId: string): Promise<IProgress[]> {
    const progress = await Progress.find({ studentId }).lean().populate('taskId');
    return progress;
  }

  async findByTaskId(taskId: string): Promise<IProgress[]> {
    const progress = await Progress.find({ taskId }).lean().populate('studentId');
    return progress;
  }

  async findByStudentAndTask(studentId: string, taskId: string): Promise<IProgress | null> {
    const progress = await Progress.findOne({ studentId, taskId }).lean();
    return progress;
  }

  async findAll(): Promise<IProgress[]> {
    const progress = await Progress.find().lean().populate('studentId taskId');
    return progress;
  }

  async update(id: string, updateData: Partial<IProgress>): Promise<IProgress> {
    const progress = await Progress.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!progress) {
      throw new NotFoundError('Progress');
    }

    return progress;
  }

  async delete(id: string): Promise<void> {
    const result = await Progress.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Progress');
    }
  }

  async findCompletedByStudent(studentId: string): Promise<IProgress[]> {
    const progress = await Progress.find({
      studentId,
      status: 'completed',
    }).lean();
    return progress;
  }
}

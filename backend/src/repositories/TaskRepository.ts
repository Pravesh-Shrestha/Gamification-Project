import Task from '../models/Task';
import { ITask } from '../types';
import { NotFoundError } from '../errors/AppError';

export class TaskRepository {
  async create(taskData: Partial<ITask>): Promise<ITask> {
    const task = await Task.create(taskData);
    return task.toObject();
  }

  async findById(id: string): Promise<ITask | null> {
    const task = await Task.findById(id).lean();
    return task;
  }

  async findByModule(module: string): Promise<ITask[]> {
    const tasks = await Task.find({ module }).lean();
    return tasks;
  }

  async findBySubject(subject: string): Promise<ITask[]> {
    const tasks = await Task.find({ subject }).lean();
    return tasks;
  }

  async findAll(): Promise<ITask[]> {
    const tasks = await Task.find().lean();
    return tasks;
  }

  async findByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<ITask[]> {
    const tasks = await Task.find({ difficulty }).lean();
    return tasks;
  }

  async update(id: string, updateData: Partial<ITask>): Promise<ITask> {
    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!task) {
      throw new NotFoundError('Task');
    }

    return task;
  }

  async delete(id: string): Promise<void> {
    const result = await Task.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Task');
    }
  }
}

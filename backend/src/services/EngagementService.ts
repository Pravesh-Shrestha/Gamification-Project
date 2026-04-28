import { StudentRepository } from '../repositories/StudentRepository.js';
import { ProgressRepository } from '../repositories/ProgressRepository.js';
import { TaskRepository } from '../repositories/TaskRepository.js';

export class EngagementService {
  private studentRepo = new StudentRepository();
  private progressRepo = new ProgressRepository();
  private taskRepo = new TaskRepository();

  async completeTask(studentId: string, taskId: string): Promise<void> {
    // Get task to know points
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new Error('Task not found');

    // Update progress
    const progress = await this.progressRepo.findByStudentAndTask(studentId, taskId);
    if (!progress) throw new Error('Progress record not found');

    await this.progressRepo.update(progress._id as string, {
      status: 'completed',
      completionPercentage: 100,
      pointsEarned: task.pointsReward,
      completedAt: new Date(),
    });

    // Award points to student
    await this.studentRepo.incrementPoints(studentId, task.pointsReward);
  }

  async updateStreak(studentId: string): Promise<void> {
    const student = await this.studentRepo.findById(studentId);
    if (!student) throw new Error('Student not found');

    const newStreak = student.currentStreak + 1;
    const newLongestStreak = Math.max(newStreak, student.longestStreak);

    await this.studentRepo.updateStreak(studentId, newStreak, newLongestStreak);
  }

  async calculateLevel(totalPoints: number): Promise<number> {
    // Simple level calculation: 100 points per level
    return Math.floor(totalPoints / 100) + 1;
  }

  async getStudentStats(studentId: string): Promise<any> {
    const student = await this.studentRepo.findById(studentId);
    if (!student) throw new Error('Student not found');

    const completedTasks = await this.progressRepo.findCompletedByStudent(studentId);
    const level = await this.calculateLevel(student.totalPoints);

    return {
      name: student.name,
      totalPoints: student.totalPoints,
      currentStreak: student.currentStreak,
      longestStreak: student.longestStreak,
      level,
      tasksCompleted: completedTasks.length,
    };
  }
}

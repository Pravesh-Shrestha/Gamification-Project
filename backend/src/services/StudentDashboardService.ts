import { NotFoundError } from '../errors/AppError';
import { ProgressRepository } from '../repositories/ProgressRepository';
import { StudentRepository } from '../repositories/StudentRepository';
import { IProgress, IStudent } from '../types';

export interface ProgressStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  totalPointsEarned: number;
  averageCompletion: number;
}

export interface StudentDashboardData {
  profile: IStudent;
  progress: IProgress[];
  stats: ProgressStats;
  summary: {
    levelProgressPercentage: number;
    pointsToNextLevel: number;
  };
}

export class StudentDashboardService {
  private studentRepository = new StudentRepository();
  private progressRepository = new ProgressRepository();

  private calculateProgressStats(progress: IProgress[]): ProgressStats {
    return {
      total: progress.length,
      completed: progress.filter((entry) => entry.status === 'completed').length,
      inProgress: progress.filter((entry) => entry.status === 'in_progress').length,
      notStarted: progress.filter((entry) => entry.status === 'not_started').length,
      totalPointsEarned: progress.reduce((sum, entry) => sum + (entry.pointsEarned || 0), 0),
      averageCompletion:
        progress.length > 0
          ? Math.round(progress.reduce((sum, entry) => sum + (entry.completionPercentage || 0), 0) / progress.length)
          : 0,
    };
  }

  getProgressStats(progress: IProgress[]): ProgressStats {
    return this.calculateProgressStats(progress);
  }

  async getDashboard(studentId: string): Promise<StudentDashboardData> {
    const [profile, progress] = await Promise.all([
      this.studentRepository.findById(studentId),
      this.progressRepository.findByStudentId(studentId),
    ]);

    if (!profile) {
      throw new NotFoundError('Student');
    }

    const pointsIntoCurrentLevel = profile.totalPoints % 100;

    return {
      profile,
      progress,
      stats: this.calculateProgressStats(progress),
      summary: {
        levelProgressPercentage: pointsIntoCurrentLevel,
        pointsToNextLevel: pointsIntoCurrentLevel === 0 ? 100 : 100 - pointsIntoCurrentLevel,
      },
    };
  }
}

export const studentDashboardService = new StudentDashboardService();
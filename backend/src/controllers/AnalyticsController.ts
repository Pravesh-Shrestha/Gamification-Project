import { Request, Response, NextFunction } from 'express';
import Student from '../models/Student';
import Progress from '../models/Progress';
import EngagementEvent from '../models/EngagementEvent';
import Task from '../models/Task';
import School from '../models/School';
import { AppError } from '../errors/AppError';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    role: string;
    name: string;
    schoolId?: string;
  };
}

export class AnalyticsController {
  /**
   * Get progress trends for a student
   */
  static async getStudentProgressTrends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const { days = 30 } = req.query;

      // Verify student exists
      const student = await Student.findById(studentId).select('name schoolId');
      if (!student) {
        return next(new AppError(404, 'Student not found'));
      }

      // Get progress data for the last N days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (parseInt(days as string) || 30));

      const progressData = await Progress.find({
        studentId,
        createdAt: { $gte: startDate },
      }).sort({ createdAt: 1 });

      // Group by date and aggregate points earned
      const trendsByDate: { [key: string]: { date: string; pointsEarned: number; tasksCompleted: number } } = {};

      for (const progress of progressData) {
        const dateKey = progress.createdAt!.toISOString().split('T')[0];
        if (!trendsByDate[dateKey]) {
          trendsByDate[dateKey] = { date: dateKey, pointsEarned: 0, tasksCompleted: 0 };
        }
        trendsByDate[dateKey].pointsEarned += progress.pointsEarned;
        if (progress.status === 'completed') {
          trendsByDate[dateKey].tasksCompleted += 1;
        }
      }

      const trends = Object.values(trendsByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      res.json({
        success: true,
        data: {
          studentId,
          studentName: student.name,
          timeRange: `Last ${days} days`,
          trends,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get task completion statistics
   */
  static async getTaskCompletionStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.query;
      let query: any = {};

      // If schoolId provided, filter by that school
      if (schoolId) {
        query.schoolId = schoolId;
      }

      // Get all tasks and their completion stats
      const tasks = await Task.find();
      const stats = [];

      for (const task of tasks) {
        const progressRecords = await Progress.find({ taskId: task._id });
        const completed = progressRecords.filter((p: { status: string }) => p.status === 'completed').length;
        const inProgress = progressRecords.filter((p: { status: string }) => p.status === 'in_progress').length;
        const notStarted = progressRecords.filter((p: { status: string }) => p.status === 'not_started').length;
        const total = progressRecords.length;

        stats.push({
          taskId: task._id,
          title: task.title,
          difficulty: task.difficulty,
          pointsReward: task.pointsReward,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          completed,
          inProgress,
          notStarted,
          total,
        });
      }

      // Sort by completion rate descending
      stats.sort((a, b) => b.completionRate - a.completionRate);

      res.json({
        success: true,
        data: {
          totalTasks: stats.length,
          averageCompletionRate: Math.round(stats.reduce((sum, s) => sum + s.completionRate, 0) / stats.length),
          tasks: stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top performing students
   */
  static async getTopPerformers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { limit = 10, schoolId } = req.query;
      let query: any = {};

      if (schoolId) {
        const school = await School.findById(schoolId).select('name');
        if (!school) {
          return next(new AppError(404, 'School not found'));
        }
        query.school = school.name;
      }

      const topStudents = await Student.find(query)
        .sort({ totalPoints: -1 })
        .limit(parseInt(limit as string) || 10)
        .select('name grade totalPoints level currentStreak longestStreak');

      res.json({
        success: true,
        data: {
          topPerformers: topStudents,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get engagement heatmap data (activity by day of week)
   */
  static async getEngagementHeatmap(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { studentId, days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (parseInt(days as string) || 30));

      let query: any = { timestamp: { $gte: startDate } };
      if (studentId) {
        query.studentId = studentId;
      }

      const events = await EngagementEvent.find(query);

      // Create heatmap by day of week and hour
      const heatmapData: { [key: string]: number } = {};
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (const event of events) {
        const eventTime = event.createdAt || new Date();
        const day = dayNames[eventTime.getDay()];
        const hour = eventTime.getHours();
        const key = `${day} ${hour}:00`;
        heatmapData[key] = (heatmapData[key] || 0) + 1;
      }

      // Convert to array format
      const heatmap = Object.entries(heatmapData).map(([timeSlot, count]) => ({
        timeSlot,
        activity: count,
      }));

      res.json({
        success: true,
        data: {
          timeRange: `Last ${days} days`,
          heatmap: heatmap.sort((a, b) => b.activity - a.activity).slice(0, 20), // Top 20 time slots
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get overall dashboard statistics
   */
  static async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.query;
      let query: any = {};

      if (schoolId) {
        query.schoolId = schoolId;
      }

      // Total students
      const totalStudents = await Student.countDocuments(query);

      // Average points
      const studentStats = await Student.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            avgPoints: { $avg: '$totalPoints' },
            avgLevel: { $avg: '$level' },
            maxPoints: { $max: '$totalPoints' },
            minPoints: { $min: '$totalPoints' },
          },
        },
      ]);

      // Task statistics
      const totalTasks = await Task.countDocuments();
      const totalProgress = await Progress.countDocuments();
      const completedTasks = await Progress.countDocuments({ status: 'completed' });
      const completionRate = totalProgress > 0 ? Math.round((completedTasks / totalProgress) * 100) : 0;

      res.json({
        success: true,
        data: {
          totalStudents,
          averagePoints: studentStats[0]?.avgPoints || 0,
          averageLevel: studentStats[0]?.avgLevel || 0,
          totalTasks,
          totalProgress,
          completedTasks,
          completionRate,
          overallEngagement: `${completionRate}%`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student distribution by grade
   */
  static async getStudentDistribution(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.query;
      let query: any = {};

      if (schoolId) {
        query.schoolId = schoolId;
      }

      const distribution = await Student.aggregate([
        { $match: query },
        { $group: { _id: '$grade', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      const formattedDistribution = distribution.map((item: { _id: string; count: number }) => ({
        grade: `Grade ${item._id}`,
        students: item.count,
      }));

      res.json({
        success: true,
        data: {
          distribution: formattedDistribution,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

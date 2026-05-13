import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: ReturnType<typeof Router> = Router();

// All analytics routes require authentication
router.use(authMiddleware);

/**
 * Student Progress Trends
 * GET /api/analytics/students/:studentId/progress-trends?days=30
 */
router.get('/students/:studentId/progress-trends', AnalyticsController.getStudentProgressTrends);

/**
 * Task Completion Statistics
 * GET /api/analytics/tasks/completion-stats?schoolId=...
 */
router.get('/tasks/completion-stats', AnalyticsController.getTaskCompletionStats);

/**
 * Top Performing Students
 * GET /api/analytics/students/top-performers?limit=10&schoolId=...
 */
router.get('/students/top-performers', AnalyticsController.getTopPerformers);

/**
 * Engagement Heatmap
 * GET /api/analytics/engagement/heatmap?studentId=...&days=30
 */
router.get('/engagement/heatmap', AnalyticsController.getEngagementHeatmap);

/**
 * Dashboard Statistics
 * GET /api/analytics/dashboard/stats?schoolId=...
 */
router.get('/dashboard/stats', AnalyticsController.getDashboardStats);

/**
 * Student Distribution by Grade
 * GET /api/analytics/students/distribution?schoolId=...
 */
router.get('/distribution', AnalyticsController.getStudentDistribution);

export const analyticsRoutes: ReturnType<typeof Router> = router;

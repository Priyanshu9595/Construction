import express from 'express';
import {
  getCompanyActivity,
  getCompanyAlerts,
  getCompanyFinancialOverview,
  getCompanyProjectPerformance,
  getCompanyRecentProjects,
  getCompanySummary,
  getProjectApprovals,
  getProjectBudget,
  getProjectIssues,
  getProjectMilestones,
  getProjectProgress,
  getProjectSummary,
  getProjectTasks,
  getSiteDashboard,
} from '../controllers/dashboardController.js';
import {
  protect,
  requireCompanyAccess,
  requireProjectAccess,
  requireRole,
  requireSiteAccess,
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/company/dashboard/summary', requireRole('company_owner'), requireCompanyAccess, getCompanySummary);
router.get('/company/dashboard/project-performance', requireRole('company_owner'), requireCompanyAccess, getCompanyProjectPerformance);
router.get('/company/dashboard/recent-projects', requireRole('company_owner'), requireCompanyAccess, getCompanyRecentProjects);
router.get('/company/dashboard/alerts', requireRole('company_owner'), requireCompanyAccess, getCompanyAlerts);
router.get('/company/dashboard/financial-overview', requireRole('company_owner'), requireCompanyAccess, getCompanyFinancialOverview);
router.get('/company/dashboard/activity', requireRole('company_owner'), requireCompanyAccess, getCompanyActivity);

router.get('/projects/:projectId/dashboard/summary', requireRole('company_owner', 'project_owner'), requireProjectAccess, getProjectSummary);
router.get('/projects/:projectId/dashboard/progress', requireRole('company_owner', 'project_owner'), requireProjectAccess, getProjectProgress);
router.get('/projects/:projectId/dashboard/budget', requireRole('company_owner', 'project_owner'), requireProjectAccess, getProjectBudget);
router.get('/projects/:projectId/dashboard/tasks', requireRole('company_owner', 'project_owner'), requireProjectAccess, getProjectTasks);
router.get('/projects/:projectId/dashboard/milestones', requireRole('company_owner', 'project_owner'), requireProjectAccess, getProjectMilestones);
router.get('/projects/:projectId/dashboard/approvals', requireRole('company_owner', 'project_owner'), requireProjectAccess, getProjectApprovals);
router.get('/projects/:projectId/dashboard/issues', requireRole('company_owner', 'project_owner'), requireProjectAccess, getProjectIssues);

router.get('/projects/:projectId/sites/:siteId/dashboard', requireRole('company_owner', 'project_owner'), requireProjectAccess, requireSiteAccess, getSiteDashboard);

export default router;

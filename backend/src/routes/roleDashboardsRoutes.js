import express from 'express';
import { getClientDashboard, getFinanceDashboard, getPurchaseDashboard, getQualityDashboard, getSafetyDashboard } from '../controllers/roleDashboardsController.js';
import { protect, requireCompanyAccess, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/purchase/dashboard', requireRole('project_owner'), requireCompanyAccess, getPurchaseDashboard);
router.get('/finance/dashboard', requireRole('project_owner'), requireCompanyAccess, getFinanceDashboard);
router.get('/quality/dashboard', requireRole('project_owner'), requireCompanyAccess, getQualityDashboard);
router.get('/safety/dashboard', requireRole('project_owner'), requireCompanyAccess, getSafetyDashboard);
router.get('/client/dashboard', requireRole('project_owner'), requireCompanyAccess, getClientDashboard);

export default router;

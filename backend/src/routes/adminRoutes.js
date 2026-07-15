import express from 'express';
import { createCompany, getCompanies, getDashboard, getPlans, createPlan, updateCompany, deleteCompany, getPlatformExpenses, createPlatformExpense, deletePlatformExpense } from '../controllers/adminController.js';
import { protect, superOwnerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply middleware to all admin routes
router.use(protect, superOwnerOnly);

router.route('/dashboard').get(getDashboard);
router.route('/companies').get(getCompanies).post(createCompany);
router.route('/companies/:id').patch(updateCompany).delete(deleteCompany);
router.route('/plans').get(getPlans).post(createPlan);
router.route('/expenses').get(getPlatformExpenses).post(createPlatformExpense);
router.route('/expenses/:id').delete(deletePlatformExpense);

export default router;

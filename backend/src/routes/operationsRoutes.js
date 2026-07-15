import express from 'express';
import {
  createLabourAllocation,
  createOvertime,
  createStockIssue,
  createStockReceipt,
  createSupervisorAttendance,
  getContractorDashboard,
  getStoreDashboard,
  getStoreInventory,
  getSupervisorAllocations,
  getSupervisorAttendance,
  getSupervisorSummary,
  getSupervisorTasks,
  getSupervisorTrades,
  getWorkerDashboard,
  getWorkerAttendanceHistory,
  updateWorkerTaskStatus,
  workerCheckIn,
  workerCheckOut,
} from '../controllers/operationsController.js';
import { protect, requireCompanyAccess, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/worker/dashboard', requireRole('worker'), getWorkerDashboard);
router.get('/worker/attendance', requireRole('worker'), getWorkerAttendanceHistory);
router.patch('/worker/tasks/:taskId/status', requireRole('worker'), updateWorkerTaskStatus);
router.post('/worker/attendance/check-in', requireRole('worker'), workerCheckIn);
router.post('/worker/attendance/check-out', requireRole('worker'), workerCheckOut);

router.get('/supervisor/dashboard/summary', requireRole('project_owner'), requireCompanyAccess, getSupervisorSummary);
router.get('/supervisor/dashboard/attendance', requireRole('project_owner'), requireCompanyAccess, getSupervisorAttendance);
router.get('/supervisor/dashboard/trades', requireRole('project_owner'), requireCompanyAccess, getSupervisorTrades);
router.get('/supervisor/dashboard/allocations', requireRole('project_owner'), requireCompanyAccess, getSupervisorAllocations);
router.get('/supervisor/dashboard/tasks', requireRole('project_owner'), requireCompanyAccess, getSupervisorTasks);
router.post('/supervisor/attendance', requireRole('project_owner'), requireCompanyAccess, createSupervisorAttendance);
router.post('/supervisor/labour-allocation', requireRole('project_owner'), requireCompanyAccess, createLabourAllocation);
router.post('/supervisor/overtime', requireRole('project_owner'), requireCompanyAccess, createOvertime);

router.get('/contractor/dashboard', requireRole('project_owner'), requireCompanyAccess, getContractorDashboard);

router.get('/store/dashboard', requireRole('project_owner'), requireCompanyAccess, getStoreDashboard);
router.get('/store/inventory', requireRole('project_owner'), requireCompanyAccess, getStoreInventory);
router.post('/store/material-receipts', requireRole('project_owner'), requireCompanyAccess, createStockReceipt);
router.post('/store/material-issues', requireRole('project_owner'), requireCompanyAccess, createStockIssue);

export default router;

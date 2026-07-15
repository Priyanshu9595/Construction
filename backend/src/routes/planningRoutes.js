import express from 'express';
import { 
  getPhases, createPhase, deletePhase,
  getTasks, createTask, assignTask, getProjectWorkers, createProjectWorker,
  getCostCodes, createCostCode,
  getBOQ, createBOQItem, bulkCreateBOQ, updateBOQItem, deleteBOQItem,
  getBudget, updateBudget, createBudgetLine,
  freezeBaseline, payWorker, getWorkerAttendanceSummary, getWorkerPaymentHistory
} from '../controllers/planningController.js';
import { protect, requireCompanyAccess } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect, requireCompanyAccess);

// /api/projects/:projectId/...
router.route('/phases')
  .get(getPhases)
  .post(createPhase);
router.route('/phases/:phaseId').delete(deletePhase);

router.route('/tasks')
  .get(getTasks)
  .post(createTask);

router.post('/tasks/:taskId/assign', assignTask);
router.route('/workers')
  .get(getProjectWorkers)
  .post(createProjectWorker);

router.get('/workers/:workerId/attendance-summary', getWorkerAttendanceSummary);
router.get('/workers/:workerId/payments', getWorkerPaymentHistory);
router.post('/workers/:workerId/pay', payWorker);

router.post('/boq/bulk', bulkCreateBOQ);
router.route('/boq')
  .get(getBOQ)
  .post(createBOQItem);
router.route('/boq/:itemId')
  .put(updateBOQItem)
  .delete(deleteBOQItem);

router.route('/budget')
  .get(getBudget)
  .put(updateBudget);

router.route('/budget/lines')
  .post(createBudgetLine);

router.route('/freeze-baseline')
  .post(freezeBaseline);

// Note: Cost codes are typically company-wide, not project specific, 
// but we place it here or as a separate company route. Let's put it on root.
const costCodeRouter = express.Router();
costCodeRouter.use(protect, requireCompanyAccess);
costCodeRouter.route('/')
  .get(getCostCodes)
  .post(createCostCode);

export { router as planningRouter, costCodeRouter };

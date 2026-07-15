import express from 'express';
import {
  getSites, createSite,
  getExpenses, createExpense,
  getPurchaseOrders, createPurchaseOrder,
  getQualityInspections, createQualityInspection,
  getSafetyIncidents, createSafetyIncident
} from '../controllers/operationalController.js';
import { protect, requireCompanyAccess } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect, requireCompanyAccess);

router.route('/sites')
  .get(getSites)
  .post(createSite);

router.route('/expenses')
  .get(getExpenses)
  .post(createExpense);

router.route('/purchase-orders')
  .get(getPurchaseOrders)
  .post(createPurchaseOrder);

router.route('/quality')
  .get(getQualityInspections)
  .post(createQualityInspection);

router.route('/safety')
  .get(getSafetyIncidents)
  .post(createSafetyIncident);

export default router;

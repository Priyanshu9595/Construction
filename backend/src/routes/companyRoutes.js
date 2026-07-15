import express from 'express';
import {
  getClients, createClient,
  getContractors, createContractor,
  getCompanyInfo, updateCompanyInfo,
  addCompanyUser
} from '../controllers/companyController.js';
import { protect, requireCompanyAccess, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireCompanyAccess, requireRole('company_owner', 'company_admin'));

router.route('/clients')
  .get(getClients)
  .post(createClient);

router.route('/contractors')
  .get(getContractors)
  .post(createContractor);

router.route('/settings')
  .get(getCompanyInfo)
  .put(updateCompanyInfo);

router.route('/users/add')
  .post(addCompanyUser);

export default router;

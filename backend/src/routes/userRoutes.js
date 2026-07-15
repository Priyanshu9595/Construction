import express from 'express';
import { getCompanyUsers } from '../controllers/userController.js';
import { protect, requireCompanyAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireCompanyAccess);

router.route('/')
  .get(getCompanyUsers);

export default router;

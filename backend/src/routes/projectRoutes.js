import express from 'express';
import { getProjects, createProject, deleteProject, updateProject } from '../controllers/projectController.js';
import { protect, requireRole, requireCompanyAccess } from '../middleware/authMiddleware.js';

const router = express.Router();

// Require user to be logged in and have company access
router.use(protect, requireCompanyAccess);

router.route('/')
  .get(getProjects)
  .post(requireRole('company_owner', 'company_admin', 'admin'), createProject);

router.route('/:id')
  .put(requireRole('company_owner', 'company_admin', 'admin'), updateProject)
  .delete(requireRole('company_owner', 'company_admin', 'admin'), deleteProject);

export default router;

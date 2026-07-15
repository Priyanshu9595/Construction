import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Site from '../models/Site.js';
import Worker from '../models/Worker.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check for super_owner role
export const superOwnerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'super_owner') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as super owner' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    return next();
  }

  return res.status(403).json({ message: 'Not authorized for this role' });
};

export const requireCompanyAccess = (req, res, next) => {
  if (req.user?.role === 'super_owner') {
    return next();
  }

  if (!req.user?.companyId) {
    return res.status(403).json({ message: 'Company access required' });
  }

  req.companyId = req.user.companyId;
  return next();
};

export const requireProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findOne({ _id: projectId, deletedAt: null });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user.role !== 'super_owner' && project.companyId.toString() !== req.user.companyId?.toString()) {
      return res.status(403).json({ message: 'Cross-company project access blocked' });
    }

    if (req.user.role === 'project_owner') {
      const assignedByUser = req.user.projectIds?.some((id) => id.toString() === projectId);
      const assignedByProject = project.projectManagerIds?.some((id) => id.toString() === req.user._id.toString());
      if (!assignedByUser && !assignedByProject) {
        return res.status(403).json({ message: 'Project assignment required' });
      }
    }

    req.project = project;
    req.companyId = project.companyId;
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Project access check failed', error: error.message });
  }
};

export const requireSiteAccess = async (req, res, next) => {
  try {
    const siteId = req.params.siteId;
    const site = await Site.findOne({ _id: siteId, deletedAt: null });

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    if (site.companyId.toString() !== req.companyId?.toString()) {
      return res.status(403).json({ message: 'Cross-company site access blocked' });
    }

    if (site.projectId.toString() !== req.params.projectId) {
      return res.status(403).json({ message: 'Site does not belong to this project' });
    }

    if (req.user.role === 'site_engineer') {
      const assignedByUser = req.user.siteIds?.some((id) => id.toString() === siteId);
      const assignedBySite = site.engineerIds?.some((id) => id.toString() === req.user._id.toString());
      if (!assignedByUser && !assignedBySite) {
        return res.status(403).json({ message: 'Site assignment required' });
      }
    }

    req.site = site;
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Site access check failed', error: error.message });
  }
};

export const requirePermission = (permission) => (req, res, next) => {
  if (req.user?.role === 'super_owner' || req.user?.role === 'company_owner') {
    return next();
  }
  if (req.user?.permissions?.includes(permission)) {
    return next();
  }
  return res.status(403).json({ message: `Missing required permission: ${permission}` });
};
export const validateRequest = () => (req, res, next) => next();
export const auditAction = () => (req, res, next) => next();


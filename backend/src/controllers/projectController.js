import Project from '../models/Project.js';
import SystemLog from '../models/SystemLog.js';
import User from '../models/User.js';

// @desc    Get all projects for a company
// @route   GET /api/company/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ companyId: req.user.companyId, deletedAt: null }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching projects', error: error.message });
  }
};

// @desc    Create a new project
// @route   POST /api/company/projects
// @access  Private (Company Owner/Admin)
export const createProject = async (req, res) => {
  try {
    const {
      name,
      clientName,
      location,
      budget,
      approvedBudget,
      contractValue,
      status,
      expectedProfit,
      projectManagerId,
      pmFirstName,
      pmLastName,
      pmEmail,
      pmPassword,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    let finalPmId = projectManagerId;

    // Create new Project Manager if details are provided
    if (pmEmail && pmPassword && pmFirstName && pmLastName) {
      const existingUser = await User.findOne({ email: pmEmail.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this email already exists' });
      }
      const newPm = await User.create({
        firstName: pmFirstName,
        lastName: pmLastName,
        email: pmEmail.toLowerCase(),
        password: pmPassword,
        role: 'project_owner',
        permissions: ['project.manage', 'finance.manage', 'quality.manage', 'safety.manage', 'inventory.manage', 'purchase.manage', 'reports.export'], // Default permissions
        companyId: req.user.companyId,
        isActive: true,
      });
      finalPmId = newPm._id;
    }

    const project = await Project.create({
      companyId: req.user.companyId,
      name,
      clientName,
      location,
      budget: Number(approvedBudget ?? budget) || 0,
      approvedBudget: Number(approvedBudget ?? budget) || 0,
      contractValue: Number(contractValue) || 0,
      expectedProfit: Number(expectedProfit) || 0,
      status: status || 'not_started',
      projectManagerIds: finalPmId ? [finalPmId] : [],
      createdBy: req.user._id,
    });

    if (finalPmId) {
      await User.findByIdAndUpdate(finalPmId, {
        $addToSet: { projectIds: project._id }
      });
    }

    await SystemLog.create({
      action: `Created new project: ${project.name}`,
      performedBy: req.user._id,
      details: { projectId: project._id },
      ipAddress: req.ip,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error in createProject:', error);
    res.status(400).json({ message: 'Error creating project', error: error.message, stack: error.stack });
  }
};

// @desc    Delete a project
// @route   DELETE /api/company/projects/:id
// @access  Private (Company Owner/Admin)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, companyId: req.user.companyId, deletedAt: null });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.deletedAt = new Date();
    await project.save();

    await SystemLog.create({
      action: `Deleted project: ${project.name}`,
      performedBy: req.user._id,
      details: { projectId: project._id },
      ipAddress: req.ip,
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting project', error: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/company/projects/:id
// @access  Private (Company Owner/Admin)
export const updateProject = async (req, res) => {
  try {
    const updates = { ...req.body };
    if ('approvedBudget' in updates) {
      updates.approvedBudget = Number(updates.approvedBudget) || 0;
      updates.budget = updates.approvedBudget;
    } else if ('budget' in updates) {
      updates.budget = Number(updates.budget) || 0;
      updates.approvedBudget = updates.budget;
    }
    if ('contractValue' in updates) updates.contractValue = Number(updates.contractValue) || 0;
    if ('expectedProfit' in updates) updates.expectedProfit = Number(updates.expectedProfit) || 0;
    if (updates.status === 'completed') {
      updates.progress = 100;
      updates.progressPercentage = 100;
    }
    if (Number(updates.progress) >= 100 || Number(updates.progressPercentage) >= 100) {
      updates.progress = 100;
      updates.progressPercentage = 100;
      updates.status = 'completed';
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId, deletedAt: null },
      updates,
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await SystemLog.create({
      action: `Updated project: ${project.name}`,
      performedBy: req.user._id,
      details: { projectId: project._id },
      ipAddress: req.ip,
    });

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: 'Error updating project', error: error.message });
  }
};

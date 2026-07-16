import ProjectPhase from '../models/ProjectPhase.js';
import Task from '../models/Task.js';
import TaskDependency from '../models/TaskDependency.js';
import CostCode from '../models/CostCode.js';
import BOQItem from '../models/BOQItem.js';
import ProjectBudget from '../models/ProjectBudget.js';
import BudgetLine from '../models/BudgetLine.js';
import ProjectBaseline from '../models/ProjectBaseline.js';
import Project from '../models/Project.js';
import SystemLog from '../models/SystemLog.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import SalarySlip from '../models/SalarySlip.js';
import Attendance from '../models/Attendance.js';
import Expense from '../models/Expense.js';

// ======================= PHASES =======================
export const getPhases = async (req, res) => {
  try {
    const phases = await ProjectPhase.find({ projectId: req.params.projectId, deletedAt: null }).sort({ plannedStartDate: 1 });
    res.json(phases);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching phases', error: error.message });
  }
};

export const createPhase = async (req, res) => {
  try {
    const { name, code, plannedStartDate, plannedEndDate, weight, responsibleTeam, description } = req.body;
    
    // Validate weight total
    const existingPhases = await ProjectPhase.find({ projectId: req.params.projectId, deletedAt: null });
    const currentWeight = existingPhases.reduce((acc, curr) => acc + (curr.weight || 0), 0);
    if (currentWeight + Number(weight) > 100) {
      return res.status(400).json({ message: 'Total phase weight cannot exceed 100%' });
    }

    const phase = await ProjectPhase.create({
      projectId: req.params.projectId,
      companyId: req.user.companyId,
      name,
      code,
      plannedStartDate,
      plannedEndDate,
      weight: Number(weight) || 0,
      responsibleTeam,
      description,
      createdBy: req.user._id
    });

    res.status(201).json(phase);
  } catch (error) {
    res.status(400).json({ message: 'Error creating phase', error: error.message });
  }
};

export const deletePhase = async (req, res) => {
  try {
    const phase = await ProjectPhase.findOne({ _id: req.params.phaseId, projectId: req.params.projectId });
    if (!phase) return res.status(404).json({ message: 'Phase not found' });
    
    phase.deletedAt = new Date();
    await phase.save();
    res.json({ message: 'Phase deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting phase', error: error.message });
  }
};

// ======================= TASKS =======================
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      projectId: req.params.projectId,
      deletedAt: null
    }).populate('phaseId', 'name').populate('assignedUserIds', 'firstName lastName email').populate('costCodeId').lean();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      projectId: req.params.projectId,
      companyId: req.user.companyId,
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error creating task', error: error.message });
  }
};

export const assignTask = async (req, res) => {
  try {
    const { assignedUserIds } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, projectId: req.params.projectId },
      { $set: { assignedUserIds: assignedUserIds || [] } },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error assigning task', error: error.message });
  }
};

export const getProjectWorkers = async (req, res) => {
  try {
    const [workers, legacyUsers] = await Promise.all([
      Worker.find({
        companyId: req.user.companyId,
        projectIds: req.params.projectId,
        deletedAt: null,
        employmentStatus: { $ne: 'blocked' },
      }).select('name mobile workerCode trade dailyWage skillLevel projectIds').lean(),
      User.find({
        role: 'worker',
        companyId: req.user.companyId,
        projectIds: req.params.projectId,
        deletedAt: null
      }).select('firstName lastName email employeeCode trade dailyWage skillLevel projectIds').lean(),
    ]);

    res.json([
      ...workers.map(serializeWorkerForProject),
      ...legacyUsers,
    ]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workers', error: error.message });
  }
};

export const createProjectWorker = async (req, res) => {
  try {
    const { firstName, lastName, email, password, trade, dailyWage, employeeCode } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: 'worker',
      companyId: req.user.companyId,
      projectIds: [req.params.projectId],
      trade,
      dailyWage: Number(dailyWage) || 0,
      employeeCode,
      isActive: true
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      trade: user.trade,
      dailyWage: user.dailyWage,
      employeeCode: user.employeeCode
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating worker', error: error.message });
  }
};

// ======================= WORKER PAYMENTS =======================
export const payWorker = async (req, res) => {
  try {
    const { month, workDate, grossSalary, deductions, netSalary } = req.body;
    const payPeriod = workDate || month;
    if (!payPeriod) {
      return res.status(400).json({ message: 'Payment date is required' });
    }
    
    // Check if worker exists
    const worker = await findProjectWorker(req.user.companyId, req.params.projectId, req.params.workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Since a project manager could be paying a worker multiple times for different months
    const salarySlip = await SalarySlip.create({
      companyId: req.user.companyId,
      workerId: req.params.workerId,
      month: payPeriod,
      grossSalary: Number(grossSalary) || 0,
      deductions: Number(deductions) || 0,
      netSalary: Number(netSalary) || 0,
      paymentStatus: 'paid',
      paymentDate: new Date(),
    });

    await Expense.create({
      companyId: req.user.companyId,
      projectId: req.params.projectId,
      invoiceNumber: `SAL-${salarySlip._id}`,
      description: `Worker Salary: ${worker.displayName} (${payPeriod})`,
      category: 'Labour',
      amount: Number(netSalary) || 0,
      totalAmount: Number(netSalary) || 0,
      date: new Date(),
      expenseDate: new Date(),
      incurredBy: req.user.firstName + ' ' + req.user.lastName,
      status: 'paid',
      createdBy: req.user._id
    });

    await SystemLog.create({
      action: `Recorded payment for worker: ${worker.displayName} for ${payPeriod}`,
      performedBy: req.user._id,
      details: { workerId: worker._id, salarySlipId: salarySlip._id, projectId: req.params.projectId },
      ipAddress: req.ip,
    });

    res.status(201).json(salarySlip);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A salary slip for this payment date already exists for this worker.' });
    }
    res.status(400).json({ message: 'Error processing payment', error: error.message });
  }
};

export const getWorkerAttendanceSummary = async (req, res) => {
  try {
    const { date, month } = req.query;
    const payPeriod = date || month;
    if (!payPeriod) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    const { startDate, endDate } = getAttendancePeriod(payPeriod);
    const worker = await findProjectWorker(req.user.companyId, req.params.projectId, req.params.workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const attendances = await Attendance.find({
      workerId: req.params.workerId,
      projectId: req.params.projectId,
      attendanceDate: { $gte: startDate, $lt: endDate }
    }).lean();

    const existingSlip = await SalarySlip.findOne({ workerId: req.params.workerId, month: payPeriod });

    let daysWorked = 0;
    attendances.forEach(att => {
      if (att.status === 'present') daysWorked += 1;
      else if (att.status === 'half_day') daysWorked += 0.5;
    });

    if (existingSlip) {
      return res.json({ 
        daysWorked, 
        alreadyPaid: true, 
        paidAmount: existingSlip.netSalary 
      });
    }

    res.json({ daysWorked, alreadyPaid: false });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance summary', error: error.message });
  }
};

export const getWorkerPaymentHistory = async (req, res) => {
  try {
    const worker = await findProjectWorker(req.user.companyId, req.params.projectId, req.params.workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const slips = await SalarySlip.find({
      workerId: req.params.workerId
    }).sort({ createdAt: -1 }).lean();
    
    res.json(slips);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment history', error: error.message });
  }
};

// ======================= COST CODES =======================
export const getCostCodes = async (req, res) => {
  try {
    const codes = await CostCode.find({ companyId: req.user.companyId, deletedAt: null });
    res.json(codes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cost codes', error: error.message });
  }
};

export const createCostCode = async (req, res) => {
  try {
    const code = await CostCode.create({ companyId: req.user.companyId, ...req.body });
    res.status(201).json(code);
  } catch (error) {
    res.status(400).json({ message: 'Error creating cost code', error: error.message });
  }
};

// ======================= BOQ =======================
export const getBOQ = async (req, res) => {
  try {
    const boq = await BOQItem.find({ projectId: req.params.projectId, deletedAt: null })
      .populate('phaseId')
      .populate('taskId')
      .populate('costCodeId');
      
    // Calculate actual quantity based on linked task progress
    const boqWithProgress = boq.map(item => {
      const plain = item.toObject();
      plain.actualQuantity = 0;
      if (plain.taskId && plain.taskId.progressPercentage != null) {
        plain.actualQuantity = (plain.taskId.progressPercentage / 100) * plain.quantity;
      }
      return plain;
    });
    
    res.json(boqWithProgress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching BOQ', error: error.message });
  }
};

export const createBOQItem = async (req, res) => {
  try {
    const amount = Number(req.body.quantity) * Number(req.body.rate);
    const item = await BOQItem.create({
      projectId: req.params.projectId,
      companyId: req.user.companyId,
      ...req.body,
      amount
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Error creating BOQ item', error: error.message });
  }
};

export const bulkCreateBOQ = async (req, res) => {
  try {
    const items = req.body.items.map(item => ({
      ...item,
      projectId: req.params.projectId,
      companyId: req.user.companyId,
      amount: Number(item.quantity || 0) * Number(item.rate || 0)
    }));
    
    const created = await BOQItem.insertMany(items);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Error in bulk import', error: error.message });
  }
};

export const updateBOQItem = async (req, res) => {
  try {
    const amount = Number(req.body.quantity || 0) * Number(req.body.rate || 0);
    const item = await BOQItem.findOneAndUpdate(
      { _id: req.params.itemId, projectId: req.params.projectId },
      { ...req.body, amount },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: 'Error updating item', error: error.message });
  }
};

export const deleteBOQItem = async (req, res) => {
  try {
    const item = await BOQItem.findOneAndUpdate(
      { _id: req.params.itemId, projectId: req.params.projectId },
      { deletedAt: new Date() }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting item', error: error.message });
  }
};

// ======================= BUDGET =======================
export const getBudget = async (req, res) => {
  try {
    let budget = await ProjectBudget.findOne({ projectId: req.params.projectId, deletedAt: null });
    if (!budget) {
      const project = await Project.findOne({ _id: req.params.projectId, companyId: req.user.companyId, deletedAt: null }).lean();
      budget = await ProjectBudget.create({
        projectId: req.params.projectId,
        companyId: req.user.companyId,
        contractValue: Number(project?.contractValue || project?.approvedBudget || project?.budget || 0),
        approvedBudget: Number(project?.approvedBudget || project?.budget || 0),
        expectedProfit: Number(project?.expectedProfit || 0),
      });
    }
    const lines = await BudgetLine.find({ budgetId: budget._id, deletedAt: null }).populate('costCodeId');
    res.json({ budget, lines });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budget', error: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const numericFields = ['contractValue', 'approvedBudget', 'expectedProfit'];
    const budgetUpdates = { ...req.body };
    numericFields.forEach((field) => {
      if (field in budgetUpdates) {
        budgetUpdates[field] = Number(budgetUpdates[field]) || 0;
      }
    });

    const budget = await ProjectBudget.findOneAndUpdate(
      { projectId: req.params.projectId, deletedAt: null },
      {
        $set: budgetUpdates,
        $setOnInsert: {
          projectId: req.params.projectId,
          companyId: req.user.companyId,
        },
      },
      { new: true, upsert: true }
    );

    const projectUpdates = {};
    if ('contractValue' in budgetUpdates) projectUpdates.contractValue = budgetUpdates.contractValue;
    if ('approvedBudget' in budgetUpdates) {
      projectUpdates.approvedBudget = budgetUpdates.approvedBudget;
      projectUpdates.budget = budgetUpdates.approvedBudget;
    }
    if ('expectedProfit' in budgetUpdates) projectUpdates.expectedProfit = budgetUpdates.expectedProfit;

    if (Object.keys(projectUpdates).length) {
      await Project.findOneAndUpdate(
        { _id: req.params.projectId, companyId: req.user.companyId, deletedAt: null },
        { $set: projectUpdates }
      );
    }

    res.json(budget);
  } catch (error) {
    res.status(400).json({ message: 'Error updating budget', error: error.message });
  }
};

export const createBudgetLine = async (req, res) => {
  try {
    const budget = await ProjectBudget.findOne({ projectId: req.params.projectId, deletedAt: null });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    
    // Validate that allocated amounts don't exceed approved budget
    const existingLines = await BudgetLine.find({ budgetId: budget._id, deletedAt: null });
    const totalAllocated = existingLines.reduce((acc, curr) => acc + curr.allocatedAmount, 0) + Number(req.body.allocatedAmount);
    
    if (totalAllocated > budget.approvedBudget) {
      return res.status(400).json({ message: 'Allocations exceed approved budget limit' });
    }

    const line = await BudgetLine.create({
      budgetId: budget._id,
      projectId: req.params.projectId,
      companyId: req.user.companyId,
      ...req.body
    });
    res.status(201).json(line);
  } catch (error) {
    res.status(400).json({ message: 'Error creating budget line', error: error.message });
  }
};

// ======================= BASELINE =======================
export const freezeBaseline = async (req, res) => {
  try {
    // 1. Fetch current state
    const phases = await ProjectPhase.find({ projectId: req.params.projectId, deletedAt: null });
    const tasks = await Task.find({ projectId: req.params.projectId, deletedAt: null });
    const boqItems = await BOQItem.find({ projectId: req.params.projectId, deletedAt: null });
    const budgetData = await ProjectBudget.findOne({ projectId: req.params.projectId, deletedAt: null });
    const budgetLines = budgetData ? await BudgetLine.find({ budgetId: budgetData._id, deletedAt: null }) : [];
    
    // 2. Validations
    const totalPhaseWeight = phases.reduce((acc, curr) => acc + (curr.weight || 0), 0);
    if (Math.abs(totalPhaseWeight - 100) > 0.1) {
       return res.status(400).json({ message: `Total phase weight must be exactly 100%. Current is ${totalPhaseWeight}%` });
    }
    
    // 3. Create Baseline
    const baselinesCount = await ProjectBaseline.countDocuments({ projectId: req.params.projectId });
    const baseline = await ProjectBaseline.create({
      projectId: req.params.projectId,
      companyId: req.user.companyId,
      frozenBy: req.user._id,
      version: baselinesCount + 1,
      snapshot: {
        phases,
        tasks,
        boqItems,
        budget: {
          details: budgetData,
          lines: budgetLines
        }
      }
    });

    // 4. Update project status and budget status
    await Project.findByIdAndUpdate(req.params.projectId, { status: 'in_progress' });
    if (budgetData) {
      await ProjectBudget.findByIdAndUpdate(budgetData._id, { status: 'frozen' });
    }

    await SystemLog.create({
      action: `Frozen Project Baseline (v${baseline.version})`,
      performedBy: req.user._id,
      details: { projectId: req.params.projectId, baselineId: baseline._id },
      ipAddress: req.ip,
    });

    res.json({ message: 'Baseline frozen successfully', baseline });
  } catch (error) {
    res.status(500).json({ message: 'Error freezing baseline', error: error.message });
  }
};

const serializeWorkerForProject = (worker) => {
  const [firstName = worker.name || '', ...lastNameParts] = (worker.name || '').trim().split(/\s+/);
  return {
    _id: worker._id,
    firstName,
    lastName: lastNameParts.join(' '),
    email: worker.mobile,
    employeeCode: worker.workerCode,
    mobile: worker.mobile,
    trade: worker.trade,
    dailyWage: worker.dailyWage,
    skillLevel: worker.skillLevel,
    projectIds: worker.projectIds,
    source: 'worker',
  };
};

const findProjectWorker = async (companyId, projectId, workerId) => {
  const worker = await Worker.findOne({
    _id: workerId,
    companyId,
    projectIds: projectId,
    deletedAt: null,
  }).lean();

  if (worker) {
    return {
      ...worker,
      displayName: worker.name,
    };
  }

  const legacyUser = await User.findOne({
    _id: workerId,
    role: 'worker',
    companyId,
    projectIds: projectId,
    deletedAt: null,
  }).lean();

  if (!legacyUser) {
    return null;
  }

  return {
    ...legacyUser,
    displayName: `${legacyUser.firstName || ''} ${legacyUser.lastName || ''}`.trim() || legacyUser.email,
  };
};

const getAttendancePeriod = (period) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    const [year, month, day] = period.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    return { startDate, endDate };
  }

  const [year, month] = period.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  return { startDate, endDate };
};

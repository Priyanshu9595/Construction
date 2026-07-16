import Approval from '../models/Approval.js';
import Attendance from '../models/Attendance.js';
import ActivityLog from '../models/ActivityLog.js';
import DailyReport from '../models/DailyReport.js';
import EquipmentLog from '../models/EquipmentLog.js';
import Issue from '../models/Issue.js';
import MaterialUsage from '../models/MaterialUsage.js';
import Milestone from '../models/Milestone.js';
import ProgressEntry from '../models/ProgressEntry.js';
import Project from '../models/Project.js';
import SitePhoto from '../models/SitePhoto.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';

export const getCompanySummary = async (req, res) => {
  try {
    const companyId = req.companyId;
    const [projects, activeEmployees, openApprovals] = await Promise.all([
      Project.find({ companyId, deletedAt: null }).lean(),
      User.countDocuments({ companyId, isActive: true, deletedAt: null }),
      Approval.countDocuments({ companyId, status: 'pending' }),
    ]);

    const totalBudget = sumProjectBudget(projects);
    const actualCost = sum(projects, 'actualCost');
    const expectedProfit = sum(projects, 'expectedProfit');

    res.json({
      totalProjects: projects.length,
      inProgress: projects.filter((p) => p.status === 'in_progress').length,
      completed: projects.filter((p) => p.status === 'completed').length,
      onHold: projects.filter((p) => p.status === 'on_hold').length,
      delayed: projects.filter((p) => isProjectDelayed(p)).length,
      totalBudget,
      actualCost,
      expectedProfit,
      activeEmployees,
      openApprovals,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load company summary', error: error.message });
  }
};

export const getCompanyProjectPerformance = async (req, res) => {
  try {
    const projects = await Project.find({ companyId: req.companyId, deletedAt: null }).limit(8).lean();
    const performance = await Promise.all(projects.map(async (project) => {
      const calculatedProgress = await calculateProjectProgress(project._id);
      return {
        projectId: project._id,
        name: project.name,
        budgetUtilization: percent(project.actualCost, project.approvedBudget || project.budget),
        progress: calculatedProgress,
        costVariance: percent((project.actualCost || 0) - (project.approvedBudget || 0), project.approvedBudget || 1),
        qualityScore: project.healthStatus === 'on_track' ? 92 : project.healthStatus === 'at_risk' ? 76 : 62,
        safetyScore: project.healthStatus === 'delayed' ? 70 : 94,
      };
    }));
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load project performance', error: error.message });
  }
};

export const getCompanyRecentProjects = async (req, res) => {
  try {
    const projects = await Project.find({ companyId: req.companyId, deletedAt: null })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('projectManagerIds', 'firstName lastName')
      .lean();

    const recent = await Promise.all(projects.map(async (project) => {
      const calculatedProgress = await calculateProjectProgress(project._id);
      return {
        id: project._id,
        name: project.name,
        clientName: project.clientName,
        projectManager: project.projectManagerIds?.map((user) => `${user.firstName} ${user.lastName}`).join(', ') || '',
        location: project.location,
        progress: calculatedProgress,
        status: project.status,
        budgetUsage: percent(project.actualCost, project.approvedBudget || project.budget),
        delayed: isProjectDelayed(project),
        lastActivity: project.updatedAt,
      };
    }));
    res.json(recent);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load recent projects', error: error.message });
  }
};

export const getCompanyAlerts = async (req, res) => {
  try {
    const [delayedProjects, pendingApprovals, criticalIssues, blockedTasks] = await Promise.all([
      Project.find({ companyId: req.companyId, deletedAt: null }).lean(),
      Approval.find({ companyId: req.companyId, status: 'pending' }).limit(5).populate('projectId', 'name').lean(),
      Issue.find({ companyId: req.companyId, status: { $nin: ['resolved', 'closed'] }, severity: { $in: ['high', 'critical'] } }).limit(5).populate('projectId', 'name').lean(),
      Task.find({ companyId: req.companyId, status: { $in: ['blocked', 'delayed'] }, deletedAt: null }).limit(5).populate('projectId', 'name').lean(),
    ]);

    res.json([
      ...delayedProjects.filter(isProjectDelayed).slice(0, 5).map((project) => ({
        category: 'Schedule',
        severity: 'high',
        project: project.name,
        description: 'Project forecast is beyond planned end date',
        dueDate: project.forecastEndDate,
        cta: 'Review',
      })),
      ...pendingApprovals.map((approval) => ({
        category: 'Approval',
        severity: 'warning',
        project: approval.projectId?.name || '',
        description: `${approval.type} approval is pending`,
        dueDate: approval.submittedAt,
        cta: 'Approve',
      })),
      ...criticalIssues.map((issue) => ({
        category: 'Issue',
        severity: issue.severity,
        project: issue.projectId?.name || '',
        description: issue.title,
        dueDate: issue.dueDate,
        cta: 'View Details',
      })),
      ...blockedTasks.map((task) => ({
        category: 'Task',
        severity: task.status === 'blocked' ? 'critical' : 'warning',
        project: task.projectId?.name || '',
        description: task.title,
        dueDate: task.plannedEndDate,
        cta: 'Review',
      })),
    ]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load company alerts', error: error.message });
  }
};

export const getCompanyFinancialOverview = async (req, res) => {
  try {
    const projects = await Project.find({ companyId: req.companyId, deletedAt: null }).lean();
    const expenses = await Expense.aggregate([
      { $match: activeExpenseMatch({ companyId: req.companyId }) },
      { $group: { _id: null, total: { $sum: expenseAmountExpression } } }
    ]);
    const totalBudget = sumProjectBudget(projects);
    const totalExpenses = expenses[0]?.total || 0;
    const totalCommittedCost = sum(projects, 'committedCost');
    const totalExpectedRevenue = sumCompletedProjectRevenue(projects);
    const totalExpectedProfit = totalExpectedRevenue - totalExpenses - totalCommittedCost;

    res.json({
      totalBudget,
      totalExpenses,
      totalCommittedCost,
      totalExpectedRevenue,
      totalExpectedProfit,
      profitMargin: totalExpectedRevenue ? Number(((totalExpectedProfit / totalExpectedRevenue) * 100).toFixed(1)) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load financial overview', error: error.message });
  }
};

export const getCompanyActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ companyId: req.companyId }).sort({ createdAt: -1 }).limit(10).lean();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load company activity', error: error.message });
  }
};

export const getProjectSummary = async (req, res) => {
  try {
    const project = req.project;
    const today = dayRange(new Date());
    const [labourToday, pendingTasks, openIssues, pendingApprovals, expenses] = await Promise.all([
      Attendance.aggregate([{ $match: { projectId: project._id, attendanceDate: today.match, status: 'present', approved: true } }, { $group: { _id: null, total: { $sum: '$workerCount' } } }]),
      Task.countDocuments({ projectId: project._id, status: { $in: ['not_started', 'in_progress', 'blocked', 'delayed'] }, deletedAt: null }),
      Issue.countDocuments({ projectId: project._id, status: { $nin: ['resolved', 'closed'] }, deletedAt: null }),
      Approval.countDocuments({ projectId: project._id, status: 'pending' }),
      Expense.aggregate([{ $match: activeExpenseMatch({ projectId: project._id }) }, { $group: { _id: null, total: { $sum: expenseAmountExpression } } }]),
    ]);

    const totalExpenses = expenses[0]?.total || 0;
    const approvedBudget = project.approvedBudget || project.budget || 0;

    res.json({
      project: serializeProject(project),
      overallProgress: await calculateProjectProgress(project._id),
      budgetUsed: percent(totalExpenses, approvedBudget),
      daysPassed: daysBetween(project.plannedStartDate || project.startDate, new Date()),
      totalDays: daysBetween(project.plannedStartDate || project.startDate, project.plannedEndDate || project.endDate),
      delayDays: delayDays(project),
      labourPresentToday: labourToday[0]?.total || 0,
      pendingTasks,
      openIssues,
      pendingApprovals,
      totalExpenses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load project summary', error: error.message });
  }
};

export const getProjectProgress = async (req, res) => {
  try {
    const rows = await ProgressEntry.aggregate([
      { $match: { projectId: req.project._id, status: 'approved' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$entryDate' } }, actual: { $avg: '$percentage' } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(rows.map((row, index) => ({ name: row._id, actual: Math.round(row.actual), planned: Math.min(100, (index + 1) * 10) })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to load project progress', error: error.message });
  }
};

export const getProjectBudget = async (req, res) => {
  try {
    const project = req.project;
    const approvedBudget = project.approvedBudget || project.budget || 0;
    
    const expenses = await Expense.aggregate([
      { $match: activeExpenseMatch({ projectId: project._id }) },
      { $group: { _id: null, total: { $sum: expenseAmountExpression } } }
    ]);
    const actualCost = expenses.length > 0 ? expenses[0].total : (project.actualCost || 0);

    const committedCost = project.committedCost || 0;
    const remainingBudget = approvedBudget - actualCost - committedCost;
    const forecastCostAtCompletion = actualCost + committedCost;

    res.json({ 
      revenue: isRevenueRecognized(project) ? project.contractValue || 0 : 0,
      expense: actualCost,
      approvedBudget, 
      actualCost, 
      committedCost, 
      remainingBudget, 
      forecastCostAtCompletion, 
      expectedVariance: forecastCostAtCompletion - approvedBudget 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load project budget', error: error.message });
  }
};

export const getProjectTasks = async (req, res) => {
  const tasks = await Task.find({ projectId: req.project._id, deletedAt: null }).sort({ updatedAt: -1 }).limit(10).populate('assignedUserIds', 'firstName lastName').lean();
  res.json(tasks.map((task) => ({ ...task, assignedUser: task.assignedUserIds?.map((user) => `${user.firstName} ${user.lastName}`).join(', ') || '' })));
};

export const getProjectMilestones = async (req, res) => {
  const milestones = await Milestone.find({ projectId: req.project._id, deletedAt: null }).sort({ plannedDate: 1 }).limit(8).lean();
  res.json(milestones);
};

export const getProjectApprovals = async (req, res) => {
  const approvals = await Approval.find({ projectId: req.project._id, status: 'pending' }).sort({ submittedAt: -1 }).limit(8).populate('submittedBy', 'firstName lastName').lean();
  res.json(approvals);
};

export const getProjectIssues = async (req, res) => {
  const issues = await Issue.find({ projectId: req.project._id, status: { $nin: ['resolved', 'closed'] }, deletedAt: null }).sort({ createdAt: -1 }).limit(8).lean();
  res.json(issues);
};

export const getSiteDashboard = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const range = dayRange(date);
    const [labour, progress, materials, equipment, issues, inspections, report, photos, tasks] = await Promise.all([
      Attendance.aggregate([{ $match: { siteId: req.site._id, attendanceDate: range.match, status: 'present', approved: true } }, { $group: { _id: null, total: { $sum: '$workerCount' } } }]),
      ProgressEntry.aggregate([{ $match: { siteId: req.site._id, entryDate: range.match } }, { $group: { _id: null, total: { $avg: '$percentage' }, count: { $sum: 1 } } }]),
      MaterialUsage.find({ siteId: req.site._id, usageDate: range.match }).lean(),
      EquipmentLog.find({ siteId: req.site._id, logDate: range.match }).lean(),
      Issue.find({ siteId: req.site._id, status: { $nin: ['resolved', 'closed'] }, deletedAt: null }).sort({ createdAt: -1 }).limit(5).lean(),
      Approval.countDocuments({ siteId: req.site._id, status: 'pending', type: /inspection/i }),
      DailyReport.findOne({ siteId: req.site._id, reportDate: range.match }).lean(),
      SitePhoto.find({ siteId: req.site._id }).sort({ uploadedAt: -1 }).limit(8).lean(),
      Task.find({ siteId: req.site._id, deletedAt: null }).sort({ plannedEndDate: 1 }).limit(8).lean(),
    ]);

    res.json({
      project: serializeProject(req.project),
      site: req.site,
      date,
      weather: report?.weather || '',
      temperature: report?.temperature || null,
      kpis: {
        labourToday: labour[0]?.total || 0,
        workProgressToday: Math.round(progress[0]?.total || 0),
        materialsUsed: new Set(materials.map((item) => item.materialName)).size,
        equipmentUsed: new Set(equipment.map((item) => item.equipmentName)).size,
        openIssues: issues.length,
        pendingInspections: inspections,
      },
      checklist: [
        { label: 'Work progress updated', status: progress[0]?.count ? 'completed' : 'pending' },
        { label: 'Labour attendance taken', status: labour[0]?.total ? 'completed' : 'pending' },
        { label: 'Material usage added', status: materials.length ? 'completed' : 'pending' },
        { label: 'Equipment log updated', status: equipment.length ? 'completed' : 'pending' },
        { label: 'Site photos uploaded', status: photos.some((photo) => sameDay(photo.uploadedAt, date)) ? 'completed' : 'pending' },
        { label: 'Daily report submitted', status: report?.status === 'submitted' || report?.status === 'approved' ? 'completed' : 'pending' },
      ],
      photos,
      tasks,
      issues,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load site dashboard', error: error.message });
  }
};

const sum = (rows, key) => rows.reduce((total, row) => total + (row[key] || 0), 0);
const projectBudget = (project) => project.approvedBudget || project.budget || 0;
const sumProjectBudget = (projects) => projects.reduce((total, project) => total + projectBudget(project), 0);
const isRevenueRecognized = (project) =>
  project.status === 'completed' || (project.progressPercentage || 0) >= 100 || (project.progress || 0) >= 100;
const sumCompletedProjectRevenue = (projects) =>
  projects.reduce((total, project) => total + (isRevenueRecognized(project) ? project.contractValue || 0 : 0), 0);
const percent = (value = 0, total = 0) => total ? Math.round((value / total) * 100) : 0;
const daysBetween = (start, end) => start && end ? Math.max(0, Math.ceil((new Date(end) - new Date(start)) / 86400000)) : 0;
const delayDays = (project) => project.forecastEndDate && project.plannedEndDate ? Math.max(0, daysBetween(project.plannedEndDate, project.forecastEndDate)) : 0;
const isProjectDelayed = (project) => delayDays(project) > 0 || project.healthStatus === 'delayed';
const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
const activeExpenseMatch = (scope) => ({
  ...scope,
  deletedAt: null,
  status: { $nin: ['rejected', 'cancelled'] },
});
const expenseAmountExpression = {
  $cond: [
    { $gt: ['$amount', 0] },
    '$amount',
    { $ifNull: ['$totalAmount', 0] },
  ],
};
const dayRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end, match: { $gte: start, $lt: end } };
};
const serializeProject = (project) => ({
  id: project._id,
  name: project.name,
  clientName: project.clientName,
  location: project.location,
  status: project.status,
  approvedBudget: project.approvedBudget || project.budget || 0,
  actualCost: project.actualCost || 0,
  progress: project.progressPercentage || project.progress || 0,
});
const calculateProjectProgress = async (projectId) => {
  const result = await Task.aggregate([
    { $match: { projectId, deletedAt: null } },
    { $group: { _id: null, weightedDone: { $sum: { $multiply: ['$progressPercentage', '$weight'] } }, totalWeight: { $sum: '$weight' } } },
  ]);
  return result[0]?.totalWeight ? Number((result[0].weightedDone / result[0].totalWeight).toFixed(1)) : 0;
};

import jwt from 'jsonwebtoken';
import Attendance from '../models/Attendance.js';
import Contractor from '../models/Contractor.js';
import Grievance from '../models/Grievance.js';
import Issue from '../models/Issue.js';
import LabourAllocation from '../models/LabourAllocation.js';
import Material from '../models/Material.js';
import OvertimeRequest from '../models/OvertimeRequest.js';
import RunningBill from '../models/RunningBill.js';
import SalarySlip from '../models/SalarySlip.js';
import StockTransaction from '../models/StockTransaction.js';
import Store from '../models/Store.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import WorkOrder from '../models/WorkOrder.js';
import Worker from '../models/Worker.js';
import Project from '../models/Project.js';

export const getSupervisorSummary = async (req, res) => {
  try {
    const { projectId, siteId, date } = scopedQuery(req);
    const range = dayRange(date);
    const workerMatch = { companyId: req.user.companyId, deletedAt: null };
    if (projectId) workerMatch.projectIds = projectId;
    if (siteId) workerMatch.siteIds = siteId;
    if (req.user.role === 'site_supervisor') workerMatch.supervisorId = req.user._id;

    const attendanceMatch = { companyId: req.user.companyId, attendanceDate: range.match };
    if (projectId) attendanceMatch.projectId = projectId;
    if (siteId) attendanceMatch.siteId = siteId;

    const [totalLabourAssigned, attendance, overtimeWorkers, activeTasks, shortages] = await Promise.all([
      Worker.countDocuments(workerMatch),
      Attendance.aggregate([{ $match: attendanceMatch }, { $group: { _id: '$status', count: { $sum: '$workerCount' } } }]),
      OvertimeRequest.distinct('workerId', { companyId: req.user.companyId, date: range.match, status: { $in: ['submitted', 'approved'] } }),
      Task.countDocuments({ companyId: req.user.companyId, ...(projectId ? { projectId } : {}), ...(siteId ? { siteId } : {}), status: { $in: ['not_started', 'in_progress', 'blocked', 'delayed'] }, deletedAt: null }),
      getTradeShortages(req.user.companyId, projectId, siteId, range),
    ]);

    const byStatus = Object.fromEntries(attendance.map((row) => [row._id, row.count]));
    res.json({
      totalLabourAssigned,
      presentToday: (byStatus.present || 0) + (byStatus.late || 0) + (byStatus.half_day || 0),
      absentToday: byStatus.absent || 0,
      onLeave: byStatus.leave || 0,
      lateWorkers: byStatus.late || 0,
      overtimeWorkers: overtimeWorkers.length,
      activeTasks,
      labourShortageAlerts: shortages.filter((row) => row.shortage > 0).length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load supervisor summary', error: error.message });
  }
};

export const getSupervisorAttendance = async (req, res) => {
  const { projectId, siteId, date } = scopedQuery(req);
  const match = { companyId: req.user.companyId, attendanceDate: dayRange(date).match };
  if (projectId) match.projectId = projectId;
  if (siteId) match.siteId = siteId;
  const rows = await Attendance.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: '$workerCount' } } }]);
  res.json(rows.map((row) => ({ status: row._id, count: row.count })));
};

export const getSupervisorTrades = async (req, res) => {
  const { projectId, siteId, date } = scopedQuery(req);
  res.json(await getTradeShortages(req.user.companyId, projectId, siteId, dayRange(date)));
};

export const getSupervisorAllocations = async (req, res) => {
  const { projectId, siteId, date } = scopedQuery(req);
  const match = { companyId: req.user.companyId, allocationDate: dayRange(date).match };
  if (projectId) match.projectId = projectId;
  if (siteId) match.siteId = siteId;
  const rows = await LabourAllocation.find(match).populate('workerId', 'name workerCode trade').populate('taskId', 'title location').limit(50).lean();
  res.json(rows);
};

export const getSupervisorTasks = async (req, res) => {
  const { projectId, siteId } = scopedQuery(req);
  const match = { companyId: req.user.companyId, deletedAt: null };
  if (projectId) match.projectId = projectId;
  if (siteId) match.siteId = siteId;
  res.json(await Task.find(match).sort({ plannedEndDate: 1 }).limit(20).lean());
};

export const createSupervisorAttendance = async (req, res) => {
  try {
    const worker = await Worker.findOne({ _id: req.body.workerId, companyId: req.user.companyId, deletedAt: null });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    const attendance = await Attendance.create({
      companyId: req.user.companyId,
      workerId: worker._id,
      contractorId: worker.contractorId,
      projectId: req.body.projectId || worker.projectIds?.[0],
      siteId: req.body.siteId || worker.siteIds?.[0],
      attendanceDate: dayStart(req.body.attendanceDate || new Date()),
      shiftId: req.body.shiftId || 'day',
      status: req.body.status || 'present',
      workerCount: 1,
      source: 'supervisor_manual',
      verificationStatus: 'verified',
      verifiedBy: req.user._id,
      createdBy: req.user._id,
    });
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create attendance', error: error.message });
  }
};

export const createLabourAllocation = async (req, res) => {
  try {
    const worker = await Worker.findOne({ _id: req.body.workerId, companyId: req.user.companyId, deletedAt: null });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    const allocation = await LabourAllocation.create({
      companyId: req.user.companyId,
      workerId: worker._id,
      contractorId: worker.contractorId,
      projectId: req.body.projectId || worker.projectIds?.[0],
      siteId: req.body.siteId || worker.siteIds?.[0],
      taskId: req.body.taskId,
      allocationDate: dayStart(req.body.allocationDate || new Date()),
      shift: req.body.shift || 'day',
      workLocation: req.body.workLocation,
      expectedQuantity: req.body.expectedQuantity || 0,
      remarks: req.body.remarks,
      createdBy: req.user._id,
    });
    res.status(201).json(allocation);
  } catch (error) {
    res.status(400).json({ message: 'Failed to allocate labour', error: error.message });
  }
};

export const createOvertime = async (req, res) => {
  const startAt = new Date(req.body.startAt);
  const endAt = new Date(req.body.endAt);
  if (endAt <= startAt) return res.status(400).json({ message: 'Overtime end must be after start' });
  const overtime = await OvertimeRequest.create({
    ...req.body,
    companyId: req.user.companyId,
    date: dayStart(req.body.date || startAt),
    totalMinutes: Math.round((endAt - startAt) / 60000),
    createdBy: req.user._id,
  });
  res.status(201).json(overtime);
};



export const getWorkerDashboard = async (req, res) => {
  const worker = req.user;
  const range = dayRange(new Date());
  const [attendance, allocation, salary, slips, tasks] = await Promise.all([
    Attendance.findOne({ workerId: worker._id, attendanceDate: range.match }).lean(),
    LabourAllocation.findOne({ workerId: worker._id, allocationDate: range.match }).populate('taskId', 'title location').populate('projectId', 'name').populate('siteId', 'name').lean(),
    SalarySlip.findOne({ workerId: worker._id }).sort({ createdAt: -1 }).lean(),
    SalarySlip.find({ workerId: worker._id }).sort({ createdAt: -1 }).limit(6).lean(),
    Task.find({ assignedUserIds: worker._id, deletedAt: null, status: { $nin: ['completed', 'on_hold'] } }).populate('projectId', 'name').lean(),
  ]);
  res.json({ profile: serializeWorker(worker), todayAttendance: attendance, todayWork: allocation, currentSalary: salary, salarySlips: slips, assignedTasks: tasks });
};

export const updateWorkerTaskStatus = async (req, res) => {
  try {
    const { status, progressPercentage } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (typeof progressPercentage === 'number') updateData.progressPercentage = progressPercentage;
    
    if (status === 'completed') updateData.progressPercentage = 100;
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, assignedUserIds: req.user._id },
      { $set: updateData },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found or not assigned to you' });

    if (updateData.status === 'in_progress' || updateData.status === 'completed' || task.status === 'in_progress' || task.status === 'completed') {
      const project = await Project.findById(task.projectId);
      if (project && project.status === 'not_started') {
        project.status = 'in_progress';
        await project.save();
      }
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update task status', error: error.message });
  }
};

export const getWorkerAttendanceHistory = async (req, res) => {
  try {
    const attendance = await Attendance.find({ workerId: req.user._id })
      .populate('projectId', 'name')
      .populate('siteId', 'name')
      .sort({ attendanceDate: -1 })
      .lean();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance history', error: error.message });
  }
};

export const workerCheckIn = async (req, res) => {
  const worker = req.user;
  const range = dayRange(new Date());
  const existing = await Attendance.findOne({ workerId: worker._id, attendanceDate: range.match, shiftId: req.body.shiftId || 'day' });
  if (existing) return res.status(409).json({ message: 'Already checked in for this shift' });
  const attendance = await Attendance.create({
    companyId: worker.companyId,
    workerId: worker._id,
    contractorId: null,
    projectId: worker.projectIds?.[0],
    siteId: worker.siteIds?.[0],
    attendanceDate: dayStart(new Date()),
    shiftId: req.body.shiftId || 'day',
    status: 'present',
    checkInAt: new Date(),
    checkInLocation: req.body.location,
    source: 'worker_web',
    geofenceStatus: 'pending',
    verificationStatus: 'pending',
    workerCount: 1,
  });
  res.status(201).json(attendance);
};

export const workerCheckOut = async (req, res) => {
  const range = dayRange(new Date());
  const attendance = await Attendance.findOne({ workerId: req.user._id, attendanceDate: range.match, checkOutAt: { $exists: false } });
  if (!attendance) return res.status(404).json({ message: 'No active check-in found' });
  attendance.checkOutAt = new Date();
  attendance.checkOutLocation = req.body.location;
  attendance.totalWorkingMinutes = Math.max(0, Math.round((attendance.checkOutAt - attendance.checkInAt) / 60000));
  await attendance.save();
  res.json(attendance);
};

export const getContractorDashboard = async (req, res) => {
  const contractor = await getUserContractor(req.user);
  if (!contractor) return res.status(403).json({ message: 'Contractor access required' });
  const [workOrders, bills, workers, issues] = await Promise.all([
    WorkOrder.find({ contractorId: contractor._id, deletedAt: null }).lean(),
    RunningBill.find({ contractorId: contractor._id }).lean(),
    Worker.countDocuments({ contractorId: contractor._id, employmentStatus: 'active', deletedAt: null }),
    Issue.countDocuments({ companyId: req.user.companyId, status: { $nin: ['resolved', 'closed'] }, severity: { $in: ['high', 'critical'] } }),
  ]);
  res.json({
    contractor,
    summary: {
      totalWorkOrders: workOrders.length,
      inProgress: workOrders.filter((wo) => wo.status === 'in_progress').length,
      completed: workOrders.filter((wo) => ['completed', 'closed'].includes(wo.status)).length,
      pendingBills: bills.filter((bill) => ['draft', 'submitted', 'under_verification'].includes(bill.status)).length,
      approvedBills: bills.filter((bill) => ['approved', 'paid'].includes(bill.status)).length,
      outstandingPayment: bills.reduce((sum, bill) => sum + Math.max(0, (bill.netPayable || 0) - (bill.paidAmount || 0)), 0),
      labourDeployedToday: workers,
      openQualityIssues: issues,
    },
    workOrders,
    bills,
  });
};

export const getStoreDashboard = async (req, res) => {
  const store = await getUserStore(req.user);
  if (!store) return res.status(403).json({ message: 'Store access required' });
  const inventory = await getInventoryRows(req.user.companyId, store._id);
  const lowStock = inventory.filter((row) => row.availableStock > 0 && row.availableStock <= row.reorderLevel).length;
  res.json({
    store,
    summary: {
      totalMaterialItems: inventory.length,
      inStock: inventory.filter((row) => row.availableStock > row.reorderLevel).length,
      lowStock,
      outOfStock: inventory.filter((row) => row.availableStock <= 0).length,
      pendingReceipts: 0,
      pendingMaterialRequests: 0,
      damagedItems: 0,
      stockValue: inventory.reduce((sum, row) => sum + row.stockValue, 0),
    },
    inventory,
  });
};

export const getStoreInventory = async (req, res) => {
  const store = await getUserStore(req.user);
  if (!store) return res.status(403).json({ message: 'Store access required' });
  res.json(await getInventoryRows(req.user.companyId, store._id));
};

export const createStockReceipt = async (req, res) => {
  const store = await getUserStore(req.user);
  const material = await Material.findOne({ _id: req.body.materialId, companyId: req.user.companyId, deletedAt: null });
  if (!store || !material) return res.status(404).json({ message: 'Store or material not found' });
  const balance = await currentStock(store._id, material._id);
  const quantity = Number(req.body.quantity || 0);
  const unitRate = Number(req.body.unitRate || 0);
  const tx = await StockTransaction.create({
    companyId: req.user.companyId,
    projectId: store.projectId,
    storeId: store._id,
    materialId: material._id,
    transactionType: 'GRN receipt',
    referenceType: 'material_receipt',
    referenceNumber: req.body.referenceNumber,
    inwardQuantity: quantity,
    balanceAfter: balance + quantity,
    unitRate,
    totalValue: quantity * unitRate,
    createdBy: req.user._id,
  });
  res.status(201).json(tx);
};

export const createStockIssue = async (req, res) => {
  const store = await getUserStore(req.user);
  const material = await Material.findOne({ _id: req.body.materialId, companyId: req.user.companyId, deletedAt: null });
  if (!store || !material) return res.status(404).json({ message: 'Store or material not found' });
  const balance = await currentStock(store._id, material._id);
  const quantity = Number(req.body.quantity || 0);
  if (quantity > balance) return res.status(400).json({ message: 'Cannot issue more than available stock' });
  const tx = await StockTransaction.create({
    companyId: req.user.companyId,
    projectId: store.projectId,
    storeId: store._id,
    materialId: material._id,
    transactionType: 'Material issue',
    referenceType: 'material_issue',
    referenceNumber: req.body.referenceNumber,
    outwardQuantity: quantity,
    balanceAfter: balance - quantity,
    unitRate: Number(req.body.unitRate || 0),
    totalValue: quantity * Number(req.body.unitRate || 0),
    createdBy: req.user._id,
  });
  res.status(201).json(tx);
};

const scopedQuery = (req) => ({ projectId: req.query.projectId, siteId: req.query.siteId, date: req.query.date || new Date() });
const dayStart = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};
const dayRange = (date) => {
  const start = dayStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end, match: { $gte: start, $lt: end } };
};
const getTradeShortages = async (companyId, projectId, siteId, range) => {
  const match = { companyId, attendanceDate: range.match, status: { $in: ['present', 'late', 'half_day'] } };
  if (projectId) match.projectId = projectId;
  if (siteId) match.siteId = siteId;
  const rows = await Attendance.aggregate([{ $match: match }, { $group: { _id: '$trade', present: { $sum: '$workerCount' } } }]);
  return rows.map((row) => ({ trade: row._id || 'Unassigned', assigned: row.present, present: row.present, required: row.present, shortage: 0 }));
};
const serializeWorker = (worker) => ({ id: worker._id, workerCode: worker.employeeCode, name: `${worker.firstName} ${worker.lastName}`, mobile: worker.mobile, trade: worker.trade, dailyWage: worker.dailyWage, safetyInductionStatus: worker.safetyInductionStatus });
const getUserContractor = async (user) => Contractor.findOne({ companyId: user.companyId, userIds: user._id, deletedAt: null });
const getUserStore = async (user) => Store.findOne({ companyId: user.companyId, managerIds: user._id, deletedAt: null });
const currentStock = async (storeId, materialId) => {
  const last = await StockTransaction.findOne({ storeId, materialId }).sort({ transactionDate: -1, createdAt: -1 }).lean();
  return last?.balanceAfter || 0;
};
const getInventoryRows = async (companyId, storeId) => {
  const materials = await Material.find({ companyId, deletedAt: null }).lean();
  return Promise.all(materials.map(async (material) => {
    const txs = await StockTransaction.find({ storeId, materialId: material._id }).lean();
    const inward = txs.reduce((sum, tx) => sum + (tx.inwardQuantity || 0), 0);
    const outward = txs.reduce((sum, tx) => sum + (tx.outwardQuantity || 0), 0);
    const current = inward - outward;
    const unitRate = txs.filter((tx) => tx.unitRate).at(-1)?.unitRate || 0;
    return { materialId: material._id, materialCode: material.materialCode, materialName: material.name, category: material.category, unit: material.unit, received: inward, issued: outward, currentStock: current, reservedStock: 0, availableStock: current, reorderLevel: material.reorderLevel, stockValue: current * unitRate, status: current <= 0 ? 'Out of Stock' : current <= material.reorderLevel ? 'Low Stock' : 'In Stock' };
  }));
};

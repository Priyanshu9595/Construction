import Expense from '../models/Expense.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import QualityInspection from '../models/QualityInspection.js';
import SafetyIncident from '../models/SafetyIncident.js';
import Site from '../models/Site.js';

// Get Sites
export const getSites = async (req, res) => {
  try {
    const sites = await Site.find({ projectId: req.params.projectId, deletedAt: null });
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sites', error: error.message });
  }
};

// Create Site
export const createSite = async (req, res) => {
  try {
    const site = await Site.create({ ...req.body, projectId: req.params.projectId, companyId: req.user.companyId });
    res.status(201).json(site);
  } catch (error) {
    res.status(400).json({ message: 'Error creating site', error: error.message });
  }
};

// Expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ projectId: req.params.projectId, deletedAt: null }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const invoiceNumber = req.body.invoiceNumber || `EXP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const amount = Number(req.body.amount || req.body.totalAmount || 0);
    const expense = await Expense.create({
      ...req.body,
      invoiceNumber,
      amount,
      totalAmount: Number(req.body.totalAmount || amount),
      projectId: req.params.projectId,
      companyId: req.user.companyId,
      createdBy: req.user._id,
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: 'Error creating expense', error: error.message });
  }
};

// Purchase Orders
export const getPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find({ projectId: req.params.projectId, deletedAt: null }).sort({ poDate: -1 }).populate('vendorId');
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchase orders', error: error.message });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.create({ ...req.body, projectId: req.params.projectId, companyId: req.user.companyId, createdBy: req.user._id });
    res.status(201).json(po);
  } catch (error) {
    res.status(400).json({ message: 'Error creating PO', error: error.message });
  }
};

// Quality Inspections
export const getQualityInspections = async (req, res) => {
  try {
    const inspections = await QualityInspection.find({ projectId: req.params.projectId, deletedAt: null }).sort({ inspectionDate: -1 }).populate('inspectorId');
    res.json(inspections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inspections', error: error.message });
  }
};

export const createQualityInspection = async (req, res) => {
  try {
    const insp = await QualityInspection.create({ ...req.body, projectId: req.params.projectId, companyId: req.user.companyId, inspectorId: req.user._id });
    res.status(201).json(insp);
  } catch (error) {
    res.status(400).json({ message: 'Error creating inspection', error: error.message });
  }
};

// Safety Incidents
export const getSafetyIncidents = async (req, res) => {
  try {
    const incidents = await SafetyIncident.find({ projectId: req.params.projectId, deletedAt: null }).sort({ incidentDate: -1 }).populate('reportedBy');
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incidents', error: error.message });
  }
};

export const createSafetyIncident = async (req, res) => {
  try {
    const incident = await SafetyIncident.create({ ...req.body, projectId: req.params.projectId, companyId: req.user.companyId, reportedBy: req.user._id });
    res.status(201).json(incident);
  } catch (error) {
    res.status(400).json({ message: 'Error creating incident', error: error.message });
  }
};

import Approval from '../models/Approval.js';
import Client from '../models/Client.js';
import ClientInvoice from '../models/ClientInvoice.js';
import ClientQuery from '../models/ClientQuery.js';
import Expense from '../models/Expense.js';
import NCR from '../models/NCR.js';
import Payment from '../models/Payment.js';
import ProgressEntry from '../models/ProgressEntry.js';
import Project from '../models/Project.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import QualityInspection from '../models/QualityInspection.js';
import RFQ from '../models/RFQ.js';
import SafetyIncident from '../models/SafetyIncident.js';
import SitePhoto from '../models/SitePhoto.js';

export const getPurchaseDashboard = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const [requests, openRfqs, purchaseOrders, pendingApprovals, invoices] = await Promise.all([
      PurchaseRequest.find({ companyId, deletedAt: null }).lean(),
      RFQ.countDocuments({ companyId, status: { $in: ['open', 'sent'] }, deletedAt: null }),
      PurchaseOrder.find({ companyId, deletedAt: null }).populate('vendorId', 'name').populate('projectId', 'name').sort({ createdAt: -1 }).limit(8).lean(),
      Approval.countDocuments({ companyId, status: 'pending', type: /purchase/i }),
      Expense.countDocuments({ companyId, status: { $in: ['submitted', 'under_review'] }, category: /vendor|material/i, deletedAt: null }),
    ]);
    const now = new Date();
    res.json({
      summary: {
        purchaseRequests: requests.filter((r) => r.status !== 'closed').length,
        openRfqs,
        purchaseOrders: purchaseOrders.filter((po) => ['issued', 'vendor_accepted', 'partially_delivered'].includes(po.status)).length,
        pendingDeliveries: purchaseOrders.filter((po) => pendingQty(po) > 0).length,
        pendingApprovals,
        totalPurchaseValue: purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0),
        delayedOrders: purchaseOrders.filter((po) => po.expectedDeliveryDate && po.expectedDeliveryDate < now && pendingQty(po) > 0).length,
        pendingVendorInvoices: invoices,
      },
      recentOrders: purchaseOrders.map((po) => ({ id: po._id, poNumber: po.purchaseOrderNumber, vendor: po.vendorId?.name || '', project: po.projectId?.name || '', amount: po.totalAmount, orderDate: po.createdAt, expectedDelivery: po.expectedDeliveryDate, deliveryProgress: deliveryProgress(po), paymentTerms: po.paymentTerms, status: po.status })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load purchase dashboard', error: error.message });
  }
};

export const getFinanceDashboard = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const [expenses, payments, clientInvoices, contractorApprovals] = await Promise.all([
      Expense.find({ companyId, deletedAt: null }).lean(),
      Payment.find({}).populate('companyId').lean(),
      ClientInvoice.find({ companyId, deletedAt: null }).lean(),
      Approval.countDocuments({ companyId, status: 'pending', type: /payment|expense|bill/i }),
    ]);
    const postedExpenses = expenses.filter((e) => ['approved', 'posted', 'paid'].includes(e.status));
    const paidPayments = payments.filter((p) => p.status === 'successful');
    res.json({
      summary: {
        totalExpenses: postedExpenses.reduce((sum, e) => sum + (e.totalAmount || 0), 0),
        totalIncome: paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        payables: expenses.filter((e) => ['approved', 'posted'].includes(e.status)).reduce((sum, e) => sum + (e.totalAmount || 0), 0),
        receivables: clientInvoices.reduce((sum, inv) => sum + Math.max(0, (inv.amount || 0) + (inv.tax || 0) - (inv.paidAmount || 0)), 0),
        cashInHand: paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0) - postedExpenses.reduce((sum, e) => sum + (e.totalAmount || 0), 0),
        bankBalance: paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        pendingApprovals: contractorApprovals,
        overduePayments: clientInvoices.filter((inv) => inv.dueDate && inv.dueDate < new Date() && inv.status !== 'paid').length,
      },
      cashflow: buildCashFlow(expenses, paidPayments),
      expenseCategories: groupByAmount(postedExpenses, 'category', 'totalAmount'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load finance dashboard', error: error.message });
  }
};

export const getQualityDashboard = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const [inspections, ncrs] = await Promise.all([
      QualityInspection.find({ companyId, deletedAt: null }).populate('projectId', 'name').populate('siteId', 'name').sort({ createdAt: -1 }).limit(10).lean(),
      NCR.find({ companyId, deletedAt: null }).lean(),
    ]);
    const passed = inspections.filter((i) => ['passed', 'passed_with_observation'].includes(i.result)).length;
    const failed = inspections.filter((i) => ['failed', 'reinspection_required'].includes(i.result)).length;
    const pending = inspections.filter((i) => ['requested', 'scheduled', 'in_progress'].includes(i.status)).length;
    const openNcrs = ncrs.filter((n) => n.status !== 'closed').length;
    const score = inspections.length ? Math.max(0, Math.round((passed / inspections.length) * 100 - openNcrs * 2)) : 0;
    res.json({ summary: { totalInspections: inspections.length, passedInspections: passed, failedInspections: failed, pendingInspections: pending, openNCRs: openNcrs, reworkPending: ncrs.filter((n) => n.status === 'corrective_action').length, testsAwaitingResults: pending, qualityScore: score }, inspections });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load quality dashboard', error: error.message });
  }
};

export const getSafetyDashboard = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const incidents = await SafetyIncident.find({ companyId, deletedAt: null }).populate('projectId', 'name').populate('siteId', 'name').sort({ createdAt: -1 }).limit(10).lean();
    const critical = incidents.filter((i) => i.severity === 'critical').length;
    const open = incidents.filter((i) => i.status !== 'closed').length;
    const score = incidents.length ? Math.max(0, 100 - critical * 15 - open * 3) : 100;
    res.json({ summary: { inspections: 0, incidents: incidents.length, nearMisses: incidents.filter((i) => i.incidentType === 'near_miss').length, openActions: open, criticalIncidents: critical, complianceScore: score }, incidents });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load safety dashboard', error: error.message });
  }
};

export const getClientDashboard = async (req, res) => {
  try {
    const client = await Client.findOne({ companyId: req.user.companyId, userIds: req.user._id, deletedAt: null }).lean();
    if (!client) return res.status(403).json({ message: 'Client access required' });
    const [projects, invoices, queries, photos] = await Promise.all([
      Project.find({ _id: { $in: client.projectIds }, deletedAt: null }).lean(),
      ClientInvoice.find({ clientId: client._id, deletedAt: null }).lean(),
      ClientQuery.find({ clientId: client._id }).sort({ createdAt: -1 }).limit(8).lean(),
      SitePhoto.find({ projectId: { $in: client.projectIds }, approvalStatus: 'approved' }).sort({ uploadedAt: -1 }).limit(8).lean(),
    ]);
    const progress = projects.length ? Math.round(projects.reduce((sum, p) => sum + (p.progressPercentage || p.progress || 0), 0) / projects.length) : 0;
    res.json({ client, summary: { projects: projects.length, overallProgress: progress, pendingApprovals: 0, dueInvoices: invoices.filter((i) => i.status !== 'paid').length, dueAmount: invoices.reduce((sum, i) => sum + Math.max(0, (i.amount || 0) + (i.tax || 0) - (i.paidAmount || 0)), 0), openQueries: queries.filter((q) => q.status !== 'closed').length }, projects, invoices, queries, photos });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load client dashboard', error: error.message });
  }
};

const pendingQty = (po) => (po.items || []).reduce((sum, item) => sum + Math.max(0, (item.quantity || 0) - (item.deliveredQuantity || 0)), 0);
const deliveryProgress = (po) => {
  const total = (po.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  const delivered = (po.items || []).reduce((sum, item) => sum + (item.deliveredQuantity || 0), 0);
  return total ? Math.round((delivered / total) * 100) : 0;
};
const groupByAmount = (rows, key, amountKey) => Object.values(rows.reduce((map, row) => {
  const name = row[key] || 'Other';
  map[name] = map[name] || { name, value: 0 };
  map[name].value += row[amountKey] || 0;
  return map;
}, {}));
const buildCashFlow = (expenses, payments) => {
  const map = {};
  expenses.forEach((e) => { const d = new Date(e.expenseDate || e.createdAt).toISOString().slice(0, 10); map[d] = map[d] || { date: d, inflow: 0, outflow: 0 }; map[d].outflow += e.totalAmount || 0; });
  payments.forEach((p) => { const d = new Date(p.paymentDate || p.createdAt).toISOString().slice(0, 10); map[d] = map[d] || { date: d, inflow: 0, outflow: 0 }; map[d].inflow += p.amount || 0; });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).map((row) => ({ ...row, net: row.inflow - row.outflow }));
};

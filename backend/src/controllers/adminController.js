import Company from '../models/Company.js';
import Payment from '../models/Payment.js';
import Project from '../models/Project.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import SupportTicket from '../models/SupportTicket.js';
import SystemLog from '../models/SystemLog.js';
import User from '../models/User.js';
import PlatformExpense from '../models/PlatformExpense.js';
import Expense from '../models/Expense.js';

const PLAN_COLORS = ['#2563eb', '#f97316', '#7c3aed', '#16a34a', '#0891b2', '#64748b'];

// @desc    Get all companies
// @route   GET /api/admin/companies
// @access  Private/SuperAdmin
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}).populate('planId', 'name price');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching companies', error: error.message });
  }
};

// @desc    Create company
// @route   POST /api/admin/companies
// @access  Private/SuperAdmin
export const createCompany = async (req, res) => {
  try {
    const {
      companyName,
      email,
      phone,
      address,
      status,
      planId,
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerPassword,
    } = req.body;

    if (!companyName || !email) {
      return res.status(400).json({ message: 'Company name and email are required' });
    }

    const normalizedOwnerEmail = (ownerEmail || email)?.toLowerCase().trim();
    if (!normalizedOwnerEmail) {
      return res.status(400).json({ message: 'Owner email is required' });
    }

    const existingOwner = await User.findOne({ email: normalizedOwnerEmail });
    if (existingOwner) {
      return res.status(400).json({ message: 'Owner email is already linked to another user' });
    }

    const company = await Company.create({
      companyName,
      email,
      phone,
      address,
      status: status || 'pending',
      planId: planId || undefined,
    });

    const owner = await User.create({
      firstName: ownerFirstName || companyName.split(' ')[0] || 'Company',
      lastName: ownerLastName || 'Owner',
      email: normalizedOwnerEmail,
      password: ownerPassword || '123456',
      role: 'company_owner',
      isActive: status !== 'blocked',
      companyId: company._id,
      designation: 'Company Owner',
      department: 'Management',
    });

    company.ownerId = owner._id;
    await company.save();

    await SystemLog.create({
      action: `Company created with owner: ${company.companyName}`,
      performedBy: req.user._id,
      details: { companyId: company._id, email: company.email, ownerId: owner._id, ownerEmail: owner.email },
      ipAddress: req.ip,
    });

    res.status(201).json({ company, owner: { id: owner._id, email: owner.email, role: owner.role } });
  } catch (error) {
    res.status(400).json({ message: 'Error creating company', error: error.message });
  }
};

// @desc    Update company
// @route   PATCH /api/admin/companies/:id
// @access  Private/SuperAdmin
export const updateCompany = async (req, res) => {
  try {
    const allowedFields = ['companyName', 'email', 'phone', 'address', 'status', 'planId', 'ownerId'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );
    const company = await Company.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    let owner;
    if (req.body.ownerEmail) {
      const normalizedOwnerEmail = req.body.ownerEmail.toLowerCase().trim();
      owner = await User.findOne({ email: normalizedOwnerEmail });

      if (owner && owner.companyId?.toString() !== company._id.toString()) {
        return res.status(400).json({ message: 'Owner email is already linked to another company' });
      }

      if (owner) {
        owner.firstName = req.body.ownerFirstName || owner.firstName;
        owner.lastName = req.body.ownerLastName || owner.lastName;
        owner.role = 'company_owner';
        owner.companyId = company._id;
        owner.isActive = company.status !== 'blocked';
        if (req.body.ownerPassword) {
          owner.password = req.body.ownerPassword;
        }
        await owner.save();
      } else {
        owner = await User.create({
          firstName: req.body.ownerFirstName || company.companyName.split(' ')[0] || 'Company',
          lastName: req.body.ownerLastName || 'Owner',
          email: normalizedOwnerEmail,
          password: req.body.ownerPassword || '123456',
          role: 'company_owner',
          isActive: company.status !== 'blocked',
          companyId: company._id,
          designation: 'Company Owner',
          department: 'Management',
        });
      }

      company.ownerId = owner._id;
      await company.save();
    }

    await SystemLog.create({
      action: owner ? `Company owner assigned: ${company.companyName}` : `Company updated: ${company.companyName}`,
      performedBy: req.user._id,
      details: { companyId: company._id, updates, ownerId: owner?._id, ownerEmail: owner?.email },
      ipAddress: req.ip,
    });

    res.json(company);
  } catch (error) {
    res.status(400).json({ message: 'Error updating company', error: error.message });
  }
};

// @desc    Delete company
// @route   DELETE /api/admin/companies/:id
// @access  Private/SuperAdmin
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Cleanup related data
    await User.deleteMany({ companyId: company._id });
    await Project.deleteMany({ companyId: company._id });
    
    await company.deleteOne();

    await SystemLog.create({
      action: `Company deleted: ${company.companyName}`,
      performedBy: req.user._id,
      details: { companyId: company._id },
      ipAddress: req.ip,
    });

    res.json({ message: 'Company removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting company', error: error.message });
  }
};

// @desc    Get all plans
// @route   GET /api/admin/plans
// @access  Private/SuperAdmin
export const getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({});
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching plans', error: error.message });
  }
};

// @desc    Create a new plan
// @route   POST /api/admin/plans
// @access  Private/SuperAdmin
export const createPlan = async (req, res) => {
  try {
    const newPlan = new SubscriptionPlan(req.body);
    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (error) {
    res.status(400).json({ message: 'Error creating plan', error: error.message });
  }
};

// @desc    Get Super Admin module data
// @route   GET /api/admin/modules/:module
// @access  Private/SuperAdmin
export const getAdminModuleData = async (req, res) => {
  try {
    const module = req.params.module;
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (module === 'companies') {
      const [companies, totalCompanies, activeCompanies, newThisMonth] = await Promise.all([
        Company.find({})
          .sort({ createdAt: -1 })
          .limit(100)
          .populate('ownerId', 'firstName lastName email')
          .lean(),
        Company.countDocuments(),
        Company.countDocuments({ status: 'active' }),
        Company.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      ]);

      return res.json({
        title: 'Companies',
        stats: [
          { label: 'Total Companies', value: totalCompanies, tone: 'blue' },
          { label: 'Active Companies', value: activeCompanies, tone: 'emerald' },
          { label: 'New This Month', value: newThisMonth, tone: 'purple' },
        ],
        columns: ['Company', 'Owner', 'Email', 'Phone', 'Status', 'Joined'],
        rows: companies.map((company) => ({
          id: company._id,
          cells: [
            company.companyName,
            company.ownerId ? `${company.ownerId.firstName || ''} ${company.ownerId.lastName || ''}`.trim() || company.ownerId.email : 'Not assigned',
            company.email || '-',
            company.phone || '-',
            company.status || 'pending',
            company.createdAt,
          ],
        })),
      });
    }

    if (module === 'users') {
      const [users, totalUsers, activeUsers, inactiveUsers] = await Promise.all([
        User.find({ deletedAt: null })
          .sort({ createdAt: -1 })
          .limit(100)
          .populate('companyId', 'companyName')
          .select('firstName lastName email role isActive companyId lastLoginAt createdAt')
          .lean(),
        User.countDocuments({ deletedAt: null }),
        User.countDocuments({ deletedAt: null, isActive: true }),
        User.countDocuments({ deletedAt: null, isActive: false }),
      ]);

      return res.json({
        title: 'Users',
        stats: [
          { label: 'Total Users', value: totalUsers, tone: 'blue' },
          { label: 'Active Users', value: activeUsers, tone: 'emerald' },
          { label: 'Inactive Users', value: inactiveUsers, tone: 'amber' },
        ],
        columns: ['User', 'Email', 'Role', 'Company', 'Status', 'Last Login'],
        rows: users.map((user) => ({
          id: user._id,
          cells: [
            `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            user.email,
            user.role,
            user.companyId?.companyName || 'Platform',
            user.isActive ? 'active' : 'inactive',
            user.lastLoginAt || '',
          ],
        })),
      });
    }

    if (module === 'logs') {
      const [logs, totalLogs, loginEvents] = await Promise.all([
        SystemLog.find({})
          .sort({ createdAt: -1 })
          .limit(100)
          .populate('performedBy', 'firstName lastName email role')
          .lean(),
        SystemLog.countDocuments(),
        SystemLog.countDocuments({ action: /login/i }),
      ]);

      return res.json({
        title: 'System Logs',
        stats: [
          { label: 'Total Logs', value: totalLogs, tone: 'blue' },
          { label: 'Login Events', value: loginEvents, tone: 'purple' },
          { label: 'Recent Rows', value: logs.length, tone: 'slate' },
        ],
        columns: ['Action', 'Performed By', 'Role', 'IP Address', 'Date'],
        rows: logs.map((log) => ({
          id: log._id,
          cells: [
            log.action,
            log.performedBy ? `${log.performedBy.firstName || ''} ${log.performedBy.lastName || ''}`.trim() || log.performedBy.email : 'System',
            log.performedBy?.role || '-',
            log.ipAddress || '-',
            log.createdAt,
          ],
        })),
      });
    }

    if (module === 'announcements') {
      const [companies, users, recentLogs] = await Promise.all([
        Company.countDocuments({ status: 'active' }),
        User.countDocuments({ deletedAt: null, isActive: true }),
        SystemLog.find({ action: /announcement/i }).sort({ createdAt: -1 }).limit(50).populate('performedBy', 'firstName lastName email').lean(),
      ]);

      return res.json({
        title: 'Announcements',
        stats: [
          { label: 'Reachable Companies', value: companies, tone: 'blue' },
          { label: 'Reachable Users', value: users, tone: 'emerald' },
          { label: 'Sent Announcements', value: recentLogs.length, tone: 'purple' },
        ],
        columns: ['Announcement Activity', 'Sent By', 'Date'],
        rows: recentLogs.map((log) => ({
          id: log._id,
          cells: [
            log.action,
            log.performedBy ? `${log.performedBy.firstName || ''} ${log.performedBy.lastName || ''}`.trim() || log.performedBy.email : 'System',
            log.createdAt,
          ],
        })),
        emptyTitle: 'No announcements have been sent yet.',
        emptyDescription: 'Announcement history will appear here after messages are sent.',
      });
    }

    if (module === 'support') {
      const [tickets, openTickets, criticalTickets, resolvedTickets] = await Promise.all([
        SupportTicket.find({})
          .sort({ createdAt: -1 })
          .limit(100)
          .populate('companyId', 'companyName')
          .populate('userId', 'firstName lastName email')
          .lean(),
        SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
        SupportTicket.countDocuments({ priority: 'critical', status: { $in: ['open', 'in_progress'] } }),
        SupportTicket.countDocuments({ status: { $in: ['resolved', 'closed'] } }),
      ]);

      return res.json({
        title: 'Support Tickets',
        stats: [
          { label: 'Open Tickets', value: openTickets, tone: openTickets ? 'amber' : 'emerald' },
          { label: 'Critical Open', value: criticalTickets, tone: criticalTickets ? 'red' : 'emerald' },
          { label: 'Resolved / Closed', value: resolvedTickets, tone: 'blue' },
        ],
        columns: ['Subject', 'Company', 'Raised By', 'Priority', 'Status', 'Created'],
        rows: tickets.map((ticket) => ({
          id: ticket._id,
          cells: [
            ticket.subject,
            ticket.companyId?.companyName || '-',
            ticket.userId ? `${ticket.userId.firstName || ''} ${ticket.userId.lastName || ''}`.trim() || ticket.userId.email : '-',
            ticket.priority,
            ticket.status,
            ticket.createdAt,
          ],
        })),
      });
    }

    if (module === 'settings') {
      const [companies, users, projects, platformExpenses] = await Promise.all([
        Company.countDocuments(),
        User.countDocuments({ deletedAt: null }),
        Project.countDocuments({ deletedAt: null }),
        PlatformExpense.countDocuments(),
      ]);

      return res.json({
        title: 'Settings',
        stats: [
          { label: 'Companies', value: companies, tone: 'blue' },
          { label: 'Users', value: users, tone: 'emerald' },
          { label: 'Projects', value: projects, tone: 'purple' },
        ],
        columns: ['Setting', 'Current Value', 'Status'],
        rows: [
          { id: 'platform-uptime', cells: ['Platform uptime', `${process.env.PLATFORM_UPTIME || 100}%`, 'active'] },
          { id: 'currency', cells: ['Default currency', 'INR', 'active'] },
          { id: 'expense-records', cells: ['Platform expense records', platformExpenses, 'active'] },
        ],
      });
    }

    res.status(404).json({ message: 'Admin module not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error loading admin module', error: error.message });
  }
};

// @desc    Get dynamic Super Admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/SuperAdmin
export const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfLast30Days = new Date(now);
    startOfLast30Days.setDate(now.getDate() - 30);
    const startOfPrevious30Days = new Date(now);
    startOfPrevious30Days.setDate(now.getDate() - 60);

    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalProjects,
      companiesThisMonth,
      usersThisMonth,
      projectsThisMonth,
      plans,
      companies,
      recentCompanies,
      ticketsOpen,
      ticketsCritical,
      pendingApprovals,
      supportCritical,
      suspiciousLogins,
      recentLogs,
      monthlyCompanyRegistrations,
      thisMonthRevenue,
      previousMonthRevenue,
      last30DaysRevenue,
      previous30DaysRevenue,
      failedOrPendingPayments,
      thisMonthExpenses,
      last30DaysExpenses,
      recentExpenses,
      totalCompanyExpenses,
      platformProjectRevenue,
      last30DaysProjectRevenue,
      previous30DaysProjectRevenue,
    ] = await Promise.all([
      Company.countDocuments(),
      Company.countDocuments({ status: 'active' }),
      User.countDocuments(),
      Project.countDocuments(),
      Company.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Project.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      SubscriptionPlan.find({}).sort({ price: 1 }).lean(),
      Company.find({}).populate('planId', 'name price maxUsers').lean(),
      Company.find({}).sort({ createdAt: -1 }).limit(5).populate('planId', 'name price maxUsers').lean(),
      SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      SupportTicket.countDocuments({ priority: 'critical', status: { $in: ['open', 'in_progress'] } }),
      Company.countDocuments({ status: 'pending' }),
      SupportTicket.countDocuments({ priority: 'critical', status: { $in: ['open', 'in_progress'] } }),
      SystemLog.countDocuments({ action: /login/i, createdAt: { $gte: startOfLast30Days } }),
      SystemLog.find({}).sort({ createdAt: -1 }).limit(5).populate('performedBy', 'firstName lastName email').lean(),
      Company.aggregate([
        { $match: { createdAt: { $gte: startOfYear } } },
        { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        { $match: { status: 'successful', paymentDate: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'successful', paymentDate: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'successful', paymentDate: { $gte: startOfLast30Days } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'successful', paymentDate: { $gte: startOfPrevious30Days, $lt: startOfLast30Days } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.countDocuments({ status: { $in: ['failed', 'pending'] } }),
      PlatformExpense.aggregate([
        { $match: { date: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      PlatformExpense.aggregate([
        { $match: { date: { $gte: startOfLast30Days } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      PlatformExpense.find({}).sort({ date: -1 }).limit(5).populate('recordedBy', 'firstName lastName').lean(),
      Expense.aggregate([
        { $match: activeExpenseMatch() },
        { $group: { _id: null, total: { $sum: expenseAmountExpression } } },
      ]),
      Project.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: null, total: { $sum: recognizedProjectRevenueExpression } } },
      ]),
      Project.aggregate([
        { $match: { deletedAt: null, updatedAt: { $gte: startOfLast30Days } } },
        { $group: { _id: null, total: { $sum: recognizedProjectRevenueExpression } } },
      ]),
      Project.aggregate([
        { $match: { deletedAt: null, updatedAt: { $gte: startOfPrevious30Days, $lt: startOfLast30Days } } },
        { $group: { _id: null, total: { $sum: recognizedProjectRevenueExpression } } },
      ]),
    ]);

    const companyIds = companies.map((company) => company._id);
    const userCounts = await User.aggregate([
      { $match: { companyId: { $in: companyIds } } },
      { $group: { _id: '$companyId', count: { $sum: 1 } } },
    ]);
    const projectCounts = await Project.aggregate([
      { $match: { companyId: { $in: companyIds } } },
      { $group: { _id: '$companyId', count: { $sum: 1 } } },
    ]);
    const owners = await User.find({
      companyId: { $in: companyIds },
      role: { $in: ['company_owner', 'company_admin', 'admin'] },
    }).select('firstName lastName email companyId role').lean();

    const userCountByCompany = toCountMap(userCounts);
    const projectCountByCompany = toCountMap(projectCounts);
    const ownerRolePriority = { company_owner: 3, company_admin: 2, admin: 1 };
    const ownerByCompany = owners.reduce((map, owner) => {
      const key = owner.companyId?.toString();
      if (key && (!map[key] || ownerRolePriority[owner.role] > map[key].priority)) {
        map[key] = {
          name: `${owner.firstName} ${owner.lastName}`.trim(),
          firstName: owner.firstName,
          lastName: owner.lastName,
          email: owner.email,
          priority: ownerRolePriority[owner.role],
        };
      }
      return map;
    }, {});

    const planRows = buildPlanRows(plans, companies);
    const monthlyRevenue = sumAggregate(platformProjectRevenue);
    const previousRevenue = 0;
    const last30Revenue = sumAggregate(last30DaysProjectRevenue);
    const previous30Revenue = sumAggregate(previous30DaysProjectRevenue);
    const revenueGrowth = calculateGrowth(last30Revenue || monthlyRevenue, previous30Revenue || previousRevenue);

    const monthlyExpenses = sumAggregate(thisMonthExpenses);
    const totalCompanyExpenseValue = totalCompanyExpenses[0]?.total || 0;
    const netProfit = monthlyRevenue - monthlyExpenses - totalCompanyExpenseValue;

    res.json({
      generatedAt: now,
      stats: {
        totalCompanies,
        activeCompanies,
        totalUsers,
        totalProjects,
        companiesThisMonth,
        usersThisMonth,
        projectsThisMonth,
        activationRate: totalCompanies ? Number(((activeCompanies / totalCompanies) * 100).toFixed(1)) : 0,
      },
      financials: {
        revenue: monthlyRevenue,
        expenses: monthlyExpenses,
        totalCompanyExpenses: totalCompanyExpenseValue,
        netProfit,
        recentExpenses: recentExpenses.map((exp) => ({
          id: exp._id,
          title: exp.title,
          amount: exp.amount,
          category: exp.category,
          date: exp.date,
        }))
      },
      platformGrowth: buildMonthlyGrowth(monthlyCompanyRegistrations, currentYear, now.getMonth()),
      companiesByPlan: planRows,
      recentCompanies: recentCompanies.map((company) => {
        const key = company._id.toString();
        const ownerInfo = ownerByCompany[key];
        return {
          id: company._id,
          company: company.companyName,
          email: company.email || '',
          phone: company.phone || '',
          address: company.address || '',
          owner: ownerInfo?.name || '',
          ownerFirstName: ownerInfo?.firstName || '',
          ownerLastName: ownerInfo?.lastName || '',
          ownerEmail: ownerInfo?.email || '',
          plan: company.planId?.name || 'Unassigned',
          planId: company.planId?._id || '',
          users: userCountByCompany[key] || 0,
          projects: projectCountByCompany[key] || 0,
          joinedDate: company.registrationDate || company.createdAt,
          status: company.status,
          initials: getInitials(company.companyName),
        };
      }),
      subscriptionOverview: {
        plans: planRows.map((plan) => ({
          plan: plan.name,
          companies: plan.companies,
          monthlyRevenue: plan.monthlyRevenue,
        })),
        totalMonthlyRevenue: monthlyRevenue,
        totalMonthlyExpenses: monthlyExpenses,
        annualRecurringRevenue: monthlyRevenue * 12,
        revenueGrowth,
      },
      recentActivity: recentLogs.map((log) => ({
        id: log._id,
        message: formatLogMessage(log),
        timestamp: log.createdAt,
      })),
      alerts: [
        { key: 'pendingApprovals', label: 'company approvals pending', count: pendingApprovals, severity: 'warning' },
        { key: 'overduePayments', label: 'payments needing review', count: failedOrPendingPayments, severity: 'danger' },
        { key: 'criticalTickets', label: 'critical support tickets', count: supportCritical, severity: 'danger' },
        { key: 'companiesNearUserLimit', label: 'companies nearing user limit', count: countCompaniesNearUserLimit(companies, userCountByCompany), severity: 'warning' },
        { key: 'suspiciousLogins', label: 'suspicious login attempts', count: suspiciousLogins, severity: 'danger' },
      ],
      performance: {
        platformUptime: Number(process.env.PLATFORM_UPTIME || 100),
        monthlyRevenue,
        monthlyExpenses,
        netProfit,
        revenueGrowth,
        activeSupportTickets: ticketsOpen,
        criticalSupportTickets: ticketsCritical,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching dashboard', error: error.message });
  }
};

// @desc    Get all platform expenses
// @route   GET /api/admin/expenses
// @access  Private/SuperAdmin
export const getPlatformExpenses = async (req, res) => {
  try {
    const expenses = await PlatformExpense.find({}).sort({ date: -1 }).populate('recordedBy', 'firstName lastName');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching platform expenses', error: error.message });
  }
};

// @desc    Create platform expense
// @route   POST /api/admin/expenses
// @access  Private/SuperAdmin
export const createPlatformExpense = async (req, res) => {
  try {
    const expense = await PlatformExpense.create({
      ...req.body,
      recordedBy: req.user._id,
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: 'Error creating platform expense', error: error.message });
  }
};

// @desc    Delete platform expense
// @route   DELETE /api/admin/expenses/:id
// @access  Private/SuperAdmin
export const deletePlatformExpense = async (req, res) => {
  try {
    const expense = await PlatformExpense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting platform expense', error: error.message });
  }
};

const toCountMap = (rows) =>
  rows.reduce((map, row) => {
    map[row._id.toString()] = row.count;
    return map;
  }, {});

const sumAggregate = (rows) => rows?.[0]?.total || 0;
const activeExpenseMatch = () => ({
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
const recognizedProjectRevenueExpression = {
  $cond: [
    {
      $or: [
        { $eq: ['$status', 'completed'] },
        { $gte: ['$progressPercentage', 100] },
        { $gte: ['$progress', 100] },
      ],
    },
    { $ifNull: ['$contractValue', 0] },
    0,
  ],
};

const calculateGrowth = (current, previous) => {
  if (!previous) {
    return current ? 100 : 0;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const buildPlanRows = (plans, companies) => {
  const rows = plans.map((plan, index) => {
    const planCompanies = companies.filter((company) => company.planId?._id?.toString() === plan._id.toString());
    return {
      id: plan._id,
      name: plan.name,
      companies: planCompanies.length,
      monthlyRevenue: planCompanies.length * plan.price,
      color: PLAN_COLORS[index % PLAN_COLORS.length],
    };
  });

  const unassignedCompanies = companies.filter((company) => !company.planId);
  if (unassignedCompanies.length) {
    rows.push({
      id: 'unassigned',
      name: 'Unassigned',
      companies: unassignedCompanies.length,
      monthlyRevenue: 0,
      color: '#94a3b8',
    });
  }

  return rows;
};

const calculateRecurringRevenue = (planRows) =>
  planRows.reduce((total, plan) => total + plan.monthlyRevenue, 0);

const buildMonthlyGrowth = (registrations, year, currentMonthIndex) => {
  const monthCounts = new Map(registrations.map((row) => [row._id, row.count]));

  return Array.from({ length: currentMonthIndex + 1 }, (_, index) => {
    return {
      month: new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(year, index, 1)),
      companies: monthCounts.get(index + 1) || 0,
    };
  });
};

const countCompaniesNearUserLimit = (companies, userCountByCompany) =>
  companies.filter((company) => {
    const maxUsers = company.planId?.maxUsers;
    if (!maxUsers) {
      return false;
    }
    const usedUsers = userCountByCompany[company._id.toString()] || 0;
    return usedUsers >= maxUsers * 0.9;
  }).length;

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const formatLogMessage = (log) => {
  const actor = log.performedBy
    ? `${log.performedBy.firstName || ''} ${log.performedBy.lastName || ''}`.trim() || log.performedBy.email
    : 'System';
  return `${log.action} by ${actor}`;
};

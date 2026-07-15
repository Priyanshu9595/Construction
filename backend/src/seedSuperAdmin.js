import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Company from './models/Company.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Site from './models/Site.js';
import Task from './models/Task.js';
import Milestone from './models/Milestone.js';
import Attendance from './models/Attendance.js';
import ProgressEntry from './models/ProgressEntry.js';
import MaterialUsage from './models/MaterialUsage.js';
import EquipmentLog from './models/EquipmentLog.js';
import Issue from './models/Issue.js';
import Approval from './models/Approval.js';
import DailyReport from './models/DailyReport.js';
import SitePhoto from './models/SitePhoto.js';
import ActivityLog from './models/ActivityLog.js';
import Worker from './models/Worker.js';
import Contractor from './models/Contractor.js';
import LabourAllocation from './models/LabourAllocation.js';
import SalarySlip from './models/SalarySlip.js';
import Store from './models/Store.js';
import Material from './models/Material.js';
import StockTransaction from './models/StockTransaction.js';
import WorkOrder from './models/WorkOrder.js';
import RunningBill from './models/RunningBill.js';

dotenv.config();

const demoPassword = '123456';

const demoUsers = [
  {
    firstName: 'Amrit',
    lastName: 'Raj',
    email: 'super@buildflow.com',
    role: 'super_owner',
  },
  {
    firstName: 'Rajesh',
    lastName: 'Verma',
    email: 'owner@abcconstruction.com',
    role: 'company_owner',
  },
  {
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'pm@abcconstruction.com',
    role: 'project_owner',
    permissions: ['project.manage', 'finance.manage', 'quality.manage', 'safety.manage'],
  },
  {
    firstName: 'Suresh',
    lastName: 'Yadav',
    email: 'worker@abcconstruction.com',
    role: 'worker',
  }
];

const seedDemoUsers = async () => {
  try {
    await Promise.race([
      mongoose.connect(process.env.MONGODB_URI, {
        connectTimeoutMS: 8000,
        serverSelectionTimeoutMS: 8000,
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('MongoDB connection timed out')), 10000);
      }),
    ]);

    const company = await Company.findOneAndUpdate(
      { email: 'admin@abcconstruction.com' },
      {
        companyName: 'ABC Constructions',
        email: 'admin@abcconstruction.com',
        phone: '+91 98765 43210',
        address: 'Mumbai, Maharashtra',
        status: 'active',
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const seededUsers = {};
    for (const userSeed of demoUsers) {
      const existingUser = await User.findOne({ email: userSeed.email });
      const userPayload = {
        ...userSeed,
        isActive: true,
        companyId: userSeed.role === 'super_owner' ? undefined : company._id,
      };

      if (existingUser) {
        Object.assign(existingUser, userPayload);
        seededUsers[userSeed.email] = await existingUser.save();
      } else {
        seededUsers[userSeed.email] = await User.create({
          ...userPayload,
          password: demoPassword,
        });
      }
    }

    const projectManager = seededUsers['pm@abcconstruction.com'];
    const siteEngineer = seededUsers['pm@abcconstruction.com']; // Map old role to PO

    const projects = [];
    for (const [index, item] of [
      ['BF-OCN', 'Oceanview Residences', 'Oceanview Realty', 'Mumbai', 'in_progress', 24500000, 17500000, 4200000, 31000000, 65, 'at_risk'],
      ['BF-GRN', 'GreenField Villas', 'GreenField Homes', 'Pune', 'in_progress', 18000000, 8200000, 2200000, 26000000, 42, 'on_track'],
      ['BF-SUN', 'Sunrise Complex', 'Sunrise Group', 'Navi Mumbai', 'completed', 13200000, 11800000, 800000, 18500000, 100, 'on_track'],
      ['BF-TEC', 'Tech Park Phase 1', 'TechSquare', 'Thane', 'on_hold', 20500000, 5600000, 1800000, 28000000, 20, 'delayed'],
    ].entries()) {
      const [projectCode, name, clientName, location, status, approvedBudget, actualCost, committedCost, contractValue, progressPercentage, healthStatus] = item;
      const plannedStartDate = new Date('2026-01-01');
      const plannedEndDate = new Date('2026-12-15');
      const forecastEndDate = new Date(index === 3 ? '2027-01-20' : '2026-12-20');
      const project = await Project.findOneAndUpdate(
        { companyId: company._id, projectCode },
        {
          companyId: company._id,
          projectCode,
          name,
          clientName,
          location,
          status,
          approvedBudget,
          budget: approvedBudget,
          actualCost,
          committedCost,
          contractValue,
          expectedProfit: contractValue - actualCost - committedCost,
          progressPercentage,
          progress: progressPercentage,
          healthStatus,
          plannedStartDate,
          plannedEndDate,
          forecastEndDate,
          projectManagerIds: [projectManager._id],
          createdBy: seededUsers['owner@abcconstruction.com']._id,
          deletedAt: null,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      projects.push(project);
    }

    const site = await Site.findOneAndUpdate(
      { projectId: projects[0]._id, code: 'TOWER-A' },
      {
        companyId: company._id,
        projectId: projects[0]._id,
        name: 'Tower A',
        code: 'TOWER-A',
        location: 'Oceanview Residences - Tower A',
        engineerIds: [siteEngineer._id],
        status: 'active',
        createdBy: seededUsers['owner@abcconstruction.com']._id,
        deletedAt: null,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    projectManager.projectIds = projects.map((project) => project._id);
    await projectManager.save();
    siteEngineer.projectIds = [projects[0]._id];
    siteEngineer.siteIds = [site._id];
    await siteEngineer.save();


    const tasks = [];
    for (const item of [
      ['T-001', 'Brick Work - 2nd Floor', 1000, 750, 'CFT', 4, 75, 'in_progress'],
      ['T-002', 'Plastering - Tower B', 800, 320, 'SQM', 3, 40, 'in_progress'],
      ['T-003', 'Flooring - Tower A', 600, 120, 'SQM', 2, 20, 'delayed'],
    ]) {
      const [taskCode, title, plannedQuantity, approvedCompletedQuantity, unit, weight, progressPercentage, status] = item;
      const task = await Task.findOneAndUpdate(
        { projectId: projects[0]._id, taskCode },
        {
          companyId: company._id,
          projectId: projects[0]._id,
          siteId: site._id,
          taskCode,
          title,
          phase: 'Structure',
          location: site.name,
          plannedQuantity,
          approvedCompletedQuantity,
          unit,
          weight,
          progressPercentage,
          status,
          assignedUserIds: [siteEngineer._id],
          plannedEndDate: new Date('2026-08-30'),
          createdBy: projectManager._id,
          deletedAt: null,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      tasks.push(task);
    }

    await Milestone.deleteMany({ projectId: projects[0]._id });
    await Milestone.insertMany([
      { companyId: company._id, projectId: projects[0]._id, title: 'Block Work Start', plannedDate: new Date('2026-08-20'), forecastDate: new Date('2026-08-25'), progress: 35, status: 'at_risk', responsibleUserId: projectManager._id },
      { companyId: company._id, projectId: projects[0]._id, title: 'Electrical Rough-in', plannedDate: new Date('2026-09-10'), forecastDate: new Date('2026-09-10'), progress: 10, status: 'upcoming', responsibleUserId: projectManager._id },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await Promise.all([
      Attendance.deleteMany({ siteId: site._id, attendanceDate: { $gte: today } }),
      ProgressEntry.deleteMany({ siteId: site._id, entryDate: { $gte: today } }),
      MaterialUsage.deleteMany({ siteId: site._id, usageDate: { $gte: today } }),
      EquipmentLog.deleteMany({ siteId: site._id, logDate: { $gte: today } }),
      DailyReport.deleteMany({ siteId: site._id, reportDate: { $gte: today } }),
    ]);
    await Attendance.create({ companyId: company._id, projectId: projects[0]._id, siteId: site._id, attendanceDate: today, trade: 'Mason', contractorName: 'Sharma Constructions', workerCount: 58, status: 'present', approved: true, createdBy: siteEngineer._id });
    await ProgressEntry.create({ companyId: company._id, projectId: projects[0]._id, siteId: site._id, taskId: tasks[0]._id, entryDate: today, quantity: 75, unit: '%', percentage: 75, submittedBy: siteEngineer._id, status: 'approved', approvedBy: projectManager._id, approvedAt: new Date() });
    await MaterialUsage.create({ companyId: company._id, projectId: projects[0]._id, siteId: site._id, taskId: tasks[0]._id, materialName: 'Cement', quantity: 120, unit: 'Bag', usageDate: today, cost: 48000, createdBy: siteEngineer._id });
    await EquipmentLog.create({ companyId: company._id, projectId: projects[0]._id, siteId: site._id, equipmentName: 'Concrete Mixer', operatorName: 'Raju', openingMeter: 1100, closingMeter: 1118, workingHours: 8, idleHours: 1, fuelUsed: 22, logDate: today, createdBy: siteEngineer._id });
    await DailyReport.create({ companyId: company._id, projectId: projects[0]._id, siteId: site._id, reportDate: today, shift: 'day', weather: 'Sunny', temperature: 32, submittedBy: siteEngineer._id, status: 'submitted', submittedAt: new Date(), createdBy: siteEngineer._id });

    await Issue.deleteMany({ projectId: projects[0]._id });
    await Issue.insertMany([
      { companyId: company._id, projectId: projects[0]._id, siteId: site._id, title: 'Material delay', category: 'material', severity: 'high', status: 'open', assignedUserId: projectManager._id, dueDate: new Date('2026-08-01'), createdBy: siteEngineer._id },
      { companyId: company._id, projectId: projects[0]._id, siteId: site._id, title: 'Drawing approval pending', category: 'approval', severity: 'warning', status: 'in_progress', assignedUserId: projectManager._id, dueDate: new Date('2026-08-02'), createdBy: siteEngineer._id },
    ]);
    await Approval.deleteMany({ projectId: projects[0]._id });
    await Approval.create({ companyId: company._id, projectId: projects[0]._id, siteId: site._id, type: 'Daily Report', submittedBy: siteEngineer._id, currentApproverIds: [projectManager._id], status: 'pending', submittedAt: new Date() });
    await SitePhoto.deleteMany({ siteId: site._id });
    await SitePhoto.insertMany([
      { companyId: company._id, projectId: projects[0]._id, siteId: site._id, url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=500', category: 'progress', caption: 'Tower A slab work', location: site.name, approvalStatus: 'submitted', uploadedBy: siteEngineer._id },
      { companyId: company._id, projectId: projects[0]._id, siteId: site._id, url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=500', category: 'material', caption: 'Material staging', location: site.name, approvalStatus: 'submitted', uploadedBy: siteEngineer._id },
    ]);
    await ActivityLog.create({ companyId: company._id, projectId: projects[0]._id, siteId: site._id, actorId: siteEngineer._id, action: 'Daily report submitted', resourceType: 'DailyReport' });

    const contractor = await Contractor.findOneAndUpdate(
      { companyId: company._id, code: 'CTR-SHARMA' },
      { companyId: company._id, name: 'Sharma Constructions', code: 'CTR-SHARMA', email: 'contractor@abcconstruction.com', phone: '+91 90000 11111', status: 'active', userIds: [], createdBy: seededUsers['owner@abcconstruction.com']._id, deletedAt: null },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const worker = await Worker.findOneAndUpdate(
      { companyId: company._id, workerCode: 'W-001' },
      {
        companyId: company._id,
        contractorId: contractor._id,
        workerCode: 'W-001',
        name: 'Ramesh Kumar',
        mobile: '9876500001',
        trade: 'Mason',
        dailyWage: 850,
        overtimeRate: 150,
        projectIds: [projects[0]._id],
        siteIds: [site._id],
        supervisorId: seededUsers['pm@abcconstruction.com']._id,
        joiningDate: new Date('2026-01-10'),
        employmentStatus: 'active',
        safetyInductionStatus: 'completed',
        loginEnabled: true,
        pinHash: await Worker.hashPin('1234'),
        deletedAt: null,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    await LabourAllocation.findOneAndUpdate(
      { workerId: worker._id, allocationDate: today, shift: 'day' },
      { companyId: company._id, workerId: worker._id, contractorId: contractor._id, projectId: projects[0]._id, siteId: site._id, taskId: tasks[0]._id, allocationDate: today, shift: 'day', workLocation: site.name, expectedQuantity: 75, outputQuantity: 40, status: 'working', createdBy: seededUsers['pm@abcconstruction.com']._id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    await SalarySlip.findOneAndUpdate(
      { workerId: worker._id, month: '2026-07' },
      { companyId: company._id, workerId: worker._id, month: '2026-07', grossSalary: 22100, deductions: 1100, netSalary: 21000, paymentStatus: 'approved' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    await WorkOrder.findOneAndUpdate(
      { companyId: company._id, contractorId: contractor._id, workOrderNumber: 'WO-001' },
      { companyId: company._id, contractorId: contractor._id, projectId: projects[0]._id, siteId: site._id, workOrderNumber: 'WO-001', title: 'Brick Work - Tower A', packageType: 'Masonry', contractValue: 1200000, startDate: new Date('2026-07-01'), endDate: new Date('2026-10-15'), retentionPercentage: 5, status: 'in_progress', progressPercentage: 75, createdBy: projectManager._id, deletedAt: null },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const workOrder = await WorkOrder.findOne({ companyId: company._id, contractorId: contractor._id, workOrderNumber: 'WO-001' });
    await RunningBill.findOneAndUpdate(
      { workOrderId: workOrder._id, billNumber: 'RB-001' },
      { companyId: company._id, contractorId: contractor._id, projectId: projects[0]._id, workOrderId: workOrder._id, billNumber: 'RB-001', grossAmount: 450000, materialRecovery: 25000, retentionAmount: 22500, TDSAmount: 4500, GSTAmount: 81000, netPayable: 479000, paidAmount: 250000, status: 'approved', approvedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const store = await Store.findOneAndUpdate(
      { companyId: company._id, code: 'MAIN-STORE' },
      { companyId: company._id, projectId: projects[0]._id, name: 'Oceanview Main Store', code: 'MAIN-STORE', managerIds: [seededUsers['pm@abcconstruction.com']._id], status: 'active', deletedAt: null },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const material = await Material.findOneAndUpdate(
      { companyId: company._id, materialCode: 'MAT-CEM-53' },
      { companyId: company._id, materialCode: 'MAT-CEM-53', name: 'Cement OPC 53', category: 'Cement', unit: 'Bag', reorderLevel: 200, preferredVendor: 'UltraBuild Suppliers', status: 'active', deletedAt: null },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    await StockTransaction.deleteMany({ storeId: store._id, materialId: material._id });
    await StockTransaction.create({ companyId: company._id, projectId: projects[0]._id, storeId: store._id, materialId: material._id, transactionType: 'Opening stock', referenceNumber: 'OPEN-001', inwardQuantity: 1250, balanceAfter: 1250, unitRate: 390, totalValue: 487500, createdBy: seededUsers['pm@abcconstruction.com']._id });
    await StockTransaction.create({ companyId: company._id, projectId: projects[0]._id, storeId: store._id, materialId: material._id, transactionType: 'Material issue', referenceNumber: 'MI-001', outwardQuantity: 120, balanceAfter: 1130, unitRate: 390, totalValue: 46800, createdBy: seededUsers['pm@abcconstruction.com']._id });

    console.log('BuildFlow demo login users seeded successfully.');
    console.table(
      demoUsers.map((user) => ({
        role: user.role,
        email: user.email,
        password: demoPassword,
      }))
    );
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding demo users: ${error.message}`);
    process.exit(1);
  }
};

seedDemoUsers();

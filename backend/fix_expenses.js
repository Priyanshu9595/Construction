import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SalarySlip from './src/models/SalarySlip.js';
import Expense from './src/models/Expense.js';
import User from './src/models/User.js';
import Worker from './src/models/Worker.js';
import SystemLog from './src/models/SystemLog.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/construction')
  .then(async () => {
    console.log('Connected to DB');
    try {
      const slips = await SalarySlip.find({ paymentStatus: 'paid' }).lean();
      console.log(`Found ${slips.length} paid salary slips.`);
      
      let count = 0;
      for (const slip of slips) {
        const worker = await Worker.findById(slip.workerId).lean();
        const legacyUser = worker ? null : await User.findById(slip.workerId).lean();
        const displayName = worker?.name || `${legacyUser?.firstName || ''} ${legacyUser?.lastName || ''}`.trim();
        
        if (!worker && !legacyUser) continue;
        if (!displayName) continue;
        
        const desc = `Worker Salary: ${displayName} (${slip.month})`;
        const log = await SystemLog.findOne({ 'details.salarySlipId': slip._id }).lean();
        const projectId = log?.details?.projectId || worker?.projectIds?.[0] || legacyUser?.projectIds?.[0];
        
        const existing = await Expense.findOne({
          companyId: slip.companyId,
          $or: [
            { description: desc, amount: slip.netSalary },
            { description: desc, totalAmount: slip.netSalary },
            ...(projectId ? [{ projectId, description: desc }] : []),
          ],
        });
        
        if (!existing) {
          await Expense.create({
            companyId: slip.companyId,
            projectId: projectId,
            invoiceNumber: `SAL-${slip._id}`,
            description: desc,
            category: 'Labour',
            amount: slip.netSalary,
            totalAmount: slip.netSalary,
            date: slip.paymentDate || slip.createdAt,
            expenseDate: slip.paymentDate || slip.createdAt,
            incurredBy: 'System Admin',
            status: 'paid'
          });
          count++;
          console.log(`Created expense for ${desc}`);
        }
      }
      console.log(`Created ${count} missing expenses.`);
    } catch (err) {
      console.error(err);
    }
    process.exit(0);
  });

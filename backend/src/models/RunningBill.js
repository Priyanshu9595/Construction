import mongoose from 'mongoose';

const runningBillSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    workOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder', required: true },
    billNumber: { type: String, required: true },
    billingPeriodStart: Date,
    billingPeriodEnd: Date,
    grossAmount: { type: Number, default: 0 },
    materialRecovery: { type: Number, default: 0 },
    advanceRecovery: { type: Number, default: 0 },
    retentionAmount: { type: Number, default: 0 },
    TDSAmount: { type: Number, default: 0 },
    GSTAmount: { type: Number, default: 0 },
    penaltyAmount: { type: Number, default: 0 },
    previousPayment: { type: Number, default: 0 },
    netPayable: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'submitted', 'under_verification', 'approved', 'paid', 'rejected'], default: 'draft' },
    submittedAt: Date,
    verifiedAt: Date,
    approvedAt: Date,
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('RunningBill', runningBillSchema);

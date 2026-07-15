import mongoose from 'mongoose';

const workOrderSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', index: true },
    workOrderNumber: { type: String, required: true },
    title: { type: String, required: true },
    packageType: String,
    contractValue: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
    retentionPercentage: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'issued', 'accepted', 'in_progress', 'on_hold', 'completed', 'closed', 'cancelled'], default: 'issued' },
    progressPercentage: { type: Number, default: 0 },
    acceptedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

workOrderSchema.index({ companyId: 1, contractorId: 1, workOrderNumber: 1 }, { unique: true });

export default mongoose.model('WorkOrder', workOrderSchema);

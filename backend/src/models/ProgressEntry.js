import mongoose from 'mongoose';

const progressEntrySchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyReport' },
    entryDate: { type: Date, required: true, index: true },
    quantity: { type: Number, default: 0, min: 0 },
    unit: String,
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    remarks: String,
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'submitted' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

export default mongoose.model('ProgressEntry', progressEntrySchema);

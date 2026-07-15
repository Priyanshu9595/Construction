import mongoose from 'mongoose';

const overtimeRequestSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    date: { type: Date, required: true, index: true },
    startAt: Date,
    endAt: Date,
    totalMinutes: { type: Number, default: 0 },
    reason: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'submitted' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

overtimeRequestSchema.index({ workerId: 1, date: 1, taskId: 1 }, { unique: true, sparse: true });

export default mongoose.model('OvertimeRequest', overtimeRequestSchema);

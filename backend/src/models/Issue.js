import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', index: true },
    title: { type: String, required: true },
    category: { type: String, default: 'general' },
    severity: { type: String, enum: ['info', 'warning', 'high', 'critical'], default: 'warning' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    assignedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Issue', issueSchema);

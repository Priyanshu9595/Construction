import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', index: true },
    type: { type: String, required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    currentApproverIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'revision_requested'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Approval', approvalSchema);

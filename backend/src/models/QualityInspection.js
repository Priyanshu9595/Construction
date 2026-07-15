import mongoose from 'mongoose';

const qualityInspectionSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    inspectionNumber: { type: String, required: true },
    inspectionType: String,
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    scheduledAt: Date,
    inspectedAt: Date,
    checklistItems: [{ label: String, passed: Boolean }],
    observations: String,
    result: { type: String, enum: ['passed', 'passed_with_observation', 'failed', 'reinspection_required'], default: 'passed' },
    status: { type: String, enum: ['requested', 'scheduled', 'in_progress', 'submitted', 'approved', 'rejected', 'closed'], default: 'requested' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
export default mongoose.model('QualityInspection', qualityInspectionSchema);

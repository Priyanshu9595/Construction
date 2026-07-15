import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', index: true },
    phaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectPhase', index: true },
    costCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'CostCode', index: true },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor', index: true },
    phase: { type: String, trim: true }, // Legacy/String fallback
    taskCode: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    plannedStartDate: Date,
    plannedEndDate: Date,
    forecastEndDate: Date,
    plannedQuantity: { type: Number, default: 0 },
    plannedLabour: { type: Number, default: 0 },
    plannedMaterial: { type: Number, default: 0 },
    plannedEquipment: { type: Number, default: 0 },
    approvedCompletedQuantity: { type: Number, default: 0 },
    unit: { type: String, default: '%' },
    weight: { type: Number, default: 1 },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    assignedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['not_started', 'in_progress', 'completed', 'delayed', 'blocked', 'on_hold'], default: 'not_started' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ companyId: 1, projectId: 1, status: 1, deletedAt: 1 });

export default mongoose.model('Task', taskSchema);

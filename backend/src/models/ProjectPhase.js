import mongoose from 'mongoose';

const projectPhaseSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    plannedStartDate: { type: Date },
    plannedEndDate: { type: Date },
    weight: { type: Number, default: 0, min: 0, max: 100 },
    responsibleTeam: { type: String, trim: true },
    status: { type: String, enum: ['not_started', 'in_progress', 'completed', 'delayed'], default: 'not_started' },
    description: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

projectPhaseSchema.index({ projectId: 1, code: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export default mongoose.model('ProjectPhase', projectPhaseSchema);

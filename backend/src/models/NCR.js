import mongoose from 'mongoose';

const ncrSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QualityInspection' },
    title: String,
    severity: { type: String, enum: ['minor', 'major', 'critical'], default: 'major' },
    status: { type: String, enum: ['open', 'corrective_action', 'verified', 'closed'], default: 'open' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
export default mongoose.model('NCR', ncrSchema);

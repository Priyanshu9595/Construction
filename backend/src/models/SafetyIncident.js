import mongoose from 'mongoose';

const safetyIncidentSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', index: true },
    incidentNumber: { type: String, required: true },
    incidentType: String,
    incidentDateTime: Date,
    location: String,
    description: String,
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['open', 'investigating', 'action_pending', 'closed'], default: 'open' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    investigatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    closedAt: Date,
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
export default mongoose.model('SafetyIncident', safetyIncidentSchema);

import mongoose from 'mongoose';

const dailyReportSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    reportNumber: String,
    reportDate: { type: Date, required: true, index: true },
    shift: { type: String, enum: ['day', 'night', 'general'], default: 'day' },
    weather: String,
    temperature: Number,
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tomorrowPlan: mongoose.Schema.Types.Mixed,
    remarks: String,
    status: { type: String, enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'revision_requested'], default: 'draft' },
    submittedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

dailyReportSchema.index({ projectId: 1, siteId: 1, reportDate: 1, shift: 1 }, { unique: true });

export default mongoose.model('DailyReport', dailyReportSchema);

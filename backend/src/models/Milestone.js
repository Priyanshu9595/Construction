import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    plannedDate: Date,
    forecastDate: Date,
    progress: { type: Number, default: 0, min: 0, max: 100 },
    responsibleUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['upcoming', 'at_risk', 'delayed', 'achieved'], default: 'upcoming' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Milestone', milestoneSchema);

import mongoose from 'mongoose';

const siteSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    location: { type: String, trim: true },
    latitude: Number,
    longitude: Number,
    engineerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

siteSchema.index({ companyId: 1, projectId: 1, deletedAt: 1 });

export default mongoose.model('Site', siteSchema);

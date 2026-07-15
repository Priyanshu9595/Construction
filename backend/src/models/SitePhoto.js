import mongoose from 'mongoose';

const sitePhotoSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    url: { type: String, required: true },
    category: { type: String, enum: ['progress', 'material', 'equipment', 'quality', 'safety', 'issue', 'before', 'after'], default: 'progress' },
    caption: String,
    location: String,
    approvalStatus: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('SitePhoto', sitePhotoSchema);

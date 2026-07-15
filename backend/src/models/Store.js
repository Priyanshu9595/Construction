import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    managerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

storeSchema.index({ companyId: 1, code: 1 }, { unique: true });

export default mongoose.model('Store', storeSchema);

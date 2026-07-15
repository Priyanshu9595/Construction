import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    projectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true }],
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
clientSchema.index({ companyId: 1, code: 1 }, { unique: true });
export default mongoose.model('Client', clientSchema);

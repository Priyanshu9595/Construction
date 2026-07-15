import mongoose from 'mongoose';

const contractorSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: String,
    status: { type: String, enum: ['pending', 'active', 'blocked'], default: 'active' },
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

contractorSchema.index({ companyId: 1, code: 1 }, { unique: true });

export default mongoose.model('Contractor', contractorSchema);

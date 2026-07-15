import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const workerSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor', index: true },
    workerCode: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true, index: true },
    alternateMobile: String,
    photo: String,
    trade: { type: String, required: true, trim: true },
    skillLevel: { type: String, enum: ['helper', 'semi_skilled', 'skilled', 'highly_skilled'], default: 'skilled' },
    dailyWage: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 },
    projectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true }],
    siteIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Site', index: true }],
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    joiningDate: Date,
    employmentStatus: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active', index: true },
    bankDetailsEncrypted: String,
    UPIEncrypted: String,
    emergencyContact: String,
    safetyInductionStatus: { type: String, enum: ['pending', 'completed', 'expired'], default: 'pending' },
    loginEnabled: { type: Boolean, default: true },
    pinHash: String,
    lastLoginAt: Date,
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

workerSchema.index({ companyId: 1, workerCode: 1 }, { unique: true });
workerSchema.index({ companyId: 1, mobile: 1 });

workerSchema.methods.matchPin = async function (pin) {
  return bcrypt.compare(pin, this.pinHash || '');
};

workerSchema.statics.hashPin = async function (pin) {
  return bcrypt.hash(pin, await bcrypt.genSalt(10));
};

export default mongoose.model('Worker', workerSchema);

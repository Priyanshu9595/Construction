import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', index: true },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor', index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', index: true },
    attendanceDate: { type: Date, required: true, index: true },
    shiftId: { type: String, default: 'day' },
    trade: String,
    contractorName: String,
    workerCount: { type: Number, default: 0 },
    status: { type: String, enum: ['present', 'absent', 'half_day', 'leave', 'late'], default: 'present' },
    checkInAt: Date,
    checkOutAt: Date,
    checkInLocation: mongoose.Schema.Types.Mixed,
    checkOutLocation: mongoose.Schema.Types.Mixed,
    checkInPhoto: String,
    checkOutPhoto: String,
    totalWorkingMinutes: { type: Number, default: 0 },
    overtimeMinutes: { type: Number, default: 0 },
    source: { type: String, default: 'manual' },
    geofenceStatus: { type: String, enum: ['inside', 'outside', 'pending'], default: 'pending' },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    correctionReason: String,
    approved: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

attendanceSchema.index({ workerId: 1, attendanceDate: 1, shiftId: 1 }, { unique: true, sparse: true });

export default mongoose.model('Attendance', attendanceSchema);

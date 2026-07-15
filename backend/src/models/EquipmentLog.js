import mongoose from 'mongoose';

const equipmentLogSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    equipmentName: { type: String, required: true },
    operatorName: String,
    openingMeter: { type: Number, default: 0 },
    closingMeter: { type: Number, default: 0 },
    workingHours: { type: Number, default: 0 },
    idleHours: { type: Number, default: 0 },
    fuelUsed: { type: Number, default: 0 },
    logDate: { type: Date, required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('EquipmentLog', equipmentLogSchema);

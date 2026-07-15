import mongoose from 'mongoose';

const labourAllocationSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor', index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', index: true },
    allocationDate: { type: Date, required: true, index: true },
    shift: { type: String, default: 'day' },
    workLocation: String,
    expectedQuantity: { type: Number, default: 0 },
    outputQuantity: { type: Number, default: 0 },
    remarks: String,
    status: { type: String, enum: ['assigned', 'working', 'idle', 'completed', 'removed'], default: 'assigned' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

labourAllocationSchema.index({ workerId: 1, allocationDate: 1, shift: 1 }, { unique: true });

export default mongoose.model('LabourAllocation', labourAllocationSchema);

import mongoose from 'mongoose';

const boqItemSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    phaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectPhase' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    costCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'CostCode' },
    contractorWorkOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder' }, // Assuming WorkOrder represents Contractor Work Order
    itemCode: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true, default: 0 }, // Should be calculated as quantity * rate
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('BOQItem', boqItemSchema);

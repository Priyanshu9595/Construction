import mongoose from 'mongoose';

const budgetLineSchema = new mongoose.Schema(
  {
    budgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectBudget', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    category: { 
      type: String, 
      enum: ['Civil Work', 'Material', 'Labour', 'Contractor', 'Equipment', 'Electrical', 'Plumbing', 'Consultants', 'Transport', 'Overheads', 'Contingency'],
      required: true
    },
    phaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectPhase' },
    costCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'CostCode' },
    allocatedAmount: { type: Number, required: true, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('BudgetLine', budgetLineSchema);

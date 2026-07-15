import mongoose from 'mongoose';

const projectBudgetSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    contractValue: { type: Number, required: true, default: 0 },
    approvedBudget: { type: Number, required: true, default: 0 },
    expectedProfit: { type: Number, default: 0 },
    expectedMargin: { type: Number, default: 0 }, // Percentage
    contingency: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'approved', 'frozen'], default: 'draft' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('ProjectBudget', projectBudgetSchema);

import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', index: true },
    expenseNumber: { type: String, required: true },
    expenseDate: { type: Date, default: Date.now, index: true },
    payeeName: String,
    category: { type: String, default: 'Other' },
    description: String,
    baseAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paymentMethod: String,
    invoiceNumber: String,
    status: { type: String, enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'posted', 'paid', 'cancelled'], default: 'draft' },
    postingStatus: { type: String, enum: ['unposted', 'posted', 'reversed'], default: 'unposted' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
expenseSchema.index({ companyId: 1, invoiceNumber: 1 }, { unique: true, sparse: true });
export default mongoose.model('Expense', expenseSchema);

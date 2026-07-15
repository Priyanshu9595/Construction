import mongoose from 'mongoose';

const purchaseRequestSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', index: true },
    requestNumber: { type: String, required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    department: String,
    requiredDate: Date,
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    items: [{ materialName: String, quantity: Number, unit: String, estimatedRate: Number }],
    estimatedAmount: { type: Number, default: 0 },
    purpose: String,
    status: { type: String, enum: ['draft', 'submitted', 'under_review', 'approved', 'partially_approved', 'rejected', 'converted_to_rfq', 'converted_to_po', 'closed'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
purchaseRequestSchema.index({ companyId: 1, requestNumber: 1 }, { unique: true });
export default mongoose.model('PurchaseRequest', purchaseRequestSchema);

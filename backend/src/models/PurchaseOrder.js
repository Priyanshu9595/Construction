import mongoose from 'mongoose';

const purchaseOrderSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', index: true },
    purchaseOrderNumber: { type: String, required: true },
    name: { type: String, trim: true },
    items: [{ materialName: String, quantity: Number, deliveredQuantity: { type: Number, default: 0 }, unitRate: Number, tax: Number }],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    freight: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paymentTerms: String,
    expectedDeliveryDate: Date,
    issuedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['draft', 'approval_pending', 'approved', 'issued', 'vendor_accepted', 'partially_delivered', 'delivered', 'closed', 'cancelled'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
purchaseOrderSchema.index({ companyId: 1, purchaseOrderNumber: 1 }, { unique: true });
export default mongoose.model('PurchaseOrder', purchaseOrderSchema);

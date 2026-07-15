import mongoose from 'mongoose';

const rfqSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    rfqNumber: { type: String, required: true },
    vendorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    items: [{ materialName: String, quantity: Number, unit: String }],
    deadline: Date,
    status: { type: String, enum: ['draft', 'sent', 'open', 'partially_quoted', 'closed', 'evaluated', 'cancelled'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
export default mongoose.model('RFQ', rfqSchema);

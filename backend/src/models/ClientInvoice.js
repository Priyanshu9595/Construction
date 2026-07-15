import mongoose from 'mongoose';

const clientInvoiceSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', index: true },
    invoiceNumber: { type: String, required: true },
    milestone: String,
    invoiceDate: Date,
    dueDate: Date,
    amount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'issued', 'due', 'partially_paid', 'paid', 'overdue', 'cancelled'], default: 'draft' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
export default mongoose.model('ClientInvoice', clientInvoiceSchema);

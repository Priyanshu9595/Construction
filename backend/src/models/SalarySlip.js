import mongoose from 'mongoose';

const salarySlipSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    month: { type: String, required: true },
    grossSalary: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['processing', 'approved', 'paid', 'on_hold'], default: 'processing' },
    paymentDate: Date,
    pdfUrl: String,
  },
  { timestamps: true }
);

salarySlipSchema.index({ workerId: 1, month: 1 }, { unique: true });

export default mongoose.model('SalarySlip', salarySlipSchema);

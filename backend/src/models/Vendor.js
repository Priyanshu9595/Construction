import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    email: String,
    phone: String,
    rating: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
vendorSchema.index({ companyId: 1, code: 1 }, { unique: true });
export default mongoose.model('Vendor', vendorSchema);

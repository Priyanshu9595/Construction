import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    materialCode: { type: String, required: true },
    name: { type: String, required: true },
    category: String,
    unit: String,
    reorderLevel: { type: Number, default: 0 },
    preferredVendor: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

materialSchema.index({ companyId: 1, materialCode: 1 }, { unique: true });

export default mongoose.model('Material', materialSchema);

import mongoose from 'mongoose';

const costCodeSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      enum: ['Civil Work', 'Material', 'Labour', 'Contractor', 'Equipment', 'Electrical', 'Plumbing', 'Consultants', 'Transport', 'Overheads', 'Contingency'],
      required: true
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

costCodeSchema.index({ companyId: 1, code: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

export default mongoose.model('CostCode', costCodeSchema);

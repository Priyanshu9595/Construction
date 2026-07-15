import mongoose from 'mongoose';

const stockTransactionSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true, index: true },
    transactionType: { type: String, required: true },
    referenceType: String,
    referenceId: mongoose.Schema.Types.ObjectId,
    referenceNumber: String,
    inwardQuantity: { type: Number, default: 0 },
    outwardQuantity: { type: Number, default: 0 },
    balanceAfter: { type: Number, default: 0 },
    unitRate: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    batchNumber: String,
    transactionDate: { type: Date, default: Date.now, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

stockTransactionSchema.pre('findOneAndUpdate', function () {
  throw new Error('Stock ledger entries are immutable. Use reversal transactions.');
});

export default mongoose.model('StockTransaction', stockTransactionSchema);

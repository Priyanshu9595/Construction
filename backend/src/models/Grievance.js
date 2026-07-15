import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    category: { type: String, required: true },
    subject: { type: String, required: true },
    description: String,
    confidential: { type: Boolean, default: false },
    status: { type: String, enum: ['submitted', 'under_review', 'resolved', 'closed'], default: 'submitted' },
  },
  { timestamps: true }
);

export default mongoose.model('Grievance', grievanceSchema);

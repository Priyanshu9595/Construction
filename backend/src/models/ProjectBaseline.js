import mongoose from 'mongoose';

const projectBaselineSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    frozenAt: { type: Date, required: true, default: Date.now },
    frozenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    snapshot: {
      phases: { type: Array, default: [] },
      tasks: { type: Array, default: [] },
      boqItems: { type: Array, default: [] },
      budget: { type: Object, default: {} },
    },
    version: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model('ProjectBaseline', projectBaselineSchema);

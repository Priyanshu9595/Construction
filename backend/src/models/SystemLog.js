import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Can store JSON objects with details about what changed
    },
    ipAddress: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const SystemLog = mongoose.model('SystemLog', systemLogSchema);

export default SystemLog;

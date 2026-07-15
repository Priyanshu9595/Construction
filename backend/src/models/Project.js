import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    projectCode: {
      type: String,
      trim: true,
    },
    clientName: {
      type: String,
      trim: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    projectManagerIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    }],
    location: {
      type: String,
      trim: true,
    },
    plannedStartDate: Date,
    plannedEndDate: Date,
    forecastEndDate: Date,
    actualStartDate: Date,
    actualEndDate: Date,
    approvedBudget: {
      type: Number,
      default: 0,
    },
    contractValue: {
      type: Number,
      default: 0,
    },
    expectedProfit: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['planning', 'not_started', 'in_progress', 'on_hold', 'completed', 'cancelled'],
      default: 'planning',
    },
    healthStatus: {
      type: String,
      enum: ['on_track', 'at_risk', 'delayed', 'over_budget'],
      default: 'on_track',
    },
    budget: {
      type: Number,
      default: 0,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    committedCost: {
      type: Number,
      default: 0,
    },
    actualCost: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ companyId: 1, status: 1, deletedAt: 1 });
projectSchema.index({ companyId: 1, projectCode: 1 }, { unique: true, sparse: true });
projectSchema.index({ projectManagerIds: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;

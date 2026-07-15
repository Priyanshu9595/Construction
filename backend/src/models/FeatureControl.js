import mongoose from 'mongoose';

const featureControlSchema = new mongoose.Schema(
  {
    featureName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const FeatureControl = mongoose.model('FeatureControl', featureControlSchema);

export default FeatureControl;

import mongoose from 'mongoose';

const platformExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Server', 'Salary', 'Marketing', 'Legal', 'Software', 'Other'],
      default: 'Other',
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('PlatformExpense', platformExpenseSchema);

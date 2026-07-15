import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: [
        'super_owner',
        'company_owner',
        'project_owner',
        'worker'
      ],
      required: true,
    },
    permissions: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      // Super admin might not have a companyId, so it is not required
    },
    employeeCode: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    projectIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    }],
    siteIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      index: true,
    }],
    designation: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    // --- WORKER PROFILE FIELDS ---
    trade: { 
      type: String, 
      trim: true 
    },
    skillLevel: { 
      type: String, 
      enum: ['helper', 'semi_skilled', 'skilled', 'highly_skilled'], 
      default: 'skilled' 
    },
    dailyWage: { 
      type: Number, 
      default: 0 
    },
    safetyInductionStatus: { 
      type: String, 
      enum: ['pending', 'completed', 'expired'], 
      default: 'pending' 
    },
    lastLoginAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

userSchema.index(
  { companyId: 1, email: 1 },
  { unique: true, partialFilterExpression: { companyId: { $exists: true }, deletedAt: null } }
);
userSchema.index(
  { companyId: 1, employeeCode: 1 },
  { unique: true, sparse: true, partialFilterExpression: { companyId: { $exists: true }, employeeCode: { $exists: true }, deletedAt: null } }
);
userSchema.index({ companyId: 1, role: 1, isActive: 1 });

// We would normally add a pre-save hook to hash the password with bcrypt here!
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;

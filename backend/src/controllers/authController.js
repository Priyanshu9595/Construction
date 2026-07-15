import User from '../models/User.js';
import Company from '../models/Company.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const demoPassword = '123456';
const demoUsers = [
  { firstName: 'Amrit', lastName: 'Raj', email: 'super@buildflow.com', role: 'super_owner' },
  { firstName: 'Rajesh', lastName: 'Verma', email: 'owner@abcconstruction.com', role: 'company_owner' },
  { firstName: 'Priya', lastName: 'Nair', email: 'pm@abcconstruction.com', role: 'project_owner', permissions: ['project.manage', 'finance.manage', 'quality.manage', 'safety.manage'] },
  { firstName: 'Suresh', lastName: 'Yadav', email: 'worker@abcconstruction.com', role: 'worker' }
];

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  try {
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await createDemoUserIfAllowed(normalizedEmail, password);
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'User account is deactivated' });
      }

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        permissions: user.permissions,
        redirectPath: getRedirectPath(user),
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role, permissions: user.permissions }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const createDemoUserIfAllowed = async (email, password) => {
  const demoUser = demoUsers.find((user) => user.email === email);

  if (!demoUser || password !== demoPassword) {
    return null;
  }

  let companyId;

  if (demoUser.role !== 'super_owner') {
    const company = await Company.findOneAndUpdate(
      { email: 'admin@abcconstruction.com' },
      {
        companyName: 'ABC Constructions',
        email: 'admin@abcconstruction.com',
        phone: '+91 98765 43210',
        address: 'Mumbai, Maharashtra',
        status: 'active',
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    companyId = company._id;
  }

  return User.create({
    ...demoUser,
    password: demoPassword,
    isActive: true,
    companyId,
  });
};

const getRedirectPath = (user) => {
  const role = user.role;
  const firstProjectId = user.projectIds?.[0]?.toString();

  if (role === 'project_owner' && firstProjectId) {
    return `/project-owner/${firstProjectId}/dashboard`;
  }

  const redirectByRole = {
    super_owner: '/super-owner/dashboard',
    company_owner: '/company-owner/dashboard',
    project_owner: '/project-owner/dashboard', // Fallback if no project ID
    worker: '/worker/dashboard',
  };

  return redirectByRole[role] || '/';
};

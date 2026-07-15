import User from '../models/User.js';

// @desc    Get all users for a company (with optional role filter)
// @route   GET /api/company/users
// @access  Private (Company Owner/Admin)
export const getCompanyUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = { companyId: req.user.companyId, deletedAt: null };
    if (role) {
      filter.role = role;
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching users', error: error.message });
  }
};

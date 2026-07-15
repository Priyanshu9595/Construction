import Client from '../models/Client.js';
import Contractor from '../models/Contractor.js';
import Company from '../models/Company.js';
import User from '../models/User.js';

// Clients
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ companyId: req.user.companyId, deletedAt: null }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error: error.message });
  }
};

export const createClient = async (req, res) => {
  try {
    const client = await Client.create({ ...req.body, companyId: req.user.companyId });
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: 'Error creating client', error: error.message });
  }
};

// Contractors
export const getContractors = async (req, res) => {
  try {
    const contractors = await Contractor.find({ companyId: req.user.companyId, deletedAt: null }).sort({ createdAt: -1 });
    res.json(contractors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contractors', error: error.message });
  }
};

export const createContractor = async (req, res) => {
  try {
    const contractor = await Contractor.create({ ...req.body, companyId: req.user.companyId });
    res.status(201).json(contractor);
  } catch (error) {
    res.status(400).json({ message: 'Error creating contractor', error: error.message });
  }
};

// Settings (Company Info)
export const getCompanyInfo = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company info', error: error.message });
  }
};

export const updateCompanyInfo = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.user.companyId, req.body, { new: true });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(400).json({ message: 'Error updating company info', error: error.message });
  }
};

// Add User to Company
export const addCompanyUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role,
      companyId: req.user.companyId,
      status: 'active'
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
};

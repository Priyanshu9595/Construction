import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import operationsRoutes from './routes/operationsRoutes.js';
import roleDashboardsRoutes from './routes/roleDashboardsRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { planningRouter, costCodeRouter } from './routes/planningRoutes.js';
import operationalProjectRoutes from './routes/operationalRoutes.js';
import companyRoutes from './routes/companyRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the BuildFlow Express Backend!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company/projects', projectRoutes);
app.use('/api/company/users', userRoutes);
app.use('/api/company/costcodes', costCodeRouter);
app.use('/api/company', companyRoutes);
app.use('/api/projects/:projectId', planningRouter);
app.use('/api/projects/:projectId/operations', operationalProjectRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', operationsRoutes);
app.use('/api', roleDashboardsRoutes);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});

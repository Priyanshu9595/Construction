import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './src/models/Attendance.js';
import User from './src/models/User.js';
import Project from './src/models/Project.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const worker = await User.findOne({ role: 'worker' });
  try {
    const att = await Attendance.create({
      companyId: worker.companyId,
      workerId: worker._id,
      projectId: worker.projectIds[0],
      attendanceDate: new Date(),
      status: 'present',
      checkInAt: new Date(),
      source: 'web'
    });
    console.log('Success:', att);
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
run();

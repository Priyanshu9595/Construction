import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from './src/models/Task.js';
import User from './src/models/User.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB.");

  const tasks = await Task.find({});
  console.log("Total Tasks:", tasks.length);
  for (let t of tasks) {
    console.log(`Task: ${t.title}, assignedUserIds:`, t.assignedUserIds);
  }
  
  const workers = await User.find({ role: 'worker' });
  console.log("\nWorkers:");
  for (let w of workers) {
    console.log(`Worker: ${w.firstName} ${w.lastName} (ID: ${w._id})`);
  }
  
  process.exit(0);
}

run();

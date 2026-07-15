import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function dropDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected! Dropping database...');
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

dropDB();

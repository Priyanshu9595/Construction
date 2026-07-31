import dotenv from 'dotenv';
dotenv.config();

import { sendCredentialsEmail } from './src/utils/emailService.js';

const test = async () => {
  try {
    console.log('Sending test email to coder95m@gmail.com...');
    await sendCredentialsEmail('coder95m@gmail.com', 'testpass123', 'Priyanshu', 'worker');
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
  }
};
test();

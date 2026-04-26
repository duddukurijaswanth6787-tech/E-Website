import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';
console.log('Connecting to:', MONGO_URI);

const test = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  }
};

test();

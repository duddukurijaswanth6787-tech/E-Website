import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import TemporaryActivity from './src/modules/marketing/retention/temporaryActivity.model';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function purge() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('🌱 Connected to MongoDB...');
    
    const result = await TemporaryActivity.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} old live stream activities!`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

purge();

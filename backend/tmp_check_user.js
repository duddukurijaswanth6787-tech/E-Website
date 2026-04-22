
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function checkUser() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model('User', new mongoose.Schema({ email: String, isEmailVerified: Boolean, role: String }));
  const users = await User.find({ email: /tester/i });
  console.log('Test Users:', JSON.stringify(users, null, 2));
  process.exit(0);
}

checkUser();

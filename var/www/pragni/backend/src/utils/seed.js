require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  const admin = await User.create({
    name: 'Pragni Admin',
    email: 'admin@pragni.com',
    password: 'ChangeThis@Admin123!',
    role: 'admin',
    isActive: true
  });

  console.log('✅ Admin created:');
  console.log('   Email:', admin.email);
  console.log('   Password: ChangeThis@Admin123!');
  console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY after first login!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

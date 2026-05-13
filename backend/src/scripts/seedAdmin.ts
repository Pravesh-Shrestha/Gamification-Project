import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';

dotenv.config();

// Prefer an explicit MONGODB_URI when provided (useful for remote DBs); fall back to local URI
const uri = process.env.MONGODB_URI || process.env.LOCAL_MONGODB_URI || process.env.MONGODB_URI;

if (!uri) {
  console.error('No MongoDB URI found in environment variables.');
  process.exit(1);
}

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri as string);
    console.log('Connected to MongoDB:', uri);

    const usersColl = mongoose.connection.collection('users');

    const superAdminEmail = process.env.DEV_SUPERADMIN_EMAIL || 'superadmin@academia.io';
    const adminEmail = process.env.DEV_ADMIN_EMAIL || 'admin@demo.edu';

    const existingSuper = await usersColl.findOne({ email: superAdminEmail });
    if (!existingSuper) {
      await usersColl.insertOne({
        email: superAdminEmail,
        name: 'Super Admin',
        role: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date(),
        password: process.env.DEV_SUPERADMIN_PASSWORD || 'supersecret',
      });
      console.log('Inserted superadmin:', superAdminEmail);
    } else {
      console.log('Superadmin already exists:', superAdminEmail);
    }

    const existingAdmin = await usersColl.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await usersColl.insertOne({
        email: adminEmail,
        name: 'Demo Admin',
        role: 'school_admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        password: process.env.DEV_ADMIN_PASSWORD || 'adminpass',
      });
      console.log('Inserted admin:', adminEmail);
    } else {
      console.log('Admin already exists:', adminEmail);
    }

    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

run();

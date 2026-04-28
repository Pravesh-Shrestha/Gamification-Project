import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGODB_URI || process.env.LOCAL_MONGODB_URI;

if (!uri) {
  console.error('No MongoDB URI found in environment variables.');
  process.exit(1);
}

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB:', uri);

    const coll = mongoose.connection.collection('students');
    const existing = await coll.findOne({ email: 'seed@example.com' });

    if (existing) {
      console.log('Seed user already exists.');
    } else {
      await coll.insertOne({
        name: 'Seed User',
        email: 'seed@example.com',
        password: 'seedpassword',
        school: 'Demo School',
        grade: '5',
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('Inserted seed user into students collection.');
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

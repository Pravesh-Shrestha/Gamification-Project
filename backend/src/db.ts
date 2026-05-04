import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URI || process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/gamification'
        : process.env.LOCAL_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/gamification';
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;

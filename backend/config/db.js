import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/town_council', {
      serverSelectionTimeoutMS: 2000 // 2 seconds timeout to fail fast
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[WARNING] MongoDB connection failed (${error.message}). Falling back to local JSON database mode.`);
  }
};

export default connectDB;

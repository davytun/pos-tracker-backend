import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
     console.error('MongoDB connection error:', err.message);
     throw new Error(`MongoDB connection error: ${err.message}`);
  }
};

export default connectDB;

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // useNewUrlParser and useUnifiedTopology are deprecated and default to true.
    // No longer need to be specified.
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
     console.error('MongoDB connection error:', err.message);
     throw new Error(`MongoDB connection error: ${err.message}`);
  }
};

export default connectDB;

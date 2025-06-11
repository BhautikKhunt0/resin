import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

export async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB successfully');
    console.log('Using existing MongoDB data - no seeding performed');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export default mongoose;
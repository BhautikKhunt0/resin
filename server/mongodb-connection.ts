import mongoose from 'mongoose';
import { config } from './config';

export async function connectToMongoDB() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB successfully');
    console.log('Using existing MongoDB data - no seeding performed');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export default mongoose;
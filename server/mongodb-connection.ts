import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://bhautikkhunt0393:bhautik%400393@resinadmin.ddio6d8.mongodb.net/ecommerce';

export async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export default mongoose;
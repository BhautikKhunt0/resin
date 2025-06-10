import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://bhautikkhunt0393:bhautik%400393@resinadmin.ddio6d8.mongodb.net/ecommerce';

export async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds
    });
    
    // Configure mongoose for better performance
    mongoose.set('bufferCommands', false);
    
    console.log('Connected to MongoDB successfully');
    console.log('Using existing MongoDB data - no seeding performed');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export default mongoose;
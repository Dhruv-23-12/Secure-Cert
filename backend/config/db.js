import mongoose from 'mongoose';

/**
 * Database connection configuration
 * Connects to MongoDB using the connection string from environment variables
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing');
    }

    // Connect to MongoDB using the connection string from .env
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || undefined,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Exit process if database connection fails
    process.exit(1);
  }
};

export default connectDB;


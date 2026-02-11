import mongoose from 'mongoose';

/**
 * Database connection configuration
 * Connects to MongoDB using the connection string from environment variables
 */
const connectDB = async () => {
  try {
    // Connect to MongoDB using the connection string from .env
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are recommended for Mongoose 6+
      // useNewUrlParser and useUnifiedTopology are no longer needed
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Exit process if database connection fails
    process.exit(1);
  }
};

export default connectDB;


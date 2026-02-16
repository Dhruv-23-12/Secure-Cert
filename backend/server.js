import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import User from './models/User.js';
import Admin from './models/Admin.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import certificateRoutes from './routes/certificate.routes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB().then(async () => {
  try {
    // Ensure at least one admin user exists in the main users collection
    const existingAdminUser = await User.findOne({ role: 'admin' });

    if (!existingAdminUser) {
      const adminEmail =
        process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminPassword =
        process.env.ADMIN_PASSWORD || 'Admin123!';

      const createdUser = await User.create({
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });

      console.log('🔐 Default admin user created in users collection:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log('   (Change these in production using ADMIN_EMAIL/ADMIN_PASSWORD env vars)');

      // Also mirror into the admins collection for easier viewing
      await Admin.create({
        email: createdUser.email,
        password: adminPassword,
        role: 'admin',
      });
      console.log('📁 Admin entry mirrored to admins collection.');
    } else {
      console.log(`🔐 Admin user already exists in users collection: ${existingAdminUser.email}`);

      // Ensure there is an entry in the admins collection as well
      const existingAdminDoc = await Admin.findOne({ email: existingAdminUser.email });
      if (!existingAdminDoc) {
        await Admin.create({
          email: existingAdminUser.email,
          password: 'Admin123!',
          role: 'admin',
        });
        console.log('📁 Existing admin mirrored to admins collection (password hash handled by model).');
      }
    }
  } catch (err) {
    console.error('❌ Error ensuring default admin user:', err.message);
  }
});

// Middleware
// Enable CORS for frontend communication
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SecureCert API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
// Auth routes: /api/auth
app.use('/api/auth', authRoutes);

// Certificate routes: /api/cert
app.use('/api/cert', certificateRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});


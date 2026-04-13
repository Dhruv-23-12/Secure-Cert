import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const fixedAllowedOrigins = ['https://hashverify.vercel.app'];
const localhostOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const allowLocalhostCors =
  process.env.NODE_ENV !== 'production' || process.env.ALLOW_LOCALHOST_CORS === 'true';
const allowVercelPreview = process.env.ALLOW_VERCEL_PREVIEW_CORS !== 'false';

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (fixedAllowedOrigins.includes(origin)) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (allowLocalhostCors && localhostOrigins.includes(origin)) return true;
  if (allowVercelPreview && /^https:\/\/.*\.vercel\.app$/.test(origin)) return true;
  return false;
};

const ensureAdminUser = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const syncAdminFromEnv = process.env.ADMIN_SYNC_FROM_ENV !== 'false';

    // Prefer env-configured admin user
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`🔐 Admin user created: ${adminEmail}`);
    } else {
      // Ensure role is admin
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
      }

      // Keep DB password in sync with env when enabled
      if (syncAdminFromEnv) {
        adminUser.password = adminPassword;
      }

      await adminUser.save();
      console.log(`🔐 Admin user synced: ${adminEmail}`);
    }

    // Keep admins collection mirrored
    const existingAdminDoc = await Admin.findOne({ email: adminUser.email });
    if (!existingAdminDoc) {
      await Admin.create({
        email: adminUser.email,
        password: adminPassword,
        role: 'admin',
      });
      console.log('📁 Admin entry mirrored to admins collection.');
    }
  } catch (err) {
    console.error('❌ Error ensuring default admin user:', err.message);
  }
};

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (server-to-server calls, Postman)
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

// Middleware
// Enable CORS for frontend communication
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet());
app.use(morgan('combined'));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SecureCert API root',
  });
});

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

// Start server only after DB is connected
const PORT = process.env.PORT || 5000;
(async () => {
  await connectDB();
  await ensureAdminUser();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  });
})();


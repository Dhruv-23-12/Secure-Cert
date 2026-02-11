# SecureCert Backend - Setup Guide

## 📋 Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Choose one:
   - Local MongoDB installation
   - MongoDB Atlas (cloud) - [Sign up](https://www.mongodb.com/cloud/atlas)

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- dotenv - Environment variables
- cors - Cross-origin resource sharing

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/securecert

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/securecert

# JWT Secret Key (Generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# JWT Expiration
JWT_EXPIRE=7d

# Frontend URL (for QR code generation)
FRONTEND_URL=http://localhost:5173
```

**Important:** 
- Change `JWT_SECRET` to a strong random string in production
- Update `MONGODB_URI` with your actual MongoDB connection string
- Update `FRONTEND_URL` if your frontend runs on a different port

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows (if installed as service, it should auto-start)
# Or start manually:
mongod

# Mac/Linux
sudo systemctl start mongod
# or
mongod
```

**Option B: MongoDB Atlas**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `.env`

### Step 4: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ MongoDB Connected: localhost:27017
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
🏥 Health check: http://localhost:5000/api/health
```

## 🧪 Testing the API

### 1. Test Health Endpoint

```bash
curl http://localhost:5000/api/health
```

### 2. Register an Admin User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "role": "admin"
  }'
```

### 3. Register a Regular User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "User123!",
    "role": "user"
  }'
```

### 4. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

Save the `token` from the response for the next steps.

### 5. Create a Certificate (Admin Only)

Replace `<YOUR_TOKEN>` with the token from login:

```bash
curl -X POST http://localhost:5000/api/cert/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "studentName": "John Doe",
    "enrollmentNo": "EN2024001",
    "course": "Computer Science",
    "issueDate": "2024-01-15"
  }'
```

Save the `certificateId` from the response.

### 6. Verify Certificate (Public)

Replace `<CERTIFICATE_ID>` with the certificateId from step 5:

```bash
curl http://localhost:5000/api/cert/verify/<CERTIFICATE_ID>
```

### 7. List All Certificates (Admin Only)

```bash
curl -X GET http://localhost:5000/api/cert/list \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

## 🔗 Frontend Integration

Update your React frontend to connect to this backend:

1. **Update API base URL** in your frontend:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

2. **Update AuthContext** to use real API endpoints:
   - `POST /api/auth/login`
   - `POST /api/auth/register`

3. **Update certificate endpoints**:
   - `POST /api/cert/create` (with JWT token)
   - `GET /api/cert/verify/:certificateId`

4. **Add JWT token to requests**:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```

## 📁 Project Structure

```
backend/
├── server.js                    # Main entry point
├── package.json                 # Dependencies
├── .env                         # Environment variables (create this)
├── .gitignore                   # Git ignore file
├── README.md                    # API documentation
├── SETUP_GUIDE.md              # This file
├── config/
│   └── db.js                   # MongoDB connection
├── models/
│   ├── User.js                 # User schema
│   └── Certificate.js          # Certificate schema
├── routes/
│   ├── auth.routes.js          # Auth endpoints
│   └── certificate.routes.js   # Certificate endpoints
├── controllers/
│   ├── auth.controller.js      # Auth logic
│   └── certificate.controller.js # Certificate logic
├── middleware/
│   └── auth.middleware.js      # JWT authentication
└── utils/
    ├── hash.util.js            # SHA-256 hash functions
    └── qr.util.js              # QR code utilities
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- **Error:** `MongoServerError: connect ECONNREFUSED`
- **Solution:** Make sure MongoDB is running
  ```bash
  # Check if MongoDB is running
  mongosh
  ```

### Port Already in Use
- **Error:** `EADDRINUSE: address already in use :::5000`
- **Solution:** Change PORT in `.env` or stop the process using port 5000

### JWT Token Invalid
- **Error:** `Invalid token. Access denied.`
- **Solution:** Make sure you're sending the token in the Authorization header:
  ```
  Authorization: Bearer <your-token>
  ```

### Certificate Not Found
- **Error:** `Certificate not found`
- **Solution:** Make sure the certificateId is correct and exists in the database

## 📚 Next Steps

1. ✅ Backend is ready
2. 🔄 Connect frontend to backend API
3. 🧪 Test all endpoints
4. 🚀 Deploy to production (when ready)

## 💡 Tips

- Use **Postman** or **Thunder Client** (VS Code) for easier API testing
- Check MongoDB using **MongoDB Compass** or **mongosh** to view your data
- Enable CORS in production if frontend is on a different domain
- Use environment variables for all sensitive data
- Implement rate limiting for production use

---

**Happy Coding! 🎉**


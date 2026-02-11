# SecureCert Backend API

A simple, clean Node.js backend for the SecureCert certificate verification system.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
# Copy .env file and update with your values
cp .env .env.local
```

3. Start MongoDB (if running locally):
```bash
# Make sure MongoDB is running on localhost:27017
# Or update MONGODB_URI in .env to your MongoDB connection string
```

4. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Certificates
- `POST /api/cert/create` - Create certificate (Admin only)
- `GET /api/cert/verify/:certificateId` - Verify certificate (Public)
- `GET /api/cert/list` - List all certificates (Admin only)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📝 Example Requests

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "user"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Create Certificate (Admin)
```bash
POST /api/cert/create
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "studentName": "John Doe",
  "enrollmentNo": "EN2024001",
  "course": "Computer Science",
  "issueDate": "2024-01-15"
}
```

### Verify Certificate
```bash
GET /api/cert/verify/2401-ABC123-456789
```

## 🗄️ Database Models

### User
- email (unique)
- password (hashed)
- role (admin/user)
- createdAt, updatedAt

### Certificate
- certificateId (unique IRN)
- studentName
- enrollmentNo
- course
- issueDate
- status (Valid/Revoked)
- hashValue
- createdAt, updatedAt

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- SHA-256 hash for certificate integrity
- Input validation

## 📁 Project Structure

```
backend/
├── server.js              # Main entry point
├── config/
│   └── db.js             # Database connection
├── models/
│   ├── User.js           # User model
│   └── Certificate.js    # Certificate model
├── routes/
│   ├── auth.routes.js    # Auth routes
│   └── certificate.routes.js  # Certificate routes
├── controllers/
│   ├── auth.controller.js      # Auth logic
│   └── certificate.controller.js  # Certificate logic
├── middleware/
│   └── auth.middleware.js     # Authentication middleware
├── utils/
│   ├── hash.util.js      # Hash generation/verification
│   └── qr.util.js        # QR code utilities
└── .env                  # Environment variables
```

## 🧪 Testing

Test the API using tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)
- Your React frontend

## 📚 Notes

- This is a college-level project - code is kept simple and well-commented
- No over-engineering - straightforward implementation
- Suitable for academic purposes
- Ready for frontend integration


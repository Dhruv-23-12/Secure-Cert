# 🛡️ SecureCert — University Certificate Verification System

<div align="center">

**A full-stack web application for secure generation, management, and verification of university certificates using QR codes, digital hashing, and OTP-based two-factor authentication.**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Certificate Types](#-certificate-types)
- [Authentication Flow](#-authentication-flow)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**SecureCert** is a comprehensive certificate verification platform designed for universities and educational institutions. It enables administrators to generate tamper-proof certificates embedded with QR codes and cryptographic hashes, while students and employers can instantly verify certificate authenticity through QR scanning or reference number lookup.

### Why SecureCert?

- 🔒 **Tamper-proof** — Each certificate is embedded with a unique QR code and SHA-256 hash
- ⚡ **Instant verification** — Verify any certificate in seconds via QR scan or reference number
- 🎓 **Multiple certificate types** — Supports marksheets, hackathon, and sports certificates
- 📱 **Responsive** — Works seamlessly on desktop and mobile devices
- 🔐 **Secure** — OTP-based 2FA for admin access, JWT authentication, bcrypt password hashing

---

## ✨ Key Features

### 🔑 Authentication & Security
- Email/password registration and login with robust validation
- **OTP-based Two-Factor Authentication (2FA)** for admin accounts via email
- JWT token-based session management
- Password strength enforcement (uppercase, lowercase, number, special char, 8+ chars)
- Role-based access control (Admin / User)
- Protected routes with automatic redirection

### 📜 Certificate Generation (Admin)
- Generate certificates from **pre-designed HTML/CSS templates** rendered to PDF via Puppeteer
- Three certificate types: **Marksheet**, **Hackathon Participation**, **Sports Achievement**
- Automatic **QR code** embedding with verification URL
- Unique **Invoice Reference Number (IRN)** generation (`YYMM-XXXXXX-XXXXXX` format)
- **SHA-256 hash** generation for document integrity
- Live certificate preview before generation
- Batch certificate data entry with form validation

### ✅ Certificate Verification
- **Reference Number Lookup** — Enter the IRN to verify instantly
- **QR Code Scanning** — Use device camera for real-time QR scanning via `jsQR`
- **QR Image Upload** — Upload an image containing the QR code
- Detailed verification results: holder name, issue date, certificate type, status, verification history
- User activity log tracking recent verifications

### 📊 Admin Dashboard
- **Statistics overview** — Total certificates, verifications, users, database metrics
- **Certificate management** — Search, view, soft-delete, restore, and permanently delete certificates
- **Analytics tab** — Visual charts powered by Recharts
- **Certificate generation** — Form-based interface for creating new certificates with live preview
- Activity log of all generated certificates

### 🌐 Public Pages
- **Home** — Hero section with animated blobs, feature cards, how-it-works guide, FAQ accordion
- **About Us** — Mission statement and platform information
- **Contact Us** — Contact form with validation and contact details
- **Services** — Overview of platform capabilities
- **Demo** — Step-by-step verification walkthrough
- **Privacy Policy / Terms of Service / Cookie Policy** — Legal pages

### 🎨 UI/UX
- Modern design with gradient backgrounds and micro-animations
- Fully responsive layout (mobile-first, custom 900px navbar breakpoint)
- Lottie animations for OTP confirmation flow
- Interactive maps via Leaflet
- Accessible — ARIA labels, semantic HTML, keyboard navigation

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **React Router DOM 6** | Client-side routing |
| **Axios** | HTTP client |
| **Recharts** | Data visualization / charts |
| **react-qr-code / qrcode** | QR code generation |
| **jsQR** | QR code scanning & decoding |
| **pdf-lib** | Client-side PDF manipulation |
| **jsPDF + html2canvas** | PDF generation from HTML |
| **Lottie React** | Animated illustrations |
| **React Leaflet / Leaflet** | Interactive maps |
| **Headless UI / Heroicons** | Accessible UI components & icons |
| **React Hook Form** | Form management |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express 4** | Web framework & REST API |
| **MongoDB + Mongoose** | Database & ODM |
| **Puppeteer** | Headless Chrome for PDF rendering |
| **Nunjucks** | HTML template engine for certificates |
| **JWT (jsonwebtoken)** | Token-based authentication |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Email service for OTP delivery |
| **Multer** | File upload handling |
| **QRCode** | Server-side QR code generation |

---

## 📁 Project Structure

```
SecureCert/
├── backend/                    # Express.js API server
│   ├── config/
│   │   └── db.js               # MongoDB connection setup
│   ├── controllers/
│   │   ├── auth.controller.js  # Login, signup, OTP verification
│   │   └── certificate.controller.js  # CRUD, generate, verify
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification
│   │   └── admin.middleware.js  # Admin role check
│   ├── models/
│   │   ├── User.js             # User schema (email, password, role, OTP)
│   │   ├── Admin.js            # Admin mirror schema
│   │   └── Certificate.js      # Certificate schema (IRN, hash, QR, data)
│   ├── routes/
│   │   ├── auth.routes.js      # /api/auth/*
│   │   └── certificate.routes.js  # /api/cert/*
│   ├── templates/              # Nunjucks HTML certificate templates
│   │   ├── base.html           # Shared base layout
│   │   ├── marksheet.html      # Academic marksheet template
│   │   ├── hackathon.html      # Hackathon participation template
│   │   └── sports.html         # Sports achievement template
│   ├── utils/
│   │   ├── email.js            # Nodemailer transporter & send OTP
│   │   ├── hash.util.js        # SHA-256 hash generation
│   │   └── qr.util.js          # QR code data URL generation
│   ├── server.js               # Express app entry point
│   ├── .env                    # Backend environment variables
│   └── package.json
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Responsive navbar with auth state
│   │   │   ├── Footer.jsx              # Four-column footer
│   │   │   ├── HeroAnimation.jsx       # Animated hero section
│   │   │   ├── CertificateGenerator.jsx     # Certificate form & generation
│   │   │   ├── CertificatePreviewModal.jsx  # Live certificate preview
│   │   │   ├── CertificateTypeSelector.jsx  # Certificate type picker
│   │   │   └── UserActivity.jsx        # Recent verification log
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Global auth state (React Context)
│   │   ├── pages/
│   │   │   ├── Home.jsx                # Landing page
│   │   │   ├── Login.jsx               # Login + OTP 2FA flow
│   │   │   ├── Signup.jsx              # Registration with validation
│   │   │   ├── AdminLogin.jsx          # Admin-specific login
│   │   │   ├── AdminDashboard.jsx      # Dashboard (stats, manage, analytics)
│   │   │   ├── VerifyCertificate.jsx   # QR scan / reference lookup
│   │   │   ├── UserVerification.jsx    # User verification page
│   │   │   ├── Marksheet.jsx           # Marksheet entry form
│   │   │   ├── HackathonCertificate.jsx # Hackathon cert entry form
│   │   │   ├── SportsCertificate.jsx   # Sports cert entry form
│   │   │   ├── AboutUs.jsx
│   │   │   ├── ContactUs.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Demo.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   ├── TermsOfService.jsx
│   │   │   └── Cookies.jsx
│   │   ├── assets/                     # Images and static files
│   │   ├── config/                     # API configuration
│   │   ├── App.jsx                     # Root component with routing
│   │   ├── App.css
│   │   ├── index.css                   # Global + Tailwind directives
│   │   └── main.jsx                    # React DOM entry point
│   ├── public/
│   ├── .env                    # Frontend environment variables
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── install.bat                 # One-click dependency installer (Windows)
├── PROJECT_ANALYSIS.md         # Detailed feature documentation
└── README.md                   # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dhruv-23-12/Secure-Cert.git
   cd Secure-Cert
   ```

2. **Install dependencies**

   **Option A — One-click (Windows):**
   ```bash
   install.bat
   ```

   **Option B — Manual:**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment variables** (see [Environment Variables](#-environment-variables))

4. **Start the development servers**
   ```bash
   # Terminal 1 — Backend (port 5000)
   cd backend
   npm run dev

   # Terminal 2 — Frontend (port 5173)
   cd frontend
   npm run dev
   ```

5. **Open the app** → [http://localhost:5173](http://localhost:5173)

### Default Admin Account

On first startup, the backend automatically seeds a default admin user:

| Field | Value |
|---|---|
| Email | `admin@example.com` (or `ADMIN_EMAIL` env var) |
| Password | `Admin123!` (or `ADMIN_PASSWORD` env var) |

> ⚠️ **Change these credentials in production** by setting the `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | — |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `ADMIN_EMAIL` | Default admin email | `admin@example.com` |
| `ADMIN_PASSWORD` | Default admin password | `Admin123!` |
| `EMAIL_USER` | SMTP email address (for OTP) | — |
| `EMAIL_PASS` | SMTP app password (for OTP) | — |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

---

## 📡 API Endpoints

### Authentication — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Register a new user | — |
| `POST` | `/login` | Login (returns JWT or triggers OTP for admins) | — |
| `POST` | `/verify-2fa` | Verify OTP code for admin 2FA | — |

### Certificates — `/api/cert`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/generate` | Generate a new certificate (PDF) | Admin |
| `GET` | `/verify/:referenceNumber` | Verify a certificate by IRN | User |
| `GET` | `/all` | Get all certificates | Admin |
| `GET` | `/:id` | Get a single certificate by ID | Admin |
| `DELETE` | `/:id` | Soft-delete a certificate | Admin |
| `PATCH` | `/:id/restore` | Restore a soft-deleted certificate | Admin |
| `DELETE` | `/:id/permanent` | Permanently delete a certificate | Admin |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server status check |

---

## 🎓 Certificate Types

### 1. Academic Marksheet
- Multi-subject grade report with semester details
- Supports SGPA/CGPA calculation
- Includes student photo, university logo, and QR code
- Fields: student name, enrollment number, semester, subjects with marks/grades

### 2. Hackathon Participation Certificate
- Modern blue/purple gradient design
- Fields: participant name, hackathon name, date, team name, project title
- Landscape A4 with decorative border and QR code

### 3. Sports Achievement Certificate
- Green/gold color scheme
- Fields: athlete name, sport, event, achievement/position, date
- Landscape A4 with medal-style design elements and QR code

All certificates are rendered from **Nunjucks HTML templates** → **Puppeteer (headless Chrome)** → **PDF**, ensuring pixel-perfect output.

---

## 🔐 Authentication Flow

```
User Login                          Admin Login
  │                                     │
  ├─ POST /api/auth/login               ├─ POST /api/auth/login
  │                                     │
  ├─ ✅ JWT token returned              ├─ 🔒 OTP sent via email
  │                                     │
  └─ Redirect to Home                  ├─ Enter 6-digit OTP
                                        │
                                        ├─ POST /api/auth/verify-2fa
                                        │
                                        ├─ ✅ JWT token returned
                                        │
                                        └─ Redirect to Admin Dashboard
```

- Passwords hashed with **bcryptjs** before storage
- JWT tokens used for subsequent API authorization
- OTP codes expire after **30 seconds**, max **3 attempts** before lockout
- OTP delivery via **Nodemailer** (SMTP)

---

## 🌐 Deployment

The application is deployed as a split architecture:

| Service | Platform | URL |
|---|---|---|
| **Frontend** | Vercel | *Your Vercel URL* |
| **Backend** | Render | https://secure-cert-kumw.onrender.com |
| **Database** | MongoDB Atlas | Cloud-hosted cluster |

### Deploy Frontend (Vercel)

1. Import the `frontend/` directory in [Vercel](https://vercel.com)
2. Set the environment variable `VITE_API_URL` to your Render backend URL
3. Build command: `npm run build`
4. Output directory: `dist`

### Deploy Backend (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Root directory: `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Set all required environment variables (see [Environment Variables](#-environment-variables))

---

## 🖼️ Screenshots

> Screenshots can be added here to showcase the application's UI.

| Page | Description |
|---|---|
| Home | Landing page with hero section and feature cards |
| Login | Email/password form with OTP 2FA for admins |
| Admin Dashboard | Statistics, certificate generation, and management |
| Verify Certificate | QR scanner and reference number verification |
| Certificate Preview | Live preview modal before PDF generation |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Built with ❤️ for secure academic credential verification**

</div>

@echo off
echo ==========================================
echo    SecureCert Dependency Installer
echo ==========================================
echo.

echo [1/2] Backend Dependencies:
echo    - bcryptjs: Password hashing
echo    - cors: Cross-Origin Resource Sharing
echo    - dotenv: Environment variable management
echo    - express: Web application framework
echo    - jsonwebtoken: JWT authentication
echo    - mongoose: MongoDB object modeling
echo    - multer: File upload handling
echo    - nodemailer: Email sending
echo    - nunjucks: Template engine
echo    - puppeteer: Headless browser automation
echo    - qrcode: QR code generation
echo.
echo Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b %errorlevel%
)
cd ..
echo Backend dependencies installed.
echo.

echo [2/2] Frontend Dependencies:
echo    - @headlessui/react: UI components
echo    - @heroicons/react: Icon library
echo    - @react-google-maps/api: Google Maps integration
echo    - axios: HTTP client
echo    - html2canvas: Screenshot capture
echo    - jspdf: PDF generation
echo    - jsqr: QR code reading
echo    - leaflet: Interactive maps
echo    - lottie-react: Animation rendering
echo    - pdf-lib: PDF manipulation
echo    - qrcode: QR code generation
echo    - react: UI library
echo    - react-dom: React DOM rendering
echo    - react-hook-form: Form management
echo    - react-leaflet: React components for Leaflet
echo    - react-qr-code: QR code component
echo    - react-router-dom: Routing
echo    - recharts: Charting library
echo.
echo Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b %errorlevel%
)
cd ..
echo Frontend dependencies installed.
echo.

echo ==========================================
echo    All dependencies installed!
echo    You can now run the app.
echo ==========================================
pause

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import VerifyCertificate from './pages/VerifyCertificate';
import Demo from './pages/Demo';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import TermsOfService from './pages/TermsOfService';
import Services from './pages/Services';
import Cookies from './pages/Cookies';
import AdminLogin from './pages/AdminLogin';
import Marksheet from './pages/Marksheet';
import HackathonCertificate from './pages/HackathonCertificate';
import SportsCertificate from './pages/SportsCertificate';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    // Store the attempted URL to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  // If logged in but not admin and trying to access admin route, redirect to home
  if (user.role !== 'admin' && window.location.pathname === '/admin') {
    return <Navigate to="/" replace />;
  }

  // Show the protected content
  return children;
};

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

// Inner component to usage of useLocation hook
function AppContent() {
  const location = useLocation();

  return (
    <>
      <ScrollToTopOnRouteChange />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow relative">
          <div key={location.pathname} className="animate-fade-in">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              {/* Obscure URL for admin login */}
              <Route path="/SecureCert-admin" element={<AdminLogin />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/services" element={<Services />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/marksheet" element={<Marksheet />} />
              <Route path="/certificate/hackathon/:id" element={<HackathonCertificate />} />
              <Route path="/certificate/sports/:id" element={<SportsCertificate />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
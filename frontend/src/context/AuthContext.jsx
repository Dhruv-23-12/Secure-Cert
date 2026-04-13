import { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../config/api';


const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (e.g., check localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return { success: false, message: data?.message || 'Login failed' };
      }

      // Check for 2FA requirement
      if (data.require2FA) {
        return {
          success: true,
          require2FA: true,
          userId: data.userId,
          email: data.email
        };
      }

      if (!data.success || !data.data?.user) {
        return { success: false, message: data?.message || 'Login failed' };
      }

      const userData = {
        id: data.data.user.id,
        email: data.data.user.email,
        role: data.data.user.role,
        token: data.data.token,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
      }

      return { success: true, require2FA: false };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error or server down' };
    }
  };

  const sendOTP = async (email) => {
    try {
      const response = await fetch(apiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        return { success: false, message: data?.message || 'Failed to send OTP' };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false, message: 'Error sending OTP' };
    }
  };

  const verifyOTP = async ({ email, code, userId }) => {
    try {
      const response = await fetch(apiUrl('/api/auth/verify-2fa'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId, code })
      });
      const data = await response.json();

      if (data.success && data.data.token) {
        const userData = {
          id: data.data.user.id,
          email: data.data.user.email,
          role: data.data.user.role,
          token: data.data.token,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.data.token);
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || 'Verification failed',
          attemptsLeft: data.attemptsLeft,
        };
      }
    } catch (error) {
      return { success: false, message: 'Error verifying OTP' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    loading,
    login,
    sendOTP,
    verifyOTP,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
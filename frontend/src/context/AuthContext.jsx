import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// API base URL (Vite env or fallback to localhost backend)
const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  'http://localhost:5000/api';

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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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

  const verifyOTP = async (userId, code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
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
        return { success: false, message: data.message || 'Verification failed' };
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
    verifyOTP,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
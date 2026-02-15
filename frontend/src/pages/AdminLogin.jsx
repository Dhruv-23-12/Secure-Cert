import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Animated Shield SVG ────────────────────────────────── */
function AnimatedShield() {
  return (
    <svg viewBox="0 0 200 220" className="w-44 h-44 md:w-56 md:h-56 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 8px 32px rgba(99,102,241,0.35))' }}>
      <defs>
        <linearGradient id="shG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="shG2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>
      </defs>

      {/* Outer glow ring */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1">
        <animate attributeName="r" values="90;98;90" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.08;0.15;0.08" dur="4s" repeatCount="indefinite" />
      </circle>

      {/* Shield body */}
      <path d="M100,15 L175,45 L175,95 C175,145 100,185 100,185 C100,185 25,145 25,95 L25,45 Z"
        fill="url(#shG)" opacity="0.95">
        <animate attributeName="d"
          values="M100,15 L175,45 L175,95 C175,145 100,185 100,185 C100,185 25,145 25,95 L25,45 Z;
                  M100,12 L178,43 L178,97 C178,148 100,188 100,188 C100,188 22,148 22,97 L22,43 Z;
                  M100,15 L175,45 L175,95 C175,145 100,185 100,185 C100,185 25,145 25,95 L25,45 Z"
          dur="6s" repeatCount="indefinite" />
      </path>

      {/* Inner shield */}
      <path d="M100,28 L162,52 L162,92 C162,134 100,168 100,168 C100,168 38,134 38,92 L38,52 Z"
        fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" />

      {/* Lock body */}
      <rect x="82" y="90" width="36" height="30" rx="5" fill="white" opacity="0.95">
        <animate attributeName="opacity" values="0.95;1;0.95" dur="3s" repeatCount="indefinite" />
      </rect>

      {/* Lock shackle */}
      <path d="M88,90 L88,78 C88,66 112,66 112,78 L112,90"
        fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.9" />

      {/* Keyhole */}
      <circle cx="100" cy="102" r="5" fill="url(#shG2)" />
      <rect x="98" y="104" width="4" height="8" rx="2" fill="url(#shG2)" />

      {/* Checkmark (appears periodically) */}
      <g opacity="0">
        <circle cx="140" cy="55" r="14" fill="#10b981" />
        <path d="M133,55 L138,60 L148,49" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <animate attributeName="opacity" values="0;0;1;1;0" dur="5s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState(['', '', '', '', '', '']);
  const [tempUserData, setTempUserData] = useState(null);
  const [twoFATimer, setTwoFATimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let interval;
    if (show2FA && twoFATimer > 0) {
      interval = setInterval(() => {
        setTwoFATimer((prev) => prev - 1);
      }, 1000);
    } else if (twoFATimer === 0) {
      setError('2FA code expired. Please click "Resend Code".');
      setCanResend(true);
      setResendTimer(0);
    }
    return () => clearInterval(interval);
  }, [show2FA, twoFATimer]);

  useEffect(() => {
    let interval;
    if (!canResend && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [canResend, resendTimer]);

  useEffect(() => {
    if (attempts >= 5) {
      setBlocked(true);
      setError('Too many failed attempts. Please try again later.');
      setTimeout(() => {
        setBlocked(false);
        setAttempts(0);
        setError('');
      }, 60000);
    }
  }, [attempts]);

  const handleResendCode = async () => {
    setTwoFATimer(30);
    setResendTimer(60);
    setCanResend(false);
    setError('Code resend simulation: Check console/email if implemented.');
  };

  const handleCodeChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newCode = [...twoFACode];
    newCode[index] = value;
    setTwoFACode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !twoFACode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^[0-9]+$/.test(pastedData)) return;
    const newCode = [...twoFACode];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setTwoFACode(newCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (blocked) {
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);

      if (result.success) {
        if (result.require2FA) {
          setTempUserData({ userId: result.userId, email: result.email });
          setShow2FA(true);
          setTwoFATimer(600);
          setResendTimer(60);
          setCanResend(false);
        } else {
          const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
          if (storedUser?.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            setError('Access denied: Admin privileges required.');
          }
        }
      } else {
        setAttempts(prev => prev + 1);
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { verifyOTP } = useAuth();

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (!tempUserData?.userId) return;

    const code = twoFACode.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(tempUserData.userId, code);

      if (result.success) {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (storedUser?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          setError('Access denied: Admin privileges required.');
        }
      } else {
        setError(result.message || 'Invalid code. Please try again.');
        setTwoFACode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.3); }
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(99,102,241,0.2); }
          50% { border-color: rgba(99,102,241,0.5); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.7s ease-out forwards; }
        .animate-slide-in { animation: slideInRight 0.6s ease-out forwards; }
        .animate-gradient { 
          background-size: 200% 200%; 
          animation: gradientMove 8s ease infinite; 
        }
        .input-glow:focus {
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 1px 2px rgba(0,0,0,0.05);
        }
        .btn-shine {
          position: relative;
          overflow: hidden;
        }
        .btn-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 40%;
          height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: skewX(-20deg);
          animation: shimmer 4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { left: -60%; }
          100% { left: 120%; }
        }
      `}</style>

      {/* ─── LEFT PANEL (hidden on mobile) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #4f46e5 100%)',
        }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 animate-gradient opacity-30"
          style={{
            background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #6366f1, #4f46e5)',
            backgroundSize: '300% 300%',
          }}
        />

        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-10 w-40 h-40 bg-indigo-400/5 rounded-full blur-2xl" />

        {/* Floating dots */}
        <div className="absolute inset-0">
          {[
            { top: '12%', left: '18%', size: 6, delay: '0s', dur: '3s' },
            { top: '25%', left: '75%', size: 4, delay: '0.5s', dur: '2.5s' },
            { top: '55%', left: '12%', size: 5, delay: '1s', dur: '3.5s' },
            { top: '70%', left: '80%', size: 3, delay: '1.5s', dur: '2.8s' },
            { top: '85%', left: '35%', size: 4, delay: '0.3s', dur: '3.2s' },
            { top: '40%', left: '55%', size: 5, delay: '0.8s', dur: '2.6s' },
            { top: '15%', left: '45%', size: 3, delay: '1.2s', dur: '3.8s' },
            { top: '90%', left: '65%', size: 4, delay: '0.6s', dur: '3s' },
          ].map((dot, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                top: dot.top,
                left: dot.left,
                width: dot.size,
                height: dot.size,
                animation: `pulse-dot ${dot.dur} ease-in-out ${dot.delay} infinite`,
              }}
            />
          ))}
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          {/* Shield animation */}
          <div className="animate-float mb-10">
            <AnimatedShield />
          </div>

          {/* Text */}
          <div className="text-center animate-fade-in-up">
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
              SecureCert Admin
            </h1>
            <p className="text-indigo-200/70 text-base max-w-sm leading-relaxed">
              Manage certificates, verify documents, and control your institution's credential system from one secure dashboard.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {['🔐 Encrypted', '⚡ Real-time', '🛡️ Protected'].map((label, i) => (
              <span key={i}
                className="px-4 py-1.5 rounded-full text-xs font-medium text-indigo-100 border border-indigo-400/20 bg-white/5 backdrop-blur-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (form) ─── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10 w-full max-w-md animate-slide-in">
          {/* Logo + heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/25 mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {show2FA ? 'Two-Factor Authentication' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-500">
              {show2FA
                ? `Enter the 6-digit code sent to your email. Expires in ${twoFATimer}s.`
                : 'Sign in to your admin dashboard'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            {show2FA ? (
              <form className="space-y-5" onSubmit={handle2FASubmit}>
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 p-3.5 rounded-xl text-sm animate-fade-in-up">
                    <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{error}</p>
                  </div>
                )}

                {/* 2FA animation */}
                <div className="flex justify-center py-2">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Enter 6-digit verification code
                  </label>
                  <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
                    {twoFACode.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50 hover:border-indigo-300 input-glow"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-shine w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : 'Verify Code'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={!canResend || loading}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 disabled:opacity-40 transition-all"
                  >
                    {loading ? 'Sending...' : canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShow2FA(false);
                      setTempUserData(null);
                      setTwoFACode(['', '', '', '', '', '']);
                      setError('');
                      setAttempts(0);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 transition-all"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 p-3.5 rounded-xl text-sm animate-fade-in-up">
                    <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{error}</p>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50 hover:border-indigo-300 input-glow"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={blocked}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="block w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50/50 hover:border-indigo-300 input-glow"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={blocked}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-colors"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      disabled={blocked}
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || blocked}
                  className="btn-shine w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Protected by SecureCert • End-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
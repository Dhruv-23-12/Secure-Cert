import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import signupAnimation from '../assets/animations/signup.json';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [signupSummary, setSignupSummary] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  // Password requirements check
  const passwordChecks = [
    {
      label: 'At least 8 characters',
      test: (pw) => pw.length >= 8,
    },
    {
      label: 'At least one uppercase letter',
      test: (pw) => /[A-Z]/.test(pw),
    },
    {
      label: 'At least one lowercase letter',
      test: (pw) => /[a-z]/.test(pw),
    },
    {
      label: 'At least one number',
      test: (pw) => /[0-9]/.test(pw),
    },
    {
      label: 'At least one special character',
      test: (pw) => /[^A-Za-z0-9]/.test(pw),
    },
  ];

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Enter a valid email address.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(form.password)) errs.password = 'Password must contain an uppercase letter.';
    if (!/[a-z]/.test(form.password)) errs.password = 'Password must contain a lowercase letter.';
    if (!/[0-9]/.test(form.password)) errs.password = 'Password must contain a number.';
    if (!/[^A-Za-z0-9]/.test(form.password)) errs.password = 'Password must contain a special character.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setSuccess('');
    setApiError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSuccess('');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: 'user',
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setApiError(data?.message || 'Failed to create account. Please try again.');
        return;
      }

      setSuccess('Signup successful! You can now log in.');
      setSignupSummary({ name: form.name, password: form.password });
      setForm({ name: '', email: '', password: '', confirmPassword: '' });
      setErrors({});
    } catch (err) {
      setApiError('An error occurred while creating your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndRedirect = () => {
    setSignupSummary(null);
    navigate('/login');
  };

  // Generate a strong password
  const suggestPassword = () => {
    const length = 12;
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = upper + lower + numbers + special;
    let pwd = '';
    // Ensure at least one of each
    pwd += upper[Math.floor(Math.random() * upper.length)];
    pwd += lower[Math.floor(Math.random() * lower.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += special[Math.floor(Math.random() * special.length)];
    for (let i = 4; i < length; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }
    // Shuffle password
    pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');
    setForm(f => ({ ...f, password: pwd, confirmPassword: pwd }));
    setShowPassword(true);
    setShowConfirmPassword(true);
    setErrors(e => ({ ...e, password: '', confirmPassword: '' }));
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-white">
      {/* Left Side - Animation (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-500 to-indigo-700 justify-center items-center relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 w-3/4 max-w-lg text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="w-full h-80">
              <Lottie animationData={signupAnimation} loop={true} className="w-full h-full" />
            </div>
            <h2 className="text-3xl font-bold text-white mt-6">Join SecureCert</h2>
            <p className="mt-4 text-indigo-100 text-lg font-light leading-relaxed">
              Create your account to start issuing, verifying, and managing digital certificates with ease and security.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-10">
          <div className="text-center">
            {/* Mobile Logo */}
            <div className="flex justify-center mb-6 lg:hidden">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-3 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join us to verify and manage your certificates securely
            </p>
          </div>

          <div className="mt-8">
            {/* Content Container */}
            <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
              {success && signupSummary && (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4 animate-bounce">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Account Created Successfully!</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    {signupSummary.name}, your account has been created. You can now sign in.
                  </p>
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      Sign In to Your Account
                    </Link>
                  </div>
                </div>
              )}
              {!success && (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {apiError && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-fade-in text-sm">
                      {apiError}
                    </div>
                  )}
                  {errors.name && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-fade-in text-sm">
                      {errors.name}
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all bg-gray-50 hover:border-indigo-300"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all bg-gray-50 hover:border-indigo-300"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        onFocus={() => setPasswordFocused(true)}
                        className="appearance-none block w-full px-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all bg-gray-50 hover:border-indigo-300"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={suggestPassword}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Suggest Strong Password
                      </button>
                    </div>

                    {/* Password Requirements Checklist - Only show if focused or has value */}
                    {(passwordFocused || form.password) && (
                      <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-md border border-gray-100">
                        {passwordChecks.map((check, index) => (
                          <div key={index} className="flex items-center">
                            <div className={`flex-shrink-0 h-4 w-4 rounded-full border flex items-center justify-center ${check.test(form.password) ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}>
                              {check.test(form.password) && (
                                <svg className="h-2.5 w-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className={`ml-2 text-xs ${check.test(form.password) ? 'text-green-600' : 'text-gray-500'}`}>
                              {check.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-3 border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all bg-gray-50 hover:border-indigo-300"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        checked={agreed}
                        onChange={e => setAgreed(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                        I agree to the{' '}
                        <Link to="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">Terms</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">Privacy Policy</Link>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                      disabled={!agreed || submitting}
                    >
                      {submitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                          Creating account...
                        </span>
                      ) : 'Create Account'}
                    </button>
                  </div>
                </form>
              )}

              {!success && (
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Already available?</span>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Link to="/login" className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-indigo-600 bg-white hover:bg-gray-50 transition-all duration-200">
                      Sign in to your account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
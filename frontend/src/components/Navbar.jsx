import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

// Add this style block at the top of your component (after imports, before export default)
const customNavbarStyles = `
  @media (max-width: 900px) {
    .hide-900 { display: none !important; }
    .show-900 { display: flex !important; }
  }
  @media (min-width: 901px) {
    .hide-900 { display: flex !important; }
    .show-900 { display: none !important; }
  }
`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const mobileMenuRef = useRef();
  const buttonRef = useRef();
  const hamburgerRef = useRef();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown and mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if click is outside both the button and dropdown
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
      // Check if click is outside both the hamburger button and mobile menu
      if (
        mobileMenuRef.current &&
        hamburgerRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    }

    // Add click event listener to the document
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      {/* Custom style for 900px breakpoint */}
      <style>{customNavbarStyles}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-lg font-bold text-indigo-700 hover:text-indigo-900">
              SecureCert
            </Link>
            {/* Desktop Navigation (hide on <=900px) */}
            <div className="hide-900 space-x-6">
              <Link to="/" className="group relative text-gray-700 hover:text-indigo-700 font-medium">
                Home
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
              </Link>
              <Link to="/verify" className="group relative text-gray-700 hover:text-indigo-700 font-medium">
                Verify
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
              </Link>
              <Link to="/about" className="group relative text-gray-700 hover:text-indigo-700 font-medium">
                About Us
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
              </Link>
              <Link to="/contact" className="group relative text-gray-700 hover:text-indigo-700 font-medium">
                Contact
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
              </Link>
              <Link to="/privacy" className="group relative text-gray-700 hover:text-indigo-700 font-medium">
                Privacy
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="group relative text-gray-700 hover:text-indigo-700 font-medium">
                  Admin Dashboard
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
                </Link>
              )}
            </div>
          </div>
          {/* Right side: Hamburger and Login */}
          <div className="flex items-center space-x-2">
            {/* Hamburger for mobile (show on <=900px) */}
            <div className="show-900 items-center">
              <button
                ref={hamburgerRef}
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-label="Toggle navigation menu"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
            <div className="relative flex items-center space-x-2">
              {!user && (
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              {user && (
                <div>
                  <button
                    ref={buttonRef}
                    onClick={toggleDropdown}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium bg-white hover:bg-gray-100 focus:outline-none"
                  >
                    <span className="mr-2">{user.email}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-64 bg-white text-gray-900 rounded-lg shadow-lg z-50 border border-gray-200"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="text-xs text-gray-500">Signed in as</div>
                        <div className="font-bold text-gray-900">{user.email}</div>
                      </div>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <span className="text-xs text-gray-500">Role:</span>
                        <span className="ml-2 font-semibold text-gray-900">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-indigo-700 hover:bg-gray-100 font-semibold border-b border-gray-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 font-semibold rounded-b-lg transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Mobile Navigation Menu (show on <=900px) */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="show-900 flex flex-col gap-y-2 bg-white shadow rounded-lg border border-gray-200 mt-3 mx-2 p-3 z-50 relative"
          >
            <Link to="/" className="group relative block text-gray-700 hover:text-indigo-700 font-medium px-4 py-2 rounded transition" onClick={() => setMobileMenuOpen(false)}>
              Home
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
            </Link>
            <Link to="/verify" className="group relative block text-gray-700 hover:text-indigo-700 font-medium px-4 py-2 rounded transition" onClick={() => setMobileMenuOpen(false)}>
              Verify
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
            </Link>
            <Link to="/about" className="group relative block text-gray-700 hover:text-indigo-700 font-medium px-4 py-2 rounded transition" onClick={() => setMobileMenuOpen(false)}>
              About Us
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
            </Link>
            <Link to="/contact" className="group relative block text-gray-700 hover:text-indigo-700 font-medium px-4 py-2 rounded transition" onClick={() => setMobileMenuOpen(false)}>
              Contact
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
            </Link>
            <Link to="/privacy" className="group relative block text-gray-700 hover:text-indigo-700 font-medium px-4 py-2 rounded transition" onClick={() => setMobileMenuOpen(false)}>
              Privacy
              <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="group relative block text-gray-700 hover:text-indigo-700 font-medium px-4 py-2 rounded transition" onClick={() => setMobileMenuOpen(false)}>
                Admin Dashboard
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500"></span>
              </Link>
            )}
            {!user && (
              <div className="flex flex-col gap-y-2 pt-2 border-t border-gray-200">
                <Link
                  to="/login"
                  className="w-full block text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="w-full block text-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
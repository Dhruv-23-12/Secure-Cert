import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#232837] text-gray-200 pt-12 pb-6 mt-12 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand & Social */}
        <div>
          <div className="text-xl font-bold mb-2">SecureCert</div>
          <p className="text-sm text-gray-400 mb-4">Secure document verification platform for all your certification needs.</p>
          <div className="flex space-x-4 mb-2">
            <a href="#" aria-label="Facebook" className="hover:text-[#ff80b5]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12" /></svg>
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-[#ff80b5]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.84 1.95 3.62-.72-.02-1.4-.22-1.99-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.68 2.11 2.9 3.97 2.93A8.6 8.6 0 012 19.54a12.13 12.13 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19-.01-.37-.02-.56A8.72 8.72 0 0024 4.59a8.48 8.48 0 01-2.54.7z" /></svg>
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-[#ff80b5]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41.59.22 1.01.48 1.45.92.44.44.7.86.92 1.45.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43-.22.59-.48 1.01-.92 1.45-.44.44-.86.7-1.45.92-.46.17-1.26.354-2.43.41-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41-.59-.22-1.01-.48-1.45-.92-.44-.44-.7-.86-.92-1.45-.17-.46-.354-1.26-.41-2.43C2.212 15.784 2.2 15.4 2.2 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43.22-.59.48-1.01.92-1.45.44-.44.86-.7 1.45-.92.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.012 7.052.07 5.77.128 4.87.312 4.1.54c-.77.23-1.42.54-2.07 1.19-.65.65-.96 1.3-1.19 2.07-.23.77-.412 1.67-.47 2.95C.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.282.24 2.182.47 2.95.23.77.54 1.42 1.19 2.07.65.65 1.3.96 2.07 1.19.77.23 1.67.412 2.95.47C8.332 23.988 8.736 24 12 24s3.668-.012 4.948-.07c1.282-.058 2.182-.24 2.95-.47.77-.23 1.42-.54 2.07-1.19.65-.65.96-1.3 1.19-2.07.23-.77.412-1.67.47-2.95.058-1.28.07-1.684.07-4.948s-.012-3.668-.07-4.948c-.058-1.282-.24-2.182-.47-2.95-.23-.77-.54-1.42-1.19-2.07-.65-.65-1.3-.96-2.07-1.19-.77-.23-1.67-.412-2.95-.47C15.668.012 15.264 0 12 0z" /><circle cx="12" cy="12" r="3.5" /><circle cx="18.5" cy="5.5" r="1.5" /></svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-[#ff80b5]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.966 0-1.75-.79-1.75-1.75s.784-1.75 1.75-1.75 1.75.79 1.75 1.75-.784 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.38v4.59h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" /></svg>
            </a>
          </div>
        </div>
        {/* Quick Links */}
        <div>
          <div className="font-semibold mb-2">Quick Links</div>
          <ul className="space-y-1 text-sm">
            <li><Link to="/" className="hover:text-[#ff80b5]">Home</Link></li>
            <li><Link to="/about" className="hover:text-[#ff80b5]">About Us</Link></li>
            <li><Link to="/services" className="hover:text-[#ff80b5]">Services</Link></li>
            <li><Link to="/contact" className="hover:text-[#ff80b5]">Contact</Link></li>
          </ul>
        </div>
        {/* Services */}
        <div>
          <div className="font-semibold mb-2">Services</div>
          <ul className="space-y-1 text-sm">
            <li>Document Verification</li>
            <li>Certificate Generation</li>
            <li>Blockchain Security</li>
            <li>API Integration</li>
          </ul>
        </div>
        {/* Contact Us */}
        <div>
          <div className="font-semibold mb-2">Contact Us</div>
          <ul className="space-y-1 text-sm">
            <li>Email: info@securecert.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Address: 123 Verification Street</li>
            <li>New York, NY 10001</li>
          </ul>
        </div>
      </div>
      <hr className="my-6 border-gray-700" />
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-2">
        <div>© {new Date().getFullYear()} SecureCert. All rights reserved.</div>
        <div className="flex space-x-4">
          <Link to="/privacy" className="hover:text-[#ff80b5]">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-[#4f46e5]">Terms of Service</Link>
          <Link to="/cookies" className="hover:text-[#ff80b5]">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}
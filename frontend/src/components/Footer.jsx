import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      toast.success('Thanks for subscribing!');
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const footerLinks = {
    Shop: [
      { name: 'New Arrivals', link: '/new-arrivals' },
      { name: 'Dresses', link: '/dresses' },
      { name: 'Best Sellers', link: '/best-sellers' },
      { name: 'Sale', link: '/sale' },
    ],
    Support: [
      { name: 'Help & Support', link: '/help' },
      { name: 'Privacy Policy', link: '/privacy' },
      { name: 'Terms & Conditions', link: '/Terms' },
      { name: 'Returns & Exchanges', link: '/returns' },
    ],
    Contact: [
      { name: 'support@liora.com', link: 'mailto:support@liora.com' },
      { name: '+91 98765 43210', link: 'tel:+919876543210' },
      { name: 'Mon–Sat, 9AM–6PM', link: '#' },
    ],
  };

  return (
    <footer className="bg-white border-t-2 border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-4 tracking-wide">
              Liora
            </h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Fashion that moves with you. Discover timeless pieces that define your style.
            </p>
            <div className="flex gap-5">
              <a href="#" className="text-gray-500 hover:text-gray-900 transition font-medium text-sm">
                Instagram
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition font-medium text-sm">
                Facebook
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition font-medium text-sm">
                Pinterest
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-5">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.Shop.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.link}
                    className="text-gray-500 hover:text-gray-900 transition font-medium text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-5">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.Support.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.link}
                    className="text-gray-500 hover:text-gray-900 transition font-medium text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-5">
              Contact
            </h4>
            <ul className="space-y-3">
              {footerLinks.Contact.map((link, idx) => (
                <li key={idx}>
                  {link.link.startsWith('mailto:') || link.link.startsWith('tel:') ? (
                    <a
                      href={link.link}
                      className="text-gray-500 hover:text-gray-900 transition font-medium text-sm"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">{link.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Bolder */}
        <div className="border-t-2 border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6 text-sm">
              <Link to="/terms" className="text-gray-500 hover:text-gray-900 transition font-medium">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="text-gray-500 hover:text-gray-900 transition font-medium">
                Privacy Policy
              </Link>
              <Link to="/shipping" className="text-gray-500 hover:text-gray-900 transition font-medium">
                Shipping Policy
              </Link>
              <Link to="/returns" className="text-gray-500 hover:text-gray-900 transition font-medium">
                Return Policy
              </Link>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Liora. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
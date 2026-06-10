import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {ShoppingBagIcon, ArrowPathIcon, ChatBubbleLeftRightIcon,  ChevronDownIcon,  ChevronUpIcon,  EnvelopeIcon,  PhoneIcon,  ClockIcon,  MagnifyingGlassIcon,  TruckIcon,  CreditCardIcon,  ShieldCheckIcon,  ArrowLeftIcon,  UserIcon,  DocumentTextIcon,  GlobeAltIcon,  ScaleIcon,  CalculatorIcon} from '@heroicons/react/24/outline';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    issueType: 'order',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ subject: '', issueType: 'order', message: '' });
  };

  const helpCategories = [
    { 
      title: "My Account", 
      icon: UserIcon, 
      description: "But students often neglect the fact that it is much more.",
      link: "/account-help"
    },
    { 
      title: "Charges & Refunds", 
      icon: CreditCardIcon, 
      description: "But students often neglect the fact that it is much more.",
      link: "/refund-help"
    },
    { 
      title: "Payouts", 
      icon: CurrencyRupeeIcon, 
      description: "But students often neglect the fact that it is much more.",
      link: "/payout-help"
    },
    { 
      title: "Connect", 
      icon: ChatBubbleLeftRightIcon, 
      description: "But students often neglect the fact that it is much more.",
      link: "/connect-help"
    },
    { 
      title: "Billing & Subscriptions", 
      icon: DocumentTextIcon, 
      description: "But students often neglect the fact that it is much more.",
      link: "/billing-help"
    },
    { 
      title: "International", 
      icon: GlobeAltIcon, 
      description: "But students often neglect the fact that it is much more.",
      link: "/international-help"
    },
    { 
      title: "Disputes & Fraud", 
      icon: ScaleIcon, 
      description: "But students often neglect the fact that it is much more.",
      link: "/disputes-help"
    },
    { 
      title: "Accounting & Taxes", 
      icon: CalculatorIcon, 
      description: "But students often neglect the fact that it is much more.",
      link: "/taxes-help"
    },
  ];

  const faqs = [
    {
      question: "How can I track my order?",
      answer: "You can track your order anytime from the My Orders section of your Liora account. You'll also receive tracking updates via email and SMS."
    },
    {
      question: "What is your return policy?",
      answer: "Items can be returned within 7 days of delivery, provided they are unused, unwashed, and in their original packaging with all tags attached."
    },
    {
      question: "How long does delivery take?",
      answer: "Most Liora orders are delivered within 3-7 business days. Metro cities may get faster delivery."
    },
    {
      question: "Do you offer free shipping?",
      answer: "Free shipping is available on orders above ₹999. Promotional campaigns may offer free shipping on all orders."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Credit/Debit Cards, UPI, Net Banking, Cash on Delivery, and Digital Wallets."
    },
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page and follow the instructions sent to your registered email."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/profile" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition">
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm">Back to Profile</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Online education is a game-changer in many ways, but students often neglect the fact that it is much more economical than a traditional campus degree.
          </p>
          
          {/* Search and CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
              Find more online discussions
            </button>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-2.5 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Help Categories Grid - 2 rows of 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {helpCategories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Link
                key={idx}
                to={category.link}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{category.title}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </Link>
            );
          })}
        </div>

        {/* FAQ Section - Clean Accordion */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-800">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Still need help?</h3>
            <p className="text-gray-500 mb-6">Can't find what you're looking for? Contact our support team.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-3 text-gray-600">
                <EnvelopeIcon className="w-5 h-5" />
                <span>support@liora.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <PhoneIcon className="w-5 h-5" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <ClockIcon className="w-5 h-5" />
                <span>Mon-Sat, 9AM-6PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Policies Links */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-700 transition">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-700 transition">Terms & Conditions</Link>
            <Link to="/shipping" className="text-gray-500 hover:text-gray-700 transition">Shipping Policy</Link>
            <Link to="/returns" className="text-gray-500 hover:text-gray-700 transition">Return Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// CurrencyRupeeIcon is not in the standard set, let me add a fallback
const CurrencyRupeeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0v12m0-12H8m10 0h-3m-2 0v12m0-12h-2m0 0H8m0 0H5m14 0h-3" />
  </svg>
);

export default Help;
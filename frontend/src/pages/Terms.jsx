import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {  DocumentTextIcon, CheckCircleIcon, CreditCardIcon, TruckIcon, ArrowPathIcon, EnvelopeIcon, ShieldCheckIcon, ScaleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const Terms = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAgree = () => {
    if (agreed) {
      setIsAccepted(true);
      toast.success('You have accepted the Terms & Conditions');
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } else {
      toast.error('Please check the box to agree');
    }
  };

  const sections = [
    {
      id: 1,
      title: 'Acceptance of Terms',
      icon: DocumentTextIcon,
      content: 'By accessing and using Liora, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you may not use our services.',
      subsections: [
        'You must be at least 18 years old to use our services',
        'You are responsible for maintaining account confidentiality',
        'We reserve the right to modify terms at any time',
        'Continued use constitutes acceptance of changes'
      ]
    },
    {
      id: 2,
      title: 'Orders and Payments',
      icon: CreditCardIcon,
      content: 'All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason.',
      subsections: [
        'Prices are subject to change without notice',
        'Payment must be completed before order processing',
        'We accept multiple payment methods including cards, UPI, and COD',
        'Order confirmation email will be sent upon successful payment'
      ]
    },
    {
      id: 3,
      title: 'Shipping and Delivery',
      icon: TruckIcon,
      content: 'Delivery times are estimates and may vary. We are not responsible for delays caused by shipping carriers or unforeseen circumstances.',
      subsections: [
        'Free shipping on orders above ₹999',
        'Standard delivery takes 3-7 business days',
        'Metro cities may receive faster delivery',
        'Tracking information provided via email and SMS'
      ]
    },
    {
      id: 4,
      title: 'Returns and Refunds',
      icon: ArrowPathIcon,
      content: 'Items can be returned within 7 days of delivery in original condition for a refund or exchange.',
      subsections: [
        'Items must be unused with original tags attached',
        'Refunds processed within 5-7 business days',
        'Exchange available for size and color variations',
        'Sale items may have different return policies'
      ]
    },
    {
      id: 5,
      title: 'Account Responsibility',
      icon: ShieldCheckIcon,
      content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
      subsections: [
        'Notify us immediately of unauthorized account use',
        'We are not liable for losses due to compromised accounts',
        'You may not transfer your account to others',
        'We reserve right to suspend accounts violating terms'
      ]
    },
    {
      id: 6,
      title: 'Intellectual Property',
      icon: ScaleIcon,
      content: 'All content on Liora, including images, logos, designs, and text, is our intellectual property and protected by copyright laws.',
      subsections: [
        'You may not reproduce or distribute our content without permission',
        'Trademarks and logos are property of Liora',
        'User-generated content may be used for promotional purposes',
        'Violation may result in legal action'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-6">
            <DocumentTextIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-gray-500 text-sm">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <div className="w-12 h-px bg-gray-300 mx-auto mt-6"></div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={section.id} className="group">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-900 transition-colors duration-300">
                  <section.icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                    {section.id}. {section.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {section.content}
                  </p>
                  <ul className="space-y-2">
                    {section.subsections.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2 text-sm text-gray-500">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {idx < sections.length - 1 && (
                <div className="ml-14 pl-1 mt-6">
                  <div className="h-px bg-gray-100"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Agreement Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <button
                onClick={() => setAgreed(!agreed)}
                className="flex-shrink-0 mt-0.5"
              >
                {agreed ? (
                  <CheckCircleSolid className="w-6 h-6 text-gray-900" />
                ) : (
                  <CheckCircleIcon className="w-6 h-6 text-gray-400 hover:text-gray-600 transition" />
                )}
              </button>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">I Agree to the Terms & Conditions</h3>
                <p className="text-gray-500 text-sm">
                  By checking this box, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
                  You also confirm that you are at least 18 years old and have the legal capacity to enter into this agreement.
                </p>
              </div>
            </div>

            {/* Accepted State */}
            {isAccepted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircleSolid className="w-5 h-5 text-green-600" />
                <p className="text-green-700 text-sm">Thank you for accepting the Terms & Conditions.</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleAgree}
                className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition text-sm uppercase tracking-wide"
              >
                I Agree & Continue
              </button>
              <Link
                to="/"
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition text-sm uppercase tracking-wide text-center"
              >
                Decline
              </Link>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              By continuing, you agree to our Terms & Conditions and Privacy Policy
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <EnvelopeIcon className="w-4 h-4" />
            <span>Questions?</span>
            <a href="mailto:legal@liora.com" className="text-gray-900 hover:text-gray-600 transition font-medium">
              legal@liora.com
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            This agreement is governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Chennai.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
import {} from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, DocumentTextIcon, LockClosedIcon, EnvelopeIcon, GlobeAltIcon, ServerIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Privacy = () => {
  const sections = [
    {
      id: 1,
      title: 'Information We Collect',
      icon: DocumentTextIcon,
      content: 'We collect information you provide directly to us, such as when you create an account, make a purchase, subscribe to our newsletter, or contact us for support. This includes your name, email address, phone number, shipping address, and payment information.',
      subsections: [
        'Personal identification information (Name, email address, phone number)',
        'Payment information (Credit card details, UPI, banking information)',
        'Browsing data (IP address, browser type, device information)',
        'Order history and purchase preferences'
      ]
    },
    {
      id: 2,
      title: 'How We Use Your Information',
      icon: ServerIcon,
      content: 'We use the information we collect to provide, maintain, and improve our services. This includes processing your orders, communicating with you about your purchases, and personalizing your shopping experience.',
      subsections: [
        'Process and fulfill your orders',
        'Send order confirmations and shipping updates',
        'Personalize product recommendations',
        'Improve our website and customer service',
        'Send promotional offers (with your consent)'
      ]
    },
    {
      id: 3,
      title: 'Information Sharing & Disclosure',
      icon: UserGroupIcon,
      content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted partners who assist us in operating our website, conducting our business, or servicing you, under strict confidentiality agreements.',
      subsections: [
        'Shipping carriers to deliver your orders',
        'Payment processors to handle transactions',
        'Service providers who help us operate our website',
        'Law enforcement when required by law'
      ]
    },
    {
      id: 4,
      title: 'Data Security',
      icon: LockClosedIcon,
      content: 'We implement industry-standard security measures to protect your personal information. All sensitive information is encrypted using SSL technology. We regularly update our security protocols to ensure your data remains safe.',
      subsections: [
        '256-bit SSL encryption for all transactions',
        'Regular security audits and updates',
        'Secure data storage facilities',
        'Restricted access to personal information'
      ]
    },
    {
      id: 5,
      title: 'Your Rights & Choices',
      icon: ShieldCheckIcon,
      content: 'You have the right to access, update, or delete your personal information. You can also opt out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting our support team.',
      subsections: [
        'Access and update your profile information',
        'Request deletion of your account',
        'Opt out of marketing communications',
        'Download your personal data'
      ]
    },
    {
      id: 6,
      title: 'Cookies & Tracking',
      icon: GlobeAltIcon,
      content: 'We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can control cookie preferences through your browser settings.',
      subsections: [
        'Essential cookies for website functionality',
        'Analytics cookies to improve our services',
        'Preference cookies to remember your settings',
        'Marketing cookies for personalized ads'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-6">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">Privacy Policy</h1>
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
                    {section.title}
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

        {/* Contact Section */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <EnvelopeIcon className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Have Questions?</h3>
            <p className="text-gray-500 text-sm mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:privacy@liora.com" className="text-gray-900 text-sm font-medium hover:text-gray-600 transition">
                privacy@liora.com
              </a>
              <span className="text-gray-300">|</span>
              <Link to="/help" className="text-gray-500 text-sm hover:text-gray-700 transition">
                Visit Help Center
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            This Privacy Policy applies to all Liora websites, products, and services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
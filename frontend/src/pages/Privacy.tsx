import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect personal information including name, email, and phone number for M-PESA transactions.</p>
          
          <h2 className="text-xl font-semibold mb-4">2. How We Use Information</h2>
          <p className="mb-4">Your information is used to process investments, payments, and provide customer support.</p>
          
          <h2 className="text-xl font-semibold mb-4">3. Data Security</h2>
          <p className="mb-4">We use industry-standard encryption to protect your personal and financial information.</p>
          
          <h2 className="text-xl font-semibold mb-4">4. Third-Party Services</h2>
          <p className="mb-4">We use Safaricom M-PESA for payment processing. Their privacy policy also applies.</p>
          
          <h2 className="text-xl font-semibold mb-4">5. Contact Us</h2>
          <p className="mb-4">For privacy concerns, email privacy@fortune-platform.com</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
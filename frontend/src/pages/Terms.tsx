import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">1. Investment Risks</h2>
          <p className="mb-4">All investments carry risk. Past performance does not guarantee future results.</p>
          
          <h2 className="text-xl font-semibold mb-4">2. M-PESA Payments</h2>
          <p className="mb-4">All payments are processed through Safaricom M-PESA. Transaction fees may apply.</p>
          
          <h2 className="text-xl font-semibold mb-4">3. Returns Policy</h2>
          <p className="mb-4">Daily returns are calculated based on your investment plan. Returns are not guaranteed.</p>
          
          <h2 className="text-xl font-semibold mb-4">4. Account Security</h2>
          <p className="mb-4">You are responsible for maintaining the security of your account credentials.</p>
          
          <h2 className="text-xl font-semibold mb-4">5. Contact Information</h2>
          <p className="mb-4">For support, contact us at support@fortune-platform.com</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
import React, { useEffect, useState } from 'react';

const FastWithdrawalTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const withdrawals = [
    { phone: '+254789-XXXX-XX', amount: 4944 },
    { phone: '+254780-XXXX-XX', amount: 3843 },
    { phone: '+254787-XXXX-XX', amount: 3517 },
    { phone: '+254791-XXXX-XX', amount: 2636 },
    { phone: '+254722-XXXX-XX', amount: 5234 },
    { phone: '+254733-XXXX-XX', amount: 2891 },
    { phone: '+254745-XXXX-XX', amount: 6123 },
    { phone: '+254756-XXXX-XX', amount: 1567 },
    { phone: '+254767-XXXX-XX', amount: 3456 },
    { phone: '+254778-XXXX-XX', amount: 4789 },
    { phone: '+254701-XXXX-XX', amount: 2345 },
    { phone: '+254712-XXXX-XX', amount: 5678 },
    { phone: '+254723-XXXX-XX', amount: 3210 },
    { phone: '+254734-XXXX-XX', amount: 4567 },
    { phone: '+254746-XXXX-XX', amount: 1890 },
    { phone: '+254757-XXXX-XX', amount: 6789 },
    { phone: '+254768-XXXX-XX', amount: 2134 },
    { phone: '+254779-XXXX-XX', amount: 5432 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % withdrawals.length);
    }, 1500); // Change every 1.5 seconds

    return () => clearInterval(interval);
  }, [withdrawals.length]);

  // Show 3 items at once with staggered animation
  const getVisibleItems = () => {
    const items = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % withdrawals.length;
      items.push({ ...withdrawals[index], delay: i * 0.2 });
    }
    return items;
  };

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 50%, rgba(16, 185, 129, 0.1) 100%)',
      padding: '1rem',
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '0.75rem',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        display: 'flex',
        gap: '2rem',
        width: '100%',
        justifyContent: 'space-around'
      }}>
        {getVisibleItems().map((withdrawal, index) => (
          <div
            key={`${withdrawal.phone}-${currentIndex}-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              animation: `slideInFast 0.8s ease-out ${withdrawal.delay}s both, glow 2s ease-in-out infinite`,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transform: 'translateY(0)',
              opacity: 1
            }}
          >
            <span style={{ 
              color: '#e5e7eb', 
              fontSize: '0.85rem',
              fontWeight: '500'
            }}>
              {withdrawal.phone}
            </span>
            <span style={{ 
              color: '#10b981', 
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              withdrew
            </span>
            <span style={{ 
              color: '#fbbf24', 
              fontWeight: 'bold', 
              fontSize: '0.9rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              KES {withdrawal.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes slideInFast {
          0% {
            transform: translateX(100px) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateX(0) scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }
          50% {
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
          }
        }
      `}</style>
    </div>
  );
};

export default FastWithdrawalTicker;
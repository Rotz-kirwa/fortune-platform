import React from 'react';

const WithdrawalTicker: React.FC = () => {
  const withdrawals = [
    { phone: '54796-XXXX-XX', amount: 4077 },
    { phone: '+254711-XXXX-XX', amount: 1386 },
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
    { phone: '+254779-XXXX-XX', amount: 5432 },
    { phone: '+254702-XXXX-XX', amount: 3876 },
    { phone: '+254713-XXXX-XX', amount: 4321 },
    { phone: '+254724-XXXX-XX', amount: 1987 },
    { phone: '+254735-XXXX-XX', amount: 6543 },
    { phone: '+254747-XXXX-XX', amount: 2765 },
    { phone: '+254758-XXXX-XX', amount: 4098 },
    { phone: '+254769-XXXX-XX', amount: 5876 },
    { phone: '+254703-XXXX-XX', amount: 3254 },
    { phone: '+254714-XXXX-XX', amount: 1765 },
    { phone: '+254725-XXXX-XX', amount: 4987 }
  ];

  // Triple the array for smoother continuous scrolling
  const duplicatedWithdrawals = [...withdrawals, ...withdrawals, ...withdrawals];

  return (
    <div style={{
      background: 'rgba(16, 185, 129, 0.1)',
      padding: '1rem 0',
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      borderRadius: '0.5rem'
    }}>
      <div style={{
        display: 'flex',
        animation: 'scroll 25s linear infinite',
        gap: '2rem'
      }}>
        {duplicatedWithdrawals.map((withdrawal, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '0.4rem 0.8rem',
              borderRadius: '1.5rem',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              animation: 'pulse 2s ease-in-out infinite',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
            }}
          >
            <span style={{ 
              color: '#cccccc', 
              fontSize: '0.9rem',
              animation: 'blink 1.5s ease-in-out infinite'
            }}>
              {withdrawal.phone}
            </span>
            <span style={{ color: '#10b981', fontSize: '0.8rem' }}>
              just withdrew
            </span>
            <span style={{ color: '#ff6b35', fontWeight: 'bold', fontSize: '0.9rem' }}>
              KES {withdrawal.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes blink {
          0%, 50% {
            opacity: 1;
            color: #cccccc;
          }
          75% {
            opacity: 0.7;
            color: #10b981;
          }
          100% {
            opacity: 1;
            color: #cccccc;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};

export default WithdrawalTicker;
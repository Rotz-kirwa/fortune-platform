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
    <div className="withdrawal-ticker" style={{
      background: 'rgba(16, 185, 129, 0.08)',
      padding: '0.75rem 0',
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      borderRadius: '0.75rem',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="ticker-content" style={{
        display: 'flex',
        animation: 'scroll 30s linear infinite',
        gap: '1rem'
      }}>
        {duplicatedWithdrawals.map((withdrawal, index) => (
          <div
            key={index}
            className="withdrawal-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
              background: 'rgba(16, 185, 129, 0.12)',
              padding: '0.5rem 0.75rem',
              borderRadius: '2rem',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}
          >
            <span className="phone-number" style={{ 
              color: '#e5e7eb',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {withdrawal.phone}
            </span>
            <span className="action-text" style={{ 
              color: '#10b981', 
              fontSize: '0.7rem',
              fontWeight: '500'
            }}>
              withdrew
            </span>
            <span className="amount" style={{ 
              color: '#ff6b35', 
              fontWeight: '700', 
              fontSize: '0.75rem',
              textShadow: '0 1px 2px rgba(255, 107, 53, 0.3)'
            }}>
              KSh {withdrawal.amount.toLocaleString()}
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
        
        .withdrawal-item:hover {
          background: rgba(16, 185, 129, 0.18) !important;
          transform: scale(1.02);
          transition: all 0.2s ease;
        }
        
        @media (max-width: 768px) {
          .withdrawal-ticker {
            padding: 0.5rem 0 !important;
            border-radius: 0.5rem !important;
          }
          
          .ticker-content {
            gap: 0.75rem !important;
            animation: scroll 25s linear infinite !important;
          }
          
          .withdrawal-item {
            padding: 0.375rem 0.625rem !important;
            gap: 0.25rem !important;
            border-radius: 1.5rem !important;
            font-size: 0.75rem !important;
          }
          
          .phone-number {
            font-size: 0.7rem !important;
          }
          
          .action-text {
            font-size: 0.65rem !important;
          }
          
          .amount {
            font-size: 0.7rem !important;
            font-weight: 800 !important;
          }
        }
        
        @media (max-width: 480px) {
          .withdrawal-ticker {
            padding: 0.375rem 0 !important;
          }
          
          .ticker-content {
            gap: 0.5rem !important;
            animation: scroll 20s linear infinite !important;
          }
          
          .withdrawal-item {
            padding: 0.3rem 0.5rem !important;
            gap: 0.2rem !important;
            font-size: 0.7rem !important;
          }
          
          .phone-number {
            font-size: 0.65rem !important;
          }
          
          .action-text {
            font-size: 0.6rem !important;
          }
          
          .amount {
            font-size: 0.65rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WithdrawalTicker;
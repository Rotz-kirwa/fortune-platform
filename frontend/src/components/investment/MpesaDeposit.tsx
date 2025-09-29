import React, { useState } from 'react';
import { X, Smartphone, CheckCircle } from 'lucide-react';

interface MpesaDepositProps {
  plan: {
    id: number;
    name: string;
    daily_return_rate: string;
    duration_days: number;
  };
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const MpesaDeposit: React.FC<MpesaDepositProps> = ({ plan, amount, onClose, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Processing, 3: Success

  const handleMpesaPayment = async () => {
    if (!phoneNumber) return;
    
    setLoading(true);
    setStep(2);
    
    // Simulate M-PESA STK push
    setTimeout(() => {
      setStep(3);
      setLoading(false);
      
      // Auto close and trigger success after 3 seconds
      setTimeout(() => {
        onSuccess();
      }, 3000);
    }, 3000);
  };

  const dailyReturn = amount * parseFloat(plan.daily_return_rate);
  const totalReturn = dailyReturn * plan.duration_days;
  const finalAmount = amount + totalReturn;

  return (
    <div style={{position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 60}}>
      <div style={{background: 'rgba(26, 26, 26, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '1rem', maxWidth: '500px', width: '100%', border: '1px solid rgba(255, 107, 53, 0.3)', margin: '0 1rem'}}>
        <div style={{padding: '2rem'}}>
          
          {step === 1 && (
            <>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff'}}>M-PESA Payment</h2>
                <button onClick={onClose} style={{color: '#cccccc', background: 'none', border: 'none', cursor: 'pointer'}}>
                  <X style={{height: '1.5rem', width: '1.5rem'}} />
                </button>
              </div>

              {/* Investment Summary */}
              <div style={{background: 'rgba(255, 107, 53, 0.1)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '2rem'}}>
                <h3 style={{color: '#ff6b35', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem'}}>{plan.name}</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.9rem'}}>
                  <div>
                    <span style={{color: '#cccccc'}}>Investment:</span>
                    <div style={{color: '#ffffff', fontWeight: 'bold'}}>KSh {amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span style={{color: '#cccccc'}}>Daily Profit:</span>
                    <div style={{color: '#10b981', fontWeight: 'bold'}}>KSh {dailyReturn.toLocaleString()}</div>
                  </div>
                  <div>
                    <span style={{color: '#cccccc'}}>Duration:</span>
                    <div style={{color: '#ffffff', fontWeight: 'bold'}}>{plan.duration_days} days</div>
                  </div>
                  <div>
                    <span style={{color: '#cccccc'}}>Total Return:</span>
                    <div style={{color: '#ff6b35', fontWeight: 'bold'}}>KSh {finalAmount.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Phone Number Input */}
              <div style={{marginBottom: '2rem'}}>
                <label style={{display: 'block', color: '#cccccc', marginBottom: '0.5rem', fontWeight: '500'}}>
                  M-PESA Phone Number
                </label>
                <div style={{position: 'relative'}}>
                  <Smartphone style={{position: 'absolute', left: '0.75rem', top: '0.75rem', height: '1.25rem', width: '1.25rem', color: '#10b981'}} />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="form-input"
                    style={{paddingLeft: '2.5rem'}}
                    placeholder="254712345678"
                    maxLength={12}
                  />
                </div>
                <p style={{color: '#999', fontSize: '0.8rem', marginTop: '0.5rem'}}>
                  Enter your M-PESA registered phone number
                </p>
              </div>

              {/* Payment Button */}
              <button
                onClick={handleMpesaPayment}
                disabled={!phoneNumber || phoneNumber.length < 12}
                className="btn-primary"
                style={{width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: !phoneNumber || phoneNumber.length < 12 ? 0.5 : 1}}
              >
                Pay KSh {amount.toLocaleString()} via M-PESA
              </button>

              <p style={{color: '#999', fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem'}}>
                You will receive an M-PESA prompt on your phone
              </p>
            </>
          )}

          {step === 2 && (
            <div style={{textAlign: 'center', padding: '2rem 0'}}>
              <div style={{
                width: '4rem', 
                height: '4rem', 
                border: '4px solid rgba(16, 185, 129, 0.3)', 
                borderTop: '4px solid #10b981', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                margin: '0 auto 2rem'
              }}></div>
              <h3 style={{color: '#ffffff', fontSize: '1.3rem', marginBottom: '1rem'}}>Processing Payment...</h3>
              <p style={{color: '#cccccc', marginBottom: '1rem'}}>
                Check your phone for M-PESA prompt
              </p>
              <p style={{color: '#10b981', fontSize: '0.9rem'}}>
                📱 Enter your M-PESA PIN to complete payment
              </p>
            </div>
          )}

          {step === 3 && (
            <div style={{textAlign: 'center', padding: '2rem 0'}}>
              <CheckCircle style={{height: '4rem', width: '4rem', color: '#10b981', margin: '0 auto 2rem'}} />
              <h3 style={{color: '#10b981', fontSize: '1.5rem', marginBottom: '1rem'}}>Payment Successful! 🎉</h3>
              <p style={{color: '#cccccc', marginBottom: '1rem'}}>
                Your investment has been activated
              </p>
              <div style={{background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                <p style={{color: '#10b981', fontWeight: 'bold'}}>
                  {plan.name} - KSh {amount.toLocaleString()}
                </p>
                <p style={{color: '#cccccc', fontSize: '0.9rem'}}>
                  Daily profits start tomorrow!
                </p>
              </div>
              <p style={{color: '#999', fontSize: '0.8rem'}}>
                Redirecting to dashboard...
              </p>
            </div>
          )}

        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MpesaDeposit;
import React, { useState } from 'react';
import { X, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { paymentsAPI, investmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('254');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Processing, 3: Success, 4: Error
  const [error, setError] = useState('');

  const handleMpesaPayment = async () => {
    if (!phoneNumber) return;
    
    setLoading(true);
    setStep(2);
    setError('');
    
    try {
      // Validate phone number format
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (!cleanPhone.startsWith('254') || cleanPhone.length !== 12) {
        setError('Phone number must be in format 254XXXXXXXXX');
        setStep(4);
        setLoading(false);
        return;
      }

      // Make real M-PESA STK Push API call
      const response = await paymentsAPI.stkPush({
        amount: amount,
        phoneNumber: cleanPhone,
        accountReference: `INV-${plan.id}-${Date.now()}`
      });
      
      console.log('M-PESA STK Push response:', response.data);
      
      if (response.data.ResponseCode === '0') {
        const checkoutRequestId = response.data.CheckoutRequestID;
        
        // Create pending investment
        await investmentAPI.createPendingInvestment({
          plan_id: plan.id,
          amount: amount,
          phone_number: cleanPhone,
          checkout_request_id: checkoutRequestId,
          user_id: user?.id || null
        });
        
        // STK Push sent successfully - show waiting message
        setStep(3);
        
        // Don't auto-close - wait for user to complete payment
        // The investment will only be created when M-PESA confirms payment
      } else {
        // STK Push failed
        const errorMsg = response.data.ResponseDescription || response.data.errorMessage || 'Payment request failed';
        setError(errorMsg);
        setStep(4);
      }
      
    } catch (err: any) {
      console.error('M-PESA payment error:', err);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.response?.status === 500) {
        errorMessage = err.response?.data?.details || 'Server error. Please try again later.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
      setStep(4);
    } finally {
      setLoading(false);
    }
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
                <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                  <Smartphone style={{position: 'absolute', left: '0.75rem', top: '0.75rem', height: '1.25rem', width: '1.25rem', color: '#10b981', zIndex: 1}} />
                  <span style={{position: 'absolute', left: '2.5rem', top: '0.75rem', color: '#10b981', fontWeight: 'bold', fontSize: '1rem', zIndex: 1}}>254</span>
                  <input
                    type="tel"
                    value={phoneNumber.substring(3)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 9) {
                        setPhoneNumber('254' + value);
                      }
                    }}
                    className="form-input"
                    style={{paddingLeft: '4.5rem'}}
                    placeholder="712345678"
                    maxLength={9}
                  />
                </div>
                <p style={{color: '#999', fontSize: '0.8rem', marginTop: '0.5rem'}}>
                  Enter your 9-digit phone number (e.g., 712345678)
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
              <h3 style={{color: '#ffffff', fontSize: '1.3rem', marginBottom: '1rem'}}>Sending M-PESA Prompt...</h3>
              <p style={{color: '#cccccc', marginBottom: '1rem'}}>
                Please wait while we send the payment request
              </p>
              <p style={{color: '#10b981', fontSize: '0.9rem'}}>
                📱 Check your phone ({phoneNumber}) for M-PESA prompt
              </p>
            </div>
          )}

          {step === 3 && (
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
              <h3 style={{color: '#10b981', fontSize: '1.5rem', marginBottom: '1rem'}}>M-PESA Prompt Sent! 📱</h3>
              <p style={{color: '#cccccc', marginBottom: '1rem'}}>
                Check your phone and enter your M-PESA PIN to complete payment
              </p>
              <div style={{background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                <p style={{color: '#10b981', fontWeight: 'bold'}}>
                  Amount: KSh {amount.toLocaleString()}
                </p>
                <p style={{color: '#cccccc', fontSize: '0.9rem'}}>
                  Phone: {phoneNumber}
                </p>
              </div>
              <p style={{color: '#f59e0b', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                ⚠️ Your investment will only be activated after successful payment
              </p>
              <p style={{color: '#999', fontSize: '0.8rem'}}>
                You can close this window. Check your dashboard in a few minutes.
              </p>
              <button
                onClick={() => { onSuccess(); }}
                className="btn-primary"
                style={{marginTop: '1rem'}}
              >
                Close & Check Dashboard
              </button>
            </div>
          )}

          {step === 4 && (
            <div style={{textAlign: 'center', padding: '2rem 0'}}>
              <AlertCircle style={{height: '4rem', width: '4rem', color: '#ef4444', margin: '0 auto 2rem'}} />
              <h3 style={{color: '#ef4444', fontSize: '1.5rem', marginBottom: '1rem'}}>Payment Failed</h3>
              <p style={{color: '#cccccc', marginBottom: '2rem'}}>
                {error}
              </p>
              <div style={{display: 'flex', gap: '1rem'}}>
                <button
                  onClick={() => { setStep(1); setError(''); }}
                  className="btn-secondary"
                  style={{flex: 1}}
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="btn-primary"
                  style={{flex: 1}}
                >
                  Close
                </button>
              </div>
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
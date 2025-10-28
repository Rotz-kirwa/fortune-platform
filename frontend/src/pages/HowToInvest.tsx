import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus, CreditCard, TrendingUp, DollarSign, Clock, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InvestmentPlans from '../components/investment/InvestmentPlans';

const HowToInvest: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPlans, setShowPlans] = useState(false);

  const handlePlanClick = () => {
    if (isAuthenticated) {
      setShowPlans(true);
    } else {
      navigate('/register');
    }
  };
  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%)', paddingTop: '8rem', minHeight: '100vh'}}>
      <div style={{padding: '2rem 1rem', minHeight: 'calc(100vh - 8rem)'}}>
        <div className="container" style={{maxWidth: '1000px', margin: '0 auto'}}>
          
          {/* Header */}
          <div style={{textAlign: 'center', marginBottom: '3rem', padding: '2rem 1rem'}}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
              fontWeight: 'bold', 
              color: '#ffffff', 
              marginBottom: '1.5rem',
              lineHeight: '1.2',
              wordBreak: 'keep-all'
            }}>
              How to <span style={{color: '#ff6b35'}}>Invest</span> with Fortune
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
              color: '#cccccc', 
              maxWidth: '800px', 
              margin: '0 auto',
              lineHeight: '1.6',
              padding: '0 1rem'
            }}>
              Start earning daily profits in just 3 simple steps. Join thousands of successful investors today!
            </p>
          </div>

          {/* Steps */}
          <div style={{display: 'grid', gap: '2rem', marginBottom: '3rem'}}>
            
            {/* Step 1 */}
            <div className="card" style={{display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap'}}>
              <div style={{
                background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <UserPlus style={{height: '2rem', width: '2rem', color: 'white'}} />
              </div>
              <div style={{flex: 1}}>
                <h3 style={{color: '#ff6b35', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                  Step 1: Create Account
                </h3>
                <p style={{color: '#cccccc', fontSize: '1.1rem', marginBottom: '1rem'}}>
                  Sign up with your email and create a secure password. Verification takes less than 2 minutes.
                </p>
                <Link to="/register" className="btn-primary" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
                  Register Now <ArrowRight style={{height: '1rem', width: '1rem'}} />
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card" style={{display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap'}}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CreditCard style={{height: '2rem', width: '2rem', color: 'white'}} />
              </div>
              <div style={{flex: 1}}>
                <h3 style={{color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                  Step 2: Choose Investment Plan
                </h3>
                <p style={{color: '#cccccc', fontSize: '1.1rem', marginBottom: '1rem'}}>
                  Select from our 6 investment plans based on your budget. Start from as low as KSh 100.
                </p>
                <p style={{color: '#ff6b35', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center'}}>
                  👆 Click on any plan below to {isAuthenticated ? 'start investing' : 'register and invest'}
                </p>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginTop: '1rem'}}>
                  <div 
                    style={{
                      textAlign: 'center', 
                      padding: '0.75rem', 
                      background: 'rgba(205, 127, 50, 0.15)', 
                      borderRadius: '0.75rem', 
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      border: '1px solid rgba(205, 127, 50, 0.3)'
                    }} 
                    className="plan-card"
                    onClick={handlePlanClick}
                  >
                    <div style={{color: '#cd7f32', fontWeight: 'bold', fontSize: '1rem'}}>Bronze</div>
                    <div style={{color: '#cccccc', fontSize: '0.85rem', margin: '0.25rem 0'}}>KSh 100-500</div>
                    <div style={{color: '#10b981', fontSize: '0.8rem', fontWeight: '600'}}>3.5% daily</div>
                  </div>
                  
                  <div 
                    style={{
                      textAlign: 'center', 
                      padding: '0.75rem', 
                      background: 'rgba(192, 192, 192, 0.15)', 
                      borderRadius: '0.75rem', 
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      border: '1px solid rgba(192, 192, 192, 0.3)'
                    }} 
                    className="plan-card"
                    onClick={handlePlanClick}
                  >
                    <div style={{color: '#c0c0c0', fontWeight: 'bold', fontSize: '1rem'}}>Silver</div>
                    <div style={{color: '#cccccc', fontSize: '0.85rem', margin: '0.25rem 0'}}>KSh 501-2K</div>
                    <div style={{color: '#10b981', fontSize: '0.8rem', fontWeight: '600'}}>4% daily</div>
                  </div>
                  
                  <div 
                    style={{
                      textAlign: 'center', 
                      padding: '0.75rem', 
                      background: 'rgba(59, 130, 246, 0.15)', 
                      borderRadius: '0.75rem', 
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }} 
                    className="plan-card"
                    onClick={handlePlanClick}
                  >
                    <div style={{color: '#3b82f6', fontWeight: 'bold', fontSize: '1rem'}}>Premium</div>
                    <div style={{color: '#cccccc', fontSize: '0.85rem', margin: '0.25rem 0'}}>KSh 2K-10K</div>
                    <div style={{color: '#10b981', fontSize: '0.8rem', fontWeight: '600'}}>4.5% daily</div>
                  </div>
                  
                  <div 
                    style={{
                      textAlign: 'center', 
                      padding: '0.75rem', 
                      background: 'rgba(229, 228, 226, 0.15)', 
                      borderRadius: '0.75rem', 
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      border: '1px solid rgba(229, 228, 226, 0.3)'
                    }} 
                    className="plan-card"
                    onClick={handlePlanClick}
                  >
                    <div style={{color: '#e5e4e2', fontWeight: 'bold', fontSize: '1rem'}}>Platinum</div>
                    <div style={{color: '#cccccc', fontSize: '0.85rem', margin: '0.25rem 0'}}>KSh 10K-50K</div>
                    <div style={{color: '#10b981', fontSize: '0.8rem', fontWeight: '600'}}>5% daily</div>
                  </div>
                  
                  <div 
                    style={{
                      textAlign: 'center', 
                      padding: '0.75rem', 
                      background: 'rgba(185, 242, 255, 0.15)', 
                      borderRadius: '0.75rem', 
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      border: '1px solid rgba(185, 242, 255, 0.3)'
                    }} 
                    className="plan-card"
                    onClick={handlePlanClick}
                  >
                    <div style={{color: '#b9f2ff', fontWeight: 'bold', fontSize: '1rem'}}>Diamond</div>
                    <div style={{color: '#cccccc', fontSize: '0.85rem', margin: '0.25rem 0'}}>KSh 50K-200K</div>
                    <div style={{color: '#10b981', fontSize: '0.8rem', fontWeight: '600'}}>5.5% daily</div>
                  </div>
                  
                  <div 
                    style={{
                      textAlign: 'center', 
                      padding: '0.75rem', 
                      background: 'rgba(251, 191, 36, 0.15)', 
                      borderRadius: '0.75rem', 
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      border: '1px solid rgba(251, 191, 36, 0.3)'
                    }} 
                    className="plan-card"
                    onClick={handlePlanClick}
                  >
                    <div style={{color: '#fbbf24', fontWeight: 'bold', fontSize: '1rem'}}>Gold</div>
                    <div style={{color: '#cccccc', fontSize: '0.85rem', margin: '0.25rem 0'}}>KSh 200K-1M</div>
                    <div style={{color: '#10b981', fontSize: '0.8rem', fontWeight: '600'}}>6% daily</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card" style={{display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap'}}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <TrendingUp style={{height: '2rem', width: '2rem', color: 'white'}} />
              </div>
              <div style={{flex: 1}}>
                <h3 style={{color: '#3b82f6', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                  Step 3: Watch Your Money Grow
                </h3>
                <p style={{color: '#cccccc', fontSize: '1.1rem', marginBottom: '1rem'}}>
                  Track your daily profits in real-time. Withdraw anytime, reinvest to compound earnings, or earn extra through referrals.
                </p>
                <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <Clock style={{height: '1.25rem', width: '1.25rem', color: '#ff6b35'}} />
                    <span style={{color: '#cccccc'}}>Daily payouts</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <DollarSign style={{height: '1.25rem', width: '1.25rem', color: '#10b981'}} />
                    <span style={{color: '#cccccc'}}>Instant withdrawals</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <Target style={{height: '1.25rem', width: '1.25rem', color: '#3b82f6'}} />
                    <span style={{color: '#cccccc'}}>Compound interest</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{fontSize: '1.25rem'}}>💰</span>
                    <span style={{color: '#cccccc'}}>5% referral commission</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Section */}
          <div className="card" style={{marginBottom: '3rem'}}>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
              <h3 style={{color: '#ff6b35', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem'}}>
                💰 Boost Your Earnings with Referrals
              </h3>
              <p style={{color: '#cccccc', fontSize: '1.1rem'}}>
                Earn extra income by inviting friends and family to invest with Fortune
              </p>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem'}}>
              <div style={{textAlign: 'center', padding: '1.5rem', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '0.75rem'}}>
                <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>🎯</div>
                <h4 style={{color: '#ff6b35', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>5% Commission</h4>
                <p style={{color: '#cccccc', fontSize: '0.9rem'}}>Earn 5% of every investment made by your referrals</p>
              </div>
              
              <div style={{textAlign: 'center', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem'}}>
                <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>🔗</div>
                <h4 style={{color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Unique Link</h4>
                <p style={{color: '#cccccc', fontSize: '0.9rem'}}>Get your personal referral link after registration</p>
              </div>
              
              <div style={{textAlign: 'center', padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.75rem'}}>
                <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>💸</div>
                <h4 style={{color: '#3b82f6', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Instant Payouts</h4>
                <p style={{color: '#cccccc', fontSize: '0.9rem'}}>Referral commissions paid immediately to your wallet</p>
              </div>
            </div>
            
            <div style={{background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '0.75rem', textAlign: 'center'}}>
              <h4 style={{color: '#ffffff', marginBottom: '1rem'}}>Referral Example</h4>
              <p style={{color: '#cccccc', marginBottom: '1rem'}}>If your friend invests KSh 100,000, you earn KSh 5,000 commission!</p>
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
                <div style={{padding: '0.5rem 1rem', background: 'rgba(255, 107, 53, 0.2)', borderRadius: '0.5rem'}}>
                  <span style={{color: '#ff6b35', fontWeight: 'bold'}}>Friend invests: KSh 100,000</span>
                </div>
                <div style={{color: '#cccccc', fontSize: '1.5rem'}}>→</div>
                <div style={{padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '0.5rem'}}>
                  <span style={{color: '#10b981', fontWeight: 'bold'}}>You earn: KSh 5,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Example Calculation */}
          <div className="card" style={{textAlign: 'center', marginBottom: '3rem'}}>
            <h3 style={{color: '#ff6b35', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem'}}>
              Investment Example
            </h3>
            <p style={{color: '#cccccc', marginBottom: '2rem'}}>
              See how much you can earn with our Premium Plan (4.5% daily for 90 days)
            </p>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem'}}>
              <div>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.5rem'}}>KSh 10,000</div>
                <div style={{color: '#cccccc'}}>Initial Investment</div>
              </div>
              <div>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem'}}>KSh 450/day</div>
                <div style={{color: '#cccccc'}}>Daily Profit (4.5%)</div>
              </div>
              <div>
                <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#ff6b35', marginBottom: '0.5rem'}}>KSh 50,500</div>
                <div style={{color: '#cccccc'}}>Total After 90 Days</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{textAlign: 'center'}}>
            <h2 style={{color: '#ffffff', fontSize: '2rem', marginBottom: '1rem'}}>
              Ready to Start Earning?
            </h2>
            <p style={{color: '#cccccc', marginBottom: '2rem'}}>
              Join Fortune today and start your investment journey
            </p>
            <Link to="/register" className="btn-primary" style={{fontSize: '1.2rem', padding: '1rem 2rem'}}>
              Start Investing Now
              <ArrowRight style={{marginLeft: '0.5rem', height: '1.25rem', width: '1.25rem'}} />
            </Link>
          </div>

        </div>
      </div>

      {/* Investment Plans Modal */}
      {showPlans && isAuthenticated && (
        <InvestmentPlans
          onClose={() => setShowPlans(false)}
          onInvestmentCreated={() => {
            setShowPlans(false);
          }}
        />
      )}

      <style>{`
        .plan-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
        }
        
        .plan-card:active {
          transform: translateY(-1px) scale(1.01);
          transition: transform 0.1s ease;
        }
        
        @media (max-width: 768px) {
          .plan-card {
            padding: 0.5rem !important;
          }
          
          .plan-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default HowToInvest;
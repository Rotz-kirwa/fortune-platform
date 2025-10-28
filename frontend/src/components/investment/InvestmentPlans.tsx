import React, { useState, useEffect } from 'react';
import { investmentAPI } from '../../services/api';
import { X, TrendingUp, Clock, DollarSign } from 'lucide-react';
import MpesaDeposit from './MpesaDeposit';

interface Plan {
  id: number;
  name: string;
  min_amount: string;
  max_amount: string;
  daily_return_rate: string;
  duration_days: number;
  description: string;
}

interface InvestmentPlansProps {
  onClose: () => void;
  onInvestmentCreated: () => void;
}

const InvestmentPlans: React.FC<InvestmentPlansProps> = ({ onClose, onInvestmentCreated }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMpesa, setShowMpesa] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const getHardcodedPlans = (): Plan[] => [
    {
      id: 1,
      name: 'Bronze',
      min_amount: '100',
      max_amount: '500',
      daily_return_rate: '0.035',
      duration_days: 90,
      description: 'Entry level - KSh 100 to KSh 500, earn 3.5% daily for 90 days'
    },
    {
      id: 2,
      name: 'Silver',
      min_amount: '501',
      max_amount: '2000',
      daily_return_rate: '0.04',
      duration_days: 90,
      description: 'Growing returns - KSh 501 to KSh 2,000, earn 4% daily for 90 days'
    },
    {
      id: 3,
      name: 'Premium',
      min_amount: '2001',
      max_amount: '10000',
      daily_return_rate: '0.045',
      duration_days: 90,
      description: 'Premium tier - KSh 2,001 to KSh 10,000, earn 4.5% daily for 90 days'
    },
    {
      id: 4,
      name: 'Platinum',
      min_amount: '10001',
      max_amount: '50000',
      daily_return_rate: '0.05',
      duration_days: 90,
      description: 'High returns - KSh 10,001 to KSh 50,000, earn 5% daily for 90 days'
    },
    {
      id: 5,
      name: 'Diamond',
      min_amount: '50001',
      max_amount: '200000',
      daily_return_rate: '0.055',
      duration_days: 90,
      description: 'Elite tier - KSh 50,001 to KSh 200,000, earn 5.5% daily for 90 days'
    },
    {
      id: 6,
      name: 'Gold',
      min_amount: '200001',
      max_amount: '1000000',
      daily_return_rate: '0.06',
      duration_days: 90,
      description: 'Ultimate tier - KSh 200,001 to KSh 1,000,000, earn 6% daily for 90 days'
    }
  ];

  const fetchPlans = async () => {
    try {
      const response = await investmentAPI.getPlans();
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans, using hardcoded plans:', error);
      setPlans(getHardcodedPlans());
    }
  };

  const handleInvest = () => {
    if (!selectedPlan || !amount) return;
    setShowMpesa(true);
  };

  const handleMpesaSuccess = async () => {
    // Just close the modal and refresh dashboard
    // Investment will be created automatically when M-PESA confirms payment
    setShowMpesa(false);
    onInvestmentCreated();
  };

  const calculateReturns = (plan: Plan, investAmount: number) => {
    const dailyReturn = investAmount * parseFloat(plan.daily_return_rate);
    const totalReturn = dailyReturn * plan.duration_days;
    const finalAmount = investAmount + totalReturn;
    return { dailyReturn, totalReturn, finalAmount };
  };

  return (
    <div style={{position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50}}>
      <div style={{background: 'rgba(26, 26, 26, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '1rem', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1px solid rgba(255, 107, 53, 0.3)', margin: '0 1rem'}}>
        <div style={{padding: '1rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff'}}>Investment Plans</h2>
            <button onClick={onClose} style={{color: '#cccccc', background: 'none', border: 'none', cursor: 'pointer'}}>
              <X style={{height: '1.5rem', width: '1.5rem'}} />
            </button>
          </div>

          {!selectedPlan ? (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
              {plans.map((plan) => (
                <div key={plan.id} className="card" style={{cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid rgba(255, 107, 53, 0.2)'}} onClick={() => setSelectedPlan(plan)}>
                  <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
                    <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b35', marginBottom: '0.5rem'}}>
                      {plan.name}
                    </h3>
                    <p style={{color: '#cccccc', fontSize: '0.9rem'}}>{plan.description}</p>
                  </div>

                  <div style={{display: 'grid', gap: '1rem', marginBottom: '1.5rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <DollarSign style={{height: '1.25rem', width: '1.25rem', color: '#ff6b35'}} />
                      <span style={{color: '#cccccc'}}>
                        KSh {parseFloat(plan.min_amount).toLocaleString()} - KSh {parseFloat(plan.max_amount).toLocaleString()}
                      </span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <TrendingUp style={{height: '1.25rem', width: '1.25rem', color: '#10b981'}} />
                      <span style={{color: '#cccccc'}}>
                        {(parseFloat(plan.daily_return_rate) * 100).toFixed(1)}% daily
                      </span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <Clock style={{height: '1.25rem', width: '1.25rem', color: '#3b82f6'}} />
                      <span style={{color: '#cccccc'}}>
                        {plan.duration_days} days
                      </span>
                    </div>
                  </div>

                  <div style={{textAlign: 'center', padding: '1rem', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '0.5rem'}}>
                    <p style={{color: '#ff6b35', fontWeight: 'bold', fontSize: '1.1rem'}}>
                      Total Return: {(parseFloat(plan.daily_return_rate) * plan.duration_days * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <button 
                onClick={() => setSelectedPlan(null)}
                style={{color: '#ff6b35', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
              >
                ← Back to plans
              </button>

              <div className="card" style={{marginBottom: '2rem'}}>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b35', marginBottom: '1rem'}}>
                  {selectedPlan.name}
                </h3>
                <p style={{color: '#cccccc', marginBottom: '1.5rem'}}>{selectedPlan.description}</p>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
                  <div style={{textAlign: 'center', padding: '1rem', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '0.5rem'}}>
                    <p style={{color: '#cccccc', fontSize: '0.9rem'}}>Daily Return</p>
                    <p style={{color: '#ff6b35', fontSize: '1.2rem', fontWeight: 'bold'}}>
                      {(parseFloat(selectedPlan.daily_return_rate) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div style={{textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem'}}>
                    <p style={{color: '#cccccc', fontSize: '0.9rem'}}>Duration</p>
                    <p style={{color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold'}}>
                      {selectedPlan.duration_days} days
                    </p>
                  </div>
                  <div style={{textAlign: 'center', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem'}}>
                    <p style={{color: '#cccccc', fontSize: '0.9rem'}}>Total Return</p>
                    <p style={{color: '#3b82f6', fontSize: '1.2rem', fontWeight: 'bold'}}>
                      {(parseFloat(selectedPlan.daily_return_rate) * selectedPlan.duration_days * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div style={{marginBottom: '1.5rem'}}>
                  <label style={{display: 'block', color: '#cccccc', marginBottom: '0.5rem', fontWeight: '500'}}>
                    Investment Amount (KSh)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="form-input"
                    placeholder={`Min: KSh ${parseFloat(selectedPlan.min_amount).toLocaleString()} - Max: KSh ${parseFloat(selectedPlan.max_amount).toLocaleString()}`}
                    min={selectedPlan.min_amount}
                    max={selectedPlan.max_amount}
                  />
                </div>

                {amount && parseFloat(amount) >= parseFloat(selectedPlan.min_amount) && (
                  <div style={{background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem'}}>
                    <h4 style={{color: '#ffffff', marginBottom: '1rem'}}>Investment Projection</h4>
                    {(() => {
                      const { dailyReturn, totalReturn, finalAmount } = calculateReturns(selectedPlan, parseFloat(amount));
                      return (
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem'}}>
                          <div>
                            <p style={{color: '#cccccc', fontSize: '0.9rem'}}>Daily Profit</p>
                            <p style={{color: '#10b981', fontWeight: 'bold'}}>KSh {dailyReturn.toLocaleString()}</p>
                          </div>
                          <div>
                            <p style={{color: '#cccccc', fontSize: '0.9rem'}}>Total Profit</p>
                            <p style={{color: '#ff6b35', fontWeight: 'bold'}}>KSh {totalReturn.toLocaleString()}</p>
                          </div>
                          <div>
                            <p style={{color: '#cccccc', fontSize: '0.9rem'}}>Final Amount</p>
                            <p style={{color: '#ffffff', fontWeight: 'bold', fontSize: '1.1rem'}}>KSh {finalAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {error && (
                  <div className="error" style={{marginBottom: '1rem'}}>
                    {error}
                  </div>
                )}

                <div style={{display: 'flex', gap: '1rem'}}>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="btn-secondary"
                    style={{flex: 1}}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvest}
                    disabled={!amount || parseFloat(amount) < parseFloat(selectedPlan.min_amount)}
                    className="btn-primary"
                    style={{flex: 1, opacity: !amount || parseFloat(amount) < parseFloat(selectedPlan.min_amount) ? 0.5 : 1}}
                  >
                    Pay via M-PESA
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* M-PESA Deposit Modal */}
      {showMpesa && selectedPlan && amount && (
        <MpesaDeposit
          plan={selectedPlan}
          amount={parseFloat(amount)}
          onClose={() => setShowMpesa(false)}
          onSuccess={handleMpesaSuccess}
        />
      )}
    </div>
  );
};

export default InvestmentPlans;
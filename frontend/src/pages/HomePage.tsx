import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, DollarSign, Target, Clock, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { investmentAPI } from '../services/api';
import LiveChart from '../components/common/LiveChart';
import WithdrawalTicker from '../components/common/WithdrawalTicker';
import InvestmentPlans from '../components/investment/InvestmentPlans';

interface DashboardStats {
  total_invested: string;
  total_current_returns: string;
  current_portfolio_value: string;
  active_investments: number;
}

interface Investment {
  id: number;
  plan_name: string;
  amount: string;
  current_return: string;
  current_value: string;
  progress: string;
  duration_days: number;
  days_passed: number;
  created_at: string;
}

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showPlans, setShowPlans] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const [statsRes, investmentsRes] = await Promise.all([
        investmentAPI.getDashboardStats(),
        investmentAPI.getMyInvestments()
      ]);
      setStats(statsRes.data);
      setInvestments(investmentsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%)', paddingTop: '4rem'}}>
      {/* Hero Section */}
      <div className="hero-section" style={{
        backgroundImage: 'url(https://dl.dropboxusercontent.com/scl/fi/jub3petorwv8sdt30rehx/sol-1.jpg?rlkey=79ja6w6l9ipxh2ak5p8x2j4pp&st=8de3t9dv)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        height: '60vh',
        minHeight: '300px',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}>
        <div style={{marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setShowPlans(true)}
                className="btn-primary mobile-btn"
                style={{boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)'}}
              >
                <Plus style={{height: '1.25rem', width: '1.25rem', marginRight: '0.5rem'}} />
                Start New Investment
              </button>
              <Link
                to="/how-to-invest"
                className="btn-secondary mobile-btn"
                style={{boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'}}
              >
                How to Invest
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn-primary" style={{fontSize: '1.125rem', padding: '0.75rem 2rem'}}>
                Start Investing
                <ArrowRight style={{marginLeft: '0.5rem', height: '1.25rem', width: '1.25rem'}} />
              </Link>
              <Link to="/how-to-invest" className="btn-secondary" style={{fontSize: '1.125rem', padding: '0.75rem 2rem'}}>
                How to Invest
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={{padding: '1rem'}}>
        <div className="container" style={{maxWidth: '1200px', margin: '0 auto'}}>

        {/* Live Withdrawals Ticker */}
        <div style={{marginBottom: '1.5rem'}}>
          <WithdrawalTicker />
        </div>

        {/* Portfolio Chart */}
        <div className="card" style={{marginBottom: '1.5rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem'}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff'}}>Live Market Performance</h2>
            {isAuthenticated && (
              <button
                onClick={() => setShowPlans(true)}
                className="btn-primary"
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem'}}
              >
                <Plus style={{height: '0.9rem', width: '0.9rem'}} />
                <span style={{display: window.innerWidth > 480 ? 'inline' : 'none'}}>New </span>Investment
              </button>
            )}
          </div>
          <LiveChart />
        </div>

        {isAuthenticated && stats && (
          <>
            {/* Stats Cards */}
            <div className="stats-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
              <div className="card" style={{textAlign: 'center'}}>
                <DollarSign style={{height: '2.5rem', width: '2.5rem', color: '#ff6b35', margin: '0 auto 1rem', filter: 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.5))'}} />
                <h3 style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#ff6b35', marginBottom: '0.5rem'}}>
                  KSh {stats?.current_portfolio_value || '0.00'}
                </h3>
                <p style={{color: '#cccccc', fontSize: '0.85rem'}}>Portfolio Value</p>
              </div>

              <div className="card" style={{textAlign: 'center'}}>
                <TrendingUp style={{height: '2.5rem', width: '2.5rem', color: '#10b981', margin: '0 auto 1rem', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))'}} />
                <h3 style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem'}}>
                  KSh {stats?.total_current_returns || '0.00'}
                </h3>
                <p style={{color: '#cccccc', fontSize: '0.85rem'}}>Total Returns</p>
              </div>

              <div className="card" style={{textAlign: 'center'}}>
                <Target style={{height: '2.5rem', width: '2.5rem', color: '#3b82f6', margin: '0 auto 1rem', filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))'}} />
                <h3 style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem'}}>
                  KSh {stats?.total_invested || '0.00'}
                </h3>
                <p style={{color: '#cccccc', fontSize: '0.85rem'}}>Total Invested</p>
              </div>

              <div className="card" style={{textAlign: 'center'}}>
                <Clock style={{height: '2.5rem', width: '2.5rem', color: '#f59e0b', margin: '0 auto 1rem', filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))'}} />
                <h3 style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem'}}>
                  {stats?.active_investments || 0}
                </h3>
                <p style={{color: '#cccccc', fontSize: '0.85rem'}}>Active Investments</p>
              </div>
            </div>

            {/* Withdrawal Button */}
            <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/payments/withdraw', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ amount: 1000 })
                    });
                    const data = await response.json();
                    if (data.error) {
                      alert(data.error + (data.message ? '\n\n' + data.message : ''));
                    } else {
                      alert(data.message || 'Withdrawal request submitted!');
                    }
                  } catch (error) {
                    alert('Network error. Please try again.');
                  }
                }}
                className="btn-primary"
                style={{
                  fontSize: '1.1rem',
                  padding: '1rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                <DollarSign style={{height: '1.25rem', width: '1.25rem'}} />
                Request Withdrawal
              </button>
            </div>

            {/* Active Investments */}
            <div className="card">
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1.5rem'}}>
                Active Investments
              </h2>
              
              {investments.length === 0 ? (
                <div style={{textAlign: 'center', padding: '3rem 1rem'}}>
                  <Target style={{height: '4rem', width: '4rem', color: '#666', margin: '0 auto 1rem'}} />
                  <h3 style={{color: '#cccccc', marginBottom: '1rem'}}>No investments yet</h3>
                  <button
                    onClick={() => setShowPlans(true)}
                    className="btn-primary"
                  >
                    Start Investing Today
                  </button>
                </div>
              ) : (
                <div style={{display: 'grid', gap: '1rem'}}>
                  {investments.map((investment) => (
                    <div key={investment.id} style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 107, 53, 0.2)',
                      borderRadius: '0.75rem',
                      padding: '1.5rem'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem'}}>
                        <div style={{flex: '1', minWidth: '150px'}}>
                          <h3 style={{color: '#ffffff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem'}}>
                            {investment.plan_name}
                          </h3>
                          <p style={{color: '#cccccc', fontSize: '0.8rem'}}>
                            Started {new Date(investment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <p style={{color: '#ff6b35', fontSize: '1.2rem', fontWeight: 'bold'}}>
                            KSh {investment.current_value}
                          </p>
                          <p style={{color: '#10b981', fontSize: '0.8rem'}}>
                            +KSh {investment.current_return} profit
                          </p>
                        </div>
                      </div>
                      
                      <div style={{marginBottom: '1rem'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                          <span style={{color: '#cccccc'}}>Progress</span>
                          <span style={{color: '#ff6b35'}}>{investment.progress}%</span>
                        </div>
                        <div style={{background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', height: '0.5rem', overflow: 'hidden'}}>
                          <div style={{
                            background: 'linear-gradient(90deg, #ff6b35, #f7931e)',
                            height: '100%',
                            width: `${investment.progress}%`,
                            borderRadius: '0.5rem',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                      </div>
                      
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.75rem', fontSize: '0.8rem'}}>
                        <div>
                          <p style={{color: '#999'}}>Invested</p>
                          <p style={{color: '#ffffff', fontWeight: '600'}}>KSh {investment.amount}</p>
                        </div>
                        <div>
                          <p style={{color: '#999'}}>Days Passed</p>
                          <p style={{color: '#ffffff', fontWeight: '600'}}>{investment.days_passed}/{investment.duration_days}</p>
                        </div>
                        <div>
                          <p style={{color: '#999'}}>Status</p>
                          <p style={{color: '#10b981', fontWeight: '600'}}>Active</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!isAuthenticated && (
          <>
            {/* Features Section for Non-Logged Users */}
            <div style={{marginBottom: '3rem'}}>
              <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                <h2 className="mobile-heading" style={{fontSize: '2.25rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '1rem'}}>Why Invest With Fortune Farm?</h2>
                <p style={{fontSize: '1.25rem', color: '#cccccc'}}>Experience guaranteed daily returns on your investments</p>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem'}}>
                <div className="card" style={{textAlign: 'center'}}>
                  <TrendingUp style={{height: '3rem', width: '3rem', color: '#ff6b35', margin: '0 auto 1rem', filter: 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.5))'}} />
                  <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem'}}>Daily Returns</h3>
                  <p style={{color: '#cccccc'}}>Earn 3.5% to 6% daily returns on your investments with our proven strategies.</p>
                </div>
                
                <div className="card" style={{textAlign: 'center'}}>
                  <DollarSign style={{height: '3rem', width: '3rem', color: '#ff6b35', margin: '0 auto 1rem', filter: 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.5))'}} />
                  <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem'}}>Multiple Plans</h3>
                  <p style={{color: '#cccccc'}}>Choose from Bronze, Silver, Premium, Platinum, Diamond, or Gold plans based on your investment capacity.</p>
                </div>
                
                <div className="card" style={{textAlign: 'center'}}>
                  <Target style={{height: '3rem', width: '3rem', color: '#ff6b35', margin: '0 auto 1rem', filter: 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.5))'}} />
                  <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem'}}>Guaranteed Profits</h3>
                  <p style={{color: '#cccccc'}}>Watch your money grow daily with our transparent and reliable investment system.</p>
                </div>
              </div>

              {/* Stats Section */}
              <div className="card" style={{textAlign: 'center', marginBottom: '3rem'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem'}}>
                  <div>
                    <div style={{fontSize: '2.25rem', fontWeight: 'bold', color: '#ff6b35', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(255, 107, 53, 0.6)'}}>5K+</div>
                    <div style={{color: '#cccccc'}}>Active Investors</div>
                  </div>
                  <div>
                    <div style={{fontSize: '2.25rem', fontWeight: 'bold', color: '#ff6b35', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(255, 107, 53, 0.6)'}}>KSh 5M+</div>
                    <div style={{color: '#cccccc'}}>Invested</div>
                  </div>
                  <div>
                    <div style={{fontSize: '2.25rem', fontWeight: 'bold', color: '#ff6b35', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(255, 107, 53, 0.6)'}}>6%</div>
                    <div style={{color: '#cccccc'}}>Max Daily Return</div>
                  </div>
                  <div>
                    <div style={{fontSize: '2.25rem', fontWeight: 'bold', color: '#ff6b35', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(255, 107, 53, 0.6)'}}>30-90</div>
                    <div style={{color: '#cccccc'}}>Days Plans</div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="card" style={{textAlign: 'center', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                <h2 className="mobile-heading" style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Ready to Start Earning?</h2>
                <p style={{fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '2rem'}}>Join Fortune Farm today and start earning daily profits on your investments.</p>
                <Link to="/register" style={{background: 'rgba(255, 255, 255, 0.95)', color: '#10b981', fontWeight: '600', padding: '0.75rem 2rem', borderRadius: '0.5rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
                  Start Investing Now
                  <ArrowRight style={{marginLeft: '0.5rem', height: '1.25rem', width: '1.25rem'}} />
                </Link>
              </div>
            </div>
          </>
        )}

        </div>
      </div>

      {/* Investment Plans Modal */}
      {showPlans && isAuthenticated && (
        <InvestmentPlans
          onClose={() => setShowPlans(false)}
          onInvestmentCreated={() => {
            setShowPlans(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
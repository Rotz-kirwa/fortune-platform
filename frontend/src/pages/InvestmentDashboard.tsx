import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { investmentAPI } from '../services/api';
import { TrendingUp, DollarSign, Target, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import LiveChart from '../components/common/LiveChart';
import InvestmentPlans from '../components/investment/InvestmentPlans';
import WithdrawalTicker from '../components/common/WithdrawalTicker';

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

const InvestmentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showPlans, setShowPlans] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%)'}}>
        <div style={{width: '3rem', height: '3rem', border: '3px solid rgba(255, 107, 53, 0.3)', borderTop: '3px solid #ff6b35', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%)', paddingTop: '4rem'}}>
      {/* Hero Section */}
      <div style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1621501011941-c8ee93618c9a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGJpdGNvaW58ZW58MHx8MHx8fDA%3D)',
        backgroundSize: window.innerWidth <= 768 ? 'contain' : 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        height: window.innerWidth <= 768 ? '50vh' : '60vh',
        minHeight: '300px',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}>
        <div style={{marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
          <button
            onClick={() => setShowPlans(true)}
            className="btn-primary"
            style={{fontSize: '1.1rem', padding: '1rem 2rem', boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)'}}
          >
            <Plus style={{height: '1.25rem', width: '1.25rem', marginRight: '0.5rem'}} />
            Start New Investment
          </button>
          <Link
            to="/how-to-invest"
            className="btn-secondary"
            style={{fontSize: '1.1rem', padding: '1rem 2rem', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'}}
          >
            How to Invest
          </Link>
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
            <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff'}}>Portfolio Growth</h2>
            <button
              onClick={() => setShowPlans(true)}
              className="btn-primary"
              style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem'}}
            >
              <Plus style={{height: '0.9rem', width: '0.9rem'}} />
              <span style={{display: window.innerWidth > 480 ? 'inline' : 'none'}}>New </span>Investment
            </button>
          </div>
          <LiveChart />
        </div>

        {/* Stats Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
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
                        ${investment.current_value}
                      </p>
                      <p style={{color: '#10b981', fontSize: '0.8rem'}}>
                        +${investment.current_return} profit
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
                      <p style={{color: '#ffffff', fontWeight: '600'}}>${investment.amount}</p>
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
      </div>
      </div>

      {/* Investment Plans Modal */}
      {showPlans && (
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

export default InvestmentDashboard;
import React, { useState, useEffect } from 'react';
import { Copy, Check, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ReferralStats {
  referral_link: string;
  total_referrals: number;
  total_commission: string;
}

const ReferralSection: React.FC = () => {
  const { user } = useAuth();
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/referral-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReferralStats(data);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!referralStats?.referral_link) return;
    
    try {
      await navigator.clipboard.writeText(referralStats.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralStats.referral_link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
        <div style={{color: '#cccccc'}}>Loading referral information...</div>
      </div>
    );
  }

  return (
    <div className="card" style={{marginBottom: '1.5rem'}}>
      <div style={{marginBottom: '1.5rem'}}>
        <h3 style={{color: '#ff6b35', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <Users style={{height: '1.5rem', width: '1.5rem'}} />
          Referral Program
        </h3>
        <p style={{color: '#cccccc', fontSize: '0.9rem'}}>
          Earn 5% commission on every investment made by your referrals
        </p>
      </div>

      {/* Referral Stats */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
        <div style={{textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem'}}>
          <Users style={{height: '2rem', width: '2rem', color: '#10b981', margin: '0 auto 0.5rem'}} />
          <div style={{color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold'}}>
            {referralStats?.total_referrals || 0}
          </div>
          <div style={{color: '#cccccc', fontSize: '0.8rem'}}>Total Referrals</div>
        </div>
        
        <div style={{textAlign: 'center', padding: '1rem', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '0.5rem'}}>
          <DollarSign style={{height: '2rem', width: '2rem', color: '#ff6b35', margin: '0 auto 0.5rem'}} />
          <div style={{color: '#ff6b35', fontSize: '1.5rem', fontWeight: 'bold'}}>
            KSh {referralStats?.total_commission || '0.00'}
          </div>
          <div style={{color: '#cccccc', fontSize: '0.8rem'}}>Total Earned</div>
        </div>
      </div>

      {/* Referral Link */}
      <div style={{marginBottom: '1rem'}}>
        <label style={{display: 'block', color: '#cccccc', marginBottom: '0.5rem', fontWeight: '500'}}>
          🔗 Your Personal Referral Link
        </label>
        <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.75rem'}}>
          <input
            type="text"
            value={referralStats?.referral_link || `${window.location.origin}/register?ref=${user?.email || user?.id}`}
            readOnly
            className="form-input"
            style={{flex: 1, fontSize: '0.85rem', padding: '0.75rem', cursor: 'pointer'}}
            onClick={copyToClipboard}
            title="Click to copy"
          />
          <button
            onClick={copyToClipboard}
            className="btn-primary"
            style={{
              padding: '0.75rem',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={copied ? 'Copied!' : 'Copy link'}
          >
            {copied ? (
              <Check style={{height: '1.2rem', width: '1.2rem'}} />
            ) : (
              <Copy style={{height: '1.2rem', width: '1.2rem'}} />
            )}
          </button>
        </div>
        
        {/* Clickable Link */}
        <div style={{marginBottom: '0.5rem'}}>
          <a 
            href={referralStats?.referral_link || `${window.location.origin}/register?ref=${user?.email || user?.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#ff6b35',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              borderBottom: '1px solid rgba(255, 107, 53, 0.3)',
              paddingBottom: '1px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            onClick={(e) => {
              e.preventDefault();
              copyToClipboard();
            }}
          >
            🔗 Click here to copy your unique referral link
          </a>
        </div>
        
        <p style={{color: '#999', fontSize: '0.75rem', fontStyle: 'italic'}}>
          Share this link with friends to earn 5% commission on their investments
        </p>
      </div>

      {/* How it works */}
      <div style={{background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '0.5rem'}}>
        <h4 style={{color: '#ffffff', fontSize: '1rem', marginBottom: '0.5rem'}}>How it works:</h4>
        <ul style={{color: '#cccccc', fontSize: '0.85rem', paddingLeft: '1rem', margin: 0}}>
          <li style={{marginBottom: '0.25rem'}}>Share your unique referral link with friends</li>
          <li style={{marginBottom: '0.25rem'}}>They register and make their first investment</li>
          <li style={{marginBottom: '0.25rem'}}>You earn 5% commission instantly</li>
          <li>Commission is added directly to your wallet</li>
        </ul>
      </div>
    </div>
  );
};

export default ReferralSection;
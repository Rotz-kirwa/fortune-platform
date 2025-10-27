import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Coins } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header style={{background: 'rgba(26, 26, 26, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000}}>
      <div className="container">
        <div className="flex justify-between items-center" style={{height: '4rem', padding: '0 0.75rem'}}>
          <Link to="/" className="flex items-center" style={{textDecoration: 'none', gap: '0.5rem'}}>
            <img src="https://images.unsplash.com/photo-1691440604411-c667eb8f8d0f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZG9sbGFyJTIwc2lnbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500" alt="Fortune Farm" style={{height: '1.75rem', width: '1.75rem', borderRadius: '0.25rem', filter: 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.5))'}} />
            <span style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff'}}>Fortune Farm</span>
          </Link>

          <div className="flex items-center" style={{gap: '0.5rem'}}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" style={{color: '#cccccc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem'}}>
                  <User style={{height: '1.2rem', width: '1.2rem'}} />
                  <span className="mobile-hide" style={{fontSize: '0.9rem'}}>{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  style={{color: '#cccccc', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  title="Logout"
                >
                  <LogOut style={{height: '1.2rem', width: '1.2rem'}} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{color: '#cccccc', textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem'}}>Login</Link>
                <Link to="/register" className="btn-primary" style={{fontSize: '0.9rem', padding: '0.6rem 1rem'}}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
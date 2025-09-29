import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      const { user, token } = response.data;
      login(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%)', padding: '3rem 1rem'}}>
      <div className="w-full max-w-md" style={{maxWidth: '28rem'}}>
        <div>
          <h2 style={{marginTop: '1.5rem', textAlign: 'center', fontSize: '1.875rem', fontWeight: '800', color: '#ffffff'}}>
            Sign in to your account
          </h2>
          <p style={{marginTop: '0.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#cccccc'}}>
            Or{' '}
            <Link to="/register" style={{fontWeight: '500', color: '#ff6b35', textDecoration: 'none'}}>
              create a new account
            </Link>
          </p>
        </div>
        
        <form style={{marginTop: '2rem'}} onSubmit={handleSubmit}>
          {error && (
            <div className="error mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cccccc'}}>
                Email address
              </label>
              <div style={{marginTop: '0.25rem', position: 'relative'}}>
                <Mail style={{position: 'absolute', left: '0.75rem', top: '0.75rem', height: '1.25rem', width: '1.25rem', color: '#9ca3af'}} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input"
                  style={{paddingLeft: '2.5rem'}}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cccccc'}}>
                Password
              </label>
              <div style={{marginTop: '0.25rem', position: 'relative'}}>
                <Lock style={{position: 'absolute', left: '0.75rem', top: '0.75rem', height: '1.25rem', width: '1.25rem', color: '#9ca3af'}} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  style={{paddingLeft: '2.5rem', paddingRight: '2.5rem'}}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  style={{position: 'absolute', right: '0.75rem', top: '0.75rem', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer'}}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff style={{height: '1.25rem', width: '1.25rem'}} /> : <Eye style={{height: '1.25rem', width: '1.25rem'}} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{marginTop: '1.5rem'}}>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{width: '100%', padding: '0.75rem 1rem', opacity: loading ? 0.5 : 1}}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
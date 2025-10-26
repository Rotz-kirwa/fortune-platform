import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { User, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!/^\d{4}$/.test(formData.password)) {
      setError('Password must be exactly 4 digits');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      const { user, token } = response.data;
      login(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 50%, #ff6b35 100%)', padding: '3rem 1rem', position: 'relative', overflow: 'hidden'}}>
      {/* Animated background elements */}
      <div style={{position: 'absolute', top: '10%', left: '10%', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(255, 107, 53, 0.3) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite'}}></div>
      <div style={{position: 'absolute', bottom: '20%', right: '15%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(247, 147, 30, 0.2) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite reverse'}}></div>
      
      <div className="w-full max-w-md" style={{maxWidth: '28rem', position: 'relative', zIndex: 10}}>
        <div className="card" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 107, 53, 0.3)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'}}>
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
              <Sparkles style={{height: '3rem', width: '3rem', color: '#ff6b35', filter: 'drop-shadow(0 0 20px rgba(255, 107, 53, 0.6))'}} />
            </div>
            <h2 style={{fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem', textShadow: '0 4px 20px rgba(255, 107, 53, 0.3)'}}>
              Join Fortune
            </h2>
            <p style={{fontSize: '0.875rem', color: '#cccccc'}}>
              Already have an account?{' '}
              <Link to="/login" style={{fontWeight: '500', color: '#ff6b35', textDecoration: 'none', textShadow: '0 0 10px rgba(255, 107, 53, 0.5)'}}>
                Sign in here
              </Link>
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error mb-4" style={{background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#ff6b6b', backdropFilter: 'blur(10px)'}}>
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cccccc', marginBottom: '0.5rem'}}>
                  Full Name
                </label>
                <div style={{position: 'relative'}}>
                  <User style={{position: 'absolute', left: '0.75rem', top: '0.75rem', height: '1.25rem', width: '1.25rem', color: '#ff6b35', zIndex: 10}} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="form-input"
                    style={{paddingLeft: '2.5rem'}}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cccccc', marginBottom: '0.5rem'}}>
                  Email Address
                </label>
                <div style={{position: 'relative'}}>
                  <Mail style={{position: 'absolute', left: '0.75rem', top: '0.75rem', height: '1.25rem', width: '1.25rem', color: '#ff6b35', zIndex: 10}} />
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
                <label htmlFor="password" style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cccccc', marginBottom: '0.5rem'}}>
                  4-Digit PIN
                </label>
                <div style={{position: 'relative'}}>
                  <Lock style={{position: 'absolute', left: '0.75rem', top: '0.75rem', height: '1.25rem', width: '1.25rem', color: '#ff6b35', zIndex: 10}} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input"
                    style={{paddingLeft: '2.5rem', paddingRight: '2.5rem'}}
                    placeholder="Enter 4-digit PIN"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    style={{position: 'absolute', right: '0.75rem', top: '0.75rem', color: '#ff6b35', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10}}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff style={{height: '1.25rem', width: '1.25rem'}} /> : <Eye style={{height: '1.25rem', width: '1.25rem'}} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#cccccc', marginBottom: '0.5rem'}}>
                  Confirm PIN
                </label>
                <div style={{position: 'relative'}}>
                  <Lock style={{position: 'absolute', left: '0.75rem', top: '0.75rem', height: '1.25rem', width: '1.25rem', color: '#ff6b35', zIndex: 10}} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="form-input"
                    style={{paddingLeft: '2.5rem'}}
                    placeholder="Confirm 4-digit PIN"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{marginTop: '2rem'}}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
                style={{width: '100%', padding: '0.875rem 1rem', fontSize: '1rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}
              >
                {loading ? (
                  <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                    <div style={{width: '1rem', height: '1rem', border: '2px solid transparent', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                    Creating Account...
                  </span>
                ) : (
                  'Create Your Fortune Account'
                )}
              </button>
            </div>
            
            <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
              <p style={{fontSize: '0.75rem', color: '#999999'}}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegisterForm;
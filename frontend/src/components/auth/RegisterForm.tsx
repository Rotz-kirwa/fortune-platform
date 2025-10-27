import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [referralCode, setReferralCode] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  const validateField = (name: string, value: string) => {
    const errors: {[key: string]: string} = {};
    
    switch (name) {
      case 'name':
        if (value.length < 2) errors.name = 'Name must be at least 2 characters';
        else if (!/^[a-zA-Z\s]+$/.test(value)) errors.name = 'Name can only contain letters and spaces';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Please enter a valid email address';
        break;
      case 'password':
        if (!/^\d{4}$/.test(value)) errors.password = 'PIN must be exactly 4 digits';
        break;
      case 'confirmPassword':
        if (value !== formData.password) errors.confirmPassword = 'PINs do not match';
        break;
    }
    
    setFieldErrors(prev => ({ ...prev, [name]: errors[name] || '' }));
    return !errors[name];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    if (value) validateField(name, value);
    else setFieldErrors(prev => ({ ...prev, [name]: '' }));
    
    // Password strength indicator
    if (name === 'password') {
      const strength = value.length === 4 && /^\d{4}$/.test(value) ? 100 : value.length * 25;
      setPasswordStrength(Math.min(strength, 100));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    // Validate all fields
    const isNameValid = validateField('name', formData.name);
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);
    const isConfirmValid = validateField('confirmPassword', formData.confirmPassword);

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
      setError('Please fix the errors above');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        referralCode: referralCode || undefined
      });
      const { user, token } = response.data;
      login(user, token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center register-container" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 50%, #ff6b35 100%)', padding: '1.5rem 1rem', position: 'relative', overflow: 'hidden'}}>
      {/* Animated background elements */}
      <div style={{position: 'absolute', top: '10%', left: '10%', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(255, 107, 53, 0.3) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite'}}></div>
      <div style={{position: 'absolute', bottom: '20%', right: '15%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(247, 147, 30, 0.2) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite reverse'}}></div>
      
      <div className="w-full max-w-md register-form-container" style={{maxWidth: '28rem', position: 'relative', zIndex: 10}}>
        <div className="card register-card" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 107, 53, 0.3)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)', borderRadius: '1rem', padding: '2rem'}}>
          <div className="register-header" style={{textAlign: 'center', marginBottom: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
              <div style={{background: 'linear-gradient(135deg, #ff6b35, #f7931e)', borderRadius: '50%', padding: '1rem', boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)'}}>
                <Sparkles style={{height: '2rem', width: '2rem', color: '#ffffff'}} />
              </div>
            </div>
            <h1 className="mobile-heading" style={{fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem', textShadow: '0 4px 20px rgba(255, 107, 53, 0.3)'}}>
              Join Fortune Farm
            </h1>
            <p style={{fontSize: '0.875rem', color: '#cccccc', lineHeight: '1.5'}}>
              Start your investment journey today<br/>
              <Link to="/login" style={{fontWeight: '600', color: '#ff6b35', textDecoration: 'none', textShadow: '0 0 10px rgba(255, 107, 53, 0.5)', borderBottom: '1px solid rgba(255, 107, 53, 0.3)', paddingBottom: '1px'}}>
                Already have an account? Sign in
              </Link>
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="register-form">
            {error && (
              <div className="error mb-4" style={{background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.4)', color: '#ff6b6b', backdropFilter: 'blur(10px)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                <AlertCircle style={{height: '1rem', width: '1rem', flexShrink: 0}} />
                <span style={{fontSize: '0.875rem'}}>{error}</span>
              </div>
            )}
            
            <div className="space-y-5">
              <div className="form-group">
                <label htmlFor="name" style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.5rem'}}>
                  Full Name *
                </label>
                <div style={{position: 'relative'}}>
                  <User style={{position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '1.25rem', width: '1.25rem', color: fieldErrors.name ? '#ef4444' : formData.name ? '#10b981' : '#ff6b35', zIndex: 10, transition: 'color 0.2s'}} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="form-input"
                    style={{
                      paddingLeft: '2.5rem',
                      paddingRight: formData.name && !fieldErrors.name ? '2.5rem' : '0.75rem',
                      border: fieldErrors.name ? '2px solid #ef4444' : formData.name && !fieldErrors.name ? '2px solid #10b981' : '1px solid rgba(255, 107, 53, 0.3)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      fontSize: '1rem',
                      padding: '0.875rem 0.75rem 0.875rem 2.5rem',
                      borderRadius: '0.75rem',
                      transition: 'all 0.2s ease'
                    }}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {formData.name && !fieldErrors.name && (
                    <CheckCircle style={{position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '1.25rem', width: '1.25rem', color: '#10b981', zIndex: 10}} />
                  )}
                </div>
                {fieldErrors.name && (
                  <p style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <AlertCircle style={{height: '0.875rem', width: '0.875rem'}} />
                    {fieldErrors.name}
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="email" style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.5rem'}}>
                  Email Address *
                </label>
                <div style={{position: 'relative'}}>
                  <Mail style={{position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '1.25rem', width: '1.25rem', color: fieldErrors.email ? '#ef4444' : formData.email ? '#10b981' : '#ff6b35', zIndex: 10, transition: 'color 0.2s'}} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="form-input"
                    style={{
                      paddingLeft: '2.5rem',
                      paddingRight: formData.email && !fieldErrors.email ? '2.5rem' : '0.75rem',
                      border: fieldErrors.email ? '2px solid #ef4444' : formData.email && !fieldErrors.email ? '2px solid #10b981' : '1px solid rgba(255, 107, 53, 0.3)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      fontSize: '1rem',
                      padding: '0.875rem 0.75rem 0.875rem 2.5rem',
                      borderRadius: '0.75rem',
                      transition: 'all 0.2s ease'
                    }}
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {formData.email && !fieldErrors.email && (
                    <CheckCircle style={{position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '1.25rem', width: '1.25rem', color: '#10b981', zIndex: 10}} />
                  )}
                </div>
                {fieldErrors.email && (
                  <p style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <AlertCircle style={{height: '0.875rem', width: '0.875rem'}} />
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="password" style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.5rem'}}>
                  4-Digit PIN *
                </label>
                <div style={{position: 'relative'}}>
                  <Lock style={{position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '1.25rem', width: '1.25rem', color: fieldErrors.password ? '#ef4444' : formData.password ? '#10b981' : '#ff6b35', zIndex: 10, transition: 'color 0.2s'}} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={4}
                    className="form-input"
                    style={{
                      paddingLeft: '2.5rem',
                      paddingRight: '2.5rem',
                      border: fieldErrors.password ? '2px solid #ef4444' : formData.password && !fieldErrors.password ? '2px solid #10b981' : '1px solid rgba(255, 107, 53, 0.3)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      fontSize: '1.25rem',
                      letterSpacing: '0.5rem',
                      textAlign: 'center',
                      padding: '0.875rem 2.5rem',
                      borderRadius: '0.75rem',
                      transition: 'all 0.2s ease'
                    }}
                    placeholder="••••"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    style={{position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#ff6b35', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10, padding: '0.25rem'}}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPassword ? <EyeOff style={{height: '1.25rem', width: '1.25rem'}} /> : <Eye style={{height: '1.25rem', width: '1.25rem'}} />}
                  </button>
                </div>
                {formData.password && (
                  <div style={{marginTop: '0.5rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem'}}>
                      <span style={{fontSize: '0.75rem', color: '#cccccc'}}>PIN Strength</span>
                      <span style={{fontSize: '0.75rem', color: passwordStrength === 100 ? '#10b981' : '#ff6b35'}}>
                        {passwordStrength === 100 ? 'Strong' : 'Weak'}
                      </span>
                    </div>
                    <div style={{height: '3px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden'}}>
                      <div style={{height: '100%', width: `${passwordStrength}%`, background: passwordStrength === 100 ? '#10b981' : '#ff6b35', transition: 'all 0.3s ease'}}></div>
                    </div>
                  </div>
                )}
                {fieldErrors.password && (
                  <p style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <AlertCircle style={{height: '0.875rem', width: '0.875rem'}} />
                    {fieldErrors.password}
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword" style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', marginBottom: '0.5rem'}}>
                  Confirm PIN *
                </label>
                <div style={{position: 'relative'}}>
                  <Lock style={{position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '1.25rem', width: '1.25rem', color: fieldErrors.confirmPassword ? '#ef4444' : formData.confirmPassword && !fieldErrors.confirmPassword ? '#10b981' : '#ff6b35', zIndex: 10, transition: 'color 0.2s'}} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    maxLength={4}
                    className="form-input"
                    style={{
                      paddingLeft: '2.5rem',
                      paddingRight: formData.confirmPassword ? '2.5rem' : '0.75rem',
                      border: fieldErrors.confirmPassword ? '2px solid #ef4444' : formData.confirmPassword && !fieldErrors.confirmPassword ? '2px solid #10b981' : '1px solid rgba(255, 107, 53, 0.3)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      fontSize: '1.25rem',
                      letterSpacing: '0.5rem',
                      textAlign: 'center',
                      padding: '0.875rem 2.5rem 0.875rem 2.5rem',
                      borderRadius: '0.75rem',
                      transition: 'all 0.2s ease'
                    }}
                    placeholder="••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  {formData.confirmPassword && (
                    <button
                      type="button"
                      style={{position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#ff6b35', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10, padding: '0.25rem'}}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide PIN' : 'Show PIN'}
                    >
                      {showConfirmPassword ? <EyeOff style={{height: '1.25rem', width: '1.25rem'}} /> : <Eye style={{height: '1.25rem', width: '1.25rem'}} />}
                    </button>
                  )}
                  {formData.confirmPassword && !fieldErrors.confirmPassword && formData.password === formData.confirmPassword && (
                    <CheckCircle style={{position: 'absolute', right: formData.confirmPassword ? '2.75rem' : '0.75rem', top: '50%', transform: 'translateY(-50%)', height: '1.25rem', width: '1.25rem', color: '#10b981', zIndex: 10}} />
                  )}
                </div>
                {fieldErrors.confirmPassword && (
                  <p style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <AlertCircle style={{height: '0.875rem', width: '0.875rem'}} />
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {referralCode && (
              <div style={{marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '0.75rem', backdropFilter: 'blur(10px)'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                  <Sparkles style={{height: '1.25rem', width: '1.25rem', color: '#10b981'}} />
                  <span style={{color: '#10b981', fontSize: '0.875rem', fontWeight: '600'}}>Referral Bonus Active!</span>
                </div>
                <p style={{color: '#10b981', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.4'}}>
                  You're joining through <strong>{referralCode}</strong>'s referral.<br/>
                  Both of you will earn 5% commission on investments!
                </p>
              </div>
            )}

            <div style={{marginTop: '2rem'}}>
              <button
                type="submit"
                disabled={loading || Object.values(fieldErrors).some(error => error)}
                className="btn-primary w-full mobile-btn"
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  opacity: loading || Object.values(fieldErrors).some(error => error) ? 0.6 : 1,
                  cursor: loading || Object.values(fieldErrors).some(error => error) ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: '#ffffff',
                  boxShadow: loading ? 'none' : '0 8px 32px rgba(255, 107, 53, 0.4)',
                  transform: loading ? 'none' : 'translateY(0)',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? (
                  <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
                    <div style={{width: '1.25rem', height: '1.25rem', border: '2px solid rgba(255, 255, 255, 0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                    Creating Your Account...
                  </span>
                ) : (
                  <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                    <Sparkles style={{height: '1.25rem', width: '1.25rem'}} />
                    Create Fortune Farm Account
                  </span>
                )}
              </button>
            </div>
            
            <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
              <p style={{fontSize: '0.75rem', color: '#999999', lineHeight: '1.4'}}>
                By creating an account, you agree to our{' '}
                <Link to="/terms" style={{color: '#ff6b35', textDecoration: 'none', borderBottom: '1px solid rgba(255, 107, 53, 0.3)'}}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" style={{color: '#ff6b35', textDecoration: 'none', borderBottom: '1px solid rgba(255, 107, 53, 0.3)'}}>Privacy Policy</Link>
              </p>
              <div style={{marginTop: '1rem', padding: '0.75rem', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(255, 107, 53, 0.2)'}}>
                <p style={{fontSize: '0.7rem', color: '#cccccc', lineHeight: '1.3'}}>
                  🔒 Your data is encrypted and secure<br/>
                  💰 Start investing from just KSh 1<br/>
                  📱 Mobile-optimized experience
                </p>
              </div>
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
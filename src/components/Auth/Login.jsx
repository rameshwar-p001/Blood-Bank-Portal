import React, { useState } from 'react';
import { signInUser } from '../../firebase/auth';
import { Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react';

const Login = ({ onToggleMode, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check for admin credentials
      if (formData.email === 'rameshwar.patil24@pcu.edu.in' && formData.password === '123456789') {
        // Create admin session manually
        const adminUser = {
          uid: 'admin-uid',
          email: 'rameshwar.patil24@pcu.edu.in',
          userType: 'admin',
          fullName: 'Admin User'
        };
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        // Force page reload to trigger useEffect
        window.location.reload();
        return;
      }
      
      await signInUser(formData.email, formData.password);
      onLoginSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <Heart className="logo-icon" />
            <h2>Blood Donation System</h2>
          </div>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={onToggleMode} className="link-button">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
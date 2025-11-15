import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Login from './Login';
import Register from './Register';

const AuthContainer = ({ onAuthSuccess, onBackToHome }) => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const handleAuthSuccess = () => {
    onAuthSuccess();
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        {onBackToHome && (
          <button className="back-to-home-btn" onClick={onBackToHome}>
            <ArrowLeft size={20} />
            Back to Home
          </button>
        )}
        
        {isLogin ? (
          <Login 
            onToggleMode={toggleMode}
            onLoginSuccess={handleAuthSuccess}
          />
        ) : (
          <Register 
            onToggleMode={toggleMode}
            onRegisterSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default AuthContainer;
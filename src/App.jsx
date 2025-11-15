import React, { useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentUserData } from './firebase/auth';
import LandingPage from './components/Landing/LandingPage';
import AuthContainer from './components/Auth/AuthContainer';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import DonorRegistration from './components/Donor/DonorRegistration';
import BloodSearch from './components/Search/BloodSearch';
import BloodRequest from './components/Requests/BloodRequest';
import RequestApproval from './components/Requests/RequestApproval';
import HospitalInventory from './components/Hospital/Inventory';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Check for admin session first
    const adminUser = localStorage.getItem('currentUser');
    if (adminUser) {
      try {
        const parsedUser = JSON.parse(adminUser);
        // Use setTimeout to avoid cascading renders
        setTimeout(() => {
          setUser(parsedUser);
          setUserData(parsedUser);
          setShowAuth(false);
          setLoading(false);
        }, 0);
        return;
      } catch {
        localStorage.removeItem('currentUser');
      }
    }

    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (authUser) {
        try {
          const userInfo = await getCurrentUserData(authUser.uid);
          setUser(authUser);
          setUserData(userInfo);
          setShowAuth(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginClick = () => {
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleBackToHome = () => {
    setShowAuth(false);
  };

  const renderCurrentPage = () => {
    if (!userData) return null;

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentUser={userData} />;
      case 'donor-registration':
        return <DonorRegistration currentUser={userData} />;
      case 'blood-search':
        return <BloodSearch currentUser={userData} />;
      case 'blood-request':
        return <BloodRequest currentUser={userData} />;
      case 'request-approval':
        return <RequestApproval currentUser={userData} />;
      case 'inventory':
        return <HospitalInventory currentUser={userData} />;
      case 'settings':
        return (
          <div className="page-container">
            <div className="page-header">
              <h2>Settings</h2>
              <p>Manage your account settings and preferences</p>
            </div>
            <div className="settings-placeholder">
              <p>Settings page coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard currentUser={userData} />;
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Blood Donation System...</p>
        </div>
      </div>
    );
  }

  // Show landing page if user is not authenticated and auth modal is not shown
  if (!user && !showAuth) {
    return <LandingPage onLoginClick={handleLoginClick} />;
  }

  // Show auth modal if login is clicked
  if (showAuth && !user) {
    return (
      <AuthContainer 
        onAuthSuccess={handleAuthSuccess} 
        onBackToHome={handleBackToHome}
      />
    );
  }

  // Show main app if user is authenticated
  if (user && userData) {
    return (
      <div className="app">
        <Navigation 
          currentUser={userData}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <main className="main-content">
          {renderCurrentPage()}
        </main>
      </div>
    );
  }

  return null;
}

export default App;

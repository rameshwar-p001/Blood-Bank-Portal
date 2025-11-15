import React, { useState } from 'react';
import { signOutUser } from '../../firebase/auth';
import { 
  Heart, 
  Home, 
  Users, 
  Search, 
  Package, 
  FileText, 
  CheckCircle, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';

const Navigation = ({ currentUser, currentPage, onPageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Clear admin session if exists
      if (localStorage.getItem('currentUser')) {
        localStorage.removeItem('currentUser');
        window.location.reload();
        return;
      }
      
      // For regular Firebase users
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['donor', 'hospital', 'admin']
    },
    {
      id: 'donor-registration',
      label: 'Donor Profile',
      icon: Users,
      roles: ['donor']
    },
    {
      id: 'blood-search',
      label: 'Find Donors',
      icon: Search,
      roles: ['donor', 'hospital', 'admin']
    },
    {
      id: 'blood-request',
      label: 'Request Blood',
      icon: FileText,
      roles: ['hospital']
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      roles: ['hospital', 'admin']
    },
    {
      id: 'request-approval',
      label: 'Manage Requests',
      icon: CheckCircle,
      roles: ['admin']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['donor', 'hospital', 'admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUser.userType)
  );

  const getUserRoleDisplay = (userType) => {
    switch (userType) {
      case 'donor': return 'Blood Donor';
      case 'hospital': return 'Hospital Staff';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const getUserRoleColor = (userType) => {
    switch (userType) {
      case 'donor': return 'donor';
      case 'hospital': return 'hospital';
      case 'admin': return 'admin';
      default: return 'default';
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="top-header">
        <div className="header-left">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="logo">
            <Heart className="logo-icon" />
            <span className="logo-text">BloodBank</span>
          </div>
        </div>

        <div className="header-right">
          <button className="notification-button">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          
          <div className="user-profile">
            <div className="user-avatar">
              {currentUser.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser.fullName}</span>
              <span className={`user-role ${getUserRoleColor(currentUser.userType)}`}>
                {getUserRoleDisplay(currentUser.userType)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <nav className={`sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <div className="user-card">
              <div className="user-avatar large">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <h4>{currentUser.fullName}</h4>
                <p className={`role-badge ${getUserRoleColor(currentUser.userType)}`}>
                  {getUserRoleDisplay(currentUser.userType)}
                </p>
                <p className="user-email">{currentUser.email}</p>
              </div>
            </div>
          </div>

          <div className="sidebar-menu">
            <ul className="menu-list">
              {filteredMenuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
                      onClick={() => {
                        onPageChange(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <IconComponent size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="sidebar-footer">
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;
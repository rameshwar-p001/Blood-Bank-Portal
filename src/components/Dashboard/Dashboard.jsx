import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Heart, 
  Users, 
  Package, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Droplets,
  TrendingUp,
  Calendar
} from 'lucide-react';

const Dashboard = ({ currentUser }) => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalRequests: 0,
    pendingRequests: 0,
    totalInventory: 0,
    lowStock: 0,
    recentDonations: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [bloodGroupStats, setBloodGroupStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch total donors
      const donorsQuery = query(collection(db, 'donorProfiles'));
      const donorsSnapshot = await getDocs(donorsQuery);
      const totalDonors = donorsSnapshot.size;

      // Fetch blood requests
      const requestsQuery = query(collection(db, 'bloodRequests'));
      const requestsSnapshot = await getDocs(requestsQuery);
      const allRequests = [];
      requestsSnapshot.forEach(doc => {
        allRequests.push({ id: doc.id, ...doc.data() });
      });

      const totalRequests = allRequests.length;
      const pendingRequests = allRequests.filter(r => r.status === 'pending').length;

      // Fetch inventory for hospitals
      let totalInventory = 0;
      let lowStock = 0;
      let bloodGroups = {};

      if (currentUser.userType === 'hospital' || currentUser.userType === 'admin') {
        const inventoryQuery = currentUser.userType === 'hospital' 
          ? query(collection(db, 'bloodInventory'), where('hospitalId', '==', currentUser.uid))
          : query(collection(db, 'bloodInventory'));
        
        const inventorySnapshot = await getDocs(inventoryQuery);
        
        inventorySnapshot.forEach(doc => {
          const item = doc.data();
          if (item.status === 'available') {
            totalInventory += item.quantity;
            
            // Count by blood group
            if (!bloodGroups[item.bloodGroup]) {
              bloodGroups[item.bloodGroup] = 0;
            }
            bloodGroups[item.bloodGroup] += item.quantity;
            
            // Check for low stock (less than 5 units)
            if (item.quantity < 5) {
              lowStock += 1;
            }
          }
        });
      }

      // Get recent activity
      const recentRequestsQuery = query(
        collection(db, 'bloodRequests'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentRequestsSnapshot = await getDocs(recentRequestsQuery);
      const recentActivities = [];
      recentRequestsSnapshot.forEach(doc => {
        recentActivities.push({ id: doc.id, ...doc.data() });
      });

      setStats({
        totalDonors,
        totalRequests,
        pendingRequests,
        totalInventory,
        lowStock,
        recentDonations: totalDonors
      });

      setBloodGroupStats(bloodGroups);
      setRecentActivity(recentActivities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getActivityIcon = (type, status) => {
    if (type === 'request') {
      switch (status) {
        case 'approved': return <CheckCircle className="activity-icon success" />;
        case 'rejected': return <AlertTriangle className="activity-icon danger" />;
        default: return <Clock className="activity-icon warning" />;
      }
    }
    return <FileText className="activity-icon info" />;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'danger';
      case 'urgent': return 'warning';
      default: return 'success';
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>{getGreeting()}, {currentUser.fullName}!</h1>
          <p>Welcome to your Blood Donation Management Dashboard</p>
        </div>
        <div className="date-section">
          <Calendar size={20} />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <Users size={32} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalDonors}</h3>
            <p>Total Donors</p>
            <div className="stat-trend">
              <TrendingUp size={16} />
              <span>+12% this month</span>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FileText size={32} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalRequests}</h3>
            <p>Blood Requests</p>
            <div className="stat-trend">
              <TrendingUp size={16} />
              <span>+8% this week</span>
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <Clock size={32} />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
            <div className="stat-trend">
              <AlertTriangle size={16} />
              <span>Needs attention</span>
            </div>
          </div>
        </div>

        {(currentUser.userType === 'hospital' || currentUser.userType === 'admin') && (
          <div className="stat-card info">
            <div className="stat-icon">
              <Package size={32} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalInventory}</h3>
              <p>Blood Units in Stock</p>
              {stats.lowStock > 0 && (
                <div className="stat-trend danger">
                  <AlertTriangle size={16} />
                  <span>{stats.lowStock} low stock items</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Blood Group Statistics */}
      {Object.keys(bloodGroupStats).length > 0 && (
        <div className="blood-groups-section">
          <h2>Blood Group Inventory</h2>
          <div className="blood-groups-grid">
            {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(group => (
              <div key={group} className="blood-group-stat">
                <div className="blood-type">
                  <Droplets size={24} />
                  <span>{group}</span>
                </div>
                <div className="stock-count">
                  <span className="count">{bloodGroupStats[group] || 0}</span>
                  <span className="unit">units</span>
                </div>
                <div className={`stock-status ${(bloodGroupStats[group] || 0) === 0 ? 'empty' : (bloodGroupStats[group] || 0) < 5 ? 'low' : 'good'}`}>
                  {(bloodGroupStats[group] || 0) === 0 ? 'Empty' : 
                   (bloodGroupStats[group] || 0) < 5 ? 'Low' : 'Good'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <button className="view-all-button">View All</button>
        </div>
        
        <div className="activity-list">
          {recentActivity.length === 0 ? (
            <div className="empty-activity">
              <Heart size={48} />
              <p>No recent activity</p>
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                {getActivityIcon('request', activity.status)}
                <div className="activity-content">
                  <div className="activity-main">
                    <span className="activity-text">
                      Blood request for <strong>{activity.patientName}</strong> - 
                      {activity.bloodGroup} ({activity.unitsRequired} units)
                    </span>
                    <span className={`urgency-badge ${getUrgencyColor(activity.urgency)}`}>
                      {activity.urgency}
                    </span>
                  </div>
                  <div className="activity-meta">
                    <span>Hospital: {activity.hospitalName}</span>
                    <span>Submitted: {formatDate(activity.createdAt)}</span>
                    <span className={`status ${activity.status}`}>
                      {activity.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {currentUser.userType === 'donor' && (
            <>
              <div className="quick-action-card">
                <Heart className="action-icon" />
                <h4>Update Donor Profile</h4>
                <p>Update your health information and check eligibility</p>
                <button className="action-button">Update Profile</button>
              </div>
              
              <div className="quick-action-card">
                <Users className="action-icon" />
                <h4>Find Blood Requests</h4>
                <p>See who needs your blood type</p>
                <button className="action-button">View Requests</button>
              </div>
            </>
          )}

          {currentUser.userType === 'hospital' && (
            <>
              <div className="quick-action-card">
                <FileText className="action-icon" />
                <h4>Submit Blood Request</h4>
                <p>Request blood units for patients</p>
                <button className="action-button">New Request</button>
              </div>
              
              <div className="quick-action-card">
                <Package className="action-icon" />
                <h4>Manage Inventory</h4>
                <p>Track and update blood inventory</p>
                <button className="action-button">View Inventory</button>
              </div>
            </>
          )}

          {currentUser.userType === 'admin' && (
            <>
              <div className="quick-action-card">
                <CheckCircle className="action-icon" />
                <h4>Process Requests</h4>
                <p>Review and approve blood requests</p>
                <button className="action-button">Review Requests</button>
              </div>
              
              <div className="quick-action-card">
                <Users className="action-icon" />
                <h4>Manage Donors</h4>
                <p>View and manage donor database</p>
                <button className="action-button">View Donors</button>
              </div>
            </>
          )}

          <div className="quick-action-card">
            <Heart className="action-icon" />
            <h4>Search Blood Donors</h4>
            <p>Find compatible donors by blood group</p>
            <button className="action-button">Search Donors</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
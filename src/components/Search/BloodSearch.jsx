import React, { useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Search, Heart, Phone, Mail, MapPin, Calendar, Filter, Users } from 'lucide-react';

const BloodSearch = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    bloodGroup: '',
    location: '',
    lastDonation: ''
  });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Blood compatibility mapping
  const compatibilityMap = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
  };

  const handleChange = (e) => {
    setSearchCriteria({
      ...searchCriteria,
      [e.target.name]: e.target.value
    });
  };

  const searchDonors = async () => {
    if (!searchCriteria.bloodGroup) {
      setError('Please select a blood group to search');
      return;
    }

    setLoading(true);
    setError('');
    setDonors([]);

    try {
      // Get compatible blood groups
      const compatibleGroups = Object.entries(compatibilityMap)
        .filter(([, canDonateTo]) => canDonateTo.includes(searchCriteria.bloodGroup))
        .map(([donorType]) => donorType);

      let donorsList = [];

      // Search for each compatible blood group
      for (const bloodGroup of compatibleGroups) {
        const q = query(
          collection(db, 'donorProfiles'),
          where('bloodGroup', '==', bloodGroup),
          where('eligibility.eligible', '==', true),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          const donorData = { id: doc.id, ...doc.data() };
          
          // Apply location filter if specified
          if (!searchCriteria.location || 
              donorData.address?.toLowerCase().includes(searchCriteria.location.toLowerCase())) {
            
            // Apply last donation filter if specified
            if (!searchCriteria.lastDonation) {
              donorsList.push(donorData);
            } else {
              const monthsAgo = parseInt(searchCriteria.lastDonation);
              const cutoffDate = new Date();
              cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo);
              
              const lastDonation = donorData.lastDonation ? new Date(donorData.lastDonation) : null;
              
              if (!lastDonation || lastDonation <= cutoffDate) {
                donorsList.push(donorData);
              }
            }
          }
        });
      }

      // Remove duplicates and sort by compatibility
      const uniqueDonors = donorsList.filter((donor, index, self) =>
        index === self.findIndex((d) => d.userId === donor.userId)
      );

      // Sort by exact match first, then compatible types
      uniqueDonors.sort((a, b) => {
        if (a.bloodGroup === searchCriteria.bloodGroup && b.bloodGroup !== searchCriteria.bloodGroup) {
          return -1;
        }
        if (b.bloodGroup === searchCriteria.bloodGroup && a.bloodGroup !== searchCriteria.bloodGroup) {
          return 1;
        }
        return 0;
      });

      setDonors(uniqueDonors);
      setSearchPerformed(true);
    } catch (error) {
      setError('Error searching donors: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysSinceLastDonation = (lastDonation) => {
    if (!lastDonation) return 'Never donated';
    
    const today = new Date();
    const donationDate = new Date(lastDonation);
    const diffTime = Math.abs(today - donationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} months ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} years ago`;
    }
  };

  const getCompatibilityLabel = (donorBloodGroup) => {
    if (donorBloodGroup === searchCriteria.bloodGroup) {
      return 'Exact Match';
    }
    return 'Compatible';
  };

  return (
    <div className="blood-search">
      <div className="page-header">
        <Search className="page-icon" />
        <div>
          <h2>Blood Donor Search</h2>
          <p>Find compatible blood donors in your area</p>
        </div>
      </div>

      <div className="search-container">
        <div className="search-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bloodGroup">Blood Group Needed *</label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={searchCriteria.bloodGroup}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <div className="input-wrapper">
                <MapPin className="input-icon" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={searchCriteria.location}
                  onChange={handleChange}
                  placeholder="City, state, or area"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lastDonation">Available for donation</label>
              <select
                id="lastDonation"
                name="lastDonation"
                value={searchCriteria.lastDonation}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Any time</option>
                <option value="3">Available now (3+ months since last donation)</option>
                <option value="6">6+ months since last donation</option>
                <option value="12">1+ years since last donation</option>
              </select>
            </div>
          </div>

          <div className="search-actions">
            <button 
              type="button" 
              onClick={searchDonors}
              className="search-button"
              disabled={loading}
            >
              <Search size={16} />
              {loading ? 'Searching...' : 'Search Donors'}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {searchPerformed && (
          <div className="search-results">
            <div className="results-header">
              <Users className="results-icon" />
              <h3>Search Results ({donors.length} donors found)</h3>
            </div>

            {donors.length === 0 ? (
              <div className="no-results">
                <Heart size={48} />
                <h4>No donors found</h4>
                <p>Try expanding your search criteria or check back later.</p>
              </div>
            ) : (
              <div className="donors-grid">
                {donors.map((donor) => (
                  <div key={donor.id} className="donor-card">
                    <div className="donor-header">
                      <div className="donor-info">
                        <h4>{donor.fullName}</h4>
                        <div className="blood-group-badge">
                          <Heart size={16} />
                          {donor.bloodGroup}
                        </div>
                      </div>
                      <div className={`compatibility-badge ${getCompatibilityLabel(donor.bloodGroup).toLowerCase().replace(' ', '-')}`}>
                        {getCompatibilityLabel(donor.bloodGroup)}
                      </div>
                    </div>

                    <div className="donor-details">
                      <div className="detail-item">
                        <Phone size={14} />
                        <span>{donor.phone}</span>
                      </div>
                      <div className="detail-item">
                        <Mail size={14} />
                        <span>{donor.userEmail}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={14} />
                        <span>{donor.address}</span>
                      </div>
                      <div className="detail-item">
                        <Calendar size={14} />
                        <span>Last donation: {calculateDaysSinceLastDonation(donor.lastDonation)}</span>
                      </div>
                    </div>

                    <div className="donor-stats">
                      <div className="stat">
                        <span className="stat-label">Weight</span>
                        <span className="stat-value">{donor.weight} kg</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Age</span>
                        <span className="stat-value">
                          {new Date().getFullYear() - new Date(donor.dateOfBirth || '1990-01-01').getFullYear()} years
                        </span>
                      </div>
                    </div>

                    <div className="donor-actions">
                      <button className="contact-button primary">
                        <Phone size={14} />
                        Contact Donor
                      </button>
                      <button className="contact-button secondary">
                        <Mail size={14} />
                        Send Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {searchCriteria.bloodGroup && (
          <div className="compatibility-info">
            <h4>Blood Compatibility Information</h4>
            <p>
              Donors with blood types <strong>{Object.entries(compatibilityMap)
                .filter(([, canDonateTo]) => canDonateTo.includes(searchCriteria.bloodGroup))
                .map(([donorType]) => donorType)
                .join(', ')}</strong> can donate to <strong>{searchCriteria.bloodGroup}</strong> recipients.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodSearch;
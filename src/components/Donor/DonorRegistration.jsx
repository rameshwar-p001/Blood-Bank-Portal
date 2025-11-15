import React, { useState } from 'react';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Calendar, Heart, AlertCircle, CheckCircle, User, Phone, MapPin } from 'lucide-react';

const DonorRegistration = ({ currentUser }) => {
  const [formData, setFormData] = useState({
    lastDonation: '',
    weight: '',
    height: '',
    medicalHistory: '',
    medications: '',
    hasConditions: false,
    conditions: []
  });
  const [eligibilityStatus, setEligibilityStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const medicalConditions = [
    'Heart Disease',
    'Diabetes',
    'High Blood Pressure',
    'Kidney Disease',
    'Liver Disease',
    'Cancer History',
    'Blood Disorders',
    'Recent Surgery',
    'Pregnancy',
    'Recent Tattoo/Piercing'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'hasConditions') {
        setFormData({
          ...formData,
          hasConditions: checked,
          conditions: checked ? formData.conditions : []
        });
      } else {
        // Handle condition checkboxes
        const updatedConditions = checked
          ? [...formData.conditions, value]
          : formData.conditions.filter(condition => condition !== value);
        
        setFormData({
          ...formData,
          conditions: updatedConditions
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const checkEligibility = () => {
    const eligibility = {
      eligible: true,
      reasons: []
    };

    // Age check (assuming user has dateOfBirth in their profile)
    const today = new Date();
    const birthDate = new Date(currentUser.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 18 || age > 65) {
      eligibility.eligible = false;
      eligibility.reasons.push('Age must be between 18 and 65 years');
    }

    // Weight check
    if (parseFloat(formData.weight) < 50) {
      eligibility.eligible = false;
      eligibility.reasons.push('Weight must be at least 50 kg');
    }

    // Last donation check (must be at least 3 months ago)
    if (formData.lastDonation) {
      const lastDonationDate = new Date(formData.lastDonation);
      const monthsDiff = (today - lastDonationDate) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsDiff < 3) {
        eligibility.eligible = false;
        eligibility.reasons.push('Must wait at least 3 months between donations');
      }
    }

    // Medical conditions check
    const restrictiveConditions = [
      'Heart Disease',
      'Kidney Disease',
      'Liver Disease',
      'Cancer History',
      'Blood Disorders'
    ];

    const hasRestrictiveCondition = formData.conditions.some(condition =>
      restrictiveConditions.includes(condition)
    );

    if (hasRestrictiveCondition) {
      eligibility.eligible = false;
      eligibility.reasons.push('Current medical conditions prevent donation');
    }

    // Recent conditions
    const recentConditions = ['Recent Surgery', 'Recent Tattoo/Piercing'];
    const hasRecentCondition = formData.conditions.some(condition =>
      recentConditions.includes(condition)
    );

    if (hasRecentCondition) {
      eligibility.eligible = false;
      eligibility.reasons.push('Recent procedures require waiting period');
    }

    if (eligibility.eligible) {
      eligibility.reasons.push('You are eligible to donate blood!');
    }

    setEligibilityStatus(eligibility);
    return eligibility;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const eligibility = checkEligibility();

      // Update user profile
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...formData,
        isEligible: eligibility.eligible,
        eligibilityCheckedAt: new Date().toISOString()
      });

      // Create donation record
      await addDoc(collection(db, 'donorProfiles'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        fullName: currentUser.fullName,
        bloodGroup: currentUser.bloodGroup,
        phone: currentUser.phone,
        ...formData,
        eligibility: eligibility,
        createdAt: new Date().toISOString()
      });

      setSuccess('Donor profile updated successfully!');
    } catch (error) {
      setError('Error updating donor profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donor-registration">
      <div className="page-header">
        <Heart className="page-icon" />
        <div>
          <h2>Donor Registration & Eligibility Check</h2>
          <p>Complete your donor profile and check your eligibility to donate blood</p>
        </div>
      </div>

      <div className="registration-container">
        <div className="donor-info-card">
          <h3>Current Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <User size={16} />
              <span>{currentUser.fullName}</span>
            </div>
            <div className="info-item">
              <Heart size={16} />
              <span>Blood Group: {currentUser.bloodGroup}</span>
            </div>
            <div className="info-item">
              <Phone size={16} />
              <span>{currentUser.phone}</span>
            </div>
            <div className="info-item">
              <MapPin size={16} />
              <span>{currentUser.address}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-section">
            <h4>Health Information</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Enter your weight"
                  min="30"
                  max="200"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="height">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Enter your height"
                  min="120"
                  max="250"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lastDonation">Last Blood Donation Date (if any)</label>
              <div className="input-wrapper">
                <Calendar className="input-icon" />
                <input
                  type="date"
                  id="lastDonation"
                  name="lastDonation"
                  value={formData.lastDonation}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Medical History</h4>
            
            <div className="form-group">
              <label htmlFor="medicalHistory">Medical History</label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="Describe any significant medical history"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="medications">Current Medications</label>
              <textarea
                id="medications"
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                placeholder="List any medications you are currently taking"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="hasConditions"
                  checked={formData.hasConditions}
                  onChange={handleChange}
                />
                I have or recently had any of the following conditions
              </label>
            </div>

            {formData.hasConditions && (
              <div className="conditions-grid">
                {medicalConditions.map(condition => (
                  <label key={condition} className="condition-item">
                    <input
                      type="checkbox"
                      name="conditions"
                      value={condition}
                      checked={formData.conditions.includes(condition)}
                      onChange={handleChange}
                    />
                    {condition}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={checkEligibility}
              className="check-button"
            >
              Check Eligibility
            </button>
            
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Updating...' : 'Update Donor Profile'}
            </button>
          </div>
        </form>

        {eligibilityStatus && (
          <div className={`eligibility-result ${eligibilityStatus.eligible ? 'eligible' : 'ineligible'}`}>
            <div className="result-header">
              {eligibilityStatus.eligible ? (
                <CheckCircle className="result-icon success" />
              ) : (
                <AlertCircle className="result-icon error" />
              )}
              <h3>
                {eligibilityStatus.eligible ? 'Eligible to Donate' : 'Not Eligible to Donate'}
              </h3>
            </div>
            <ul className="result-reasons">
              {eligibilityStatus.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
    </div>
  );
};

export default DonorRegistration;
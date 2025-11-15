import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { sendEmail } from '../../services/emailService';
import { Heart, Calendar, MapPin, Phone, User, Droplets, AlertCircle } from 'lucide-react';

const BloodRequest = ({ currentUser }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    bloodGroup: '',
    unitsRequired: '',
    urgency: 'normal', // normal, urgent, emergency
    requiredBy: '',
    hospitalName: '',
    hospitalAddress: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    medicalReason: '',
    additionalNotes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'normal', label: 'Normal', color: 'green' },
    { value: 'urgent', label: 'Urgent', color: 'orange' },
    { value: 'emergency', label: 'Emergency', color: 'red' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create blood request
      const requestData = {
        ...formData,
        unitsRequired: parseInt(formData.unitsRequired),
        patientAge: parseInt(formData.patientAge),
        requesterId: currentUser.uid,
        requesterEmail: currentUser.email,
        requesterName: currentUser.fullName,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'bloodRequests'), requestData);

      // Send notification email
      try {
        await sendEmail({
          to: 'admin@bloodbank.com', // Replace with actual admin email
          subject: `New Blood Request - ${formData.urgency.toUpperCase()}`,
          html: `
            <h2>New Blood Request Submitted</h2>
            <p><strong>Request ID:</strong> ${docRef.id}</p>
            <p><strong>Patient:</strong> ${formData.patientName}</p>
            <p><strong>Blood Group:</strong> ${formData.bloodGroup}</p>
            <p><strong>Units Required:</strong> ${formData.unitsRequired}</p>
            <p><strong>Urgency:</strong> ${formData.urgency}</p>
            <p><strong>Required By:</strong> ${formData.requiredBy}</p>
            <p><strong>Hospital:</strong> ${formData.hospitalName}</p>
            <p><strong>Contact:</strong> ${formData.contactPerson} (${formData.contactPhone})</p>
            <p><strong>Medical Reason:</strong> ${formData.medicalReason}</p>
            ${formData.additionalNotes ? `<p><strong>Notes:</strong> ${formData.additionalNotes}</p>` : ''}
          `
        });
      } catch (emailError) {
        console.log('Email notification failed:', emailError);
        // Don't fail the request if email fails
      }

      setSuccess('Blood request submitted successfully! You will be notified once it is processed.');
      
      // Reset form
      setFormData({
        patientName: '',
        patientAge: '',
        bloodGroup: '',
        unitsRequired: '',
        urgency: 'normal',
        requiredBy: '',
        hospitalName: '',
        hospitalAddress: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        medicalReason: '',
        additionalNotes: ''
      });

    } catch (error) {
      setError('Error submitting request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blood-request">
      <div className="page-header">
        <Heart className="page-icon" />
        <div>
          <h2>Submit Blood Request</h2>
          <p>Request blood units for patients in need</p>
        </div>
      </div>

      <div className="request-container">
        {success && (
          <div className="success-message">
            <AlertCircle size={20} />
            {success}
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="request-form">
          {/* Patient Information */}
          <div className="form-section">
            <h3>Patient Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="patientName">Patient Name *</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    id="patientName"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    placeholder="Enter patient's full name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="patientAge">Patient Age *</label>
                <input
                  type="number"
                  id="patientAge"
                  name="patientAge"
                  value={formData.patientAge}
                  onChange={handleChange}
                  placeholder="Age"
                  min="0"
                  max="150"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bloodGroup">Blood Group Required *</label>
                <div className="input-wrapper">
                  <Droplets className="input-icon" />
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="unitsRequired">Units Required *</label>
                <input
                  type="number"
                  id="unitsRequired"
                  name="unitsRequired"
                  value={formData.unitsRequired}
                  onChange={handleChange}
                  placeholder="Number of units"
                  min="1"
                  max="50"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="urgency">Urgency Level *</label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                >
                  {urgencyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="requiredBy">Required By *</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" />
                  <input
                    type="datetime-local"
                    id="requiredBy"
                    name="requiredBy"
                    value={formData.requiredBy}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Information */}
          <div className="form-section">
            <h3>Hospital Information</h3>
            
            <div className="form-group">
              <label htmlFor="hospitalName">Hospital Name *</label>
              <input
                type="text"
                id="hospitalName"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                placeholder="Enter hospital name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hospitalAddress">Hospital Address *</label>
              <div className="input-wrapper">
                <MapPin className="input-icon" />
                <textarea
                  id="hospitalAddress"
                  name="hospitalAddress"
                  value={formData.hospitalAddress}
                  onChange={handleChange}
                  placeholder="Enter complete hospital address"
                  rows="3"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3>Contact Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person *</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Doctor/Staff name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contactPhone">Contact Phone *</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" />
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email *</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="Email address for updates"
                required
              />
            </div>
          </div>

          {/* Medical Information */}
          <div className="form-section">
            <h3>Medical Information</h3>
            
            <div className="form-group">
              <label htmlFor="medicalReason">Medical Reason *</label>
              <textarea
                id="medicalReason"
                name="medicalReason"
                value={formData.medicalReason}
                onChange={handleChange}
                placeholder="Describe the medical condition requiring blood transfusion"
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="additionalNotes">Additional Notes</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                placeholder="Any additional information or special requirements"
                rows="3"
              />
            </div>
          </div>

          {/* Urgency Indicator */}
          <div className={`urgency-indicator ${formData.urgency}`}>
            <AlertCircle size={20} />
            <div>
              <strong>Urgency Level: {urgencyLevels.find(l => l.value === formData.urgency)?.label}</strong>
              <p>
                {formData.urgency === 'emergency' && 'Emergency requests are processed immediately and given highest priority.'}
                {formData.urgency === 'urgent' && 'Urgent requests are processed within 2-4 hours.'}
                {formData.urgency === 'normal' && 'Normal requests are processed within 24 hours.'}
              </p>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Submitting Request...' : 'Submit Blood Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BloodRequest;
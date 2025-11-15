import React, { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { sendEmail } from '../../services/emailService';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Heart, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  User,
  Droplets
} from 'lucide-react';

const RequestApproval = ({ currentUser }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const fetchRequests = useCallback(async () => {
    try {
      let q;
      
      if (filter === 'all') {
        q = query(
          collection(db, 'bloodRequests'),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'bloodRequests'),
          where('status', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const requestsData = [];
      
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApproval = async (requestId, status, rejectionReason = '') => {
    setProcessingId(requestId);
    
    try {
      const request = requests.find(r => r.id === requestId);
      
      const updateData = {
        status,
        processedBy: currentUser.uid,
        processedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      await updateDoc(doc(db, 'bloodRequests', requestId), updateData);

      // Send notification email
      try {
        const emailSubject = status === 'approved' 
          ? 'Blood Request Approved'
          : 'Blood Request Status Update';
        
        const emailContent = status === 'approved'
          ? `
            <h2>Blood Request Approved</h2>
            <p>Your blood request has been approved!</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Patient:</strong> ${request.patientName}</p>
            <p><strong>Blood Group:</strong> ${request.bloodGroup}</p>
            <p><strong>Units Approved:</strong> ${request.unitsRequired}</p>
            <p><strong>Hospital:</strong> ${request.hospitalName}</p>
            <p>Please contact the blood bank to coordinate the collection.</p>
          `
          : `
            <h2>Blood Request Update</h2>
            <p>Your blood request status has been updated to: ${status}</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Patient:</strong> ${request.patientName}</p>
            ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
          `;

        await sendEmail({
          to: request.contactEmail,
          subject: emailSubject,
          html: emailContent
        });
      } catch (emailError) {
        console.log('Email notification failed:', emailError);
      }

      await fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="status-icon success" />;
      case 'rejected': return <XCircle className="status-icon danger" />;
      case 'pending': return <Clock className="status-icon warning" />;
      default: return <AlertTriangle className="status-icon secondary" />;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'danger';
      case 'urgent': return 'warning';
      case 'normal': return 'success';
      default: return 'secondary';
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isOverdue = (requiredBy) => {
    return new Date(requiredBy) < new Date();
  };

  if (loading) {
    return <div className="loading">Loading requests...</div>;
  }

  return (
    <div className="request-approval">
      <div className="page-header">
        <CheckCircle className="page-icon" />
        <div>
          <h2>Blood Request Management</h2>
          <p>Review and process blood requests</p>
        </div>
        
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="requests-stats">
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{requests.filter(r => r.status === 'pending').length}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon approved">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{requests.filter(r => r.status === 'approved').length}</h3>
            <p>Approved Today</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon emergency">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>{requests.filter(r => r.urgency === 'emergency' && r.status === 'pending').length}</h3>
            <p>Emergency Requests</p>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <Heart size={48} />
          <h4>No Blood Requests</h4>
          <p>No requests found matching your filter criteria.</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div 
              key={request.id} 
              className={`request-card ${request.urgency} ${request.status} ${isOverdue(request.requiredBy) ? 'overdue' : ''}`}
            >
              <div className="request-header">
                <div className="request-title">
                  <h4>{request.patientName}</h4>
                  <div className="request-badges">
                    <span className={`urgency-badge ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency.toUpperCase()}
                    </span>
                    <span className={`status-badge ${request.status}`}>
                      {getStatusIcon(request.status)}
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="request-id">
                  Request ID: {request.id.substring(0, 8)}...
                </div>
              </div>

              <div className="request-details">
                <div className="details-grid">
                  <div className="detail-item">
                    <Droplets className="detail-icon" />
                    <div>
                      <span className="label">Blood Group & Units</span>
                      <span className="value">{request.bloodGroup} - {request.unitsRequired} units</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <User className="detail-icon" />
                    <div>
                      <span className="label">Patient Age</span>
                      <span className="value">{request.patientAge} years</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Calendar className="detail-icon" />
                    <div>
                      <span className="label">Required By</span>
                      <span className={`value ${isOverdue(request.requiredBy) ? 'overdue-text' : ''}`}>
                        {formatDateTime(request.requiredBy)}
                        {isOverdue(request.requiredBy) && <span className="overdue-label"> (OVERDUE)</span>}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <MapPin className="detail-icon" />
                    <div>
                      <span className="label">Hospital</span>
                      <span className="value">{request.hospitalName}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Phone className="detail-icon" />
                    <div>
                      <span className="label">Contact</span>
                      <span className="value">{request.contactPerson} - {request.contactPhone}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Mail className="detail-icon" />
                    <div>
                      <span className="label">Email</span>
                      <span className="value">{request.contactEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="medical-reason">
                  <strong>Medical Reason:</strong>
                  <p>{request.medicalReason}</p>
                </div>

                {request.additionalNotes && (
                  <div className="additional-notes">
                    <strong>Additional Notes:</strong>
                    <p>{request.additionalNotes}</p>
                  </div>
                )}

                {request.rejectionReason && (
                  <div className="rejection-reason">
                    <strong>Rejection Reason:</strong>
                    <p>{request.rejectionReason}</p>
                  </div>
                )}
              </div>

              <div className="request-meta">
                <div className="meta-item">
                  <span className="label">Submitted:</span>
                  <span className="value">{formatDateTime(request.createdAt)}</span>
                </div>
                
                <div className="meta-item">
                  <span className="label">Submitted by:</span>
                  <span className="value">{request.requesterName} ({request.requesterEmail})</span>
                </div>

                {request.processedAt && (
                  <div className="meta-item">
                    <span className="label">Processed:</span>
                    <span className="value">{formatDateTime(request.processedAt)}</span>
                  </div>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="request-actions">
                  <button
                    onClick={() => handleApproval(request.id, 'approved')}
                    className="approve-button"
                    disabled={processingId === request.id}
                  >
                    <CheckCircle size={16} />
                    {processingId === request.id ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => {
                      const reason = prompt('Please provide a reason for rejection:');
                      if (reason) {
                        handleApproval(request.id, 'rejected', reason);
                      }
                    }}
                    className="reject-button"
                    disabled={processingId === request.id}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestApproval;
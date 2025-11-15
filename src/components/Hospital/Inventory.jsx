import React, { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Heart, 
  Calendar,
  Droplets
} from 'lucide-react';

const HospitalInventory = ({ currentUser }) => {
  const [inventory, setInventory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    bloodGroup: '',
    quantity: '',
    unitsType: 'bags', // bags, ml
    expiryDate: '',
    collectionDate: '',
    status: 'available', // available, reserved, expired
    donorId: '',
    notes: ''
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const statusOptions = ['available', 'reserved', 'expired', 'used'];

  const fetchInventory = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'bloodInventory'),
        where('hospitalId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const inventoryData = [];
      
      querySnapshot.forEach((doc) => {
        inventoryData.push({ id: doc.id, ...doc.data() });
      });
      
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      fetchInventory();
    }
  }, [currentUser, fetchInventory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const inventoryItem = {
        ...formData,
        quantity: parseInt(formData.quantity),
        hospitalId: currentUser.uid,
        hospitalName: currentUser.fullName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'bloodInventory', editingItem.id), {
          ...inventoryItem,
          createdAt: editingItem.createdAt // Preserve original creation date
        });
      } else {
        await addDoc(collection(db, 'bloodInventory'), inventoryItem);
      }

      await fetchInventory();
      resetForm();
    } catch (error) {
      console.error('Error saving inventory item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      bloodGroup: item.bloodGroup,
      quantity: item.quantity.toString(),
      unitsType: item.unitsType,
      expiryDate: item.expiryDate,
      collectionDate: item.collectionDate,
      status: item.status,
      donorId: item.donorId || '',
      notes: item.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteDoc(doc(db, 'bloodInventory', id));
        await fetchInventory();
      } catch (error) {
        console.error('Error deleting inventory item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      bloodGroup: '',
      quantity: '',
      unitsType: 'bags',
      expiryDate: '',
      collectionDate: '',
      status: 'available',
      donorId: '',
      notes: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'reserved': return 'warning';
      case 'expired': return 'danger';
      case 'used': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle size={16} />;
      case 'reserved': return <AlertTriangle size={16} />;
      case 'expired': return <AlertTriangle size={16} />;
      case 'used': return <Package size={16} />;
      default: return <Package size={16} />;
    }
  };

  const isExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isExpired = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const getTotalByBloodGroup = () => {
    const totals = {};
    bloodGroups.forEach(group => {
      totals[group] = inventory
        .filter(item => item.bloodGroup === group && item.status === 'available')
        .reduce((sum, item) => sum + item.quantity, 0);
    });
    return totals;
  };

  const totals = getTotalByBloodGroup();

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="hospital-inventory">
      <div className="page-header">
        <Package className="page-icon" />
        <div>
          <h2>Blood Inventory Management</h2>
          <p>Track and manage your hospital's blood supply</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="add-button"
        >
          <Plus size={16} />
          Add Blood Unit
        </button>
      </div>

      {/* Inventory Summary */}
      <div className="inventory-summary">
        <h3>Current Stock Summary</h3>
        <div className="blood-groups-grid">
          {bloodGroups.map(group => (
            <div key={group} className="blood-group-card">
              <div className="blood-group-header">
                <Heart className="blood-icon" />
                <span className="blood-type">{group}</span>
              </div>
              <div className="stock-amount">
                <span className="amount">{totals[group]}</span>
                <span className="unit">bags</span>
              </div>
              <div className={`stock-status ${totals[group] === 0 ? 'empty' : totals[group] < 5 ? 'low' : 'good'}`}>
                {totals[group] === 0 ? 'Out of Stock' : 
                 totals[group] < 5 ? 'Low Stock' : 'In Stock'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Blood Unit' : 'Add Blood Unit'}</h3>
              <button onClick={resetForm} className="close-button">×</button>
            </div>

            <form onSubmit={handleSubmit} className="inventory-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bloodGroup">Blood Group</label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="unitsType">Units</label>
                  <select
                    id="unitsType"
                    name="unitsType"
                    value={formData.unitsType}
                    onChange={handleInputChange}
                  >
                    <option value="bags">Bags</option>
                    <option value="ml">Milliliters</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="collectionDate">Collection Date</label>
                  <input
                    type="date"
                    id="collectionDate"
                    name="collectionDate"
                    value={formData.collectionDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="donorId">Donor ID (Optional)</label>
                  <input
                    type="text"
                    id="donorId"
                    name="donorId"
                    value={formData.donorId}
                    onChange={handleInputChange}
                    placeholder="Enter donor ID if available"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes about this blood unit"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {editingItem ? 'Update' : 'Add'} Blood Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="inventory-list">
        <div className="list-header">
          <h3>Inventory Details</h3>
          <div className="list-stats">
            Total Units: {inventory.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
        </div>

        {inventory.length === 0 ? (
          <div className="empty-state">
            <Droplets size={48} />
            <h4>No Blood Units in Inventory</h4>
            <p>Start by adding blood units to your inventory</p>
          </div>
        ) : (
          <div className="inventory-table">
            <div className="table-header">
              <div className="col">Blood Group</div>
              <div className="col">Quantity</div>
              <div className="col">Collection Date</div>
              <div className="col">Expiry Date</div>
              <div className="col">Status</div>
              <div className="col">Actions</div>
            </div>

            {inventory.map((item) => (
              <div 
                key={item.id} 
                className={`table-row ${isExpired(item.expiryDate) ? 'expired' : isExpiringSoon(item.expiryDate) ? 'expiring-soon' : ''}`}
              >
                <div className="col">
                  <div className="blood-group-cell">
                    <Heart size={16} />
                    <strong>{item.bloodGroup}</strong>
                  </div>
                </div>
                
                <div className="col">
                  {item.quantity} {item.unitsType}
                </div>
                
                <div className="col">
                  <div className="date-cell">
                    <Calendar size={14} />
                    {new Date(item.collectionDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="col">
                  <div className={`date-cell ${isExpired(item.expiryDate) ? 'expired' : isExpiringSoon(item.expiryDate) ? 'expiring' : ''}`}>
                    <Calendar size={14} />
                    {new Date(item.expiryDate).toLocaleDateString()}
                    {isExpiringSoon(item.expiryDate) && (
                      <span className="warning-text"> (Expiring Soon)</span>
                    )}
                    {isExpired(item.expiryDate) && (
                      <span className="error-text"> (Expired)</span>
                    )}
                  </div>
                </div>
                
                <div className="col">
                  <span className={`status-badge ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
                
                <div className="col">
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="edit-button"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="delete-button"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalInventory;
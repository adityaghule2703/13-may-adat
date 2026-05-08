// src/pages/inventory/EditWarehouse.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Warehouse, Building, MapPin, User, Phone, Mail, Package, AlertCircle, CheckCircle, Loader, FileText } from 'lucide-react';
import BASE_URL from '../../config/Config';

const EditWarehouse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    manager: {
      name: '',
      phone: '',
      email: ''
    },
    capacity: {
      total: '',
      used: 0,
      unit: 'KG'
    },
    isActive: true,
    notes: ''
  });

  const getToken = () => localStorage.getItem('token');

  const fetchWarehouse = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/warehouse/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        const warehouse = data.data.warehouse;
        setFormData({
          name: warehouse.name || '',
          code: warehouse.code || '',
          location: {
            address: warehouse.location?.address || '',
            city: warehouse.location?.city || '',
            state: warehouse.location?.state || '',
            pincode: warehouse.location?.pincode || ''
          },
          manager: {
            name: warehouse.manager?.name || '',
            phone: warehouse.manager?.phone || '',
            email: warehouse.manager?.email || ''
          },
          capacity: {
            total: warehouse.capacity?.total || '',
            used: warehouse.capacity?.used || 0,
            unit: warehouse.capacity?.unit || 'KG'
          },
          isActive: warehouse.isActive !== undefined ? warehouse.isActive : true,
          notes: warehouse.notes || ''
        });
      } else {
        setError(data.message || 'Failed to fetch warehouse');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Warehouse name is required';
    if (!formData.code) errors.code = 'Warehouse code is required';
    if (!formData.location.city) errors['location.city'] = 'City is required';
    if (!formData.location.state) errors['location.state'] = 'State is required';
    if (!formData.manager.name) errors['manager.name'] = 'Manager name is required';
    if (!formData.manager.phone) errors['manager.phone'] = 'Manager phone is required';
    if (!formData.capacity.total) errors['capacity.total'] = 'Total capacity is required';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/warehouse/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          capacity: { 
            ...formData.capacity, 
            total: parseFloat(formData.capacity.total),
            used: parseFloat(formData.capacity.used) || 0
          }
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/warehouses'), 2000);
      } else {
        setError(data.message || 'Failed to update warehouse');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-sm";
  const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold mb-1" style={{ color: '#4B5568' }}>
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  if (fetching) {
    return <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-green-700" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/warehouses')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-green-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-green-900">Edit Warehouse</h1>
            <p className="text-xs text-gray-500">Update warehouse information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/warehouses')} className="px-4 py-2 rounded-lg border text-gray-600">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-lg bg-green-700 text-white flex items-center gap-2">
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update Warehouse
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3"><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-sm text-red-600">{error}</span></div>}
      {success && <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-sm text-green-700">Warehouse updated successfully! Redirecting...</span></div>}

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><Warehouse className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Basic Information</h2></div></div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><Label required>Warehouse Name</Label><input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} /></div>
            <div><Label required>Warehouse Code</Label><input type="text" name="code" value={formData.code} onChange={handleChange} className={inputClasses} /></div>
            <div><Label>Status</Label><div className="flex gap-4 mt-2"><label className="flex items-center gap-2"><input type="radio" name="isActive" checked={formData.isActive === true} onChange={() => setFormData(prev => ({ ...prev, isActive: true }))} className="w-4 h-4" /> Active</label><label className="flex items-center gap-2"><input type="radio" name="isActive" checked={formData.isActive === false} onChange={() => setFormData(prev => ({ ...prev, isActive: false }))} className="w-4 h-4" /> Inactive</label></div></div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Location Details</h2></div></div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2"><Label>Address</Label><textarea name="location.address" value={formData.location.address} onChange={handleChange} rows="2" className={`${inputClasses} resize-none`} /></div>
            <div><Label required>City</Label><input type="text" name="location.city" value={formData.location.city} onChange={handleChange} className={inputClasses} /></div>
            <div><Label required>State</Label><input type="text" name="location.state" value={formData.location.state} onChange={handleChange} className={inputClasses} /></div>
            <div><Label>Pincode</Label><input type="text" name="location.pincode" value={formData.location.pincode} onChange={handleChange} className={inputClasses} /></div>
          </div>
        </div>

        {/* Manager Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><User className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Manager Details</h2></div></div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><Label required>Manager Name</Label><input type="text" name="manager.name" value={formData.manager.name} onChange={handleChange} className={inputClasses} /></div>
            <div><Label required>Phone Number</Label><input type="tel" name="manager.phone" value={formData.manager.phone} onChange={handleChange} className={inputClasses} /></div>
            <div className="md:col-span-2"><Label>Email</Label><input type="email" name="manager.email" value={formData.manager.email} onChange={handleChange} className={inputClasses} /></div>
          </div>
        </div>

        {/* Capacity Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><Package className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Capacity Details</h2></div></div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><Label required>Total Capacity</Label><input type="number" name="capacity.total" value={formData.capacity.total} onChange={handleChange} className={inputClasses} /></div>
            <div><Label>Used Capacity</Label><input type="number" name="capacity.used" value={formData.capacity.used} onChange={handleChange} className={inputClasses} /></div>
            <div><Label>Unit</Label><select name="capacity.unit" value={formData.capacity.unit} onChange={handleChange} className={inputClasses}><option value="KG">KG (Kilograms)</option><option value="TON">TON (Tons)</option><option value="QUINTAL">QUINTAL</option></select></div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Additional Notes</h2></div></div>
          <div className="p-5"><textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className={`${inputClasses} resize-none`} /></div>
        </div>
      </div>
    </div>
  );
};

export default EditWarehouse;
// src/pages/purchase/UpdatePurchaseStatus.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, AlertCircle, CheckCircle, 
  Loader, FileText, TrendingUp, Clock
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const UpdatePurchaseStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [purchase, setPurchase] = useState(null);
  
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });

  const getToken = () => localStorage.getItem('token');

  const fetchPurchase = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/purchases/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setPurchase(data.data);
        setFormData({
          status: data.data.status,
          notes: data.data.notes || ''
        });
      } else {
        setError(data.message || 'Failed to fetch purchase');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPurchase();
  }, [id]);

  const getStatusOptions = () => {
    const currentStatus = purchase?.status;
    const options = [];

    if (currentStatus === 'saved') {
      options.push({ value: 'partial', label: 'Partial Payment', icon: TrendingUp, color: '#1976D2' });
      options.push({ value: 'completed', label: 'Completed', icon: CheckCircle, color: '#2E7D32' });
      options.push({ value: 'cancelled', label: 'Cancelled', icon: X, color: '#D32F2F' });
    } else if (currentStatus === 'partial') {
      options.push({ value: 'completed', label: 'Completed', icon: CheckCircle, color: '#2E7D32' });
      options.push({ value: 'cancelled', label: 'Cancelled', icon: X, color: '#D32F2F' });
    }

    return options;
  };

  const handleSubmit = async () => {
    if (!formData.status) {
      setError('Please select a status');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const updateData = {
        status: formData.status,
        notes: formData.notes
      };

      const response = await fetch(`${BASE_URL}/purchases/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate(`/purchases/view/${id}`), 2000);
      } else {
        setError(data.message || 'Failed to update purchase');
      }
    } catch (error) {
      console.error('Error updating purchase:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/purchases/view/${id}`)} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Update Purchase Status</h1>
            <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Receipt: {purchase?.receiptNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/purchases/view/${id}`)} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50"
            style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}>
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Status
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-500"><X className="w-3 h-3" /></button>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">Purchase status updated successfully! Redirecting...</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#1B5E20' }}>Current Purchase Details</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500">Receipt Number</p>
              <p className="font-semibold">{purchase?.receiptNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Farmer</p>
              <p className="font-semibold">{purchase?.farmer?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Final Payable</p>
              <p className="font-semibold text-orange-600">{formatCurrency(purchase?.finalPayable)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount Paid</p>
              <p className="font-semibold text-green-600">{formatCurrency(purchase?.amountPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Status</p>
              <p className="inline-flex px-2 py-1 rounded-full text-xs" style={{ 
                background: purchase?.status === 'saved' ? '#FFF3E0' : purchase?.status === 'partial' ? '#E3F2FD' : '#E8F5E9',
                color: purchase?.status === 'saved' ? '#FF6F00' : purchase?.status === 'partial' ? '#1976D2' : '#2E7D32'
              }}>
                {purchase?.status || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount Due</p>
              <p className="font-semibold text-red-600">{formatCurrency(purchase?.amountDue)}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#2E7D32' }}>New Status *</label>
            <div className="grid grid-cols-1 gap-3">
              {getStatusOptions().map(option => {
                const Icon = option.icon;
                const isSelected = formData.status === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: option.value }))}
                    className={`p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <Icon className="w-5 h-5" style={{ color: option.color }} />
                    <div className="text-left">
                      <p className="font-medium" style={{ color: option.color }}>{option.label}</p>
                      <p className="text-xs text-gray-500">
                        {option.value === 'completed' && 'Mark purchase as fully paid and completed'}
                        {option.value === 'partial' && 'Mark purchase as partially paid'}
                        {option.value === 'cancelled' && 'Cancel this purchase (cannot be undone)'}
                      </p>
                    </div>
                    {isSelected && <CheckCircle className="w-5 h-5 ml-auto text-green-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#2E7D32' }}>Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any notes about this status change..."
              rows="3"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none text-sm"
              style={{ borderColor: '#C8E6C9' }}
            />
          </div>

          {formData.status === 'cancelled' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700"><strong>Warning:</strong> Cancelling this purchase will revert all ledger entries and may affect farmer pending dues.</p>
            </div>
          )}

          {formData.status === 'completed' && purchase?.amountDue > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700"><strong>Note:</strong> This purchase has an amount due of {formatCurrency(purchase.amountDue)}. Marking as completed will consider it fully paid.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatePurchaseStatus;
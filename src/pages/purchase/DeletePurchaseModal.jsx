// src/pages/purchase/DeletePurchaseModal.jsx
import React, { useState } from 'react';
import { AlertCircle, Trash2, X, Loader } from 'lucide-react';
import BASE_URL from '../../config/Config';

const DeletePurchaseModal = ({ isOpen, onClose, purchase, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forceDelete, setForceDelete] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const url = forceDelete 
        ? `${BASE_URL}/purchases/${purchase._id}?force=true`
        : `${BASE_URL}/purchases/${purchase._id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      if (response.ok && data.success) {
        onSuccess(data.message);
        onClose();
      } else {
        if (data.message?.includes('payments')) {
          setError('This purchase has payments. Check "Force Delete" to delete it anyway.');
        } else {
          setError(data.message || 'Failed to delete purchase');
        }
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Delete Purchase</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <p className="text-gray-700">Are you sure you want to delete this purchase?</p>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm"><strong>Receipt:</strong> {purchase?.receiptNumber}</p>
              <p className="text-sm"><strong>Farmer:</strong> {purchase?.farmer?.name}</p>
              <p className="text-sm"><strong>Amount:</strong> {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(purchase?.finalPayable || 0)}</p>
              <p className="text-sm"><strong>Status:</strong> {purchase?.status}</p>
            </div>
          </div>

          {purchase?.amountPaid > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={forceDelete} onChange={(e) => setForceDelete(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-yellow-800">Force Delete (This purchase has payments that will also be deleted)</span>
              </label>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePurchaseModal;
// src/pages/payment/UpdateChequeStatus.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, CreditCard, AlertCircle, CheckCircle, XCircle, Loader, Calendar, DollarSign } from 'lucide-react';
import BASE_URL from '../../config/Config';

const UpdateChequeStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [chequeStatus, setChequeStatus] = useState('');

  const getToken = () => localStorage.getItem('token');

  const fetchPaymentDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/payments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setPayment(data.data);
        setChequeStatus(data.data.chequeStatus || 'pending');
      } else {
        setError(data.message || 'Failed to fetch payment details');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPaymentDetails(); }, [id]);

  const handleSubmit = async () => {
    setUpdating(true);
    setError('');

    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/payments/${id}/cheque-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: chequeStatus })
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/payments'), 2000);
      } else {
        setError(data.message || 'Failed to update cheque status');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

  if (loading) return <div className="flex items-center justify-center h-96"><Loader className="w-8 h-8 animate-spin text-green-700" /><span className="ml-2">Loading...</span></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3"><button onClick={() => navigate('/payments')} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-green-700" /></button><div><h1 className="text-2xl font-bold text-green-900">Update Cheque Status</h1><p className="text-sm text-gray-500">Update cheque clearing status</p></div></div>
        <div className="flex gap-2"><button onClick={() => navigate('/payments')} className="px-4 py-2 rounded-lg border text-gray-600">Cancel</button><button onClick={handleSubmit} disabled={updating} className="px-4 py-2 rounded-lg bg-green-700 text-white flex items-center gap-2">{updating ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Update Status</button></div>
      </div>

      {success && <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className="text-sm text-green-700">Cheque status updated successfully! Redirecting...</span></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-500" /><span className="text-sm text-red-600">{error}</span></div>}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-green-50"><h2 className="text-lg font-semibold text-green-800">Payment Details</h2></div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-500">Farmer Name</p><p className="font-semibold text-green-800">{payment?.farmer?.name || payment?.farmerId?.name || 'N/A'}</p></div>
          <div><p className="text-xs text-gray-500">Amount</p><p className="font-bold text-orange-600">{formatCurrency(payment?.amount)}</p></div>
          <div><p className="text-xs text-gray-500">Cheque Number</p><p className="font-mono">{payment?.chequeNumber || 'N/A'}</p></div>
          <div><p className="text-xs text-gray-500">Cheque Date</p><p>{formatDate(payment?.chequeDate)}</p></div>
          <div className="col-span-2"><p className="text-xs text-gray-500">Bank Name</p><p>{payment?.bankName || 'N/A'}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-green-700" /><h2 className="text-lg font-semibold text-green-800">Update Cheque Status</h2></div></div>
        <div className="p-6">
          <div className="flex gap-4 mb-4">
            <button onClick={() => setChequeStatus('cleared')} className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 ${chequeStatus === 'cleared' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}><CheckCircle className={`w-5 h-5 ${chequeStatus === 'cleared' ? 'text-green-500' : 'text-gray-400'}`} /><span className={chequeStatus === 'cleared' ? 'text-green-700 font-medium' : 'text-gray-600'}>Cleared</span></button>
            <button onClick={() => setChequeStatus('bounced')} className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 ${chequeStatus === 'bounced' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}><XCircle className={`w-5 h-5 ${chequeStatus === 'bounced' ? 'text-red-500' : 'text-gray-400'}`} /><span className={chequeStatus === 'bounced' ? 'text-red-700 font-medium' : 'text-gray-600'}>Bounced</span></button>
          </div>
          <div className="p-4 rounded-lg bg-orange-50 border border-orange-200"><p className="text-sm text-orange-800"><strong>Note:</strong> Updating to "Cleared" marks payment as completed. Updating to "Bounced" reverses the payment.</p></div>
        </div>
      </div>
    </div>
  );
};

export default UpdateChequeStatus;
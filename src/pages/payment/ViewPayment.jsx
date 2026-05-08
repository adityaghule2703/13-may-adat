// src/pages/payment/ViewPayment.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Edit2, User, Calendar, DollarSign, CreditCard, CheckCircle, XCircle, AlertCircle, Loader, Phone, FileText, Hash, Building, Landmark, Clock, Wallet, TrendingUp, Banknote } from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      if (data.success) setPayment(data.data);
      else setError(data.message || 'Failed to fetch payment details');
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPaymentDetails(); }, [id]);

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

  const getPaymentModeDetails = (mode) => {
    const modes = { cash: { icon: Wallet, color: '#2E7D32', bg: '#E8F5E9', label: 'Cash' }, upi: { icon: TrendingUp, color: '#1976D2', bg: '#E3F2FD', label: 'UPI' }, bank: { icon: Building, color: '#F57C00', bg: '#FFF3E0', label: 'Bank Transfer' }, cheque: { icon: CreditCard, color: '#7B1FA2', bg: '#F3E5F5', label: 'Cheque' } };
    return modes[mode] || { icon: Banknote, color: '#8D6E63', bg: '#FAFAFA', label: 'Other' };
  };

  const getChequeStatusDetails = (status) => {
    switch(status) {
      case 'cleared': return { icon: CheckCircle, color: '#2E7D32', bg: '#E8F5E9', label: 'Cleared' };
      case 'bounced': return { icon: XCircle, color: '#D32F2F', bg: '#FFEBEE', label: 'Bounced' };
      default: return { icon: Clock, color: '#FF6F00', bg: '#FFF3E0', label: 'Pending Clearance' };
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader className="w-8 h-8 animate-spin text-green-700" /><span className="ml-2">Loading payment details...</span></div>;
  if (error || !payment) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" /><p className="text-red-600">{error || 'Payment not found'}</p><button onClick={() => navigate('/payments')} className="mt-4 px-4 py-2 rounded-lg bg-green-700 text-white">Back to Payments</button></div>;

  const modeDetails = getPaymentModeDetails(payment.paymentMode);
  const ModeIcon = modeDetails.icon;
  const chequeDetails = payment.paymentMode === 'cheque' ? getChequeStatusDetails(payment.chequeStatus) : null;
  const ChequeIcon = chequeDetails?.icon;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3"><button onClick={() => navigate('/payments')} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-green-700" /></button><div><h1 className="text-2xl font-bold text-green-900">Payment Details</h1><p className="text-sm text-gray-500">Payment ID: {payment.receiptNumber || payment._id}</p></div></div>
        <div className="flex gap-2"><button className="px-4 py-2 rounded-lg border flex items-center gap-2"><Printer className="w-4 h-4" />Print</button><button className="px-4 py-2 rounded-lg border flex items-center gap-2"><Download className="w-4 h-4" />Download</button>{payment.paymentMode === 'cheque' && payment.chequeStatus !== 'cleared' && <button onClick={() => navigate(`/payments/update-cheque/${payment._id}`)} className="px-4 py-2 rounded-lg bg-green-700 text-white flex items-center gap-2"><Edit2 className="w-4 h-4" />Update Cheque Status</button>}</div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"><div className="flex justify-between"><div><p className="text-sm text-gray-600">Payment Status</p><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-lg font-semibold text-green-700">Completed</span></div></div><div className="text-right"><p className="text-sm text-gray-600">Payment Amount</p><p className="text-3xl font-bold text-green-800">{formatCurrency(payment.amount)}</p></div></div></div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden"><div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><User className="w-5 h-5 text-green-700" /><h2 className="text-lg font-semibold text-green-800">Farmer Information</h2></div></div><div className="p-6 grid grid-cols-2 gap-4"><div><p className="text-xs text-gray-500">Farmer Name</p><p className="text-lg font-semibold text-green-800">{payment.farmer?.name || payment.farmerId?.name || 'N/A'}</p></div><div><p className="text-xs text-gray-500">Mobile Number</p><p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{payment.farmer?.mobile || payment.farmerId?.mobile || 'N/A'}</p></div><div className="col-span-2"><p className="text-xs text-gray-500">Address</p><p>{payment.farmer?.address || payment.farmerId?.address || 'N/A'}</p></div></div></div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden"><div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-green-700" /><h2 className="text-lg font-semibold text-green-800">Payment Information</h2></div></div><div className="p-6 grid grid-cols-2 gap-4"><div><p className="text-xs text-gray-500">Payment Date</p><p className="font-semibold">{formatDate(payment.paymentDate)}</p></div><div><p className="text-xs text-gray-500">Payment Mode</p><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ background: modeDetails.bg, color: modeDetails.color }}><ModeIcon className="w-4 h-4" />{modeDetails.label}</span></div><div><p className="text-xs text-gray-500">Purchase Reference</p><p>{payment.purchase?.receiptNumber || payment.purchaseId?.receiptNumber || 'N/A'}</p></div><div><p className="text-xs text-gray-500">Receipt Number</p><p className="font-mono">{payment.receiptNumber || `PAY-${payment._id?.slice(-6)}`}</p></div></div></div>

      {(payment.paymentMode === 'upi' || payment.paymentMode === 'bank') && (<div className="bg-white rounded-xl shadow-sm overflow-hidden"><div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><Hash className="w-5 h-5 text-green-700" /><h2 className="text-lg font-semibold text-green-800">Transaction Details</h2></div></div><div className="p-6"><p className="text-xs text-gray-500">Reference Number</p><p className="font-mono">{payment.referenceNumber || payment.transactionId || 'N/A'}</p></div></div>)}

      {payment.paymentMode === 'cheque' && (<div className="bg-white rounded-xl shadow-sm overflow-hidden"><div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><FileText className="w-5 h-5 text-green-700" /><h2 className="text-lg font-semibold text-green-800">Cheque Details</h2></div></div><div className="p-6 grid grid-cols-2 gap-4"><div><p className="text-xs text-gray-500">Cheque Number</p><p className="font-mono font-semibold">{payment.chequeNumber || 'N/A'}</p></div><div><p className="text-xs text-gray-500">Cheque Date</p><p>{formatDate(payment.chequeDate)}</p></div><div><p className="text-xs text-gray-500">Bank Name</p><p>{payment.bankName || 'N/A'}</p></div><div><p className="text-xs text-gray-500">Cheque Status</p>{chequeDetails && <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ background: chequeDetails.bg, color: chequeDetails.color }}><ChequeIcon className="w-4 h-4" />{chequeDetails.label}</span>}</div></div></div>)}

      {payment.notes && (<div className="bg-white rounded-xl shadow-sm overflow-hidden"><div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><FileText className="w-5 h-5 text-green-700" /><h2 className="text-lg font-semibold text-green-800">Additional Notes</h2></div></div><div className="p-6"><p className="text-sm text-gray-700">{payment.notes}</p></div></div>)}
    </div>
  );
};

export default ViewPayment;
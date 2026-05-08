// src/pages/expenses/ViewExpense.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Printer, Download, Calendar, 
  DollarSign, FileText, Loader, AlertCircle, 
  CheckCircle, XCircle, Clock, Wallet, Truck, 
  Briefcase, Landmark, Warehouse, Building, 
  Wrench, Banknote, Megaphone,
  Check, X, Ban
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reason, setReason] = useState('');

  const getToken = () => localStorage.getItem('token');

  const fetchExpenseDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/expenses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) setExpense(data.data);
      else setError(data.message || 'Failed to fetch expense details');
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenseDetails(); }, [id]);

  const handleApprove = async () => {
    setUpdating(true);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/expenses/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        fetchExpenseDetails();
      } else {
        setError(data.message || 'Failed to approve expense');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!reason) {
      setError('Please provide a reason for rejection');
      return;
    }
    setUpdating(true);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/expenses/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setShowRejectModal(false);
        setReason('');
        fetchExpenseDetails();
      } else {
        setError(data.message || 'Failed to reject expense');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!reason) {
      setError('Please provide a reason for cancellation');
      return;
    }
    setUpdating(true);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/expenses/${id}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setShowCancelModal(false);
        setReason('');
        fetchExpenseDetails();
      } else {
        setError(data.message || 'Failed to cancel expense');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A';
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

  const categoryOptions = {
    transport_logistics: { label: 'Transport & Logistics', icon: Truck },
    labour_wages: { label: 'Labour & Wages', icon: Briefcase },
    market_fees: { label: 'Market Fees', icon: Landmark },
    storage_cold_chain: { label: 'Storage & Cold Chain', icon: Warehouse },
    shop_office: { label: 'Shop & Office', icon: Building },
    repairs_maintenance: { label: 'Repairs & Maintenance', icon: Wrench },
    banking_finance: { label: 'Banking & Finance', icon: Banknote },
    marketing_misc: { label: 'Marketing & Miscellaneous', icon: Megaphone }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return { bg: '#E8F5E9', color: '#2E7D32', label: 'Approved', icon: CheckCircle };
      case 'auto_approved': return { bg: '#C8E6C9', color: '#1B5E20', label: 'Auto Approved', icon: CheckCircle };
      case 'pending': return { bg: '#FFF3E0', color: '#FF6F00', label: 'Pending', icon: Clock };
      case 'rejected': return { bg: '#FFEBEE', color: '#D32F2F', label: 'Rejected', icon: XCircle };
      case 'cancelled': return { bg: '#FAFAFA', color: '#8D6E63', label: 'Cancelled', icon: Ban };
      default: return { bg: '#E3F2FD', color: '#1976D2', label: status || 'Unknown', icon: AlertCircle };
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-green-700" /></div>;
  if (error || !expense) return <div className="bg-red-50 p-6 text-center rounded-xl"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" /><p className="text-red-600">{error || 'Expense not found'}</p><button onClick={() => navigate('/expenses')} className="mt-4 px-4 py-2 rounded-lg bg-green-700 text-white">Back to Expenses</button></div>;

  const status = getStatusBadge(expense.approvalStatus);
  const StatusIcon = status.icon;
  const categoryInfo = categoryOptions[expense.category] || { label: expense.category?.replace(/_/g, ' ') || 'Other', icon: Wallet };
  const CategoryIcon = categoryInfo.icon;
  const canApprove = expense.approvalStatus === 'pending';
  const canReject = expense.approvalStatus === 'pending';
  const canCancel = ['pending', 'approved', 'auto_approved'].includes(expense.approvalStatus);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/expenses')} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-green-700" /></button>
          <div><h1 className="text-2xl font-bold text-green-900">Expense Details</h1><p className="text-sm text-gray-500">ID: {expense._id?.slice(-8)}</p></div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border flex items-center gap-2"><Printer className="w-4 h-4" /> Print</button>
          <button className="px-4 py-2 rounded-lg border flex items-center gap-2"><Download className="w-4 h-4" /> Download</button>
        </div>
      </div>

      <div className={`rounded-xl p-4 flex items-center justify-between border`} style={{ background: status.bg, borderColor: status.color }}>
        <div className="flex items-center gap-3"><StatusIcon className="w-6 h-6" style={{ color: status.color }} /><div><p className="font-semibold" style={{ color: status.color }}>Status: {status.label}</p>{expense.approvedBy && <p className="text-xs">Approved by: {expense.approvedBy?.name || 'System'}</p>}</div></div>
        <div className="text-right"><p className="text-xs text-gray-500">Amount</p><p className="text-2xl font-bold" style={{ color: '#FF6F00' }}>{formatCurrency(expense.amount)}</p></div>
      </div>

      {canApprove && (
        <div className="flex gap-3 justify-end">
          <button onClick={handleApprove} disabled={updating} className="px-4 py-2 rounded-lg bg-green-600 text-white flex items-center gap-2"><Check className="w-4 h-4" /> Approve</button>
          <button onClick={() => setShowRejectModal(true)} disabled={updating} className="px-4 py-2 rounded-lg bg-red-600 text-white flex items-center gap-2"><X className="w-4 h-4" /> Reject</button>
          <button onClick={() => setShowCancelModal(true)} disabled={updating} className="px-4 py-2 rounded-lg bg-gray-600 text-white flex items-center gap-2"><Ban className="w-4 h-4" /> Cancel</button>
        </div>
      )}

      {!canApprove && canCancel && (
        <div className="flex justify-end"><button onClick={() => setShowCancelModal(true)} className="px-4 py-2 rounded-lg bg-gray-600 text-white flex items-center gap-2"><Ban className="w-4 h-4" /> Cancel Expense</button></div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><Wallet className="w-5 h-5 text-green-700" /><h2 className="font-semibold text-green-800">Expense Information</h2></div></div>
          <div className="p-6 space-y-4">
            <div><p className="text-xs text-gray-500">Category</p><div className="flex items-center gap-2"><CategoryIcon className="w-4 h-4 text-green-600" /><span className="font-medium">{categoryInfo.label}</span></div></div>
            <div><p className="text-xs text-gray-500">Description</p><p className="text-gray-700">{expense.description}</p></div>
            <div><p className="text-xs text-gray-500">Expense Date</p><p>{formatDate(expense.expenseDate)}</p></div>
            <div><p className="text-xs text-gray-500">Amount</p><p className="text-2xl font-bold text-orange-600">{formatCurrency(expense.amount)}</p></div>
            {expense.paidTo && <div><p className="text-xs text-gray-500">Paid To</p><p>{expense.paidTo}</p></div>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><Banknote className="w-5 h-5 text-green-700" /><h2 className="font-semibold text-green-800">Payment Details</h2></div></div>
          <div className="p-6 space-y-4">
            <div><p className="text-xs text-gray-500">Payment Method</p><p className="capitalize">{expense.paidBy}</p></div>
            {expense.referenceNumber && <div><p className="text-xs text-gray-500">Reference Number</p><p className="font-mono">{expense.referenceNumber}</p></div>}
            <div><p className="text-xs text-gray-500">Created By</p><p>{expense.createdBy?.name} <span className="text-xs text-gray-500">({expense.createdBy?.email})</span></p></div>
            <div><p className="text-xs text-gray-500">Created At</p><p>{formatDate(expense.createdAt)}</p></div>
            {expense.approvedAt && <div><p className="text-xs text-gray-500">Approved At</p><p>{formatDate(expense.approvedAt)}</p></div>}
          </div>
        </div>
      </div>

      {(expense.rejectionReason || expense.cancelReason) && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-green-700" /><h2 className="font-semibold text-green-800">Remarks</h2></div></div>
          <div className="p-6"><p className="text-gray-700">{expense.rejectionReason || expense.cancelReason}</p></div>
        </div>
      )}

      {expense.notes && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><FileText className="w-5 h-5 text-green-700" /><h2 className="font-semibold text-green-800">Additional Notes</h2></div></div>
          <div className="p-6"><p className="text-gray-700">{expense.notes}</p></div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Reject Expense</h2>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for rejection..." rows="3" className="w-full px-3 py-2 border rounded-lg mb-4" />
            <div className="flex gap-3"><button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleReject} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">Confirm Reject</button></div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Cancel Expense</h2>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for cancellation..." rows="3" className="w-full px-3 py-2 border rounded-lg mb-4" />
            <div className="flex gap-3"><button onClick={() => setShowCancelModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={handleCancel} className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg">Confirm Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewExpense;
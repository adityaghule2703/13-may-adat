// src/pages/purchase/ViewPurchase.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Printer, Download, Edit2, 
  User, Calendar, Package, DollarSign, 
  Truck, Briefcase, TrendingUp, Landmark,
  FileText, CheckCircle, XCircle, AlertCircle,
  Loader, Phone, Receipt, Clock, Plus
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewPurchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchPurchaseDetails = async () => {
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
      if (data.success) setPurchase(data.data);
      else setError(data.message || 'Failed to fetch purchase details');
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPurchaseDetails(); }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'saved': return { bg: '#FFF3E0', color: '#FF6F00', label: 'Saved', icon: FileText };
      case 'partial': return { bg: '#E3F2FD', color: '#1976D2', label: 'Partial Payment', icon: TrendingUp };
      case 'completed': return { bg: '#E8F5E9', color: '#2E7D32', label: 'Completed', icon: CheckCircle };
      case 'cancelled': return { bg: '#FFEBEE', color: '#D32F2F', label: 'Cancelled', icon: XCircle };
      default: return { bg: '#E3F2FD', color: '#1976D2', label: status || 'Unknown', icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading purchase details...</span>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error || 'Purchase not found'}</p>
        <button onClick={() => navigate('/purchases')} className="mt-4 px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#2E7D32' }}>Back to Purchases</button>
      </div>
    );
  }

  const statusBadge = getStatusBadge(purchase.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/purchases')} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} /></button>
          <div><h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Purchase Details</h1><p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Receipt: {purchase.receiptNumber}</p></div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}><Printer className="w-4 h-4" /> Print</button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}><Download className="w-4 h-4" /> Download</button>
          {purchase.status === 'saved' && (<button onClick={() => navigate(`/purchases/edit/${purchase._id}`)} className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}><Edit2 className="w-4 h-4" /> Edit Purchase</button>)}
        </div>
      </div>

      <div className={`rounded-xl p-4 flex items-center justify-between border`} style={{ background: statusBadge.bg, borderColor: statusBadge.color }}>
        <div className="flex items-center gap-3"><StatusIcon className="w-6 h-6" style={{ color: statusBadge.color }} /><div><p className="text-sm font-semibold" style={{ color: statusBadge.color }}>Status: {statusBadge.label}</p><p className="text-xs" style={{ color: statusBadge.color }}>Created by: {purchase.createdBy?.name || 'System'} on {formatDate(purchase.createdAt)}</p></div></div>
        {purchase.amountDue > 0 && (<div className="text-right"><p className="text-xs text-gray-600">Amount Due</p><p className="text-xl font-bold text-red-600">{formatCurrency(purchase.amountDue)}</p></div>)}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}><div className="flex items-center gap-2"><User className="w-5 h-5" style={{ color: '#2E7D32' }} /><h2 className="text-lg font-semibold" style={{ color: '#1B5E20' }}>Farmer Information</h2></div></div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><p className="text-xs text-gray-500 mb-1">Farmer Name</p><p className="text-lg font-semibold" style={{ color: '#2E7D32' }}>{purchase.farmer?.name || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Mobile Number</p><p className="text-lg flex items-center gap-2"><Phone className="w-4 h-4" style={{ color: '#8D6E63' }} />{purchase.farmer?.mobile || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Address</p><p className="text-sm">{purchase.farmer?.address || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">GST Number</p><p className="text-sm">{purchase.farmer?.gstNumber || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Bank Details</p><p className="text-sm">{purchase.farmer?.bankName ? `${purchase.farmer.bankName} - ` : ''}{purchase.farmer?.bankAccountNumber ? `****${purchase.farmer.bankAccountNumber.slice(-4)}` : 'N/A'}</p>{purchase.farmer?.ifscCode && <p className="text-xs text-gray-500">IFSC: {purchase.farmer.ifscCode}</p>}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}><div className="flex items-center gap-2"><Receipt className="w-5 h-5" style={{ color: '#2E7D32' }} /><h2 className="text-lg font-semibold" style={{ color: '#1B5E20' }}>Purchase Information</h2></div></div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><p className="text-xs text-gray-500 mb-1">Receipt Number</p><p className="text-lg font-semibold text-green-800">{purchase.receiptNumber || 'N/A'}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Purchase Date</p><p className="text-lg font-semibold">{formatDate(purchase.purchaseDate)}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Created On</p><p className="text-sm">{formatDate(purchase.createdAt)}</p></div>
          </div>
          {purchase.notes && (<div className="mt-4 p-4 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 mb-1">Additional Notes</p><p className="text-sm">{purchase.notes}</p></div>)}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}><div className="flex items-center gap-2"><Package className="w-5 h-5" style={{ color: '#2E7D32' }} /><h2 className="text-lg font-semibold" style={{ color: '#1B5E20' }}>Products Purchased</h2></div></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E8F5E9' }}><th className="px-6 py-3 text-left text-xs font-semibold uppercase">Product</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase">Bags × Weight</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase">Actual Qty</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase">Quality Deduction</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase">Billed Qty</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase">Rate</th><th className="px-6 py-3 text-right text-xs font-semibold uppercase">Total</th></tr></thead>
            <tbody>
              {purchase.lines?.map((line, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="px-6 py-4"><div><p className="font-medium text-green-800">{line.productName}</p>{line.notes && <p className="text-xs text-gray-500 mt-1">{line.notes}</p>}</div></td>
                  <td className="px-6 py-4">{line.bags && line.weightPerBag ? `${formatNumber(line.bags)} bags × ${formatNumber(line.weightPerBag)} kg` : '-'}</td>
                  <td className="px-6 py-4">{formatNumber(line.actualQty)} {line.unit || 'kg'}</td>
                  <td className="px-6 py-4">{line.qualityDeduction > 0 ? `${formatNumber(line.qualityDeduction)} kg` : '-'}</td>
                  <td className="px-6 py-4 font-semibold">{formatNumber(line.billedQty)} {line.unit || 'kg'}</td>
                  <td className="px-6 py-4">{formatCurrency(line.rate)}/{line.unit || 'kg'}</td>
                  <td className="px-6 py-4 text-right font-semibold text-green-800">{formatCurrency(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr style={{ background: '#F1F8E9' }}><td colSpan="6" className="px-6 py-4 text-right font-semibold">Gross Total:</td><td className="px-6 py-4 text-right font-bold text-green-800">{formatCurrency(purchase.grossTotal)}</td></tr></tfoot>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ background: '#FFF3E0', borderColor: '#FFE0B2' }}><div className="flex items-center gap-2"><DollarSign className="w-5 h-5" style={{ color: '#FF6F00' }} /><h2 className="text-lg font-semibold" style={{ color: '#E65100' }}>Deductions & Charges</h2></div></div>
          <div className="p-6">
            <div className="space-y-3">
              {purchase.deductions?.transport > 0 && <div className="flex justify-between py-2 border-b border-gray-100"><div className="flex items-center gap-2"><Truck className="w-4 h-4 text-gray-400" /><span>Transport</span></div><span className="text-red-600">{formatCurrency(purchase.deductions.transport)}</span></div>}
              {purchase.deductions?.labour > 0 && <div className="flex justify-between py-2 border-b border-gray-100"><div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-400" /><span>Labour</span></div><span className="text-red-600">{formatCurrency(purchase.deductions.labour)}</span></div>}
              {purchase.deductions?.commission > 0 && <div className="flex justify-between py-2 border-b border-gray-100"><div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gray-400" /><span>Commission ({purchase.deductions.commissionType})</span></div><span className="text-red-600">{formatCurrency(purchase.deductions.commission)}</span></div>}
              {purchase.deductions?.storage > 0 && <div className="flex justify-between py-2 border-b border-gray-100"><div className="flex items-center gap-2"><Landmark className="w-4 h-4 text-gray-400" /><span>Storage {purchase.deductions.storageNote && `(${purchase.deductions.storageNote})`}</span></div><span className="text-red-600">{formatCurrency(purchase.deductions.storage)}</span></div>}
              {purchase.deductions?.returnDeduction > 0 && <div className="flex justify-between py-2 border-b border-gray-100"><div className="flex items-center gap-2"><Package className="w-4 h-4 text-gray-400" /><span>Return {purchase.deductions.returnNote && `(${purchase.deductions.returnNote})`}</span></div><span className="text-red-600">{formatCurrency(purchase.deductions.returnDeduction)}</span></div>}
              {purchase.deductions?.advanceAdjusted > 0 && <div className="flex justify-between py-2 border-b border-gray-100"><div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-gray-400" /><span>Advance Adjusted</span></div><span className="text-red-600">{formatCurrency(purchase.deductions.advanceAdjusted)}</span></div>}
              {purchase.deductions?.other > 0 && <div className="flex justify-between py-2 border-b border-gray-100"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /><span>Other {purchase.deductions.otherNote && `(${purchase.deductions.otherNote})`}</span></div><span className="text-red-600">{formatCurrency(purchase.deductions.other)}</span></div>}
              <div className="flex justify-between py-3 mt-2 border-t-2 border-gray-200"><span className="font-semibold">Total Deductions</span><span className="font-bold text-red-600">- {formatCurrency(purchase.totalDeductions)}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm overflow-hidden border border-green-200">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#1B5E20' }}>Payment Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-green-200"><span className="text-gray-700">Gross Total</span><span className="font-semibold">{formatCurrency(purchase.grossTotal)}</span></div>
              <div className="flex justify-between py-3 border-b border-green-200"><span className="text-gray-700">Total Deductions</span><span className="font-semibold text-red-600">- {formatCurrency(purchase.totalDeductions)}</span></div>
              <div className="flex justify-between py-3 border-b border-green-200"><span className="text-gray-700">Final Payable</span><span className="font-semibold text-green-800">{formatCurrency(purchase.finalPayable)}</span></div>
              <div className="flex justify-between py-3 border-b border-green-200"><span className="text-gray-700">Amount Paid</span><span className="font-semibold text-green-600">{formatCurrency(purchase.amountPaid)}</span></div>
              <div className="flex justify-between py-4 bg-white rounded-lg px-4 -mx-4 mt-2"><span className="text-lg font-bold" style={{ color: '#1B5E20' }}>Amount Due</span><span className="text-2xl font-bold" style={{ color: purchase.amountDue > 0 ? '#FF6F00' : '#2E7D32' }}>{formatCurrency(purchase.amountDue)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {purchase.amountDue > 0 && (
        <div className="flex justify-end gap-3">
          <button onClick={() => navigate(`/payments/add?farmerId=${purchase.farmer?._id}&purchaseId=${purchase._id}`)} className="px-6 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #FF6F00, #FF8F00)' }}><DollarSign className="w-4 h-4" /> Record Payment</button>
        </div>
      )}
    </div>
  );
};

export default ViewPurchase;
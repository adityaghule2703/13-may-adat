// src/pages/salepayments/ViewSalePayment.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Printer, Download, Edit2, User,
  Calendar, DollarSign, CreditCard, CheckCircle, XCircle,
  AlertCircle, Loader, Phone, Hash, Building, Landmark,
  Clock, Wallet, TrendingUp, Banknote, FileText, Receipt,
  RefreshCw, UserCheck, IndianRupee
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewSalePayment = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchPaymentDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/sale-payments/${id}`, {
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
      } else {
        setError(data.message || 'Failed to fetch payment details');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPaymentDetails();
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getPaymentModeDetails = (mode) => {
    const modes = {
      cash: { icon: Wallet, color: '#2E7D32', bg: '#E8F5E9', label: 'Cash', border: '#C8E6C9' },
      upi: { icon: TrendingUp, color: '#1976D2', bg: '#E3F2FD', label: 'UPI', border: '#BBDEFB' },
      bank: { icon: Building, color: '#F57C00', bg: '#FFF3E0', label: 'Bank Transfer', border: '#FFE0B2' },
      cheque: { icon: CreditCard, color: '#7B1FA2', bg: '#F3E5F5', label: 'Cheque', border: '#E1BEE7' }
    };
    return modes[mode?.toLowerCase()] || { icon: Banknote, color: '#8D6E63', bg: '#FAFAFA', label: mode || 'Other', border: '#EEEEEE' };
  };

  const getChequeStatusDetails = (status) => {
    switch(status) {
      case 'cleared': return { icon: CheckCircle, color: '#2E7D32', bg: '#E8F5E9', label: 'Cleared' };
      case 'bounced': return { icon: XCircle, color: '#D32F2F', bg: '#FFEBEE', label: 'Bounced' };
      default: return { icon: Clock, color: '#FF6F00', bg: '#FFF3E0', label: 'Pending' };
    }
  };

  const getSaleStatusBadge = (summary) => {
    if (!summary) return null;
    if (summary.status === 'completed' || summary.amountDue === 0) {
      return { icon: CheckCircle, color: '#2E7D32', bg: '#E8F5E9', label: 'Fully Paid' };
    } else if (summary.amountDue > 0 && summary.amountReceived > 0) {
      return { icon: AlertCircle, color: '#E65100', bg: '#FFF3E0', label: 'Partial Payment' };
    }
    return { icon: Clock, color: '#1565C0', bg: '#E3F2FD', label: 'Pending' };
  };

  if (loading && !payment) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading payment details...</span>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error || 'Payment not found'}</p>
          <button 
            onClick={() => navigate('/sale-payments')} 
            className="mt-4 px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors"
          >
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

  const modeDetails = getPaymentModeDetails(payment.paymentMode);
  const ModeIcon = modeDetails.icon;
  const chequeDetails = payment.paymentMode === 'cheque' ? getChequeStatusDetails(payment.chequeStatus) : null;
  const ChequeIcon = chequeDetails?.icon;
  const saleStatus = getSaleStatusBadge(payment.saleSummary);
  const SaleStatusIcon = saleStatus?.icon;

  return (
    <div className=" mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sale-payments')}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-all"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>
              Sale Payment Details
            </h1>
            
          </div>
        </div>
       
      </div>

      {/* Payment Status Banner */}
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden"
        style={{ borderLeft: `4px solid ${modeDetails.color}` }}
      >
        <div className="p-5 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: modeDetails.bg }}
            >
              <ModeIcon className="w-6 h-6" style={{ color: modeDetails.color }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: modeDetails.color }}>Payment Mode</p>
              <p className="text-xl font-bold" style={{ color: '#1B5E20' }}>{modeDetails.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: '#8D6E63' }}>Payment Amount</p>
            <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>
              {formatCurrency(payment.amount)}
            </p>
          </div>
        </div>
      </div>

      {/* Sale Information Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5" style={{ color: '#2E7D32' }} />
            <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>Sale Information</h3>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Invoice Number</p>
              <p className="text-base font-semibold mt-1" style={{ color: '#2E7D32' }}>
                {payment.sale?.invoiceNumber || payment.saleSummary?.invoiceNumber || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Sale Date</p>
              <p className="text-base mt-1" style={{ color: '#1B5E20' }}>
                <Calendar className="w-3.5 h-3.5 inline mr-1" style={{ color: '#A5D6A7' }} />
                {formatDate(payment.sale?.saleDate)}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Final Receivable</p>
              <p className="text-base font-semibold mt-1" style={{ color: '#FF6F00' }}>
                {formatCurrency(payment.sale?.finalReceivable || payment.saleSummary?.finalReceivable || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Sale Status</p>
              <div className="mt-1">
                {saleStatus && (
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border"
                    style={{ background: saleStatus.bg, color: saleStatus.color, borderColor: modeDetails.border }}
                  >
                    <SaleStatusIcon className="w-4 h-4" />
                    {saleStatus.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buyer Information Card */}
      {payment.buyer && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: '#2E7D32' }} />
              <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>Buyer Information</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-6 items-start">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#E8F5E9' }}
              >
                <User className="w-7 h-7" style={{ color: '#2E7D32' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold" style={{ color: '#1B5E20' }}>
                  {payment.buyer?.displayName || payment.buyer?.name || 'N/A'}
                </h2>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" style={{ color: '#8D6E63' }} />
                    <span className="text-sm" style={{ color: '#5D4037' }}>
                      {payment.buyer?.mobile || 'N/A'}
                    </span>
                  </div>
                  {payment.buyer?.businessName && (
                    <div className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" style={{ color: '#8D6E63' }} />
                      <span className="text-sm" style={{ color: '#5D4037' }}>
                        {payment.buyer.businessName}
                      </span>
                    </div>
                  )}
                </div>
                {payment.buyer?.email && (
                  <p className="text-sm mt-2" style={{ color: '#8D6E63' }}>
                    {payment.buyer.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Information Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" style={{ color: '#2E7D32' }} />
            <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>Payment Information</h3>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Payment Date</p>
              <p className="text-base font-semibold mt-1" style={{ color: '#1B5E20' }}>
                <Calendar className="w-3.5 h-3.5 inline mr-1" style={{ color: '#A5D6A7' }} />
                {formatDate(payment.paymentDate)}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Payment Mode</p>
              <div className="mt-1">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border"
                  style={{ background: modeDetails.bg, color: modeDetails.color, borderColor: modeDetails.border }}
                >
                  <ModeIcon className="w-4 h-4" />
                  {modeDetails.label}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Created By</p>
              <p className="text-sm font-medium mt-1" style={{ color: '#1B5E20' }}>
                <UserCheck className="w-3.5 h-3.5 inline mr-1" style={{ color: '#8D6E63' }} />
                {payment.createdBy?.name || 'N/A'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#A5D6A7' }}>
                {formatDateTime(payment.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction / Cheque Details Card */}
      {(payment.paymentMode === 'upi' || payment.paymentMode === 'bank') && payment.referenceNumber && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5" style={{ color: '#2E7D32' }} />
              <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>Transaction Details</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>Reference Number</p>
                <p className="text-sm font-mono mt-1 break-all" style={{ color: '#5D4037' }}>
                  {payment.referenceNumber}
                </p>
              </div>
              {payment.bankName && (
                <div>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>Bank Name</p>
                  <p className="text-base mt-1" style={{ color: '#1B5E20' }}>
                    <Landmark className="w-3.5 h-3.5 inline mr-1" style={{ color: '#A5D6A7' }} />
                    {payment.bankName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {payment.paymentMode === 'cheque' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: '#2E7D32' }} />
              <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>Cheque Details</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>Cheque Number</p>
                <p className="text-base font-mono font-semibold mt-1" style={{ color: '#1B5E20' }}>
                  {payment.chequeNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>Cheque Date</p>
                <p className="text-base mt-1" style={{ color: '#1B5E20' }}>
                  {formatDate(payment.chequeDate)}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>Bank Name</p>
                <p className="text-base mt-1" style={{ color: '#1B5E20' }}>
                  <Landmark className="w-3.5 h-3.5 inline mr-1" style={{ color: '#A5D6A7' }} />
                  {payment.bankName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>Cheque Status</p>
                <div className="mt-1">
                  {chequeDetails && (
                    <span
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border"
                      style={{ background: chequeDetails.bg, color: chequeDetails.color, borderColor: modeDetails.border }}
                    >
                      <ChequeIcon className="w-4 h-4" />
                      {chequeDetails.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Summary Card */}
      {payment.saleSummary && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5" style={{ color: '#2E7D32' }} />
              <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>Payment Summary</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg" style={{ background: '#E8F5E9' }}>
                <p className="text-xs" style={{ color: '#1B5E20' }}>Final Receivable</p>
                <p className="text-lg font-bold" style={{ color: '#2E7D32' }}>
                  {formatCurrency(payment.saleSummary.finalReceivable)}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ background: '#E3F2FD' }}>
                <p className="text-xs" style={{ color: '#1565C0' }}>Amount Received</p>
                <p className="text-lg font-bold" style={{ color: '#1565C0' }}>
                  {formatCurrency(payment.saleSummary.amountReceived)}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ background: payment.saleSummary.amountDue > 0 ? '#FFF3E0' : '#E8F5E9' }}>
                <p className="text-xs" style={{ color: payment.saleSummary.amountDue > 0 ? '#E65100' : '#2E7D32' }}>
                  Amount Due
                </p>
                <p className="text-lg font-bold" style={{ color: payment.saleSummary.amountDue > 0 ? '#E65100' : '#2E7D32' }}>
                  {formatCurrency(payment.saleSummary.amountDue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Card */}
      {payment.notes && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: '#2E7D32' }} />
              <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>Additional Notes</h3>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-700 leading-relaxed">{payment.notes}</p>
          </div>
        </div>
      )}

      {/* Update Information */}
      {payment.updatedAt && payment.updatedAt !== payment.createdAt && (
        <div className="text-center text-xs" style={{ color: '#A5D6A7' }}>
          Last updated: {formatDateTime(payment.updatedAt)}
        </div>
      )}
    </div>
  );
};

export default ViewSalePayment;
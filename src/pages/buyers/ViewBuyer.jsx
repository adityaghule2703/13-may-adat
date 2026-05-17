// src/pages/buyers/ViewBuyer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Loader, AlertCircle, RefreshCw,
  User, Phone, Mail, MapPin, Building2, 
  CreditCard, Calendar, DollarSign, Wallet,
  Receipt, Package, Truck, TrendingUp,
  CheckCircle, XCircle, Edit, Printer, Download,
  ChevronLeft, ChevronRight, FileText, Clock,
  Eye
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewBuyer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const getToken = () => localStorage.getItem('token');

  const isAuthenticated = () => {
    const token = getToken();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!token || isLoggedIn !== 'true') {
      navigate('/login');
      return false;
    }
    return true;
  };

  const fetchBuyerDetails = useCallback(async () => {
    if (!isAuthenticated()) return;
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/buyers/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setBuyer(data.data);
        setPurchaseHistory(data.data.purchaseHistory || []);
        setPagination(prev => ({
          ...prev,
          total: (data.data.purchaseHistory || []).length,
          pages: Math.ceil((data.data.purchaseHistory || []).length / prev.limit)
        }));
      } else {
        setError(data.message || t('buyers.errors.fetchFailed'));
      }
    } catch (err) {
      console.error('Error fetching buyer:', err);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBuyerDetails();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBuyerDetails();
  }, [fetchBuyerDetails]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBusinessTypeLabel = (type) => {
    const types = {
      individual: t('buyers.businessTypes.individual'),
      company: t('buyers.businessTypes.company'),
      proprietorship: t('buyers.businessTypes.proprietorship'),
      partnership: t('buyers.businessTypes.partnership'),
      private_limited: t('buyers.businessTypes.privateLimited'),
      public_limited: t('buyers.businessTypes.publicLimited'),
      llp: t('buyers.businessTypes.llp'),
      trust: t('buyers.businessTypes.trust'),
      society: t('buyers.businessTypes.society')
    };
    return types[type] || type || 'N/A';
  };

  const getStatusColor = (isActive) =>
    isActive
      ? { bg: '#E8F5E9', text: '#2E7D32', label: t('buyers.status.active') }
      : { bg: '#FFEBEE', text: '#D32F2F', label: t('buyers.status.inactive') };

  const getPaymentModeLabel = (mode) => {
    const modes = {
      cash: t('payments.modes.cash'),
      bank_transfer: t('payments.modes.bank'),
      cheque: t('payments.modes.cheque'),
      credit: t('buyers.paymentModes.credit'),
      online: t('buyers.paymentModes.online')
    };
    return modes[mode] || mode || 'N/A';
  };

  const getPurchaseStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { bg: '#E8F5E9', text: '#2E7D32', label: t('purchases.status.completed'), icon: CheckCircle };
      case 'partial':
        return { bg: '#FFF3E0', text: '#E65100', label: t('purchases.status.partialPayment'), icon: Clock };
      case 'pending':
        return { bg: '#FFF8E1', text: '#F57C00', label: t('purchases.status.pending'), icon: AlertCircle };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', label: status || 'N/A', icon: FileText };
    }
  };

  // Pagination for purchase history
  const getPaginatedPurchases = () => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return purchaseHistory.slice(start, end);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
      </div>
    );
  }

  if (error || !buyer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/buyers')}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-all"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('buyers.title')}</h1>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error || t('buyers.errors.fetchFailed')}</span>
          <button onClick={fetchBuyerDetails} className="ml-auto text-sm text-red-600 hover:underline">
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  const statusColors = getStatusColor(buyer.isActive);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/buyers')}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-all"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>
              {buyer.displayName || buyer.name}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#8D6E63' }}>
              {t('buyers.subtitle')}
            </p>
          </div>
        </div>
        {/* <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
          <button
            onClick={() => navigate(`/buyers/edit/${buyer._id}`)}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)', color: 'white' }}
          >
            <Edit className="w-4 h-4" />
            {t('common.edit')}
          </button>
        </div> */}
      </div>

      {/* Buyer Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-6 py-4 border-b" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: '#2E7D32' }} />
              <h3 className="font-semibold" style={{ color: '#1B5E20' }}>{t('buyers.personalInfo')}</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('buyers.fullName')}</p>
                  <p className="text-sm" style={{ color: '#2E7D32' }}>{buyer.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: '#8D6E63' }}>
                    <Mail className="w-3 h-3" /> {t('buyers.email')}
                  </p>
                  <p className="text-sm" style={{ color: '#2E7D32' }}>{buyer.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: '#8D6E63' }}>
                    <Phone className="w-3 h-3" /> {t('buyers.mobileNumber')}
                  </p>
                  <p className="text-sm" style={{ color: '#2E7D32' }}>{buyer.mobile || '—'}</p>
                  {buyer.alternateMobile && (
                    <p className="text-xs mt-1" style={{ color: '#8D6E63' }}>{t('buyers.alternateMobile')}: {buyer.alternateMobile}</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: '#8D6E63' }}>
                    <MapPin className="w-3 h-3" /> {t('buyers.address')}
                  </p>
                  <p className="text-sm" style={{ color: '#2E7D32' }}>{buyer.fullAddress || buyer.address || '—'}</p>
                  {(buyer.city || buyer.state || buyer.pincode) && (
                    <p className="text-xs mt-1" style={{ color: '#8D6E63' }}>
                      {buyer.city && `${buyer.city}`}{buyer.city && buyer.state && ', '}{buyer.state && `${buyer.state}`}{buyer.pincode && ` - ${buyer.pincode}`}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('common.status')}</p>
                  <span
                    className="text-xs px-2 py-1 rounded-full inline-flex items-center gap-1"
                    style={{ background: statusColors.bg, color: statusColors.text }}
                  >
                    {buyer.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {statusColors.label}
                  </span>
                </div>
                
              </div>
            </div>
          </div>
        </div>

        {/* Business & Financial Summary */}
        <div className="space-y-4">
          {/* Business Info Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" style={{ color: '#2E7D32' }} />
                <h3 className="font-semibold" style={{ color: '#1B5E20' }}>{t('buyers.businessDetails')}</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('buyers.businessName')}</p>
                <p className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{buyer.businessName || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('buyers.businessType')}</p>
                <p className="text-sm" style={{ color: '#2E7D32' }}>{getBusinessTypeLabel(buyer.businessType)}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#8D6E63' }}>{t('buyers.gstNumber')} / {t('buyers.panNumber')}</p>
                <p className="text-sm" style={{ color: '#2E7D32' }}>
                  {buyer.gstNumber ? `GST: ${buyer.gstNumber}` : 'GST: —'}
                  {buyer.panNumber && <span className="block text-xs mt-1">PAN: {buyer.panNumber}</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" style={{ color: '#2E7D32' }} />
                <h3 className="font-semibold" style={{ color: '#1B5E20' }}>{t('buyers.creditTerms')}</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: '#E8F5E9' }}>
                <span className="text-xs" style={{ color: '#8D6E63' }}>{t('buyers.table.purchases')}</span>
                <span className="text-sm font-bold" style={{ color: '#2E7D32' }}>{buyer.totalPurchases || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: '#E8F5E9' }}>
                <span className="text-xs" style={{ color: '#8D6E63' }}>{t('buyers.table.purchaseValue')}</span>
                <span className="text-sm font-bold" style={{ color: '#FF6F00' }}>{formatCurrency(buyer.totalPurchaseValue)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: '#E8F5E9' }}>
                <span className="text-xs" style={{ color: '#8D6E63' }}>{t('buyers.creditLimit')}</span>
                <span className="text-sm font-bold" style={{ color: '#2E7D32' }}>{formatCurrency(buyer.creditLimit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: '#8D6E63' }}>{t('buyers.creditDays')}</span>
                <span className="text-sm font-bold" style={{ color: '#2E7D32' }}>{buyer.creditDays} {t('buyers.table.daysCredit')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t" style={{ borderColor: '#E8F5E9' }}>
                <span className="text-xs" style={{ color: '#8D6E63' }}>{t('buyers.defaultPaymentMode')}</span>
                <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{getPaymentModeLabel(buyer.defaultPaymentMode)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase History Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between flex-wrap gap-4" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5" style={{ color: '#2E7D32' }} />
            <h3 className="font-semibold" style={{ color: '#1B5E20' }}>{t('purchases.title')}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
              {purchaseHistory.length} {purchaseHistory.length === 1 ? t('purchases.title') : t('purchases.title')}
            </span>
          </div>
        </div>

        {purchaseHistory.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('purchases.noPurchasesFound')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#1B3A1F' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.table.receiptNo')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.purchaseDate')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.table.product')}</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.grossTotal')}</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.totalDeductions')}</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.finalPayable')}</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.amountDue')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('common.status')}</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedPurchases().map((purchase, index) => {
                    const statusConfig = getPurchaseStatusConfig(purchase.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr
                        key={purchase._id}
                        className="hover:bg-green-50 transition-colors"
                        style={{ borderBottom: index !== getPaginatedPurchases().length - 1 ? '1px solid #E8F5E9' : 'none' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>
                            {purchase.invoiceNumber || purchase.receiptNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" style={{ color: '#A5D6A7' }} />
                            <span className="text-sm" style={{ color: '#5D4037' }}>{formatDate(purchase.saleDate || purchase.purchaseDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {purchase.lines?.slice(0, 2).map((line, idx) => (
                              <p key={idx} className="text-xs" style={{ color: '#5D4037' }}>
                                {line.productName} - {line.bags || line.actualQty} {line.unit || (line.pricingType === 'kg' ? 'kg' : line.pricingType)}
                              </p>
                            ))}
                            {purchase.lines?.length > 2 && (
                              <p className="text-xs" style={{ color: '#8D6E63' }}>
                                +{purchase.lines.length - 2} {t('common.moreItems')}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm" style={{ color: '#2E7D32' }}>
                            {formatCurrency(purchase.grossTotal)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm" style={{ color: '#D32F2F' }}>
                            {formatCurrency(purchase.totalDeductions)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold" style={{ color: '#FF6F00' }}>
                            {formatCurrency(purchase.finalReceivable || purchase.finalPayable)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold" style={{ color: purchase.amountDue > 0 ? '#D32F2F' : '#2E7D32' }}>
                            {formatCurrency(purchase.amountDue)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className="text-xs px-2 py-1 rounded-full inline-flex items-center gap-1"
                            style={{ background: statusConfig.bg, color: statusConfig.text }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                <div className="text-xs" style={{ color: '#8D6E63' }}>
                  {t('purchases.pagination.showing', {
                    start: (pagination.page - 1) * pagination.limit + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total
                  })}
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-1.5 rounded border text-sm disabled:opacity-40 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm px-2" style={{ color: '#2E7D32' }}>
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-1.5 rounded border text-sm disabled:opacity-40 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Additional Info Section */}
      {buyer.notes && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: '#2E7D32' }} />
              <h3 className="font-semibold" style={{ color: '#1B5E20' }}>{t('buyers.notes')}</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm" style={{ color: '#5D4037' }}>{buyer.notes}</p>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default ViewBuyer;
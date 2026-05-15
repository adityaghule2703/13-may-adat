// src/pages/farmers/FarmerDues.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Loader, AlertCircle, RefreshCw,
  TrendingUp, TrendingDown, Wallet, User,
  Phone, Calendar, DollarSign, ChevronLeft, ChevronRight,
  FileText, ArrowUpCircle, ArrowDownCircle, Circle,
  Search, X, CheckCircle, XCircle, Clock, CreditCard
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const FarmerDues = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [farmerData, setFarmerData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [recentAdvanceTransactions, setRecentAdvanceTransactions] = useState([]);
  const [showAllAdvances, setShowAllAdvances] = useState(false);
  const [activeTab, setActiveTab] = useState('advances');

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

  const fetchDuesData = useCallback(async () => {
    if (!isAuthenticated()) return;
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/farmers/${id}/dues`, {
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
        const farmer = {
          name: data.data.farmer.name,
          mobile: data.data.farmer.mobile,
          totalPaid: data.data.farmer.totalPaid,
          pendingPurchaseDues: data.data.farmer.pendingPurchaseDues,
          advanceBalance: data.data.farmer.advanceBalance
        };
        
        setFarmerData(farmer);
        setSummary(data.data.summary);
        
        const mappedPurchases = data.data.pendingPurchases.map(purchase => ({
          _id: purchase._id,
          purchaseDate: purchase.purchaseDate,
          invoiceNumber: purchase.receiptNumber,
          totalAmount: purchase.finalPayable,
          paidAmount: purchase.amountPaid,
          pendingAmount: purchase.amountDue,
          status: purchase.status === 'partial' ? 'Pending' : purchase.status,
          receiptNumber: purchase.receiptNumber,
          grossTotal: purchase.grossTotal
        }));
        
        setPendingPurchases(mappedPurchases);
        setRecentAdvanceTransactions(data.data.recentAdvanceTransactions || []);
      } else {
        setError(data.message || t('farmers.errors.fetchFailed'));
      }
    } catch (err) {
      console.error('Error fetching dues:', err);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDuesData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDuesData();
  }, [fetchDuesData]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Advance exceeds dues':
        return { bg: '#E8F5E9', text: '#2E7D32', icon: TrendingUp, label: t('farmers.status.advanceExceedsDues') };
      case 'Dues pending':
        return { bg: '#FFEBEE', text: '#D32F2F', icon: TrendingDown, label: t('farmers.status.duesPending') };
      case 'Payment pending':
        return { bg: '#FFEBEE', text: '#D32F2F', icon: TrendingDown, label: t('farmers.status.paymentPending') };
      case 'Settled':
        return { bg: '#E3F2FD', text: '#1565C0', icon: CheckCircle, label: t('farmers.status.settled') };
      default:
        return { bg: '#FFF3E0', text: '#E65100', icon: Clock, label: status };
    }
  };

  const getEntryTypeConfig = (type) => {
    switch (type) {
      case 'advance_given':
        return {
          label: t('farmers.paymentTypes.advanceGiven'),
          bg: '#FFF3E0', text: '#E65100', border: '#FFB74D',
          icon: ArrowUpCircle, iconColor: '#E65100'
        };
      case 'advance_adjusted':
        return {
          label: t('farmers.paymentTypes.advanceAdjusted'),
          bg: '#E8F5E9', text: '#1B5E20', border: '#81C784',
          icon: ArrowDownCircle, iconColor: '#2E7D32'
        };
      default:
        return {
          label: type?.replace(/_/g, ' ') || t('common.transaction'),
          bg: '#F3F4F6', text: '#374151', border: '#D1D5DB',
          icon: Circle, iconColor: '#6B7280'
        };
    }
  };

  if (loading && !farmerData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('farmers.loadingDues')}</span>
      </div>
    );
  }

  const statusConfig = summary ? getStatusBadge(summary.status) : null;
  const StatusIcon = statusConfig?.icon;

  const displayAdvances = showAllAdvances ? recentAdvanceTransactions : recentAdvanceTransactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/farmers')}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-all"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>
              {t('farmers.duesTitle')}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#8D6E63' }}>
              {t('farmers.duesSubtitle')}
            </p>
          </div>
        </div>
        {/* <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
          style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button> */}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchDuesData} className="ml-auto text-sm text-red-600 hover:underline">
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Farmer Info Card */}
      {farmerData && (
        <div
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          style={{ borderLeft: '4px solid #2E7D32' }}
        >
          <div className="p-5 flex flex-wrap gap-6 items-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#E8F5E9' }}
            >
              <User className="w-7 h-7" style={{ color: '#2E7D32' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold" style={{ color: '#1B5E20' }}>{farmerData.name}</h2>
              <div className="flex items-center gap-1 mt-1">
                <Phone className="w-3.5 h-3.5" style={{ color: '#8D6E63' }} />
                <span className="text-sm" style={{ color: '#5D4037' }}>{farmerData.mobile}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl" style={{ background: '#E8F5E9' }}>
                <p className="text-xs" style={{ color: '#1B5E20' }}>{t('farmers.totalPaid')}</p>
                <p className="text-lg font-bold" style={{ color: '#2E7D32' }}>
                  {formatCurrency(farmerData.totalPaid)}
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl" style={{ background: '#FFF3E0' }}>
                <p className="text-xs" style={{ color: '#BF360C' }}>{t('farmers.pendingPurchaseDues')}</p>
                <p className="text-lg font-bold" style={{ color: '#E65100' }}>
                  {formatCurrency(farmerData.pendingPurchaseDues)}
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl" style={{ background: '#E3F2FD' }}>
                <p className="text-xs" style={{ color: '#1565C0' }}>{t('farmers.advanceBalance')}</p>
                <p className="text-lg font-bold" style={{ color: '#1565C0' }}>
                  {formatCurrency(farmerData.advanceBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FFF3E0' }}>
              <DollarSign className="w-5 h-5" style={{ color: '#E65100' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.totalPendingPurchases')}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: '#E65100' }}>
                {formatCurrency(summary.totalPendingFromPurchases)}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#E3F2FD' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#1565C0' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.advanceBalance')}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: '#1565C0' }}>
                {formatCurrency(summary.totalAdvanceBalance)}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: summary.netAmountDue > 0 ? '#FFEBEE' : '#E8F5E9' }}>
              <TrendingDown className="w-5 h-5" style={{ color: summary.netAmountDue > 0 ? '#D32F2F' : '#2E7D32' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.netAmountDue')}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: summary.netAmountDue > 0 ? '#D32F2F' : '#2E7D32' }}>
                {formatCurrency(summary.netAmountDue)}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: summary.netAmountReceivable > 0 ? '#E8F5E9' : '#FFEBEE' }}>
              <TrendingUp className="w-5 h-5" style={{ color: summary.netAmountReceivable > 0 ? '#2E7D32' : '#D32F2F' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.netAmountReceivable')}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: summary.netAmountReceivable > 0 ? '#2E7D32' : '#D32F2F' }}>
                {formatCurrency(summary.netAmountReceivable)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Card */}
      {summary && statusConfig && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: statusConfig.bg }}
            >
              {StatusIcon && <StatusIcon className="w-6 h-6" style={{ color: statusConfig.text }} />}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: statusConfig.text }}>{t('farmers.overallStatus')}</p>
              <p className="text-lg font-bold" style={{ color: statusConfig.text }}>{statusConfig.label}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b" style={{ borderColor: '#E8F5E9' }}>
          <div className="flex">
            <button
              onClick={() => setActiveTab('advances')}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${
                activeTab === 'advances'
                  ? 'text-[#2E7D32]'
                  : 'text-[#8D6E63] hover:text-[#2E7D32]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                {t('farmers.advancePaymentHistory')}
                {recentAdvanceTransactions.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#E3F2FD', color: '#1565C0' }}>
                    {recentAdvanceTransactions.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${
                activeTab === 'purchases'
                  ? 'text-[#2E7D32]'
                  : 'text-[#8D6E63] hover:text-[#2E7D32]'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {t('farmers.pendingPurchaseDues')}
                {pendingPurchases.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#FFF3E0', color: '#E65100' }}>
                    {pendingPurchases.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Advance Payment History Tab Content */}
        {activeTab === 'advances' && (
          <div>
            {recentAdvanceTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
                <p className="text-sm" style={{ color: '#8D6E63' }}>{t('farmers.noAdvanceTransactions')}</p>
              </div>
            ) : (
              <>
                {recentAdvanceTransactions.length > 5 && (
                  <div className="px-6 pt-4 flex justify-end">
                    <button
                      onClick={() => setShowAllAdvances(!showAllAdvances)}
                      className="text-sm flex items-center gap-1 hover:underline"
                      style={{ color: '#1565C0' }}
                    >
                      {showAllAdvances ? t('common.showLess') : t('common.viewAll', { count: recentAdvanceTransactions.length })}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllAdvances ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                )}
                
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: '#1B3A1F' }}>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.dateTime')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.type')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.description')}</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.debit')}</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.credit')}</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.balance')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.createdBy')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayAdvances.map((txn, index) => {
                        const config = getEntryTypeConfig(txn.entryType);
                        const Icon = config.icon;
                        return (
                          <tr
                            key={txn._id}
                            className="hover:bg-green-50 transition-colors"
                            style={{ borderBottom: index !== displayAdvances.length - 1 ? '1px solid #E8F5E9' : 'none' }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm" style={{ color: '#2E7D32' }}>{formatDate(txn.entryDate)}</p>
                                <p className="text-xs" style={{ color: '#8D6E63' }}>{formatDateTime(txn.entryDate).split(',')[1]}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit font-medium border"
                                style={{ background: config.bg, color: config.text, borderColor: config.border }}
                              >
                                <Icon className="w-3 h-3" />
                                {config.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm max-w-xs truncate" style={{ color: '#5D4037' }} title={txn.description}>
                                {txn.description || '—'}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              {txn.debit > 0 ? (
                                <span className="text-sm font-semibold" style={{ color: '#E65100' }}>
                                  {formatCurrency(txn.debit)}
                                </span>
                              ) : (
                                <span className="text-sm" style={{ color: '#BDBDBD' }}>—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              {txn.credit > 0 ? (
                                <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>
                                  {formatCurrency(txn.credit)}
                                </span>
                              ) : (
                                <span className="text-sm" style={{ color: '#BDBDBD' }}>—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-bold" style={{ color: '#1B5E20' }}>
                                {formatCurrency(txn.runningBalance)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-xs font-medium" style={{ color: '#5D4037' }}>
                                {txn.createdBy?.name || '—'}
                              </p>
                              <p className="text-xs" style={{ color: '#A5D6A7' }}>
                                {formatDate(txn.createdAt)}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden divide-y" style={{ borderColor: '#E8F5E9' }}>
                  {displayAdvances.map((txn) => {
                    const config = getEntryTypeConfig(txn.entryType);
                    const Icon = config.icon;
                    return (
                      <div key={txn._id} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit font-medium border"
                            style={{ background: config.bg, color: config.text, borderColor: config.border }}
                          >
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                          <span className="text-xs" style={{ color: '#8D6E63' }}>{formatDate(txn.entryDate)}</span>
                        </div>
                        <p className="text-sm" style={{ color: '#5D4037' }}>{txn.description || '—'}</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 rounded-lg" style={{ background: '#FFF3E0' }}>
                            <p className="text-xs" style={{ color: '#BF360C' }}>{t('farmers.table.debit')}</p>
                            <p className="text-sm font-bold" style={{ color: '#E65100' }}>
                              {txn.debit > 0 ? formatCurrency(txn.debit) : '—'}
                            </p>
                          </div>
                          <div className="text-center p-2 rounded-lg" style={{ background: '#E8F5E9' }}>
                            <p className="text-xs" style={{ color: '#1B5E20' }}>{t('farmers.table.credit')}</p>
                            <p className="text-sm font-bold" style={{ color: '#2E7D32' }}>
                              {txn.credit > 0 ? formatCurrency(txn.credit) : '—'}
                            </p>
                          </div>
                          <div className="text-center p-2 rounded-lg" style={{ background: '#F1F8E9' }}>
                            <p className="text-xs" style={{ color: '#33691E' }}>{t('farmers.table.balance')}</p>
                            <p className="text-sm font-bold" style={{ color: '#1B5E20' }}>
                              {formatCurrency(txn.runningBalance)}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: '#8D6E63' }}>
                          {t('farmers.by')} {txn.createdBy?.name || '—'} · {formatDate(txn.createdAt)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Pending Purchase Dues Tab Content */}
        {activeTab === 'purchases' && (
          <div>
            {pendingPurchases.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#A5D6A7' }} />
                <p className="text-sm" style={{ color: '#8D6E63' }}>{t('farmers.noPendingDues')}</p>
                <p className="text-xs mt-1" style={{ color: '#C8E6C9' }}>{t('farmers.allSettled')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#1B3A1F' }}>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.purchaseDate')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.receiptNo')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.grossTotal')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.finalPayable')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.paidAmount')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.pendingAmount')}</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPurchases.map((purchase, index) => (
                      <tr
                        key={purchase._id}
                        className="hover:bg-green-50 transition-colors"
                        style={{ borderBottom: index !== pendingPurchases.length - 1 ? '1px solid #E8F5E9' : 'none' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" style={{ color: '#A5D6A7' }} />
                            <span className="text-sm" style={{ color: '#2E7D32' }}>{formatDate(purchase.purchaseDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium" style={{ color: '#BF360C' }}>{purchase.receiptNumber || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm" style={{ color: '#2E7D32' }}>{formatCurrency(purchase.grossTotal)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{formatCurrency(purchase.totalAmount)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm" style={{ color: '#1565C0' }}>{formatCurrency(purchase.paidAmount)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-bold" style={{ color: '#E65100' }}>{formatCurrency(purchase.pendingAmount)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span 
                            className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit mx-auto"
                            style={{ 
                              background: purchase.status === 'partial' ? '#FFEBEE' : '#E8F5E9',
                              color: purchase.status === 'partial' ? '#D32F2F' : '#2E7D32'
                            }}
                          >
                            {purchase.status === 'partial' ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            {purchase.status === 'partial' ? t('farmers.status.partialPayment') : t('farmers.status.settled')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDues;
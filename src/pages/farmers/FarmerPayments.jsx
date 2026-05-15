// src/pages/farmers/FarmerPayments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Loader, AlertCircle, RefreshCw,
  TrendingUp, TrendingDown, Wallet, User,
  Phone, Calendar, CreditCard, ChevronLeft, ChevronRight,
  FileText, ArrowUpCircle, ArrowDownCircle, Circle,
  Search, X
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const FarmerPayments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const fetchPayments = useCallback(async () => {
    if (!isAuthenticated()) return;
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      if (debouncedSearch) {
        queryParams.append('search', debouncedSearch);
      }

      const response = await fetch(`${BASE_URL}/farmers/${id}/advance?${queryParams}`, {
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
        setFarmer(data.data.farmer);
        setSummary(data.data.summary);
        setTransactions(data.data.transactions);
        setPagination(prev => ({ ...prev, ...data.data.pagination }));
      } else {
        setError(data.message || t('farmers.errors.fetchFailed'));
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [id, pagination.page, pagination.limit, debouncedSearch, navigate, t]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
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

  // Client-side filtering as fallback if API doesn't support search
  const filteredTransactions = debouncedSearch
    ? transactions.filter(txn => {
        const q = debouncedSearch.toLowerCase();
        return (
          txn.description?.toLowerCase().includes(q) ||
          txn.entryType?.toLowerCase().includes(q) ||
          txn.createdBy?.name?.toLowerCase().includes(q) ||
          String(txn.debit || '').includes(q) ||
          String(txn.credit || '').includes(q) ||
          String(txn.runningBalance || '').includes(q)
        );
      })
    : transactions;

  if (loading && !farmer) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('farmers.loadingPayments')}</span>
      </div>
    );
  }

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
              {t('farmers.paymentHistory')}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#8D6E63' }}>
              {t('farmers.advanceTransactions')}
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

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchPayments} className="ml-auto text-sm text-red-600 hover:underline">
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Farmer Info Card */}
      {farmer && (
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
              <h2 className="text-lg font-bold" style={{ color: '#1B5E20' }}>{farmer.name}</h2>
              <div className="flex items-center gap-1 mt-1">
                <Phone className="w-3.5 h-3.5" style={{ color: '#8D6E63' }} />
                <span className="text-sm" style={{ color: '#5D4037' }}>{farmer.mobile}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: '#FFF3E0' }}>
              <Wallet className="w-5 h-5" style={{ color: '#E65100' }} />
              <div>
                <p className="text-xs" style={{ color: '#BF360C' }}>{t('farmers.currentBalance')}</p>
                <p className="text-lg font-bold" style={{ color: '#E65100' }}>
                  {formatCurrency(farmer.currentAdvanceBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FFF3E0' }}>
              <TrendingUp className="w-5 h-5" style={{ color: '#E65100' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.totalAdvanceGiven')}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: '#E65100' }}>
                {formatCurrency(summary.totalAdvanceGiven)}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#E8F5E9' }}>
              <TrendingDown className="w-5 h-5" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.totalAdjusted')}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: '#2E7D32' }}>
                {formatCurrency(summary.totalAdvanceAdjusted)}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FFF8E1' }}>
              <CreditCard className="w-5 h-5" style={{ color: '#FF8F00' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.netOutstanding')}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: '#FF8F00' }}>
                {formatCurrency(summary.netOutstanding)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        {/* Table Header + Search */}
        <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4" style={{ borderColor: '#E8F5E9' }}>
          <div className="flex items-center gap-2 flex-shrink-0">
            <FileText className="w-4 h-4" style={{ color: '#2E7D32' }} />
            <h3 className="font-semibold text-sm" style={{ color: '#1B5E20' }}>{t('farmers.transactionLedger')}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
              {debouncedSearch ? `${filteredTransactions.length} of ${pagination.total}` : `${pagination.total} ${pagination.total === 1 ? t('common.entry') : t('common.entries')}`}
            </span>
          </div>

          {/* Search Box - Reduced Width */}
          <div className="w-72">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: '#8D6E63' }}
              />
              <input
                type="text"
                placeholder={t('common.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-9 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1"
                style={{ borderColor: '#C8E6C9', focusRingColor: '#2E7D32' }}
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setDebouncedSearch(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4" style={{ color: '#8D6E63' }} />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>
              {debouncedSearch ? `${t('farmers.noTransactionsMatch')} "${debouncedSearch}"` : t('farmers.noTransactionsFound')}
            </p>
            {debouncedSearch && (
              <button
                onClick={() => { setSearchTerm(''); setDebouncedSearch(''); }}
                className="mt-2 text-sm hover:underline"
                style={{ color: '#2E7D32' }}
              >
                {t('common.clearSearch')}
              </button>
            )}
          </div>
        ) : (
          <>
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
                  {filteredTransactions.map((txn, index) => {
                    const config = getEntryTypeConfig(txn.entryType);
                    const Icon = config.icon;
                    return (
                      <tr
                        key={txn._id}
                        className="hover:bg-green-50 transition-colors"
                        style={{ borderBottom: index !== filteredTransactions.length - 1 ? '1px solid #E8F5E9' : 'none' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#A5D6A7' }} />
                            <div>
                              <p className="text-sm" style={{ color: '#2E7D32' }}>{formatDate(txn.entryDate)}</p>
                              <p className="text-xs" style={{ color: '#8D6E63' }}>{formatTime(txn.entryDate)}</p>
                            </div>
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
              {filteredTransactions.map((txn) => {
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

            {/* Pagination — hide when searching client-side */}
            {!debouncedSearch && pagination.pages > 1 && (
              <div
                className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4"
                style={{ borderColor: '#E8F5E9' }}
              >
                <div className="text-xs" style={{ color: '#8D6E63' }}>
                  {t('farmers.pagination.showing', {
                    start: (pagination.page - 1) * pagination.limit + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total
                  })}
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
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
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
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
    </div>
  );
};

export default FarmerPayments;
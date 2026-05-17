// src/pages/buyers/Buyers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Users, Search, Filter, Eye, Edit2, 
  Download, UserPlus, Phone, 
  DollarSign, Wallet, CheckCircle, XCircle, 
  Loader, AlertCircle,
  User, X,
  MoreVertical,
  PowerOff, Building2, CreditCard, Calendar
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Buyers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [stats, setStats] = useState({
    totalBuyers: 0,
    totalPurchaseValue: 0,
    totalCreditLimit: 0,
    activeBuyers: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    businessType: 'all',
    city: '',
    state: ''
  });
  
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedBuyerForMenu, setSelectedBuyerForMenu] = useState(null);
  
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
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

  const fetchBuyers = useCallback(async () => {
    if (!isAuthenticated()) return;
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.businessType !== 'all') queryParams.append('businessType', filters.businessType);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.state) queryParams.append('state', filters.state);

      const response = await fetch(`${BASE_URL}/buyers?${queryParams}`, {
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
        setBuyers(data.data);
        setPagination(data.pagination);
        
        const totalPurchaseValue = data.data.reduce((sum, b) => sum + (b.totalPurchaseValue || 0), 0);
        const totalCreditLimit = data.data.reduce((sum, b) => sum + (b.creditLimit || 0), 0);
        const activeBuyers = data.data.filter(b => b.isActive).length;
        
        setStats({
          totalBuyers: data.pagination.total || data.data.length,
          totalPurchaseValue,
          totalCreditLimit,
          activeBuyers
        });
      } else {
        setError(data.message || t('buyers.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching buyers:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.status, filters.businessType, filters.city, filters.state, navigate, t]);

  const handleDeactivateBuyer = async (buyer) => {
    setDeactivating(true);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/buyers/${buyer._id}/deactivate`, {
        method: 'PATCH',
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
        setShowDeactivateModal(false);
        setSelectedBuyer(null);
        fetchBuyers();
        alert(t('buyers.messages.deactivateSuccess', { name: buyer.displayName || buyer.name }));
      } else {
        setError(data.message || t('buyers.errors.deactivateFailed'));
        setShowDeactivateModal(false);
      }
    } catch (error) {
      console.error('Error deactivating buyer:', error);
      setError(t('common.networkError'));
    } finally {
      setDeactivating(false);
      setActionMenuAnchor(null);
      setSelectedBuyerForMenu(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilters({ status: 'all', businessType: 'all', city: '', state: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchBuyers();
  };

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  const handleActionMenuOpen = (event, buyer) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedBuyerForMenu(buyer);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedBuyerForMenu(null);
  };

  const openDeactivateModal = (buyer) => {
    setSelectedBuyer(buyer);
    setShowDeactivateModal(true);
    handleActionMenuClose();
  };

  const getStatusColor = (isActive) =>
    isActive
      ? { bg: '#E8F5E9', text: '#2E7D32', label: t('buyers.status.active') }
      : { bg: '#FFEBEE', text: '#D32F2F', label: t('buyers.status.inactive') };

  const getBusinessTypeLabel = (type) => {
    const types = {
      individual: t('buyers.businessTypes.individual'),
      company: t('buyers.businessTypes.company'),
      partnership: t('buyers.businessTypes.partnership'),
      proprietorship: t('buyers.businessTypes.proprietorship')
    };
    return types[type] || type || t('common.na');
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.na');
    return new Date(dateString).toLocaleDateString(t('common.locale') === 'mr' ? 'mr-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

 const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount || 0);

  const MENU_HEIGHT = 200;
  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  if (loading && buyers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('buyers.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('buyers.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('buyers.subtitle')}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('buyers.stats.totalBuyers')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalBuyers}</p>
            </div>
            <Users className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('buyers.stats.totalPurchaseValue')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.totalPurchaseValue)}</p>
            </div>
            <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('buyers.stats.totalCreditLimit')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#FF6F00' }}>{formatCurrency(stats.totalCreditLimit)}</p>
            </div>
            <CreditCard className="w-8 h-8" style={{ color: '#FF6F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('buyers.stats.activeBuyers')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.activeBuyers}</p>
            </div>
            <CheckCircle className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchBuyers} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
              <input
                type="text"
                placeholder={t('buyers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                style={{ borderColor: '#C8E6C9' }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <X className="w-4 h-4" style={{ color: '#8D6E63' }} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-all ${showFilters ? 'bg-[#F1F8E9]' : 'hover:bg-gray-50'}`}
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
            >
              <Filter className="w-4 h-4" />
              {t('common.filter')}
              {(filters.status !== 'all' || filters.businessType !== 'all' || filters.city || filters.state) && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
            
            <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <Download className="w-4 h-4" />
              {t('common.export')}
            </button>
            <button
              onClick={() => navigate('/buyers/add')}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <UserPlus className="w-4 h-4" />
              {t('buyers.buttons.addNew')}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('buyers.filters.status')}</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">{t('common.allStatus')}</option>
                  <option value="active">{t('buyers.status.active')}</option>
                  <option value="inactive">{t('buyers.status.inactive')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('buyers.filters.businessType')}</label>
                <select
                  value={filters.businessType}
                  onChange={(e) => setFilters({ ...filters, businessType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="individual">{t('buyers.businessTypes.individual')}</option>
                  <option value="company">{t('buyers.businessTypes.company')}</option>
                  <option value="partnership">{t('buyers.businessTypes.partnership')}</option>
                  <option value="proprietorship">{t('buyers.businessTypes.proprietorship')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('buyers.filters.city')}</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder={t('buyers.filters.cityPlaceholder')}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('buyers.filters.state')}</label>
                <input
                  type="text"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  placeholder={t('buyers.filters.statePlaceholder')}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-1 rounded-lg text-white text-sm"
                style={{ background: '#2E7D32' }}
              >
                {t('common.apply')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Buyers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
          </div>
        ) : buyers.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('buyers.noBuyersFound')}</p>
            {(searchTerm || filters.status !== 'all' || filters.businessType !== 'all' || filters.city || filters.state) && (
              <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
                {t('common.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('buyers.table.buyerInfo')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('buyers.table.contact')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('buyers.table.location')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('buyers.table.business')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('buyers.table.creditLimit')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('buyers.table.purchaseValue')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('buyers.table.status')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((buyer, index) => {
                    const statusColors = getStatusColor(buyer.isActive);
                    const isActionMenuOpen =
                      Boolean(actionMenuAnchor) && selectedBuyerForMenu?._id === buyer._id;

                    return (
                      <tr
                        key={buyer._id}
                        className="hover:bg-green-50 transition-colors"
                        style={{ borderBottom: index !== buyers.length - 1 ? '1px solid #E8F5E9' : 'none' }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                           
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{buyer.displayName || buyer.name}</p>
                              {buyer.businessName && (
                                <p className="text-xs" style={{ color: '#8D6E63' }}>{buyer.businessName}</p>
                              )}
                              {buyer.gstNumber && (
                                <p className="text-xs" style={{ color: '#8D6E63' }}>GST: {buyer.gstNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" style={{ color: '#C8E6C9' }} />
                              <span className="text-sm" style={{ color: '#5D4037' }}>{buyer.mobile}</span>
                            </div>
                            <p className="text-xs" style={{ color: '#8D6E63' }}>{buyer.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm" style={{ color: '#5D4037' }}>{buyer.address?.split(',')[0] || t('common.na')}</p>
                            <p className="text-xs" style={{ color: '#8D6E63' }}>{buyer.city}, {buyer.state} - {buyer.pincode}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-[#F1F8E9]" style={{ color: '#2E7D32' }}>
                            {getBusinessTypeLabel(buyer.businessType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>
                              {formatCurrency(buyer.creditLimit)}
                            </span>
                            <p className="text-xs" style={{ color: '#8D6E63' }}>{buyer.creditDays || 0} {t('buyers.table.daysCredit')}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className="text-sm font-semibold" style={{ color: '#FF6F00' }}>
                              {formatCurrency(buyer.totalPurchaseValue)}
                            </span>
                            <p className="text-xs" style={{ color: '#8D6E63' }}>
                              {buyer.totalPurchases || 0} {t('buyers.table.purchases')}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{
                            background: statusColors.bg,
                            color: statusColors.text
                          }}>
                            {buyer.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {statusColors.label}
                          </span>
                          {buyer.lastPurchaseDate && (
                            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#8D6E63' }}>
                              <Calendar className="w-2 h-2" />
                              {t('buyers.table.lastPurchase')}: {formatDate(buyer.lastPurchaseDate)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => handleActionMenuOpen(e, buyer)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
                            style={{ color: '#2E7D32' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="text-xs font-medium">{t('common.actions')}</span>
                          </button>

                          {/* Dropdown */}
                          {isActionMenuOpen && anchorRect && (
                            <div
                              className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
                              style={{
                                borderColor: '#E8F5E9',
                                width: '200px',
                                position: 'fixed',
                                top: openUpward
                                  ? anchorRect.top - MENU_HEIGHT - 4
                                  : anchorRect.bottom + 4,
                                left: anchorRect.left - 140,
                              }}
                            >
                              <button
                                onClick={() => {
                                  navigate(`/buyers/view/${buyer._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#2E7D32' }}
                              >
                                <Eye className="w-4 h-4" />
                                {t('common.viewDetails')}
                              </button>

                              <button
                                onClick={() => {
                                  navigate(`/buyers/edit/${buyer._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#FF6F00' }}
                              >
                                <Edit2 className="w-4 h-4" />
                                {t('common.edit')}
                              </button>

                              {/* <button
                                onClick={() => {
                                  navigate(`/buyers/purchases/${buyer._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors border-t"
                                style={{ color: '#1565C0', borderColor: '#E8F5E9' }}
                              >
                                <DollarSign className="w-4 h-4" />
                                {t('buyers.actions.viewPurchases')}
                              </button> */}

                            
                            </div>
                          )}
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
                  {t('buyers.pagination.showing', {
                    start: (pagination.page - 1) * pagination.limit + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    {t('common.previous')}
                  </button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) pageNum = i + 1;
                      else if (pagination.page <= 3) pageNum = i + 1;
                      else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                      else pageNum = pagination.page - 2 + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination({ ...pagination, page: pageNum })}
                          className="w-8 h-8 rounded border text-sm transition-all"
                          style={{
                            borderColor: '#C8E6C9',
                            background: pagination.page === pageNum ? '#2E7D32' : 'white',
                            color: pagination.page === pageNum ? 'white' : '#2E7D32'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Global Backdrop for Action Menu */}
      {Boolean(actionMenuAnchor) && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleActionMenuClose}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
        />
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && selectedBuyer && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => { setShowDeactivateModal(false); setSelectedBuyer(null); }}
          />
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '400px' }}>
              <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#D32F2F' }}>{t('buyers.modals.deactivate.title')}</h3>
                  <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('buyers.modals.deactivate.subtitle')}</p>
                </div>
                <button
                  onClick={() => { setShowDeactivateModal(false); setSelectedBuyer(null); }}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <PowerOff className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <p className="text-center text-sm mb-2" style={{ color: '#5D4037' }}>
                  {t('buyers.modals.deactivate.confirmMessage', { name: selectedBuyer.displayName || selectedBuyer.name })}
                </p>
                <p className="text-center text-xs" style={{ color: '#8D6E63' }}>
                  {t('buyers.modals.deactivate.warningMessage')}
                </p>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
                <button
                  onClick={() => { setShowDeactivateModal(false); setSelectedBuyer(null); }}
                  className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
                  style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => handleDeactivateBuyer(selectedBuyer)}
                  disabled={deactivating}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
                  style={{ background: '#D32F2F' }}
                >
                  {deactivating ? (
                    <><Loader className="w-4 h-4 animate-spin" /> {t('common.deactivating')}</>
                  ) : (
                    <><PowerOff className="w-4 h-4" /> {t('common.deactivate')}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buyers;
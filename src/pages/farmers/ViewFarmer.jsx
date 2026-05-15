// src/pages/farmers/ViewFarmer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, User, Phone, MapPin, Building, 
  CreditCard, Landmark, FileText, DollarSign, 
  Wallet, TrendingUp, Calendar, CheckCircle, XCircle,
  Loader, AlertCircle, Printer, Download, 
  Banknote, Hash, Home, Globe, Plus, Edit2, X
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewFarmer = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [ledgerFilters, setLedgerFilters] = useState({
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  const [ledgerPagination, setLedgerPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceData, setAdvanceData] = useState({
    amount: '',
    paymentMode: 'cash',
    referenceNumber: '',
    notes: ''
  });
  const [advanceLoading, setAdvanceLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const getToken = () => localStorage.getItem('token');

  // Fetch farmer details - runs only when id changes
  const fetchFarmerDetails = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/farmers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) setFarmer(data.data);
      else setError(data.message || t('farmers.errors.fetchFailed'));
    } catch (error) {
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  // Fetch ledger - separate function with dependencies
  const fetchLedger = useCallback(async () => {
    if (!farmer) return;
    
    setLedgerLoading(true);
    try {
      const token = getToken();
      const queryParams = new URLSearchParams({
        page: ledgerFilters.page,
        limit: ledgerFilters.limit
      });
      if (ledgerFilters.startDate) queryParams.append('startDate', ledgerFilters.startDate);
      if (ledgerFilters.endDate) queryParams.append('endDate', ledgerFilters.endDate);
      
      const response = await fetch(`${BASE_URL}/ledger/farmer/${id}?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setLedger(Array.isArray(data.data?.transactions) 
          ? data.data.transactions 
          : []
        );
        setLedgerPagination(
          data.data?.pagination || 
          { page: 1, limit: 20, total: 0, pages: 1 }
        );
      }
    } catch (error) {
      console.error('Error fetching ledger:', error);
    } finally {
      setLedgerLoading(false);
    }
  }, [id, farmer, ledgerFilters.page, ledgerFilters.limit, ledgerFilters.startDate, ledgerFilters.endDate, navigate]);

  // Initial load - farmer details
  useEffect(() => {
    fetchFarmerDetails();
  }, [fetchFarmerDetails]);

  // Load ledger only when activeTab changes to 'ledger' AND farmer exists
  useEffect(() => {
    if (activeTab === 'ledger' && farmer) {
      fetchLedger();
    }
  }, [activeTab, farmer, fetchLedger]);

  // Handle filter changes manually (not via useEffect)
  const handleFilterChange = (type, value) => {
    setLedgerFilters(prev => ({ ...prev, [type]: value, page: 1 }));
    setTimeout(() => {
      if (activeTab === 'ledger' && farmer) {
        fetchLedger();
      }
    }, 100);
  };

  const handlePageChange = (newPage) => {
    setLedgerFilters(prev => ({ ...prev, page: newPage }));
    setTimeout(() => {
      if (activeTab === 'ledger' && farmer) {
        fetchLedger();
      }
    }, 100);
  };

  const handleClearFilters = () => {
    setLedgerFilters({ startDate: '', endDate: '', page: 1, limit: 20 });
    setTimeout(() => {
      if (activeTab === 'ledger' && farmer) {
        fetchLedger();
      }
    }, 100);
  };

  const handleGiveAdvance = async () => {
    if (!advanceData.amount || parseFloat(advanceData.amount) <= 0) {
      setModalError(t('farmers.errors.validAmountRequired'));
      return;
    }

    setAdvanceLoading(true);
    setModalError('');
    
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/farmers/${id}/advance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(advanceData.amount),
          paymentMode: advanceData.paymentMode,
          referenceNumber: advanceData.referenceNumber || undefined,
          notes: advanceData.notes || undefined
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok && data.success) {
        setShowAdvanceModal(false);
        setAdvanceData({ amount: '', paymentMode: 'cash', referenceNumber: '', notes: '' });
        await fetchFarmerDetails();
        if (activeTab === 'ledger') await fetchLedger();
      } else {
        setModalError(data.message || t('farmers.errors.advanceFailed'));
      }
    } catch (error) {
      setModalError(t('common.networkError'));
    } finally {
      setAdvanceLoading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('farmers.loading')}</span>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error || t('farmers.errors.notFound')}</p>
        <button onClick={() => navigate('/farmers')} className="mt-4 px-4 py-2 rounded-lg" style={{ background: '#2E7D32', color: 'white' }}>{t('common.back')}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/farmers')} 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{farmer.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: '#8D6E63' }}>{t('farmers.farmerId')}: {farmer._id?.slice(-8)}</p>
          </div>
        </div>
        {/* <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/farmers/edit/${farmer._id}`)} 
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF8F00, #FF6F00)' }}
          >
            <Edit2 className="w-4 h-4" /> {t('common.edit')}
          </button>
          <button 
            onClick={() => setShowAdvanceModal(true)} 
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
          >
            <Plus className="w-4 h-4" /> {t('farmers.actions.advancePayment')}
          </button>
        </div> */}
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-4 flex items-center justify-between border ${
        farmer.isActive 
          ? 'border-green-200' 
          : 'border-red-200'
      }`} style={{ 
        background: farmer.isActive ? '#E8F5E9' : '#FFEBEE'
      }}>
        <div className="flex items-center gap-3">
          {farmer.isActive ? 
            <CheckCircle className="w-6 h-6" style={{ color: '#2E7D32' }} /> : 
            <XCircle className="w-6 h-6" style={{ color: '#D32F2F' }} />
          }
          <div>
            <p className={`font-semibold ${farmer.isActive ? 'text-green-700' : 'text-red-700'}`}>
              {t('farmers.status.label')}: {farmer.isActive ? t('farmers.status.active') : t('farmers.status.inactive')}
            </p>
            <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.memberSince')}: {formatDate(farmer.createdAt)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.pendingDues')}</p>
          <p className="text-2xl font-bold" style={{ color: '#FF6F00' }}>{formatCurrency(farmer.pendingDues)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button 
            onClick={() => setActiveTab('details')} 
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === 'details' 
                ? 'border-b-2 border-green-600 text-green-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('farmers.tabs.farmerDetails')}
          </button>
          {/* <button 
            onClick={() => setActiveTab('ledger')} 
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === 'ledger' 
                ? 'border-b-2 border-green-600 text-green-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('farmers.tabs.ledgerStatement')}
          </button> */}
        </nav>
      </div>

      {/* Tab Content - Details */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                <h2 className="font-semibold" style={{ color: '#FFFFFF' }}>{t('farmers.personalInfo')}</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.fullName')}</p>
                  <p className="font-medium" style={{ color: '#1B5E20' }}>{farmer.name}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.mobileNumber')}</p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <span style={{ color: '#5D4037' }}>{farmer.mobile}</span>
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.address')}</p>
                  <p style={{ color: '#5D4037' }}>{farmer.address || t('common.notProvided')}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.village')}</p>
                  <p style={{ color: '#5D4037' }}>{farmer.village || t('common.na')}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.city')}</p>
                  <p style={{ color: '#5D4037' }}>{farmer.city || t('common.na')}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.state')}</p>
                  <p style={{ color: '#5D4037' }}>{farmer.state || t('common.na')}</p>
                </div>
                {farmer.gstNumber && (
                  <div>
                    <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.gstNumber')}</p>
                    <p style={{ color: '#5D4037' }}>{farmer.gstNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                  <h2 className="font-semibold" style={{ color: '#FFFFFF' }}>{t('farmers.financialSummary')}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: '#E8F5E9' }}>
                    <span style={{ color: '#8D6E63' }}>{t('farmers.totalPurchases')}</span>
                    <span className="font-semibold" style={{ color: '#2E7D32' }}>{farmer.totalPurchases || 0}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: '#E8F5E9' }}>
                    <span style={{ color: '#8D6E63' }}>{t('farmers.totalPurchaseValue')}</span>
                    <span className="font-semibold" style={{ color: '#2E7D32' }}>{formatCurrency(farmer.totalPurchaseValue)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: '#E8F5E9' }}>
                    <span style={{ color: '#8D6E63' }}>{t('farmers.totalPaid')}</span>
                    <span className="font-semibold" style={{ color: '#43A047' }}>{formatCurrency(farmer.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: '#E8F5E9' }}>
                    <span style={{ color: '#8D6E63' }}>{t('farmers.pendingDues')}</span>
                    <span className="font-semibold" style={{ color: '#FF6F00' }}>{formatCurrency(farmer.pendingDues)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span style={{ color: '#8D6E63' }}>{t('farmers.advanceBalance')}</span>
                    <span className="font-semibold" style={{ color: '#1E88E5' }}>{formatCurrency(farmer.advanceBalance)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            {(farmer.bankName || farmer.bankAccountNumber) && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
                  <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                    <h2 className="font-semibold" style={{ color: '#FFFFFF' }}>{t('farmers.bankDetails')}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {farmer.bankName && (
                      <div>
                        <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.bankName')}</p>
                        <p style={{ color: '#5D4037' }}>{farmer.bankName}</p>
                      </div>
                    )}
                    {farmer.bankAccountNumber && (
                      <div>
                        <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.accountNumber')}</p>
                        <p style={{ color: '#5D4037' }}>****{farmer.bankAccountNumber.slice(-4)}</p>
                      </div>
                    )}
                    {farmer.ifscCode && (
                      <div>
                        <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.ifscCode')}</p>
                        <p style={{ color: '#5D4037' }}>{farmer.ifscCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content - Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center flex-wrap gap-4" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#FFFFFF' }} />
              <h2 className="font-semibold" style={{ color: '#FFFFFF' }}>{t('farmers.ledgerStatement')}</h2>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                <input 
                  type="date" 
                  value={ledgerFilters.startDate} 
                  onChange={(e) => handleFilterChange('startDate', e.target.value)} 
                  className="px-3 py-1.5 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20"
                  style={{ 
                    borderColor: '#C8E6C9',
                    color: '#1B3A1F',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                <input 
                  type="date" 
                  value={ledgerFilters.endDate} 
                  onChange={(e) => handleFilterChange('endDate', e.target.value)} 
                  className="px-3 py-1.5 pl-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20"
                  style={{ 
                    borderColor: '#C8E6C9',
                    color: '#1B3A1F',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>
              <button 
                onClick={handleClearFilters} 
                className="px-3 py-1.5 border rounded-lg text-sm transition-all hover:bg-gray-50"
                style={{ borderColor: '#C8E6C9', color: '#D32F2F' }}
              >
                {t('common.clear')}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {ledgerLoading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
              </div>
            ) : ledger.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
                <p className="text-sm" style={{ color: '#8D6E63' }}>{t('farmers.noLedgerEntries')}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F1F8E9' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#2E7D32' }}>{t('farmers.table.date')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#2E7D32' }}>{t('farmers.table.type')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#2E7D32' }}>{t('farmers.table.description')}</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold" style={{ color: '#2E7D32' }}>{t('farmers.table.debit')}</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold" style={{ color: '#2E7D32' }}>{t('farmers.table.credit')}</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold" style={{ color: '#2E7D32' }}>{t('farmers.table.balance')}</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(ledger) && ledger.map((entry, idx) => {
                    const entryType = entry.entryType || entry.transactionType;
                    
                    let typeColor = 'bg-gray-100 text-gray-700';
                    let displayType = entryType || 'N/A';
                    
                    if (entryType === 'purchase') {
                      typeColor = 'bg-purple-100 text-purple-700';
                      displayType = t('farmers.ledgerTypes.purchase');
                    } else if (entryType === 'payment') {
                      typeColor = 'bg-green-100 text-green-700';
                      displayType = t('farmers.ledgerTypes.payment');
                    } else if (entryType === 'advance_given') {
                      typeColor = 'bg-blue-100 text-blue-700';
                      displayType = t('farmers.ledgerTypes.advanceGiven');
                    } else if (entryType === 'advance_adjusted') {
                      typeColor = 'bg-orange-100 text-orange-700';
                      displayType = t('farmers.ledgerTypes.advanceAdjusted');
                    } else if (entryType === 'advance') {
                      typeColor = 'bg-blue-100 text-blue-700';
                      displayType = t('farmers.ledgerTypes.advanceGiven');
                    }
                    
                    return (
                      <tr key={idx} className="border-b hover:bg-green-50 transition-colors" style={{ borderColor: '#E8F5E9' }}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm" style={{ color: '#5D4037' }}>{formatDate(entry.entryDate)}</td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className={`text-xs px-2 py-1 rounded-full ${typeColor}`}>
                            {displayType}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm" style={{ color: '#5D4037' }}>{entry.description}</td>
                        <td className="px-6 py-3 text-right text-sm font-semibold" style={{ color: '#D32F2F' }}>
                          {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-semibold" style={{ color: '#2E7D32' }}>
                          {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-semibold" style={{ color: '#1B5E20' }}>
                          {formatCurrency(entry.runningBalance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {ledgerPagination.pages > 1 && (
            <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
              <div className="text-xs" style={{ color: '#8D6E63' }}>
                {t('farmers.pagination.showing', { 
                  start: ((ledgerPagination.page - 1) * ledgerPagination.limit) + 1, 
                  end: Math.min(ledgerPagination.page * ledgerPagination.limit, ledgerPagination.total), 
                  total: ledgerPagination.total 
                })}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePageChange(ledgerPagination.page - 1)} 
                  disabled={ledgerPagination.page === 1} 
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 transition-all hover:bg-gray-50"
                  style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                >
                  {t('common.previous')}
                </button>
                <button 
                  onClick={() => handlePageChange(ledgerPagination.page + 1)} 
                  disabled={ledgerPagination.page === ledgerPagination.pages} 
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 transition-all hover:bg-gray-50"
                  style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                >
                  {t('common.next')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Give Advance Modal */}
      {showAdvanceModal && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 z-40 transition-opacity duration-300"
            style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowAdvanceModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b rounded-t-2xl" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                    <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>{t('farmers.modals.advance.title', { name: farmer.name })}</h2>
                  </div>
                  <button 
                    onClick={() => setShowAdvanceModal(false)}
                    className="p-1 rounded-lg transition-colors hover:bg-white/10"
                  >
                    <X className="w-5 h-5" style={{ color: '#C8E6C9' }} />
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: '#C8E6C9' }}>{t('farmers.modals.advance.currentDues')}: {formatCurrency(farmer.pendingDues)}</p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#1B5E20' }}>{t('common.amount')} *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input 
                      type="number" 
                      value={advanceData.amount} 
                      onChange={(e) => setAdvanceData(prev => ({ ...prev, amount: e.target.value }))} 
                      placeholder={t('common.enterAmount')} 
                      className="w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20"
                      style={{ borderColor: '#C8E6C9' }}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#1B5E20' }}>{t('payments.modes.paymentMode')}</label>
                  <select 
                    value={advanceData.paymentMode} 
                    onChange={(e) => setAdvanceData(prev => ({ ...prev, paymentMode: e.target.value }))} 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20"
                    style={{ borderColor: '#C8E6C9' }}
                  >
                    <option value="cash">{t('payments.modes.cash')}</option>
                    <option value="upi">{t('payments.modes.upi')}</option>
                    <option value="bank">{t('payments.modes.bank')}</option>
                    <option value="cheque">{t('payments.modes.cheque')}</option>
                  </select>
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#1B5E20' }}>{t('payments.referenceNumber')} <span className="text-xs font-normal" style={{ color: '#8D6E63' }}>({t('common.optional')})</span></label>
                  <input 
                    type="text" 
                    value={advanceData.referenceNumber} 
                    onChange={(e) => setAdvanceData(prev => ({ ...prev, referenceNumber: e.target.value }))} 
                    placeholder={t('payments.referencePlaceholder')} 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20"
                    style={{ borderColor: '#C8E6C9' }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: '#1B5E20' }}>{t('common.notes')} <span className="text-xs font-normal" style={{ color: '#8D6E63' }}>({t('common.optional')})</span></label>
                  <textarea 
                    value={advanceData.notes} 
                    onChange={(e) => setAdvanceData(prev => ({ ...prev, notes: e.target.value }))} 
                    rows="2" 
                    className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20"
                    style={{ borderColor: '#C8E6C9' }}
                    placeholder={t('common.notesPlaceholder')}
                  />
                </div>

                {/* Error Message */}
                {modalError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">{modalError}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: '#E8F5E9' }}>
                <button 
                  onClick={() => setShowAdvanceModal(false)} 
                  className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium transition-all hover:bg-gray-50"
                  style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
                >
                  {t('common.cancel')}
                </button>
                <button 
                  onClick={handleGiveAdvance} 
                  disabled={advanceLoading} 
                  className="flex-1 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
                >
                  {advanceLoading ? (
                    <Loader className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    t('farmers.actions.advancePayment')
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewFarmer;
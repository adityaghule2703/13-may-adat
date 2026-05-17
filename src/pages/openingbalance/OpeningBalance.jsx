// src/pages/openingBalance/OpeningBalance.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, Calendar, DollarSign, Wallet, CheckCircle, XCircle,
  AlertCircle, Loader, Edit2, Save, X, Plus, RefreshCw,
  Building2, Phone, Mail, MapPin, Clock, History, Banknote,
  FileText, Shield, User, Settings, Download, Filter, Users
} from 'lucide-react';
import axios from 'axios';
import BASE_URL from '../../config/Config';

const OpeningBalance = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [openingBalance, setOpeningBalance] = useState(null);
  const [operators, setOperators] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'debit',
    asOfDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [exportData, setExportData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    operatorId: '',
    type: ''
  });

  const getToken = () => localStorage.getItem('token');

  const fetchOpeningBalance = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${BASE_URL}/opening-balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setBusinessDetails(response.data.businessDetails);
        if (response.data.data) {
          const asOfDate = response.data.data.asOfDate 
            ? new Date(response.data.data.asOfDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
          
          setOpeningBalance({
            _id: response.data.data._id,
            amount: response.data.data.amount,
            type: response.data.data.type,
            asOfDate: asOfDate,
            notes: response.data.data.notes || '',
            createdAt: response.data.data.createdAt,
            updatedAt: response.data.data.updatedAt,
            createdBy: response.data.data.createdBy
          });
        }
      }
    } catch (err) {
      console.error('Error fetching opening balance:', err);
      if (err.response?.status === 404) {
        setOpeningBalance(null);
      } else {
        setError(err.response?.data?.message || t('common.networkError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOperators = async () => {
    setLoadingOperators(true);
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/auth/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        // Filter only users with role 'operator'
        const operatorUsers = response.data.data.filter(user => user.role === 'operator');
        setOperators(operatorUsers);
      }
    } catch (err) {
      console.error('Error fetching operators:', err);
      setError(t('common.networkError'));
    } finally {
      setLoadingOperators(false);
    }
  };

  useEffect(() => {
    fetchOpeningBalance();
  }, []);

  const openModal = () => {
    if (openingBalance) {
      setFormData({
        amount: openingBalance.amount.toString(),
        type: openingBalance.type,
        asOfDate: openingBalance.asOfDate,
        notes: openingBalance.notes
      });
    } else {
      setFormData({
        amount: '',
        type: 'debit',
        asOfDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setError(null);
  };

  const openExportModal = () => {
    setExportData({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      operatorId: '',
      type: ''
    });
    setShowExportModal(true);
    fetchOperators();
    setError(null);
  };

  const closeExportModal = () => {
    setShowExportModal(false);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExportInputChange = (e) => {
    const { name, value } = e.target;
    setExportData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError(t('openingBalance.errors.validAmountRequired'));
      return false;
    }
    if (!formData.asOfDate) {
      setError(t('openingBalance.errors.dateRequired'));
      return false;
    }
    if (!formData.type) {
      setError(t('openingBalance.errors.typeRequired'));
      return false;
    }
    return true;
  };

  const validateExportForm = () => {
    if (!exportData.startDate) {
      setError(t('daybook.errors.startDateRequired'));
      return false;
    }
    if (!exportData.endDate) {
      setError(t('daybook.errors.endDateRequired'));
      return false;
    }
    if (new Date(exportData.startDate) > new Date(exportData.endDate)) {
      setError(t('daybook.errors.invalidDateRange'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const token = getToken();
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        asOfDate: formData.asOfDate,
        notes: formData.notes || ''
      };

      const response = await axios.post(`${BASE_URL}/opening-balance`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess(openingBalance 
          ? t('openingBalance.messages.updateSuccess')
          : t('openingBalance.messages.createSuccess')
        );
        closeModal();
        fetchOpeningBalance();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error saving opening balance:', err);
      setError(err.response?.data?.message || t('common.networkError'));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!validateExportForm()) return;

    setExporting(true);
    setError(null);

    try {
      const token = getToken();
      const queryParams = new URLSearchParams({
        startDate: exportData.startDate,
        endDate: exportData.endDate
      });
      
      if (exportData.operatorId) queryParams.append('operatorId', exportData.operatorId);
      if (exportData.type) queryParams.append('type', exportData.type);

      const response = await axios.get(`${BASE_URL}/daybook/export/csv?${queryParams}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv'
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `daybook_${exportData.startDate}_to_${exportData.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(t('daybook.messages.exportSuccess'));
      closeExportModal();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error exporting daybook:', err);
      setError(err.response?.data?.message || t('common.networkError'));
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('openingBalance.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('openingBalance.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openExportModal}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
            style={{ borderColor: '#C8E6C9', color: '#1976D2', background: '#E3F2FD' }}
          >
            <Download className="w-4 h-4" />
            Export Day Book
          </button>
          <button
            onClick={openModal}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
          >
            <Plus className="w-4 h-4" />
            {openingBalance ? t('openingBalance.updateBalance') : t('openingBalance.addBalance')}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-600">{success}</span>
        </div>
      )}

      {/* Business Information Card */}
      {businessDetails && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
                {t('openingBalance.businessInformation')}
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 mt-0.5" style={{ color: '#2E7D32' }} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                    {t('openingBalance.businessName')}
                  </p>
                  <p className="text-base font-semibold mt-1" style={{ color: '#1F2937' }}>
                    {businessDetails.businessName || businessDetails.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5" style={{ color: '#FF6F00' }} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                    {t('openingBalance.address')}
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
                    {businessDetails.fullAddress || businessDetails.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5" style={{ color: '#1976D2' }} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                    {t('openingBalance.phone')}
                  </p>
                  <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
                    {businessDetails.phone || businessDetails.businessPhone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5" style={{ color: '#D32F2F' }} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                    {t('openingBalance.email')}
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
                    {businessDetails.email || businessDetails.businessEmail}
                  </p>
                </div>
              </div>
              {businessDetails.gstNumber && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-0.5" style={{ color: '#9C27B0' }} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                      {t('openingBalance.gstNumber')}
                    </p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
                      {businessDetails.gstNumber}
                    </p>
                  </div>
                </div>
              )}
              {businessDetails.panNumber && (
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 mt-0.5" style={{ color: '#607D8B' }} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                      {t('openingBalance.panNumber')}
                    </p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
                      {businessDetails.panNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Opening Balance Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
              {t('openingBalance.openingBalanceDetails')}
            </h2>
          </div>
        </div>
        
        <div className="p-6">
          {openingBalance ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium flex items-center gap-2" style={{ color: '#6B7280' }}>
                      <Banknote className="w-4 h-4" />
                      {t('openingBalance.currentBalance')}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      openingBalance.type === 'debit' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {openingBalance.type === 'debit' ? t('openingBalance.debit') : t('openingBalance.credit')}
                    </span>
                  </div>
                  <p className="text-4xl font-bold" style={{ color: '#2E7D32' }}>
                    {formatCurrency(openingBalance.amount)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-3 border-b" style={{ borderColor: '#E8F5E9' }}>
                  <Calendar className="w-5 h-5 mt-0.5" style={{ color: '#FF6F00' }} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                      {t('openingBalance.asOfDate')}
                    </p>
                    <p className="text-base font-semibold mt-1" style={{ color: '#1F2937' }}>
                      {formatDate(openingBalance.asOfDate)}
                    </p>
                  </div>
                </div>
                
                {openingBalance.notes && (
                  <div className="flex items-start gap-3 pb-3 border-b" style={{ borderColor: '#E8F5E9' }}>
                    <FileText className="w-5 h-5 mt-0.5" style={{ color: '#9C27B0' }} />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                        {t('common.notes')}
                      </p>
                      <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
                        {openingBalance.notes}
                      </p>
                    </div>
                  </div>
                )}
                
                {openingBalance.createdBy && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 mt-0.5" style={{ color: '#1976D2' }} />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                        {t('openingBalance.createdBy')}
                      </p>
                      <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
                        {openingBalance.createdBy.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                        {formatDateTime(openingBalance.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-50 flex items-center justify-center">
                <AlertCircle className="w-10 h-10" style={{ color: '#FFB74D' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F2937' }}>
                {t('openingBalance.noBalanceFound')}
              </h3>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                {t('openingBalance.noBalanceDescription')}
              </p>
              <button
                onClick={openModal}
                className="px-6 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 mx-auto hover:scale-105 transition-all"
                style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
              >
                <Plus className="w-4 h-4" />
                {t('openingBalance.addBalance')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" style={{ color: '#1976D2' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: '#1E3A8A' }}>
              {t('openingBalance.whatIsOpeningBalance')}
            </h3>
            <p className="text-sm" style={{ color: '#1E40AF' }}>
              {t('openingBalance.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Opening Balance Modal */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 z-50 transition-all duration-300"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
            onClick={closeModal}
          />
          
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all duration-300">
                <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
                  <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1B5E20' }}>
                    <Banknote className="w-5 h-5" />
                    {openingBalance ? t('openingBalance.updateBalance') : t('openingBalance.addBalance')}
                  </h3>
                  <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" style={{ color: '#6B7280' }} />
                  </button>
                </div>

                <div className="px-6 py-6">
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">{error}</span>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('openingBalance.amount')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                          style={{ borderColor: '#D1D5DB' }}
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('openingBalance.type')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                      >
                        <option value="debit">{t('openingBalance.debit')} (Positive Balance)</option>
                        <option value="credit">{t('openingBalance.credit')} (Negative Balance)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('openingBalance.asOfDate')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="asOfDate"
                        value={formData.asOfDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('common.notes')}
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder={t('openingBalance.notesPlaceholder')}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                        style={{ borderColor: '#D1D5DB' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
                  <button
                    onClick={closeModal}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
                  >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? t('common.saving') : t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Export Day Book Modal */}
      {showExportModal && (
        <>
          <div 
            className="fixed inset-0 z-50 transition-all duration-300"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
            onClick={closeExportModal}
          />
          
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300">
                <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
                  <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1976D2' }}>
                    <Download className="w-5 h-5" />
                    Export Day Book
                  </h3>
                  <button onClick={closeExportModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" style={{ color: '#6B7280' }} />
                  </button>
                </div>

                <div className="px-6 py-6">
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">{error}</span>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={exportData.startDate}
                        onChange={handleExportInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={exportData.endDate}
                        onChange={handleExportInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        Operator (Optional)
                      </label>
                      <select
                        name="operatorId"
                        value={exportData.operatorId}
                        onChange={handleExportInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                      >
                        <option value="">All Operators</option>
                        {operators.map(operator => (
                          <option key={operator.id} value={operator.id}>
                            {operator.name} - {operator.email}
                          </option>
                        ))}
                      </select>
                      {loadingOperators && (
                        <div className="flex items-center gap-2 mt-1">
                          <Loader className="w-3 h-3 animate-spin" style={{ color: '#1976D2' }} />
                          <span className="text-xs" style={{ color: '#6B7280' }}>Loading operators...</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        Transaction Type (Optional)
                      </label>
                      <select
                        name="type"
                        value={exportData.type}
                        onChange={handleExportInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                      >
                        <option value="">All Types</option>
                        <option value="credit">Credit</option>
                        <option value="debit">Debit</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
                  <button
                    onClick={closeExportModal}
                    disabled={exporting}
                    className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg, #1976D2, #42A5F5)' }}
                  >
                    {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {exporting ? 'Exporting...' : 'Export'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OpeningBalance;
// src/pages/budgetalerts/ViewBudget.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Calendar, DollarSign, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Wallet, Edit2, Loader, 
  FileText, Clock, PieChart
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewBudget = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryOptions = {
    transport_logistics: { label: t('expenses.categories.transport'), icon: TrendingUp },
    labour_wages: { label: t('expenses.categories.labour'), icon: Clock },
    market_fees: { label: t('expenses.categories.marketFees'), icon: DollarSign },
    storage_cold_chain: { label: t('expenses.categories.storage'), icon: Wallet },
    shop_office: { label: t('expenses.categories.shopOffice'), icon: FileText },
    repairs_maintenance: { label: t('expenses.categories.repairs'), icon: TrendingDown },
    banking_finance: { label: t('expenses.categories.banking'), icon: PieChart },
    marketing_misc: { label: t('expenses.categories.marketing'), icon: TrendingUp }
  };

  const getToken = () => localStorage.getItem('token');

  const fetchBudget = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/budget-alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        const found = data.data.find(b => b._id === id);
        if (found) {
          setBudget(found);
        } else {
          setError(t('budgetAlerts.errors.notFound'));
        }
      } else {
        setError(data.message || t('budgetAlerts.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getAlertLevel = (level, percentage) => {
    const percent = percentage || 0;
    if (level === 'critical' || percent >= 100) {
      return { 
        bg: '#FFEBEE', text: '#D32F2F', 
        label: t('budgetAlerts.alertLevels.critical'), 
        icon: AlertCircle, 
        message: t('budgetAlerts.messages.limitExceeded') 
      };
    } else if (level === 'warning' || percent >= 80) {
      return { 
        bg: '#FFF3E0', text: '#FF6F00', 
        label: t('budgetAlerts.alertLevels.warning'), 
        icon: TrendingUp, 
        message: t('budgetAlerts.messages.approachingLimit') 
      };
    }
    return { 
      bg: '#E8F5E9', text: '#2E7D32', 
      label: t('budgetAlerts.alertLevels.normal'), 
      icon: CheckCircle, 
      message: t('budgetAlerts.messages.withinLimits') 
    };
  };

  // Fixed: Format month from "YYYY-MM" to readable format
  const formatMonth = (monthString) => {
    if (!monthString) return '';
    
    // Parse month string in format "YYYY-MM"
    const [year, month] = monthString.split('-');
    
    // Create date to get month name
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleString('default', { month: 'long' });
    
    return `${monthName} ${year}`;
  };

  const getCategoryIcon = (category) => {
    const cat = categoryOptions[category];
    if (cat && cat.icon) {
      const IconComponent = cat.icon;
      return IconComponent;
    }
    return Wallet;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('budgetAlerts.loading')}</span>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error || t('budgetAlerts.errors.notFound')}</p>
        <button onClick={() => navigate('/budget-alerts')} className="mt-4 px-4 py-2 rounded-lg text-white text-sm transition-all hover:scale-105" style={{ background: '#2E7D32' }}>
          {t('common.backToBudgets')}
        </button>
      </div>
    );
  }

  const percentage = parseFloat(budget.percentageUsed) || 0;
  const alertInfo = getAlertLevel(budget.alertLevel, percentage);
  const AlertIcon = alertInfo.icon;
  const CategoryIcon = getCategoryIcon(budget.category);
  const barColor = percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-orange-500' : 'bg-green-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/budget-alerts')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('budgetAlerts.detailsTitle')}</h1>
            <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('budgetAlerts.detailsSubtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/budget-alerts/edit/${budget._id}`)}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
          >
            <Edit2 className="w-4 h-4" /> {t('common.edit')}
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 text-white px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <CategoryIcon className="w-8 h-8" />
              <div>
                <p className="text-xs opacity-80">{t('budgetAlerts.category')}</p>
                <p className="text-xl font-bold">{categoryOptions[budget.category]?.label || budget.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">{t('budgetAlerts.monthlyLimit')}</p>
              <p className="text-2xl font-bold">{formatCurrency(budget.monthlyLimit)}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Alert Status */}
          <div className={`p-4 rounded-xl flex items-center gap-3 border`} style={{ background: alertInfo.bg, borderColor: alertInfo.text }}>
            <AlertIcon className="w-5 h-5" style={{ color: alertInfo.text }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: alertInfo.text }}>{t('common.status')}: {alertInfo.label}</p>
              <p className="text-xs" style={{ color: alertInfo.text }}>{alertInfo.message}</p>
            </div>
          </div>


          {/* Budget Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('budgetAlerts.currentSpend')}</p>
              <p className="text-2xl font-bold" style={{ color: '#FF6F00' }}>{formatCurrency(budget.currentSpend || 0)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('budgetAlerts.remainingBudget')}</p>
              <p className="text-2xl font-bold" style={{ color: '#2E7D32' }}>{formatCurrency(budget.remainingBudget || 0)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('budgetAlerts.utilization')}</p>
              <p className="text-2xl font-bold" style={{ color: '#1976D2' }}>{percentage}%</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t" style={{ borderColor: '#E8F5E9' }}>
            <div>
              <p className="text-xs mb-1" style={{ color: '#8D6E63' }}>{t('budgetAlerts.category')}</p>
              <p className="text-base font-semibold" style={{ color: '#2E7D32' }}>{categoryOptions[budget.category]?.label || budget.category}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#8D6E63' }}>{t('budgetAlerts.month')}</p>
              <p className="text-base" style={{ color: '#5D4037' }}>{formatMonth(budget.month)}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#8D6E63' }}>{t('budgetAlerts.alertThreshold')}</p>
              <p className="text-base" style={{ color: '#5D4037' }}>{budget.alertThreshold || 80}%</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#8D6E63' }}>{t('budgetAlerts.createdOn')}</p>
              <p className="text-base" style={{ color: '#5D4037' }}>{new Date(budget.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#8D6E63' }}>{t('budgetAlerts.lastUpdated')}</p>
              <p className="text-base" style={{ color: '#5D4037' }}>{new Date(budget.updatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#8D6E63' }}>{t('budgetAlerts.createdBy')}</p>
              <p className="text-base" style={{ color: '#5D4037' }}>{budget.createdBy?.name || t('common.system')}</p>
            </div>
          </div>

          {/* Notes */}
          {budget.notes && (
            <div className="pt-4 border-t" style={{ borderColor: '#E8F5E9' }}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" style={{ color: '#8D6E63' }} />
                <p className="text-sm font-medium" style={{ color: '#5D4037' }}>{t('common.notes')}</p>
              </div>
              <p className="text-sm" style={{ color: '#5D4037' }}>{budget.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-xl" style={{ background: '#E3F2FD', border: '1px solid #BBDEFB' }}>
        <p className="text-sm" style={{ color: '#1565C0' }}>
          <strong>💡 {t('common.tip')}:</strong> {t('budgetAlerts.tipMessage', { threshold: budget.alertThreshold || 80 })}
        </p>
      </div>
    </div>
  );
};

export default ViewBudget;
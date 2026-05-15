// // src/pages/budgetalerts/BudgetAlerts.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   AlertCircle, Wallet, DollarSign, TrendingUp, TrendingDown,
//   Plus, Download, RefreshCw, Loader, CheckCircle,
//   Calendar, Edit2, Eye
// } from 'lucide-react';
// import BASE_URL from '../../config/Config';

// const BudgetAlerts = () => {
//   const navigate = useNavigate();
//   const [budgets, setBudgets] = useState([]);
//   const [status, setStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

//   const categoryOptions = {
//     transport_logistics: 'Transport & Logistics',
//     labour_wages: 'Labour & Wages',
//     market_fees: 'Market Fees',
//     storage_cold_chain: 'Storage & Cold Chain',
//     shop_office: 'Shop & Office',
//     repairs_maintenance: 'Repairs & Maintenance',
//     banking_finance: 'Banking & Finance',
//     marketing_misc: 'Marketing & Miscellaneous'
//   };

//   const getToken = () => localStorage.getItem('token');

//   const fetchBudgets = useCallback(async () => {
//     try {
//       const token = getToken();
//       const response = await fetch(`${BASE_URL}/budget-alerts?month=${selectedMonth}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       const data = await response.json();
//       if (data.success) {
//         setBudgets(data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching budgets:', error);
//     }
//   }, [selectedMonth, navigate]);

//   const fetchBudgetStatus = useCallback(async () => {
//     try {
//       const token = getToken();
//       const response = await fetch(`${BASE_URL}/budget-alerts/status?month=${selectedMonth}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       const data = await response.json();
//       if (data.success) {
//         setStatus(data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching budget status:', error);
//       setError('Failed to load budget status');
//     }
//   }, [selectedMonth, navigate]);

//   const fetchAllData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     await Promise.all([fetchBudgets(), fetchBudgetStatus()]);
//     setLoading(false);
//   }, [fetchBudgets, fetchBudgetStatus]);

//   useEffect(() => {
//     fetchAllData();
//   }, [fetchAllData, selectedMonth]);

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchAllData();
//     setRefreshing(false);
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency', currency: 'INR', minimumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   const getAlertLevelColor = (level) => {
//     switch(level) {
//       case 'critical': return { bg: '#FFEBEE', text: '#D32F2F', icon: AlertCircle, label: 'Critical' };
//       case 'warning': return { bg: '#FFF3E0', text: '#FF6F00', icon: TrendingUp, label: 'Warning' };
//       default: return { bg: '#E8F5E9', text: '#2E7D32', icon: CheckCircle, label: 'Normal' };
//     }
//   };

//   if (loading && budgets.length === 0 && !status) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
//         <span className="ml-2" style={{ color: '#2E7D32' }}>Loading budget alerts...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Budget Alerts</h1>
//           <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Set monthly budget limits and track expenses</p>
//         </div>
//         <div className="flex gap-2">
//           <div className="flex items-center gap-2">
//             <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
//             <input
//               type="month"
//               value={selectedMonth}
//               onChange={(e) => setSelectedMonth(e.target.value)}
//               className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
//               style={{ borderColor: '#C8E6C9' }}
//             />
//           </div>
//           <button onClick={handleRefresh} disabled={refreshing} 
//             className="px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-all hover:scale-105"
//             style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
//             <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
//           </button>
//           <button 
//             onClick={() => navigate('/budget-alerts/add')}
//             className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
//             style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//           >
//             <Plus className="w-4 h-4" /> Set Budget
//           </button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       {status && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <div className="bg-white rounded-xl p-4 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs" style={{ color: '#8D6E63' }}>Total Budget</p>
//                 <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(status.summary?.totalBudget)}</p>
//               </div>
//               <Wallet className="w-8 h-8" style={{ color: '#43A047' }} />
//             </div>
//           </div>
//           <div className="bg-white rounded-xl p-4 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs" style={{ color: '#8D6E63' }}>Total Spend</p>
//                 <p className="text-2xl font-bold mt-1" style={{ color: '#FF6F00' }}>{formatCurrency(status.summary?.totalSpend)}</p>
//               </div>
//               <TrendingDown className="w-8 h-8" style={{ color: '#D32F2F' }} />
//             </div>
//           </div>
//           <div className="bg-white rounded-xl p-4 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs" style={{ color: '#8D6E63' }}>Remaining Budget</p>
//                 <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(status.summary?.remainingBudget)}</p>
//               </div>
//               <TrendingUp className="w-8 h-8" style={{ color: '#2E7D32' }} />
//             </div>
//           </div>
//           <div className="bg-white rounded-xl p-4 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs" style={{ color: '#8D6E63' }}>Utilization</p>
//                 <p className="text-2xl font-bold mt-1" style={{ color: '#1976D2' }}>{status.summary?.utilizationPercentage}%</p>
//               </div>
//               <AlertCircle className="w-8 h-8" style={{ color: '#1976D2' }} />
//             </div>
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
//           <AlertCircle className="w-5 h-5 text-red-500" />
//           <span className="text-sm text-red-600">{error}</span>
//           <button onClick={fetchAllData} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
//         </div>
//       )}

//       {/* Budgets List Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
//                 <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Category</th>
//                 <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Monthly Limit</th>
//                 <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Current Spend</th>
//                 <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Remaining</th>
//                 <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Usage</th>
//                 <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Status</th>
//                 <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Alert Threshold</th>
//                 <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {budgets.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="text-center py-12">
//                     <Wallet className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
//                     <p className="text-sm" style={{ color: '#8D6E63' }}>No budget set for this month. Click "Set Budget" to create one.</p>
//                    </td>
//                  </tr>
//               ) : (
//                 budgets.map((budget, index) => {
//                   const alertLevel = getAlertLevelColor(budget.alertLevel || 'normal');
//                   const AlertIcon = alertLevel.icon;
//                   const percentage = budget.percentageUsed || 0;
//                   const barColor = percentage >= 90 ? 'bg-red-500' : percentage >= 75 ? 'bg-orange-500' : 'bg-green-500';
                  
//                   return (
//                     <tr 
//                       key={budget._id} 
//                       className="hover:bg-green-50 transition-colors"
//                       style={{ borderBottom: index !== budgets.length - 1 ? '1px solid #E8F5E9' : 'none' }}
//                     >
//                       <td className="px-6 py-4 text-sm font-medium" style={{ color: '#2E7D32' }}>
//                         {categoryOptions[budget.category] || budget.category}
//                       </td>
//                       <td className="px-6 py-4 text-right text-sm font-semibold" style={{ color: '#2E7D32' }}>
//                         {formatCurrency(budget.monthlyLimit)}
//                       </td>
//                       <td className="px-6 py-4 text-right text-sm font-semibold" style={{ color: '#FF6F00' }}>
//                         {formatCurrency(budget.currentSpend || 0)}
//                       </td>
//                       <td className="px-6 py-4 text-right text-sm" style={{ color: '#5D4037' }}>
//                         {formatCurrency(budget.remainingBudget || 0)}
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
//                             <div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
//                           </div>
//                           <span className="text-xs w-12" style={{ color: '#8D6E63' }}>{percentage}%</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-center">
//                         <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ background: alertLevel.bg, color: alertLevel.text }}>
//                           <AlertIcon className="w-3 h-3" />
//                           {alertLevel.label}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-center text-sm" style={{ color: '#5D4037' }}>
//                         {budget.alertThreshold || 80}%
//                       </td>
//                       <td className="px-6 py-4 text-center">
//                         <div className="flex justify-center gap-2">
//                           <button 
//                             onClick={() => navigate(`/budget-alerts/edit/${budget._id}`)}
//                             className="p-1 rounded hover:bg-gray-100 transition-colors" 
//                             title="Edit Budget"
//                           >
//                             <Edit2 className="w-4 h-4" style={{ color: '#FF6F00' }} />
//                           </button>
//                           <button 
//                             onClick={() => navigate(`/budget-alerts/view/${budget._id}`)}
//                             className="p-1 rounded hover:bg-gray-100 transition-colors" 
//                             title="View Details"
//                           >
//                             <Eye className="w-4 h-4" style={{ color: '#2E7D32' }} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BudgetAlerts;






// src/pages/budgetalerts/BudgetAlerts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  AlertCircle, Wallet, DollarSign, TrendingUp, TrendingDown,
  Plus, Download, RefreshCw, Loader, CheckCircle,
  Calendar, Edit2, Eye, MoreVertical, Trash2, X, Search
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const BudgetAlerts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 1
  });
  
  // Action menu states
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedBudgetForMenu, setSelectedBudgetForMenu] = useState(null);

  const categoryOptions = [
    { value: 'transport_logistics', labelKey: 'expenses.categories.transport' },
    { value: 'labour_wages', labelKey: 'expenses.categories.labour' },
    { value: 'market_fees', labelKey: 'expenses.categories.marketFees' },
    { value: 'storage_cold_chain', labelKey: 'expenses.categories.storage' },
    { value: 'shop_office', labelKey: 'expenses.categories.shopOffice' },
    { value: 'repairs_maintenance', labelKey: 'expenses.categories.repairs' },
    { value: 'banking_finance', labelKey: 'expenses.categories.banking' },
    { value: 'marketing_misc', labelKey: 'expenses.categories.marketing' }
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getToken = () => localStorage.getItem('token');

  const fetchBudgets = useCallback(async () => {
    try {
      const token = getToken();
      const queryParams = new URLSearchParams({
        month: selectedMonth,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
      
      const response = await fetch(`${BASE_URL}/budget-alerts?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setBudgets(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 1
        }));
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  }, [selectedMonth, navigate, pagination.page, pagination.limit, debouncedSearchTerm]);

  const fetchBudgetStatus = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/budget-alerts/status?month=${selectedMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching budget status:', error);
      setError(t('budgetAlerts.errors.statusLoadFailed'));
    }
  }, [selectedMonth, navigate, t]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchBudgets(), fetchBudgetStatus()]);
    setLoading(false);
  }, [fetchBudgets, fetchBudgetStatus]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, selectedMonth, pagination.page, pagination.limit, debouncedSearchTerm]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getAlertLevelColor = (level) => {
    switch(level) {
      case 'critical': return { bg: '#FFEBEE', text: '#D32F2F', icon: AlertCircle, label: t('budgetAlerts.alertLevels.critical') };
      case 'warning': return { bg: '#FFF3E0', text: '#FF6F00', icon: TrendingUp, label: t('budgetAlerts.alertLevels.warning') };
      default: return { bg: '#E8F5E9', text: '#2E7D32', icon: CheckCircle, label: t('budgetAlerts.alertLevels.normal') };
    }
  };

  const getCategoryLabel = (categoryValue) => {
    const found = categoryOptions.find(c => c.value === categoryValue);
    return found ? t(found.labelKey) : categoryValue?.replace(/_/g, ' ') || 'Other';
  };

  const handleActionMenuOpen = (event, budget) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedBudgetForMenu(budget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedBudgetForMenu(null);
  };

  // Smart dropdown positioning
  const MENU_HEIGHT = 120;
  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  if (loading && budgets.length === 0 && !status) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('budgetAlerts.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('budgetAlerts.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('budgetAlerts.subtitle')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      {status && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>{t('budgetAlerts.stats.totalBudget')}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(status.summary?.totalBudget)}</p>
              </div>
              <Wallet className="w-8 h-8" style={{ color: '#43A047' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>{t('budgetAlerts.stats.totalSpend')}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#FF6F00' }}>{formatCurrency(status.summary?.totalSpend)}</p>
              </div>
              <TrendingDown className="w-8 h-8" style={{ color: '#D32F2F' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>{t('budgetAlerts.stats.remainingBudget')}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(status.summary?.remainingBudget)}</p>
              </div>
              <TrendingUp className="w-8 h-8" style={{ color: '#2E7D32' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>{t('budgetAlerts.stats.utilization')}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1976D2' }}>{status.summary?.utilizationPercentage}%</p>
              </div>
              <AlertCircle className="w-8 h-8" style={{ color: '#1976D2' }} />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchAllData} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
        </div>
      )}

      {/* Search and Action Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
              <input
                type="text"
                placeholder={t('budgetAlerts.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1"
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
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{ borderColor: '#C8E6C9' }}
              />
            </div>
            {/* <button onClick={handleRefresh} disabled={refreshing} 
              className="px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-all hover:scale-105"
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> {t('common.refresh')}
            </button> */}
            <button 
              onClick={() => navigate('/budget-alerts/add')}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <Plus className="w-4 h-4" /> {t('budgetAlerts.buttons.setBudget')}
            </button>
          </div>
        </div>
      </div>

      {/* Budgets List Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('budgetAlerts.noBudgetsFound')}</p>
            <button 
              onClick={() => navigate('/budget-alerts/add')}
              className="mt-2 text-sm text-[#2E7D32] hover:underline"
            >
              {t('budgetAlerts.buttons.setBudget')}
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('budgetAlerts.table.category')}</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('budgetAlerts.table.monthlyLimit')}</th>
                    {/* <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('budgetAlerts.table.currentSpend')}</th> */}
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('budgetAlerts.table.remaining')}</th>
                   
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('budgetAlerts.table.status')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('budgetAlerts.table.alertThreshold')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('budgetAlerts.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((budget, index) => {
                    const alertLevel = getAlertLevelColor(budget.alertLevel || 'normal');
                    const AlertIcon = alertLevel.icon;
                    const percentage = budget.percentageUsed || 0;
                    const barColor = percentage >= 90 ? 'bg-red-500' : percentage >= 75 ? 'bg-orange-500' : 'bg-green-500';
                    const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedBudgetForMenu?._id === budget._id;
                    
                    return (
                      <tr 
                        key={budget._id} 
                        className="hover:bg-green-50 transition-colors"
                        style={{ borderBottom: index !== budgets.length - 1 ? '1px solid #E8F5E9' : 'none' }}
                      >
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: '#2E7D32' }}>
                          {getCategoryLabel(budget.category)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold" style={{ color: '#2E7D32' }}>
                          {formatCurrency(budget.monthlyLimit)}
                        </td>
                        {/* <td className="px-6 py-4 text-right text-sm font-semibold" style={{ color: '#FF6F00' }}>
                          {formatCurrency(budget.currentSpend || 0)}
                        </td> */}
                        <td className="px-6 py-4 text-right text-sm" style={{ color: '#5D4037' }}>
                          {formatCurrency(budget.remainingBudget || 0)}
                        </td>
                       
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ background: alertLevel.bg, color: alertLevel.text }}>
                            <AlertIcon className="w-3 h-3" />
                            {alertLevel.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm" style={{ color: '#5D4037' }}>
                          {budget.alertThreshold || 80}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={(e) => handleActionMenuOpen(e, budget)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
                            style={{ color: '#2E7D32' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="text-xs font-medium">{t('common.actions')}</span>
                          </button>

                          {isActionMenuOpen && anchorRect && (
                            <div
                              className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
                              style={{
                                borderColor: '#E8F5E9',
                                width: '160px',
                                position: 'fixed',
                                top: openUpward
                                  ? anchorRect.top - MENU_HEIGHT - 4
                                  : anchorRect.bottom + 4,
                                left: anchorRect.left - 100,
                              }}
                            >
                              <button
                                onClick={() => {
                                  navigate(`/budget-alerts/view/${budget._id}`);
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
                                  navigate(`/budget-alerts/edit/${budget._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 transition-colors border-t"
                                style={{ color: '#FF6F00', borderColor: '#E8F5E9' }}
                              >
                                <Edit2 className="w-4 h-4" />
                                {t('budgetAlerts.buttons.editBudget')}
                              </button>
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
                  {t('budgetAlerts.pagination.showing', {
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
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
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
    </div>
  );
};

export default BudgetAlerts;
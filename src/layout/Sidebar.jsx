// src/layout/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  TrendingUp,
  ShoppingCart,
  Package,
  FileText,
  Wallet,
  Settings,
  LogOut,
  Sparkles,
  X,
  ShoppingBag,
  UserCog,
  Building,
  Bell,
  Receipt,
  Loader,
  History
} from "lucide-react";
import BASE_URL from '../config/Config';

const Sidebar = ({ isMobileOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Fetch today's profit/loss summary
  const fetchTodaySummary = async () => {
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!token || isLoggedIn !== 'true') {
      return;
    }

    setLoadingSummary(true);
    setSummaryError(null);

    try {
      const today = getTodayDate();
      const response = await fetch(`${BASE_URL}/reports/profit-loss?startDate=${today}&endDate=${today}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.clear();
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSummaryData(data.data);
      } else {
        setSummaryError(data.message || 'Failed to fetch summary');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummaryError('Network error');
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchTodaySummary();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    if (onClose && isMobileOpen) {
      onClose();
    }
  }, [location.pathname, onClose, isMobileOpen]);

  const menuItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
      isActive ? "text-white" : "text-gray-400 hover:text-white"
    }`;

  const activeStyle = {
    background: 'linear-gradient(135deg, #2E7D32, #43A047)',
    boxShadow: '0 0 20px rgba(46, 125, 50, 0.3)'
  };

  const mainMenu = [
    { path: "/dashboard", name: t('nav.dashboard'), icon: LayoutDashboard },
    { path: "/farmers", name: t('nav.farmers'), icon: Users },
     { path: "/products", name: t('nav.products'), icon: Package },
    { path: "/purchases", name: t('nav.purchases'), icon: ShoppingCart },
    { path: "/payments", name: t('nav.payments'), icon: CreditCard },
    { path: "/inventory", name: t('nav.inventory'), icon: Package },
    { path: "/warehouses", name: t('nav.warehouses'), icon: Users },
     { path: "/buyers", name: t('nav.buyers'), icon: ShoppingBag },
    { path: "/sales", name: t('nav.sales'), icon: ShoppingBag },
    { path: "/expenses", name: t('nav.expenses'), icon: Wallet },
    { path: "/ledger", name: t('nav.ledger'), icon: Receipt },
    { path: "/budget-alerts", name: t('nav.budgetAlerts'), icon: Bell },
    { path: "/audit-logs", name: t('nav.auditLogs'), icon: History },
    { path: "/users", name: t('nav.usersRoles'), icon: UserCog },
  ];

  const sidebarContent = (
    <aside className="h-full flex flex-col overflow-y-auto scrollbar-hide" style={{ background: '#1B3A1F' }}>
      {/* Header with Logo and Close Button for Mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b" style={{ borderColor: '#2E5A32' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4CAF50, #66BB6A)' }}>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">AgriBroker</span>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Gradient Border Top - Desktop only */}
      <div className="hidden lg:block h-1 w-full" style={{ background: 'linear-gradient(90deg, #FF6F00, #FF8F00, #FF6F00)' }}></div>

      {/* Today's Summary Card */}
      <div className="mx-3 sm:mx-5 mt-4 mb-6 p-3 rounded-xl" style={{ background: 'rgba(255, 111, 0, 0.15)', border: '1px solid rgba(255, 111, 0, 0.3)' }}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4" style={{ color: '#FF8F00' }} />
          <span className="text-xs font-bold" style={{ color: '#FF8F00' }}>{t('sidebar.todaySummary')}</span>
        </div>
        
        {loadingSummary ? (
          <div className="flex justify-center py-4">
            <Loader className="w-5 h-5 animate-spin" style={{ color: '#FF8F00' }} />
          </div>
        ) : summaryError ? (
          <div className="text-center py-2">
            <p className="text-[10px]" style={{ color: '#FF6F00' }}>{t('common.error')}</p>
            <button 
              onClick={fetchTodaySummary}
              className="text-[9px] mt-1 hover:underline"
              style={{ color: '#FF8F00' }}
            >
              {t('common.retry')}
            </button>
          </div>
        ) : summaryData ? (
          <>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] text-gray-400">{t('sidebar.purchases')}</p>
                <p className="text-white font-bold text-sm">{formatCurrency(summaryData.totalPurchases || 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400">{t('sidebar.expenses')}</p>
                <p className="text-white font-bold text-sm">{formatCurrency(summaryData.totalExpenses || 0)}</p>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255, 111, 0, 0.3)' }}>
              <div className="flex justify-between">
                <span className="text-[10px] text-gray-400">{t('sidebar.netProfitLoss')}</span>
                <span className={`text-xs font-bold ${(summaryData.netProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(summaryData.netProfit || 0) >= 0 ? '+' : ''}{formatCurrency(summaryData.netProfit || 0)}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-400">{t('sidebar.profitMargin')}</span>
                <span className={`text-xs font-bold ${summaryData.profitMargin !== '0%' && summaryData.profitMargin !== '-0%' && parseFloat(summaryData.profitMargin) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {summaryData.profitMargin || '0%'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-[10px] text-gray-400">{t('common.noData')}</p>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="px-3 sm:px-5 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-4 px-3" style={{ color: '#FF8F00' }}>
          <span className="inline-block w-1 h-1 rounded-full mr-2" style={{ background: '#FF6F00' }}></span>
          {t('nav.mainNav')}
        </p>
        <nav className="space-y-1">
          {mainMenu.map((item) => {
            const Icon = item.icon;
            
            return (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={menuItemClass}
                style={({ isActive }) => isActive ? activeStyle : {}}
                onClick={onClose}
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="px-3 sm:px-5 mb-6">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-white/5" style={{ color: '#D84315' }}>
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-medium">{t('common.logout')}</span>
        </button>
      </div>
    </aside>
  );

  // For mobile: render as drawer
  if (isMobileOpen !== undefined) {
    return (
      <div className={`fixed top-0 left-0 bottom-0 w-72 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>
    );
  }

  // For desktop: render as fixed sidebar
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-72 hidden lg:block">
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;
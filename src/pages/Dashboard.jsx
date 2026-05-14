// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Leaf, TrendingUp, DollarSign, Users, ShoppingCart, 
  Calendar, Award, Eye, Download, ChevronRight, 
  TrendingDown, Package, CheckCircle, Clock, XCircle,
  ArrowUp, ArrowDown, MoreVertical, RefreshCw,
  BarChart3, PieChart, Activity, Wallet, Truck, Zap,
  Bell, AlertCircle, TrendingUp as TrendUp, 
  TrendingDown as TrendDown, ChevronLeft, Maximize2,
  Download as DownloadIcon, Filter, Settings, Trophy
} from 'lucide-react';
import BASE_URL from '../config/Config';

const Dashboard = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedChart, setSelectedChart] = useState('line');
  const [showAlerts, setShowAlerts] = useState(true);
  
  // State for API data
  const [statsData, setStatsData] = useState({
    totalFarmers: 0,
    totalPayments: 0,
    totalWarehouses: 0,
    totalRevenue: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [buyersSummary, setBuyersSummary] = useState({
    totalBuyers: 0,
    activeBuyers: 0,
    totalPurchaseValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sample data for graphs
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    purchase: [85000, 92000, 78000, 105000, 125000, 145000, 135000],
    sale: [110000, 125000, 98000, 142000, 185000, 210000, 195000]
  };

  const monthlyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    purchase: [450000, 520000, 580000, 620000],
    sale: [680000, 750000, 820000, 890000]
  };

  const alerts = [
    { id: 1, type: 'warning', title: 'Low Stock Alert', message: 'Wheat stock is below 500kg', time: '5 min ago', icon: AlertCircle, color: '#FF6F00' },
    { id: 2, type: 'success', title: 'Payment Received', message: '₹25,000 received from Suresh Patel', time: '15 min ago', icon: DollarSign, color: '#4CAF50' },
    { id: 3, type: 'info', title: 'New Order', message: 'New order placed by AgriCorp Ltd', time: '1 hour ago', icon: ShoppingCart, color: '#2196F3' },
    { id: 4, type: 'warning', title: 'Price Alert', message: 'Rice prices increased by 5%', time: '2 hours ago', icon: TrendingUp, color: '#FF6F00' },
  ];

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');

  const isAuthenticated = () => {
    const token = getToken();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!token || isLoggedIn !== 'true') {
      return false;
    }
    return true;
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Fetch Farmers Count
  const fetchFarmers = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/farmers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        return null;
      }

      const data = await response.json();
      if (data.success) {
        return data.pagination?.total || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching farmers:', error);
      return 0;
    }
  };

  // Fetch Payments Total and Recent Payments
  const fetchPayments = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        return { total: 0, recent: [] };
      }

      const data = await response.json();
      if (data.success) {
        // Get all payments and sort by createdAt (newest first)
        const allPayments = data.data || [];
        const sortedPayments = allPayments.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        // Take only the latest 5 payments
        const latest5Payments = sortedPayments.slice(0, 5);
        
        return {
          total: data.summary?.totalAmount || 0,
          recent: latest5Payments
        };
      }
      return { total: 0, recent: [] };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return { total: 0, recent: [] };
    }
  };

  // Fetch Warehouses Count
  const fetchWarehouses = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/warehouse`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        return 0;
      }

      const data = await response.json();
      if (data.success && data.pagination) {
        return data.pagination.total || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      return 0;
    }
  };

  // Fetch Sales Revenue
  const fetchSalesRevenue = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/sales`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        return 0;
      }

      const data = await response.json();
      if (data.success && data.data) {
        // Calculate total revenue from all sales
        const totalRevenue = data.data.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
        return totalRevenue;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching sales revenue:', error);
      return 0;
    }
  };

  // Fetch Buyers Summary and Top Buyers
  const fetchBuyersSummary = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/buyers/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        return { topBuyers: [], summary: { totalBuyers: 0, activeBuyers: 0, totalPurchaseValue: 0 } };
      }

      const data = await response.json();
      if (data.success) {
        return {
          topBuyers: data.data?.topBuyers || [],
          summary: {
            totalBuyers: data.data?.totalBuyers || 0,
            activeBuyers: data.data?.activeBuyers || 0,
            totalPurchaseValue: data.data?.totalPurchaseValue || 0
          }
        };
      }
      return { topBuyers: [], summary: { totalBuyers: 0, activeBuyers: 0, totalPurchaseValue: 0 } };
    } catch (error) {
      console.error('Error fetching buyers summary:', error);
      return { topBuyers: [], summary: { totalBuyers: 0, activeBuyers: 0, totalPurchaseValue: 0 } };
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [farmersCount, paymentsData, warehousesCount, revenueTotal, buyersData] = await Promise.all([
        fetchFarmers(),
        fetchPayments(),
        fetchWarehouses(),
        fetchSalesRevenue(),
        fetchBuyersSummary()
      ]);
      
      setStatsData({
        totalFarmers: farmersCount,
        totalPayments: paymentsData.total,
        totalWarehouses: warehousesCount,
        totalRevenue: revenueTotal
      });
      
      setRecentPayments(paymentsData.recent || []);
      setTopBuyers(buyersData.topBuyers || []);
      setBuyersSummary(buyersData.summary);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  // Get status color based on payment mode or status
  const getStatusColor = (paymentMode) => {
    switch(paymentMode?.toLowerCase()) {
      case 'cash':
        return 'bg-green-100 text-green-700';
      case 'online':
        return 'bg-blue-100 text-blue-700';
      case 'bank':
        return 'bg-purple-100 text-purple-700';
      case 'cheque':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = [
    { 
      title: 'Total Farmers', 
      value: formatNumber(statsData.totalFarmers), 
      change: "+12", 
      changeType: "increase",
      icon: Leaf, 
      color: "#2E7D32",
      bgColor: "#E8F5E9",
      loading: loading
    },
    { 
      title: 'Total Payments', 
      value: formatCurrency(statsData.totalPayments), 
      change: "+5", 
      changeType: "increase",
      icon: Users, 
      color: "#43A047",
      bgColor: "#E8F5E9",
      loading: loading
    },
    { 
      title: 'Total Warehouses', 
      value: formatNumber(statsData.totalWarehouses), 
      change: "+8%", 
      changeType: "increase",
      icon: ShoppingCart, 
      color: "#FF6F00",
      bgColor: "#FFF3E0",
      loading: loading
    },
    { 
      title: 'Total Revenue', 
      value: formatCurrency(statsData.totalRevenue), 
      change: "+15%", 
      changeType: "increase",
      icon: DollarSign, 
      color: "#FF8F00",
      bgColor: "#FFF3E0",
      loading: loading
    },
  ];

  // Custom Line Chart Component
  const LineChart = ({ data, type }) => {
    const chartData = selectedPeriod === 'week' ? weeklyData : monthlyData;
    const maxValue = Math.max(...chartData.purchase, ...chartData.sale);
    const height = 200;
    const width = 500;
    const padding = 40;
    
    const getPoints = (values) => {
      const step = (width - padding * 2) / (values.length - 1);
      return values.map((value, index) => {
        const x = padding + index * step;
        const y = height - padding - (value / maxValue) * (height - padding * 2);
        return `${x},${y}`;
      }).join(' ');
    };

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + (1 - ratio) * (height - padding * 2);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#E8F5E9" strokeWidth="1" strokeDasharray="4" />
              <text x={padding - 5} y={y} textAnchor="end" fontSize="10" fill="#8D6E63">
                ₹{(maxValue * ratio).toFixed(0)}
              </text>
            </g>
          );
        })}
        
        {/* Purchase Line */}
        <polyline
          points={getPoints(chartData.purchase)}
          fill="none"
          stroke="#2E7D32"
          strokeWidth="2.5"
          className="line-chart"
        />
        
        {/* Sale Line */}
        <polyline
          points={getPoints(chartData.sale)}
          fill="none"
          stroke="#FF6F00"
          strokeWidth="2.5"
          className="line-chart"
        />
        
        {/* Labels */}
        {chartData.labels.map((label, index) => {
          const step = (width - padding * 2) / (chartData.labels.length - 1);
          const x = padding + index * step;
          return (
            <text key={index} x={x} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#8D6E63">
              {label}
            </text>
          );
        })}
      </svg>
    );
  };

  if (loading && !statsData.totalFarmers && !statsData.totalRevenue) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: '#2E7D32' }} />
          <p style={{ color: '#8D6E63' }}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Get the top buyer (first one from the list)
  const topBuyer = topBuyers.length > 0 ? topBuyers[0] : null;

  return (
    <div className="space-y-6">
      {/* Header with Alerts Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Real-time trading insights and analytics</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-2 rounded-lg bg-white shadow-sm hover:shadow transition-all"
          >
            <Bell className="w-5 h-5" style={{ color: '#FF6F00' }} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ background: '#F44336' }}>
              4
            </span>
          </button>
          <button className="p-2 rounded-lg bg-white shadow-sm hover:shadow transition-all">
            <DownloadIcon className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <button className="p-2 rounded-lg bg-white shadow-sm hover:shadow transition-all">
            <Filter className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-white shadow-sm hover:shadow transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} style={{ color: '#2E7D32' }} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchDashboardData} className="ml-auto text-sm text-red-600 hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isIncrease = stat.changeType === 'increase';
          return (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
              style={{ borderLeft: `4px solid ${stat.color}` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>{stat.title}</p>
                  {stat.loading ? (
                    <div className="mt-2">
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold mt-2" style={{ color: '#1B5E20' }}>{stat.value}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    {isIncrease ? (
                      <TrendUp className="w-3 h-3" style={{ color: '#4CAF50' }} />
                    ) : (
                      <TrendDown className="w-3 h-3" style={{ color: '#F44336' }} />
                    )}
                    <span className="text-xs font-medium" style={{ color: isIncrease ? '#4CAF50' : '#F44336' }}>
                      {stat.change}
                    </span>
                    <span className="text-xs" style={{ color: '#8D6E63' }}>from yesterday</span>
                  </div>
                </div>
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: stat.bgColor }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E8F5E9' }}>
            <div>
              <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>Revenue Overview</h3>
              <p className="text-xs mt-1" style={{ color: '#8D6E63' }}>Purchase vs Sale trend analysis</p>
            </div>
            <div className="flex gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['week', 'month'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      selectedPeriod === period 
                        ? 'text-white' 
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    style={selectedPeriod === period ? { background: 'linear-gradient(135deg, #2E7D32, #43A047)' } : {}}
                  >
                    {period === 'week' ? 'Weekly' : 'Monthly'}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => setSelectedChart('line')}
                  className={`p-1.5 rounded transition-all ${selectedChart === 'line' ? 'bg-green-50' : 'hover:bg-gray-100'}`}
                  style={selectedChart === 'line' ? { background: '#E8F5E9' } : {}}
                >
                  <TrendUp className="w-4 h-4" style={{ color: selectedChart === 'line' ? '#2E7D32' : '#8D6E63' }} />
                </button>
                <button 
                  onClick={() => setSelectedChart('bar')}
                  className={`p-1.5 rounded transition-all ${selectedChart === 'bar' ? 'bg-green-50' : 'hover:bg-gray-100'}`}
                  style={selectedChart === 'bar' ? { background: '#E8F5E9' } : {}}
                >
                  <BarChart3 className="w-4 h-4" style={{ color: selectedChart === 'bar' ? '#2E7D32' : '#8D6E63' }} />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {selectedChart === 'line' ? (
              <LineChart data={selectedPeriod === 'week' ? weeklyData : monthlyData} />
            ) : (
              <div className="space-y-4">
                {(selectedPeriod === 'week' ? weeklyData : monthlyData).labels.map((label, idx) => {
                  const purchaseValue = (selectedPeriod === 'week' ? weeklyData.purchase[idx] : monthlyData.purchase[idx]);
                  const saleValue = (selectedPeriod === 'week' ? weeklyData.sale[idx] : monthlyData.sale[idx]);
                  const maxValue = Math.max(...(selectedPeriod === 'week' ? [...weeklyData.purchase, ...weeklyData.sale] : [...monthlyData.purchase, ...monthlyData.sale]));
                  
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: '#8D6E63' }}>{label}</span>
                        <div className="flex gap-3">
                          <span style={{ color: '#2E7D32' }}>Purchase: ₹{purchaseValue.toLocaleString()}</span>
                          <span style={{ color: '#FF6F00' }}>Sale: ₹{saleValue.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-8">
                        <div 
                          className="rounded transition-all duration-500 relative group"
                          style={{ width: `${(purchaseValue / maxValue) * 100}%`, background: '#2E7D32' }}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            ₹{purchaseValue.toLocaleString()}
                          </div>
                        </div>
                        <div 
                          className="rounded transition-all duration-500 relative group"
                          style={{ width: `${(saleValue / maxValue) * 100}%`, background: '#FF6F00' }}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            ₹{saleValue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Chart Legend */}
            <div className="flex justify-center gap-6 mt-6 pt-4 border-t" style={{ borderColor: '#E8F5E9' }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#2E7D32' }}></div>
                <span className="text-xs" style={{ color: '#8D6E63' }}>Purchase</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#FF6F00' }}></div>
                <span className="text-xs" style={{ color: '#8D6E63' }}>Sale</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs opacity-90">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(statsData.totalRevenue)}</p>
                <p className="text-xs mt-2 opacity-80">+32% from last month</p>
              </div>
              <Wallet className="w-8 h-8 opacity-90" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-sm" style={{ color: '#1B5E20' }}>Today's Performance</h4>
              <Activity className="w-4 h-4" style={{ color: '#FF6F00' }} />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: '#8D6E63' }}>Purchase Target</span>
                  <span style={{ color: '#2E7D32' }}>65%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '65%', background: '#2E7D32' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: '#8D6E63' }}>Sale Target</span>
                  <span style={{ color: '#FF6F00' }}>78%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '78%', background: '#FF6F00' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-sm" style={{ color: '#1B5E20' }}>Top Products</h4>
              <Award className="w-4 h-4" style={{ color: '#FF8F00' }} />
            </div>
            <div className="space-y-3">
              {[
                { name: 'Wheat', revenue: '₹2,45,000', growth: '+23%' },
                { name: 'Rice', revenue: '₹1,85,000', growth: '+18%' },
                { name: 'Corn', revenue: '₹1,20,000', growth: '+12%' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{item.name}</p>
                    <p className="text-xs" style={{ color: '#8D6E63' }}>{item.revenue}</p>
                  </div>
                  <span className="text-xs text-green-600">{item.growth}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions with Real Payments Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E8F5E9' }}>
            <div>
              <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>Recent Payments</h3>
              <p className="text-xs mt-1" style={{ color: '#8D6E63' }}>Latest 5 payment transactions</p>
            </div>
            <button className="text-sm flex items-center gap-1" style={{ color: '#2E7D32' }}>
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: '#E8F5E9' }}>
            {recentPayments.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
                <p className="text-sm" style={{ color: '#8D6E63' }}>No payments found</p>
              </div>
            ) : (
              recentPayments.map((payment) => (
                <div key={payment._id} className="px-6 py-3 hover:bg-green-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>
                        {payment.farmer?.name || 'Unknown Farmer'}
                      </p>
                      <p className="text-xs" style={{ color: '#8D6E63' }}>
                        {formatTime(payment.createdAt)} • {formatDate(payment.createdAt)} • {payment.paymentMode || 'N/A'}
                      </p>
                      {payment.referenceNumber && (
                        <p className="text-xs mt-1" style={{ color: '#8D6E63' }}>
                          Ref: {payment.referenceNumber}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: '#FF6F00' }}>
                        {formatCurrency(payment.amount)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(payment.paymentMode)}`}>
                        {payment.paymentMode?.toUpperCase() || 'COMPLETED'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Buyer Section - Replacing Today's Commission */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <p className="text-xs font-medium uppercase tracking-wider opacity-90">Top Buyer of the Month</p>
              </div>
              {topBuyer ? (
                <>
                  <p className="text-2xl font-bold mt-1">{topBuyer.displayName || topBuyer.name}</p>
                  <p className="text-sm mt-1 opacity-90">{topBuyer.businessName || 'Individual Buyer'}</p>
                </>
              ) : (
                <p className="text-xl font-bold mt-1">No buyers yet</p>
              )}
            </div>
            <Award className="w-8 h-8 text-yellow-300" />
          </div>
          
          {topBuyer && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white/20 backdrop-blur rounded-xl p-3">
                <p className="text-xs opacity-80">Total Purchases</p>
                <p className="text-xl font-semibold mt-1">{topBuyer.totalPurchases || 0}</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-xl p-3">
                <p className="text-xs opacity-80">Purchase Value</p>
                <p className="text-xl font-semibold mt-1">{formatCurrency(topBuyer.totalPurchaseValue || 0)}</p>
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-80">Total Buyers</span>
              <span className="font-semibold">{buyersSummary.totalBuyers}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="opacity-80">Active Buyers</span>
              <span className="font-semibold">{buyersSummary.activeBuyers}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="opacity-80">Total Purchase Value</span>
              <span className="font-semibold">{formatCurrency(buyersSummary.totalPurchaseValue)}</span>
            </div>
          </div>
          
          <button className="w-full mt-4 bg-white/20 backdrop-blur rounded-xl py-2 text-sm font-medium hover:bg-white/30 transition-all">
            View All Buyers
          </button>
        </div>
      </div>

      {/* CSS for line chart animation */}
      <style jsx>{`
        .line-chart {
          animation: drawLine 1.5s ease-out;
        }
        
        @keyframes drawLine {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
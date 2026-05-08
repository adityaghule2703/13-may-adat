// src/pages/purchase/Purchases.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Search, Filter, Eye, Edit2, 
  Plus, Download, RefreshCw, Loader, AlertCircle,
  Calendar, User, DollarSign, TrendingUp, X,
  Truck, Package, Wallet, CheckCircle, XCircle,
  Clock, Printer
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Purchases = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 1
  });
  const [stats, setStats] = useState({
    totalPurchases: 0,
    grossTotal: 0,
    totalDeductions: 0,
    finalPayable: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    status: 'all'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getToken = () => localStorage.getItem('token');

  const fetchPurchases = useCallback(async () => {
    const token = getToken();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!token || isLoggedIn !== 'true') {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      
      const response = await fetch(`${BASE_URL}/purchases?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setPurchases(data.data);
        setPagination(data.pagination);
        
        const grossTotal = data.data.reduce((sum, p) => sum + (p.grossTotal || 0), 0);
        const totalDeductions = data.data.reduce((sum, p) => sum + (p.totalDeductions || 0), 0);
        const finalPayable = data.data.reduce((sum, p) => sum + (p.finalPayable || 0), 0);
        
        setStats({ totalPurchases: data.pagination.total, grossTotal, totalDeductions, finalPayable });
      } else {
        setError(data.message || 'Failed to fetch purchases');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.startDate, filters.endDate, filters.status, navigate]);

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilters({ startDate: '', endDate: '', minAmount: '', maxAmount: '', status: 'all' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return { bg: '#E8F5E9', text: '#2E7D32', label: 'Completed', icon: CheckCircle };
      case 'saved': return { bg: '#FFF3E0', text: '#FF6F00', label: 'Saved', icon: Clock };
      case 'partial': return { bg: '#E3F2FD', text: '#1976D2', label: 'Partial', icon: TrendingUp };
      case 'cancelled': return { bg: '#FFEBEE', text: '#D32F2F', label: 'Cancelled', icon: XCircle };
      default: return { bg: '#E3F2FD', text: '#1976D2', label: status || 'Saved', icon: AlertCircle };
    }
  };

  // Handle Edit button click based on status
  const handleEditClick = (purchase) => {
    if (purchase.status === 'draft') {
      navigate(`/purchases/edit/${purchase._id}`);
    } else if (purchase.status === 'saved' || purchase.status === 'partial') {
      navigate(`/purchases/update-status/${purchase._id}`);
    } else {
      alert(`Cannot edit ${purchase.status} purchase. Only draft, saved, or partial purchases can be edited.`);
    }
  };

  // Get edit button title
  const getEditButtonTitle = (status) => {
    switch(status) {
      case 'draft': return 'Edit Purchase (Full Update)';
      case 'saved': return 'Update Status & Notes Only';
      case 'partial': return 'Update Status & Notes Only';
      default: return 'Cannot edit this purchase';
    }
  };

  if (loading && purchases.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading purchases...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Purchases</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Manage and track all purchase transactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setRefreshing(true); fetchPurchases().finally(() => setRefreshing(false)); }} disabled={refreshing}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:scale-105" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => navigate('/purchases/add')} className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
            <Plus className="w-4 h-4" /> New Purchase
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Total Purchases</p><p className="text-2xl font-bold text-green-800">{stats.totalPurchases}</p></div>
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Gross Total</p><p className="text-2xl font-bold text-green-800">{formatCurrency(stats.grossTotal)}</p></div>
            <DollarSign className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Total Deductions</p><p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalDeductions)}</p></div>
            <Wallet className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Final Payable</p><p className="text-2xl font-bold text-green-800">{formatCurrency(stats.finalPayable)}</p></div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchPurchases} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by farmer name, product, or receipt number..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#C8E6C9' }} />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-green-50' : 'hover:bg-gray-50'}`}
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <Filter className="w-4 h-4" /> Filters
              {(filters.startDate || filters.endDate || filters.status !== 'all') && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
            </button>
            <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div><label className="block text-xs font-medium text-green-800 mb-1">Start Date</label><input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }} /></div>
              <div><label className="block text-xs font-medium text-green-800 mb-1">End Date</label><input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }} /></div>
              <div><label className="block text-xs font-medium text-green-800 mb-1">Status</label><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }}><option value="all">All</option><option value="draft">Draft</option><option value="saved">Saved</option><option value="partial">Partial</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
              <div className="flex justify-end gap-2 items-end">
                <button onClick={clearFilters} className="px-3 py-2 border rounded-lg text-sm text-red-600" style={{ borderColor: '#C8E6C9' }}>Clear All</button>
                <button onClick={() => { setShowFilters(false); fetchPurchases(); }} className="px-3 py-2 rounded-lg text-white text-sm" style={{ background: '#2E7D32' }}>Apply Filters</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin text-green-700" /><span className="ml-2 text-green-700">Loading...</span></div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12"><ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-sm text-gray-500">No purchases found</p></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F1F8E9', borderBottom: '1px solid #C8E6C9' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-green-800">Receipt No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-green-800">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-green-800">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-green-800">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-green-800">Gross Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-green-800">Deductions</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-green-800">Final Payable</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-green-800">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-green-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase, index) => {
                    const statusColors = getStatusColor(purchase.status);
                    const StatusIcon = statusColors.icon;
                    const productNames = purchase.lines?.map(l => l.productName).join(', ') || '-';
                    return (
                      <tr key={purchase._id} className="hover:bg-green-50" style={{ borderBottom: index !== purchases.length - 1 ? '1px solid #E8F5E9' : 'none' }}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-green-800">{purchase.receiptNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{formatDate(purchase.purchaseDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-green-800">{purchase.farmer?.name || 'N/A'}</p>
                              {purchase.farmer?.mobile && <p className="text-xs text-gray-500">{purchase.farmer.mobile}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{productNames}</p>
                          <p className="text-xs text-gray-500">{purchase.lines?.length || 0} item(s)</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-green-800">{formatCurrency(purchase.grossTotal)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-red-600">- {formatCurrency(purchase.totalDeductions)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-orange-600">{formatCurrency(purchase.finalPayable)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ background: statusColors.bg, color: statusColors.text }}>
                            <StatusIcon className="w-3 h-3" />{statusColors.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {/* View Button */}
                            <button 
                              onClick={() => navigate(`/purchases/view/${purchase._id}`)} 
                              className="p-1 rounded hover:bg-gray-100" 
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-green-700" />
                            </button>
                            
                            {/* Edit / Update Status Button */}
                            <button 
                              onClick={() => handleEditClick(purchase)}
                              className="p-1 rounded hover:bg-gray-100" 
                              title={getEditButtonTitle(purchase.status)}
                            >
                              <Edit2 className="w-4 h-4 text-orange-500" />
                            </button>
                            
                            {/* Print Button */}
                            <button className="p-1 rounded hover:bg-gray-100" title="Print Invoice">
                              <Printer className="w-4 h-4 text-green-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                <div className="text-xs text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} purchases
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} 
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                      let pageNum = pagination.pages <= 5 ? i + 1 : (pagination.page <= 3 ? i + 1 : (pagination.page >= pagination.pages - 2 ? pagination.pages - 4 + i : pagination.page - 2 + i));
                      return (
                        <button key={pageNum} onClick={() => setPagination({ ...pagination, page: pageNum })} 
                          className={`w-8 h-8 rounded border text-sm transition-all ${pagination.page === pageNum ? 'text-white' : 'hover:bg-gray-50'}`} 
                          style={{ borderColor: '#C8E6C9', background: pagination.page === pageNum ? '#2E7D32' : 'white', color: pagination.page === pageNum ? 'white' : '#2E7D32' }}>
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === pagination.pages} 
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
                    Next
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

export default Purchases;
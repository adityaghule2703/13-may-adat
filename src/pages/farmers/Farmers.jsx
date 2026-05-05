// src/pages/farmers/Farmers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Filter, Eye, Edit2, 
  Plus, Download, UserPlus, Phone, 
  DollarSign, Wallet, CheckCircle, XCircle, 
  Loader, RefreshCw, TrendingUp, AlertCircle,
  MapPin, Building, CreditCard, User, X
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Farmers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [farmers, setFarmers] = useState([]);
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
    totalFarmers: 0,
    totalPurchaseValue: 0,
    totalPendingDues: 0,
    activeFarmers: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all', // all, active, inactive
    city: '',
    state: ''
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Check if token exists
  const isAuthenticated = () => {
    const token = getToken();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!token || isLoggedIn !== 'true') {
      navigate('/login');
      return false;
    }
    return true;
  };

  // Fetch farmers from API with search and filters
  const fetchFarmers = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (debouncedSearchTerm) {
        queryParams.append('search', debouncedSearchTerm);
      }
      
      if (filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      
      if (filters.city) {
        queryParams.append('city', filters.city);
      }
      
      if (filters.state) {
        queryParams.append('state', filters.state);
      }
      
      const response = await fetch(`${BASE_URL}/farmers?${queryParams}`, {
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
        setFarmers(data.data);
        setPagination(data.pagination);
        
        // Calculate stats from farmers data
        const totalPurchaseValue = data.data.reduce((sum, farmer) => sum + (farmer.totalPurchaseValue || 0), 0);
        const totalPendingDues = data.data.reduce((sum, farmer) => sum + (farmer.pendingDues || 0), 0);
        const activeFarmers = data.data.filter(farmer => farmer.isActive).length;
        
        setStats({
          totalFarmers: data.pagination.total || data.data.length,
          totalPurchaseValue,
          totalPendingDues,
          activeFarmers
        });
      } else {
        setError(data.message || 'Failed to fetch farmers');
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.status, filters.city, filters.state, navigate]);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFarmers();
    setRefreshing(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilters({
      status: 'all',
      city: '',
      state: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchFarmers();
  };

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  const getStatusColor = (isActive) => {
    return isActive 
      ? { bg: '#E8F5E9', text: '#2E7D32', label: 'Active' }
      : { bg: '#FFEBEE', text: '#D32F2F', label: 'Inactive' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Use farmers directly, not filteredFarmers
  const displayFarmers = farmers;

  if (loading && farmers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading farmers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Farmers</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Manage and track all your farmers</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
         
<button 
  onClick={() => navigate('/farmers/add')}
  className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
  style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
>
  <UserPlus className="w-4 h-4" />
  Add New Farmer
</button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Total Farmers</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalFarmers}</p>
            </div>
            <Users className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Total Purchase Value</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.totalPurchaseValue)}</p>
            </div>
            <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Pending Dues</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#FF6F00' }}>{formatCurrency(stats.totalPendingDues)}</p>
            </div>
            <Wallet className="w-8 h-8" style={{ color: '#FF6F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Active Farmers</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.activeFarmers}</p>
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
          <button onClick={fetchFarmers} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
              <input
                type="text"
                placeholder="Search by name, mobile, village, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#C8E6C9' }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4" style={{ color: '#8D6E63' }} />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-all ${showFilters ? 'bg-[#F1F8E9]' : 'hover:bg-gray-50'}`}
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filters.status !== 'all' || filters.city || filters.state) && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
            <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>


        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>City</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder="Filter by city"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>State</label>
                <input
                  type="text"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  placeholder="Filter by state"
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
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-1 rounded-lg text-white text-sm"
                style={{ background: '#2E7D32' }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Farmers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>Loading...</span>
          </div>
        ) : displayFarmers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>No farmers found</p>
            {(searchTerm || filters.status !== 'all' || filters.city || filters.state) && (
              <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F1F8E9', borderBottom: '1px solid #C8E6C9' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Purchase Value</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Pending Dues</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayFarmers.map((farmer, index) => {
                    const statusColors = getStatusColor(farmer.isActive);
                    return (
                      <tr 
                        key={farmer._id} 
                        className="hover:bg-green-50 transition-colors"
                        style={{ 
                          borderBottom: index !== displayFarmers.length - 1 ? '1px solid #E8F5E9' : 'none'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#F1F8E9] flex items-center justify-center">
                              <User className="w-4 h-4" style={{ color: '#2E7D32' }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{farmer.name}</p>
                              {farmer.gstNumber && (
                                <p className="text-xs" style={{ color: '#8D6E63' }}>GST: {farmer.gstNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" style={{ color: '#C8E6C9' }} />
                            <span className="text-sm" style={{ color: '#5D4037' }}>{farmer.mobile}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm" style={{ color: '#5D4037' }}>{farmer.village || 'N/A'}</p>
                            <p className="text-xs" style={{ color: '#8D6E63' }}>{farmer.city}, {farmer.state}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>
                            {formatCurrency(farmer.totalPurchaseValue)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold" style={{ color: farmer.pendingDues > 0 ? '#FF6F00' : '#4CAF50' }}>
                            {formatCurrency(farmer.pendingDues)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ 
                            background: statusColors.bg,
                            color: statusColors.text
                          }}>
                            {farmer.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {statusColors.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs" style={{ color: '#8D6E63' }}>{formatDate(farmer.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button className="p-1 rounded hover:bg-gray-100 transition-colors" title="View Details">
                              <Eye className="w-4 h-4" style={{ color: '#2E7D32' }} />
                            </button>
                           
<button 
  onClick={() => navigate(`/farmers/edit/${farmer._id}`)}
  className="p-1 rounded hover:bg-gray-100 transition-colors" 
  title="Edit"
>
  <Edit2 className="w-4 h-4" style={{ color: '#FF6F00' }} />
</button>
                            <button className="p-1 rounded hover:bg-gray-100 transition-colors" title="View Ledger">
                              <TrendingUp className="w-4 h-4" style={{ color: '#43A047' }} />
                            </button>
                          </div>
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
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} farmers
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    Previous
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
                          className={`w-8 h-8 rounded border text-sm transition-all ${
                            pagination.page === pageNum 
                              ? 'text-white' 
                              : 'hover:bg-gray-50'
                          }`}
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

export default Farmers;
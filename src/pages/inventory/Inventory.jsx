// src/pages/inventory/Inventory.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Search, Filter, Eye, Edit2, 
  Plus, Download, RefreshCw, Loader, AlertCircle,
  TrendingUp, TrendingDown, Warehouse, X,
  CheckCircle, AlertTriangle, Building, ArrowLeftRight
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Inventory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    warehouseCount: 0
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
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

  // Fetch inventory items
  const fetchInventory = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const queryParams = new URLSearchParams();
      
      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
      if (warehouseFilter) queryParams.append('warehouse', warehouseFilter);
      if (lowStockOnly) queryParams.append('lowStock', 'true');
      
      const response = await fetch(`${BASE_URL}/inventory?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setInventory(data.data);
        
        // Extract unique warehouses
        const uniqueWarehouses = [...new Set(data.data.map(item => item.warehouse))];
        setWarehouses(uniqueWarehouses);
        
        // Calculate stats
        const totalStock = data.data.reduce((sum, item) => sum + (item.currentStock || 0), 0);
        const lowStockCount = data.data.filter(item => (item.currentStock || 0) <= 10).length;
        
        setStats({
          totalProducts: data.data.length,
          totalStock,
          lowStockCount,
          warehouseCount: uniqueWarehouses.length
        });
      } else {
        setError(data.message || 'Failed to fetch inventory');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, warehouseFilter, lowStockOnly, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setWarehouseFilter('');
    setLowStockOnly(false);
    setShowFilters(false);
  };

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  const getStockStatus = (stock, unit) => {
    if (stock <= 0) return { color: '#D32F2F', bg: '#FFEBEE', label: 'Out of Stock', icon: XCircle };
    if (stock <= 10) return { color: '#FF6F00', bg: '#FFF3E0', label: 'Low Stock', icon: AlertTriangle };
    return { color: '#2E7D32', bg: '#E8F5E9', label: 'In Stock', icon: CheckCircle };
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Inventory</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Manage and track all stock levels</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:scale-105"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => navigate('/inventory/adjust')}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
          >
            <Plus className="w-4 h-4" />
            Adjust Stock
          </button>
          <button 
            onClick={() => navigate('/inventory/transfer')}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF6F00, #FF8F00)' }}
          >
            <ArrowLeftRight className="w-4 h-4" />
            Transfer Stock
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Total Products</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalProducts}</p>
            </div>
            <Package className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Total Stock (Units)</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatNumber(stats.totalStock)}</p>
            </div>
            <Warehouse className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Low Stock Items</p>
              <p className="text-2xl font-bold mt-1" style={{ color: stats.lowStockCount > 0 ? '#FF6F00' : '#2E7D32' }}>{stats.lowStockCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8" style={{ color: '#FF6F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Warehouses</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.warehouseCount}</p>
            </div>
            <Building className="w-8 h-8" style={{ color: '#1976D2' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchInventory} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
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
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: '#C8E6C9' }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2">
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
              {(warehouseFilter || lowStockOnly) && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Warehouse</label>
                <select
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="">All Warehouses</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse} value={warehouse}>{warehouse}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Low Stock Only</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#2E7D32' }}
                  />
                  <span className="text-sm">Show only products with stock ≤ 10 units</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={clearFilters}
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-1 rounded-lg text-white text-sm"
                style={{ background: '#2E7D32' }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>Loading...</span>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>No inventory items found</p>
            {(searchTerm || warehouseFilter || lowStockOnly) && (
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
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Warehouse</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Last Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item, index) => {
                    const stockStatus = getStockStatus(item.currentStock, item.unit);
                    const StatusIcon = stockStatus.icon;
                    
                    return (
                      <tr 
                        key={item._id} 
                        className="hover:bg-green-50 transition-colors"
                        style={{ 
                          borderBottom: index !== inventory.length - 1 ? '1px solid #E8F5E9' : 'none'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>{item.productName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <span className="text-sm" style={{ color: '#5D4037' }}>{item.warehouse}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${item.currentStock <= 10 ? 'text-red-600' : 'text-green-800'}`}>
                            {formatNumber(item.currentStock)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm" style={{ color: '#5D4037' }}>{item.unit || 'kg'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ 
                            background: stockStatus.bg,
                            color: stockStatus.color
                          }}>
                            <StatusIcon className="w-3 h-3" />
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs" style={{ color: '#8D6E63' }}>
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => navigate(`/inventory/product/${item.productName}`)}
                              className="p-1 rounded hover:bg-gray-100 transition-colors" 
                              title="View Product Details"
                            >
                              <Eye className="w-4 h-4" style={{ color: '#2E7D32' }} />
                            </button>
                            <button 
                              onClick={() => navigate(`/inventory/adjust?product=${item.productName}&warehouse=${item.warehouse}`)}
                              className="p-1 rounded hover:bg-gray-100 transition-colors" 
                              title="Adjust Stock"
                            >
                              <TrendingUp className="w-4 h-4" style={{ color: '#FF6F00' }} />
                            </button>
                            <button 
                              onClick={() => navigate(`/inventory/transfer?product=${item.productName}&from=${item.warehouse}`)}
                              className="p-1 rounded hover:bg-gray-100 transition-colors" 
                              title="Transfer Stock"
                            >
                              <ArrowLeftRight className="w-4 h-4" style={{ color: '#1976D2' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Inventory;
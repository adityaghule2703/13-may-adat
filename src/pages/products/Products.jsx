// src/pages/products/Products.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Search, Filter, Eye, Edit2, 
  Download, UserPlus, CheckCircle, XCircle, 
  Loader, AlertCircle,
  X, MoreVertical, PowerOff, Box as BoxIcon,
  Tag, Calendar, User
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Products = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all'
  });
  
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedProductForMenu, setSelectedProductForMenu] = useState(null);
  
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  const fetchProducts = useCallback(async () => {
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

      const response = await fetch(`${BASE_URL}/products?${queryParams}`, {
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
        setProducts(data.data);
        setPagination(data.pagination);
        
        // Calculate stats from fetched data
        const activeProducts = data.data.filter(p => p.isActive).length;
        const inactiveProducts = data.data.filter(p => !p.isActive).length;
        
        setStats({
          totalProducts: data.pagination.total || data.data.length,
          activeProducts,
          inactiveProducts
        });
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.status, navigate]);

  const handleDeactivateProduct = async (product) => {
    setDeactivating(true);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/products/${product._id}/deactivate`, {
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
        setSelectedProduct(null);
        fetchProducts();
        alert(`${product.productName} has been deactivated successfully`);
      } else {
        setError(data.message || 'Failed to deactivate product');
        setShowDeactivateModal(false);
      }
    } catch (error) {
      console.error('Error deactivating product:', error);
      setError('Network error. Please try again.');
    } finally {
      setDeactivating(false);
      setActionMenuAnchor(null);
      setSelectedProductForMenu(null);
    }
  };

  const handleActivateProduct = async (product) => {
    setDeactivating(true);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/products/${product._id}/activate`, {
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
        setSelectedProduct(null);
        fetchProducts();
        alert(`${product.productName} has been activated successfully`);
      } else {
        setError(data.message || 'Failed to activate product');
        setShowDeactivateModal(false);
      }
    } catch (error) {
      console.error('Error activating product:', error);
      setError('Network error. Please try again.');
    } finally {
      setDeactivating(false);
      setActionMenuAnchor(null);
      setSelectedProductForMenu(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilters({ status: 'all' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleActionMenuOpen = (event, product) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedProductForMenu(product);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedProductForMenu(null);
  };

  const openDeactivateModal = (product) => {
    setSelectedProduct(product);
    setShowDeactivateModal(true);
    handleActionMenuClose();
  };

  const getStatusColor = (isActive) =>
    isActive
      ? { bg: '#E8F5E9', text: '#2E7D32', label: 'Active' }
      : { bg: '#FFEBEE', text: '#D32F2F', label: 'Inactive' };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Smart dropdown positioning
  const MENU_HEIGHT = 200;
  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Products</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Manage and track all your products</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <p className="text-xs" style={{ color: '#8D6E63' }}>Active Products</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.activeProducts}</p>
            </div>
            <CheckCircle className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Inactive Products</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#FF6F00' }}>{stats.inactiveProducts}</p>
            </div>
            <XCircle className="w-8 h-8" style={{ color: '#FF6F00' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchProducts} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
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
                placeholder="Search products by name..."
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
              Filters
              {(filters.status !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
            
            <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => navigate('/products/add')}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <UserPlus className="w-4 h-4" />
              Add New Product
            </button>
          </div>
        </div>

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

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>Loading...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>No products found</p>
            {(searchTerm || filters.status !== 'all') && (
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
                  <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Product Info</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Created Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => {
                    const statusColors = getStatusColor(product.isActive);
                    const isActionMenuOpen =
                      Boolean(actionMenuAnchor) && selectedProductForMenu?._id === product._id;

                    return (
                      <tr
                        key={product._id}
                        className="hover:bg-green-50 transition-colors"
                        style={{ borderBottom: index !== products.length - 1 ? '1px solid #E8F5E9' : 'none' }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#F1F8E9] flex items-center justify-center">
                              <Package className="w-4 h-4" style={{ color: '#2E7D32' }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{product.productName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm" style={{ color: '#5D4037' }}>
                            {product.description || '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" style={{ color: '#C8E6C9' }} />
                            <span className="text-sm" style={{ color: '#2E7D32' }}>
                              {product.createdBy?.name || '—'}
                            </span>
                          </div>
                          <p className="text-xs mt-1" style={{ color: '#8D6E63' }}>
                            {product.createdBy?.email || ''}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" style={{ color: '#C8E6C9' }} />
                            <span className="text-sm" style={{ color: '#5D4037' }}>
                              {formatDate(product.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{
                            background: statusColors.bg,
                            color: statusColors.text
                          }}>
                            {product.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {statusColors.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => handleActionMenuOpen(e, product)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
                            style={{ color: '#2E7D32' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="text-xs font-medium">Actions</span>
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
                                  navigate(`/products/view/${product._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#2E7D32' }}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>

                              <button
                                onClick={() => {
                                  navigate(`/products/edit/${product._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#FF6F00' }}
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>

                              {product.isActive ? (
                                <button
                                  onClick={() => openDeactivateModal(product)}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 transition-colors border-t"
                                  style={{ color: '#D32F2F', borderColor: '#E8F5E9' }}
                                >
                                  <PowerOff className="w-4 h-4" />
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateProduct(product)}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors border-t"
                                  style={{ color: '#2E7D32', borderColor: '#E8F5E9' }}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Activate
                                </button>
                              )}
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
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
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
                    Next
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

      {/* Deactivate/Activate Confirmation Modal */}
      {showDeactivateModal && selectedProduct && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => { setShowDeactivateModal(false); setSelectedProduct(null); }}
          />
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '400px' }}>
              <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: selectedProduct.isActive ? '#D32F2F' : '#2E7D32' }}>
                    {selectedProduct.isActive ? 'Deactivate Product' : 'Activate Product'}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>
                    {selectedProduct.isActive ? 'Confirm deactivation' : 'Confirm activation'}
                  </p>
                </div>
                <button
                  onClick={() => { setShowDeactivateModal(false); setSelectedProduct(null); }}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${selectedProduct.isActive ? 'bg-red-100' : 'bg-green-100'}`}>
                    {selectedProduct.isActive ? (
                      <PowerOff className="w-8 h-8 text-red-600" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    )}
                  </div>
                </div>
                <p className="text-center text-sm mb-2" style={{ color: '#5D4037' }}>
                  Are you sure you want to {selectedProduct.isActive ? 'deactivate' : 'activate'} <strong>{selectedProduct.productName}</strong>?
                </p>
                <p className="text-center text-xs" style={{ color: '#8D6E63' }}>
                  {selectedProduct.isActive 
                    ? 'This product will no longer be available for selection in new purchases/sales.'
                    : 'This product will become available for selection in new purchases/sales.'}
                </p>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
                <button
                  onClick={() => { setShowDeactivateModal(false); setSelectedProduct(null); }}
                  className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
                  style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedProduct.isActive 
                    ? handleDeactivateProduct(selectedProduct) 
                    : handleActivateProduct(selectedProduct)
                  }
                  disabled={deactivating}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 ${selectedProduct.isActive ? 'bg-red-600' : 'bg-green-600'}`}
                >
                  {deactivating ? (
                    <><Loader className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <>{selectedProduct.isActive ? <PowerOff className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />} {selectedProduct.isActive ? 'Deactivate' : 'Activate'}</>
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

export default Products;
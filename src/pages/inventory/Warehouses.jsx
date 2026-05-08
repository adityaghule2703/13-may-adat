// // src/pages/inventory/Warehouses.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Warehouse, Search, Filter, Eye, Edit2, 
//   Plus, Download, RefreshCw, Loader, AlertCircle,
//   Building, MapPin, User, Phone, Mail, X,
//   CheckCircle, XCircle, TrendingUp, Package
// } from 'lucide-react';
// import BASE_URL from '../../config/Config';

// const Warehouses = () => {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [warehouses, setWarehouses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [isActiveFilter, setIsActiveFilter] = useState('all');
//   const [stats, setStats] = useState({
//     totalWarehouses: 0,
//     activeWarehouses: 0,
//     totalCapacity: 0,
//     totalStock: 0
//   });

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const getToken = () => localStorage.getItem('token');

//   const fetchWarehouses = useCallback(async () => {
//     const token = getToken();
//     const isLoggedIn = localStorage.getItem('isLoggedIn');
//     if (!token || isLoggedIn !== 'true') {
//       navigate('/login');
//       return;
//     }
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const queryParams = new URLSearchParams();
//       if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
//       if (isActiveFilter !== 'all') queryParams.append('isActive', isActiveFilter === 'active');
      
//       const response = await fetch(`${BASE_URL}/warehouse?${queryParams}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       const data = await response.json();

//       if (data.success) {
//         setWarehouses(data.data);
        
//         const activeCount = data.data.filter(w => w.isActive).length;
//         const totalCapacity = data.data.reduce((sum, w) => sum + (w.capacity?.total || 0), 0);
//         const totalStock = data.data.reduce((sum, w) => sum + (w.stats?.totalStockUnits || 0), 0);
        
//         setStats({
//           totalWarehouses: data.count || data.data.length,
//           activeWarehouses: activeCount,
//           totalCapacity,
//           totalStock
//         });
//       } else {
//         setError(data.message || 'Failed to fetch warehouses');
//       }
//     } catch (error) {
//       console.error('Error fetching warehouses:', error);
//       setError('Network error. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   }, [debouncedSearchTerm, isActiveFilter, navigate]);

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchWarehouses();
//     setRefreshing(false);
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setDebouncedSearchTerm('');
//     setIsActiveFilter('all');
//     setShowFilters(false);
//   };

//   useEffect(() => {
//     fetchWarehouses();
//   }, [fetchWarehouses]);

//   const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);
//   const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

//   if (loading && warehouses.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
//         <span className="ml-2" style={{ color: '#2E7D32' }}>Loading warehouses...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Warehouses</h1>
//           <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Manage all storage facilities</p>
//         </div>
//         <div className="flex gap-2">
//           <button onClick={handleRefresh} disabled={refreshing} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:scale-105"
//             style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
//             <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
//           </button>
//           <button onClick={() => navigate('/warehouses/add')} className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
//             style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
//             <Plus className="w-4 h-4" /> Add Warehouse
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div><p className="text-xs text-gray-500">Total Warehouses</p><p className="text-2xl font-bold text-green-800">{stats.totalWarehouses}</p></div>
//             <Warehouse className="w-8 h-8 text-green-600" />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div><p className="text-xs text-gray-500">Active Warehouses</p><p className="text-2xl font-bold text-green-800">{stats.activeWarehouses}</p></div>
//             <CheckCircle className="w-8 h-8 text-green-600" />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div><p className="text-xs text-gray-500">Total Capacity</p><p className="text-2xl font-bold text-green-800">{formatNumber(stats.totalCapacity)} KG</p></div>
//             <Package className="w-8 h-8 text-orange-500" />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div><p className="text-xs text-gray-500">Total Stock</p><p className="text-2xl font-bold text-green-800">{formatNumber(stats.totalStock)} units</p></div>
//             <TrendingUp className="w-8 h-8 text-blue-600" />
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
//           <AlertCircle className="w-5 h-5 text-red-500" />
//           <span className="text-sm text-red-600">{error}</span>
//           <button onClick={fetchWarehouses} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
//         </div>
//       )}

//       <div className="bg-white rounded-xl p-4 shadow-sm">
//         <div className="flex flex-wrap gap-4">
//           <div className="flex-1 min-w-[200px]">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input type="text" placeholder="Search by name, code, or city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#C8E6C9' }} />
//               {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-green-50' : 'hover:bg-gray-50'}`}
//               style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
//               <Filter className="w-4 h-4" /> Filters
//               {(isActiveFilter !== 'all') && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
//             </button>
//             <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
//               <Download className="w-4 h-4" /> Export
//             </button>
//           </div>
//         </div>

//         {showFilters && (
//           <div className="mt-4 p-4 border rounded-lg bg-gray-50">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-medium text-green-800 mb-1">Status</label>
//                 <select value={isActiveFilter} onChange={(e) => setIsActiveFilter(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }}>
//                   <option value="all">All</option>
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-4">
//               <button onClick={clearFilters} className="px-3 py-1 border rounded-lg text-sm text-red-600">Clear All</button>
//               <button onClick={() => setShowFilters(false)} className="px-3 py-1 rounded-lg text-white text-sm bg-green-700">Apply Filters</button>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin text-green-700" /><span className="ml-2">Loading...</span></div>
//         ) : warehouses.length === 0 ? (
//           <div className="text-center py-12"><Warehouse className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-sm text-gray-500">No warehouses found</p></div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr style={{ background: '#F1F8E9' }}>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Code</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Location</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Manager</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Capacity</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Stock</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {warehouses.map((warehouse, index) => (
//                   <tr key={warehouse._id} className="hover:bg-green-50 border-b border-gray-100">
//                     <td className="px-6 py-4 whitespace-nowrap"><span className="font-mono text-sm font-semibold text-green-800">{warehouse.code}</span></td>
//                     <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-2"><Building className="w-4 h-4 text-gray-400" /><span className="font-medium">{warehouse.name}</span></div></td>
//                     <td className="px-6 py-4"><div><p className="text-sm">{warehouse.location?.city}, {warehouse.location?.state}</p><p className="text-xs text-gray-500">{warehouse.location?.address}</p></div></td>
//                     <td className="px-6 py-4"><div><p className="text-sm font-medium">{warehouse.manager?.name}</p><p className="text-xs text-gray-500">{warehouse.manager?.phone}</p></div></td>
//                     <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm">{formatNumber(warehouse.capacity?.total)} {warehouse.capacity?.unit}</span><p className="text-xs text-gray-500">Used: {formatNumber(warehouse.capacity?.used)}</p></td>
//                     <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-semibold text-orange-600">{formatNumber(warehouse.stats?.totalStockUnits || 0)} units</span><p className="text-xs text-gray-500">{warehouse.stats?.productCount || 0} products</p></td>
//                     <td className="px-6 py-4 whitespace-nowrap"><span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${warehouse.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{warehouse.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{warehouse.isActive ? 'Active' : 'Inactive'}</span></td>
//                     <td className="px-6 py-4 whitespace-nowrap"><div className="flex gap-2"><button onClick={() => navigate(`/warehouses/view/${warehouse._id}`)} className="p-1 rounded hover:bg-gray-100"><Eye className="w-4 h-4 text-green-700" /></button><button onClick={() => navigate(`/warehouses/edit/${warehouse._id}`)} className="p-1 rounded hover:bg-gray-100"><Edit2 className="w-4 h-4 text-orange-500" /></button></div></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Warehouses;

// src/pages/inventory/Warehouses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Warehouse, Search, Filter, Eye, Edit2, 
  Plus, Download, RefreshCw, Loader, AlertCircle,
  Building, MapPin, User, Phone, Mail, X,
  CheckCircle, XCircle, TrendingUp, Package
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Warehouses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState('all');
  const [stats, setStats] = useState({
    totalWarehouses: 0,
    activeWarehouses: 0,
    totalCapacity: 0,
    totalStock: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getToken = () => localStorage.getItem('token');

  const fetchWarehouses = useCallback(async () => {
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
      if (isActiveFilter !== 'all') queryParams.append('isActive', isActiveFilter === 'active');
      
      const response = await fetch(`${BASE_URL}/warehouse?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setWarehouses(data.data);
        setPagination({
          page: pagination.page,
          limit: pagination.limit,
          total: data.count || data.data.length,
          pages: Math.ceil((data.count || data.data.length) / pagination.limit)
        });
        
        const activeCount = data.data.filter(w => w.isActive).length;
        const totalCapacity = data.data.reduce((sum, w) => sum + (w.capacity?.total || 0), 0);
        const totalStock = data.data.reduce((sum, w) => sum + (w.stats?.totalStockUnits || 0), 0);
        
        setStats({
          totalWarehouses: data.count || data.data.length,
          activeWarehouses: activeCount,
          totalCapacity,
          totalStock
        });
      } else {
        setError(data.message || 'Failed to fetch warehouses');
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, isActiveFilter, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWarehouses();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsActiveFilter('all');
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

  if (loading && warehouses.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading warehouses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Warehouses</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Manage all storage facilities</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} disabled={refreshing} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:scale-105"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => navigate('/warehouses/add')} className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
            <Plus className="w-4 h-4" /> Add Warehouse
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs" style={{ color: '#8D6E63' }}>Total Warehouses</p><p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalWarehouses}</p></div>
            <Warehouse className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs" style={{ color: '#8D6E63' }}>Active Warehouses</p><p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.activeWarehouses}</p></div>
            <CheckCircle className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs" style={{ color: '#8D6E63' }}>Total Capacity</p><p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatNumber(stats.totalCapacity)} KG</p></div>
            <Package className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-xs" style={{ color: '#8D6E63' }}>Total Stock</p><p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatNumber(stats.totalStock)} units</p></div>
            <TrendingUp className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchWarehouses} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
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
                placeholder="Search by name, code, or city..."
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
              {(isActiveFilter !== 'all') && (
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
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Status</label>
                <select value={isActiveFilter} onChange={(e) => setIsActiveFilter(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }}>
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={clearFilters} className="px-3 py-1 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9', color: '#D32F2F' }}>Clear All</button>
              <button onClick={() => setShowFilters(false)} className="px-3 py-1 rounded-lg text-white text-sm" style={{ background: '#2E7D32' }}>Apply Filters</button>
            </div>
          </div>
        )}
      </div>

      {/* Warehouses Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>Loading...</span>
          </div>
        ) : warehouses.length === 0 ? (
          <div className="text-center py-12">
            <Warehouse className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>No warehouses found</p>
            {(searchTerm || isActiveFilter !== 'all') && (
              <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">Clear filters</button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F1F8E9', borderBottom: '1px solid #C8E6C9' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Code</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Manager</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#2E7D32' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((warehouse, index) => (
                    <tr 
                      key={warehouse._id} 
                      className="hover:bg-green-50 transition-colors"
                      style={{ 
                        borderBottom: index !== warehouses.length - 1 ? '1px solid #E8F5E9' : 'none'
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                          <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>{warehouse.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm" style={{ color: '#5D4037' }}>{warehouse.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm" style={{ color: '#5D4037' }}>{warehouse.location?.city}, {warehouse.location?.state}</p>
                          <p className="text-xs" style={{ color: '#8D6E63' }}>{warehouse.location?.address}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{warehouse.manager?.name}</p>
                          <p className="text-xs" style={{ color: '#8D6E63' }}>{warehouse.manager?.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{formatNumber(warehouse.capacity?.total)} {warehouse.capacity?.unit}</p>
                          <p className="text-xs" style={{ color: '#8D6E63' }}>Used: {formatNumber(warehouse.capacity?.used)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#FF6F00' }}>{formatNumber(warehouse.stats?.totalStockUnits || 0)} units</p>
                          <p className="text-xs" style={{ color: '#8D6E63' }}>{warehouse.stats?.productCount || 0} products</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${
                          warehouse.isActive ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'
                        }`}>
                          {warehouse.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {warehouse.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/warehouses/view/${warehouse._id}`)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors" 
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" style={{ color: '#2E7D32' }} />
                          </button>
                          <button 
                            onClick={() => navigate(`/warehouses/edit/${warehouse._id}`)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors" 
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" style={{ color: '#FF6F00' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination - Same as Purchases */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                <div className="text-xs" style={{ color: '#8D6E63' }}>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} warehouses
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

export default Warehouses;
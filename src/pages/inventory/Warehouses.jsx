// // src/pages/inventory/Warehouses.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Warehouse, Search, Filter, Eye, Edit2, 
//   Plus, Download, RefreshCw, Loader, AlertCircle,
//   Building, MapPin, User, Phone, Mail, X,
//   CheckCircle, XCircle, TrendingUp, Package,
//   MoreVertical, PowerOff, Trash2
// } from 'lucide-react';
// import BASE_URL from '../../config/Config';

// const Warehouses = () => {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [warehouses, setWarehouses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 5,
//     total: 0,
//     pages: 1
//   });
//   const [showFilters, setShowFilters] = useState(false);
//   const [isActiveFilter, setIsActiveFilter] = useState('all');
//   const [stats, setStats] = useState({
//     totalWarehouses: 0,
//     activeWarehouses: 0,
//     totalCapacity: 0,
//     totalStock: 0
//   });
  
//   const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
//   const [selectedWarehouseForMenu, setSelectedWarehouseForMenu] = useState(null);

//   // Modal states
//   const [showDeactivateModal, setShowDeactivateModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deactivating, setDeactivating] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const [modalError, setModalError] = useState(null);

//   // Debounce search term
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//       setPagination(prev => ({ ...prev, page: 1 }));
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const getToken = () => localStorage.getItem('token');

//   const isAuthenticated = () => {
//     const token = getToken();
//     const isLoggedIn = localStorage.getItem('isLoggedIn');
//     if (!token || isLoggedIn !== 'true') {
//       navigate('/login');
//       return false;
//     }
//     return true;
//   };

//   const fetchWarehouses = useCallback(async () => {
//     if (!isAuthenticated()) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const token = getToken();
//       const queryParams = new URLSearchParams({
//         page: pagination.page,
//         limit: pagination.limit
//       });
      
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
//         // Directly use data.data array
//         const items = data.data || [];
//         const paginationData = data.pagination || {};
        
//         setWarehouses(items);
        
//         setPagination({
//           page: paginationData.page || pagination.page,
//           limit: paginationData.limit || pagination.limit,
//           total: paginationData.total || 0,
//           pages: paginationData.pages || 1
//         });
        
//         // Calculate statistics from items
//         const activeCount = items.filter(w => w.isActive).length;
//         const totalCapacity = items.reduce((sum, w) => sum + (w.capacity?.total || 0), 0);
//         const totalStock = items.reduce((sum, w) => sum + (w.summary?.totalStockUnits || 0), 0);
        
//         setStats({
//           totalWarehouses: paginationData.total || items.length,
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
//   }, [pagination.page, pagination.limit, debouncedSearchTerm, isActiveFilter, navigate]);

//   // Deactivate warehouse (soft delete - set isActive to false)
//   const handleDeactivateWarehouse = async (warehouse) => {
//     setDeactivating(true);
//     setModalError(null);
//     try {
//       const token = getToken();
//       const response = await fetch(`${BASE_URL}/warehouse/${warehouse._id}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ isActive: false })
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       const data = await response.json();
//       if (data.success) {
//         setShowDeactivateModal(false);
//         setSelectedWarehouseForMenu(null);
//         fetchWarehouses();
//       } else {
//         setModalError(data.message || data.error || 'Failed to deactivate warehouse');
//       }
//     } catch (error) {
//       console.error('Error deactivating warehouse:', error);
//       setModalError('Network error. Please try again.');
//     } finally {
//       setDeactivating(false);
//     }
//   };

//   // Permanently delete warehouse
//   const handleDeleteWarehouse = async (warehouse) => {
//     setDeleting(true);
//     setModalError(null);
//     try {
//       const token = getToken();
//       const response = await fetch(`${BASE_URL}/warehouse/${warehouse._id}/hard`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       const data = await response.json();
//       if (data.success) {
//         setShowDeleteModal(false);
//         setSelectedWarehouseForMenu(null);
//         fetchWarehouses();
//       } else {
//         setModalError(data.message || data.error || 'Failed to delete warehouse');
//       }
//     } catch (error) {
//       console.error('Error deleting warehouse:', error);
//       setModalError('Network error. Please try again.');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setDebouncedSearchTerm('');
//     setIsActiveFilter('all');
//     setPagination(prev => ({ ...prev, page: 1 }));
//     setShowFilters(false);
//   };

//   const applyFilters = () => {
//     setPagination(prev => ({ ...prev, page: 1 }));
//     setShowFilters(false);
//     fetchWarehouses();
//   };

//   useEffect(() => {
//     fetchWarehouses();
//   }, [fetchWarehouses]);

//   const handleActionMenuOpen = (event, warehouse) => {
//     event.stopPropagation();
//     setActionMenuAnchor(event.currentTarget);
//     setSelectedWarehouseForMenu(warehouse);
//   };

//   const handleActionMenuClose = () => {
//     setActionMenuAnchor(null);
//     setSelectedWarehouseForMenu(null);
//   };

//   const openDeactivateModal = (warehouse) => {
//     setSelectedWarehouseForMenu(warehouse);
//     setModalError(null);
//     setShowDeactivateModal(true);
//     setActionMenuAnchor(null);
//   };

//   const openDeleteModal = (warehouse) => {
//     setSelectedWarehouseForMenu(warehouse);
//     setModalError(null);
//     setShowDeleteModal(true);
//     setActionMenuAnchor(null);
//   };

//   const closeModals = () => {
//     setShowDeactivateModal(false);
//     setShowDeleteModal(false);
//     setSelectedWarehouseForMenu(null);
//     setModalError(null);
//   };

//   const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

//   // Smart dropdown positioning
//   const MENU_HEIGHT = 200;
//   const anchorRect = actionMenuAnchor?.getBoundingClientRect();
//   const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
//   const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

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
//       {/* Page Header */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Warehouses</h1>
//           <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Manage all storage facilities</p>
//         </div>
//       </div>

//       {/* Stats Summary */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Total Warehouses</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalWarehouses}</p>
//             </div>
//             <Warehouse className="w-8 h-8" style={{ color: '#43A047' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Active Warehouses</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.activeWarehouses}</p>
//             </div>
//             <CheckCircle className="w-8 h-8" style={{ color: '#2E7D32' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Total Capacity</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatNumber(stats.totalCapacity)} {warehouses[0]?.capacity?.unit || 'units'}</p>
//             </div>
//             <Package className="w-8 h-8" style={{ color: '#FF8F00' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Total Stock</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatNumber(stats.totalStock)} units</p>
//             </div>
//             <TrendingUp className="w-8 h-8" style={{ color: '#2E7D32' }} />
//           </div>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
//           <AlertCircle className="w-5 h-5 text-red-500" />
//           <span className="text-sm text-red-600">{error}</span>
//           <button onClick={fetchWarehouses} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
//         </div>
//       )}

//       {/* Search and Filter Bar */}
//       <div className="bg-white rounded-xl p-4 shadow-sm">
//         <div className="flex flex-wrap gap-4 items-center justify-between">
//           <div className="w-80">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
//               <input
//                 type="text"
//                 placeholder="Search by name, code, or city..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1"
//                 style={{ borderColor: '#C8E6C9' }}
//               />
//               {searchTerm && (
//                 <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                   <X className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                 </button>
//               )}
//             </div>
//           </div>
          
//           <div className="flex gap-3">
//             <button 
//               onClick={() => setShowFilters(!showFilters)}
//               className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-green-50' : 'hover:bg-gray-50'}`}
//               style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
//             >
//               <Filter className="w-4 h-4" />
//               Filters
//               {(isActiveFilter !== 'all') && (
//                 <span className="w-2 h-2 rounded-full bg-orange-500"></span>
//               )}
//             </button>
//             <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
//               <Download className="w-4 h-4" />
//               Export
//             </button>
//             <button 
//               onClick={() => navigate('/warehouses/add')}
//               className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//               style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//             >
//               <Plus className="w-4 h-4" />
//               Add Warehouse
//             </button>
//           </div>
//         </div>

//         {showFilters && (
//           <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Status</label>
//                 <select 
//                   value={isActiveFilter} 
//                   onChange={(e) => setIsActiveFilter(e.target.value)} 
//                   className="w-full px-3 py-2 border rounded-lg text-sm" 
//                   style={{ borderColor: '#C8E6C9' }}
//                 >
//                   <option value="all">All</option>
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-4">
//               <button
//                 onClick={clearFilters}
//                 className="px-3 py-1 border rounded-lg text-sm"
//                 style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
//               >
//                 Clear All
//               </button>
//               <button
//                 onClick={() => setShowFilters(false)}
//                 className="px-3 py-1 border rounded-lg text-sm"
//                 style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={applyFilters}
//                 className="px-3 py-1 rounded-lg text-white text-sm"
//                 style={{ background: '#2E7D32' }}
//               >
//                 Apply Filters
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Warehouses Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
//             <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>Loading...</span>
//           </div>
//         ) : warehouses.length === 0 ? (
//           <div className="text-center py-12">
//             <Warehouse className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
//             <p className="text-sm" style={{ color: '#8D6E63' }}>No warehouses found</p>
//             {(searchTerm || isActiveFilter !== 'all') && (
//               <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
//                 Clear filters
//               </button>
//             )}
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Code</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Name</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Location</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Manager</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Capacity</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Stock</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Status</th>
//                     <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {warehouses.map((warehouse, index) => {
//                     const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedWarehouseForMenu?._id === warehouse._id;
                    
//                     return (
//                       <tr 
//                         key={warehouse._id} 
//                         className="hover:bg-green-50 transition-colors"
//                         style={{ 
//                           borderBottom: index !== warehouses.length - 1 ? '1px solid #E8F5E9' : 'none'
//                         }}
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-2">
//                             <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                             <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>{warehouse.code}</span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-sm" style={{ color: '#5D4037' }}>{warehouse.name}</span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div>
//                             <p className="text-sm" style={{ color: '#5D4037' }}>{warehouse.location?.city}, {warehouse.location?.state}</p>
//                             <p className="text-xs" style={{ color: '#8D6E63' }}>{warehouse.location?.address}</p>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div>
//                             <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{warehouse.manager?.name || 'N/A'}</p>
//                             {warehouse.manager?.phone && (
//                               <p className="text-xs" style={{ color: '#8D6E63' }}>{warehouse.manager?.phone}</p>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div>
//                             <p className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{formatNumber(warehouse.capacity?.total)} {warehouse.capacity?.unit}</p>
//                             <p className="text-xs" style={{ color: '#8D6E63' }}>Used: {formatNumber(warehouse.capacity?.used)}</p>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div>
//                             <p className="text-sm font-semibold" style={{ color: '#FF6F00' }}>{formatNumber(warehouse.summary?.totalStockUnits || 0)} units</p>
//                             <p className="text-xs" style={{ color: '#8D6E63' }}>{warehouse.summary?.totalProducts || 0} products</p>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${
//                             warehouse.isActive ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'
//                           }`}>
//                             {warehouse.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
//                             {warehouse.isActive ? 'Active' : 'Inactive'}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-center">
//                           <button
//                             onClick={(e) => handleActionMenuOpen(e, warehouse)}
//                             className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
//                             style={{ color: '#2E7D32' }}
//                           >
//                             <MoreVertical className="w-4 h-4" />
//                             <span className="text-xs font-medium">Actions</span>
//                           </button>

//                           {isActionMenuOpen && anchorRect && (
//                             <div
//                               className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
//                               style={{
//                                 borderColor: '#E8F5E9',
//                                 width: '180px',
//                                 position: 'fixed',
//                                 top: openUpward
//                                   ? anchorRect.top - MENU_HEIGHT - 4
//                                   : anchorRect.bottom + 4,
//                                 left: anchorRect.left - 120,
//                               }}
//                             >
//                               <button
//                                 onClick={() => {
//                                   navigate(`/warehouses/view/${warehouse._id}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
//                                 style={{ color: '#2E7D32' }}
//                               >
//                                 <Eye className="w-4 h-4" />
//                                 View Details
//                               </button>

//                               <button
//                                 onClick={() => {
//                                   navigate(`/warehouses/edit/${warehouse._id}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 transition-colors"
//                                 style={{ color: '#FF6F00' }}
//                               >
//                                 <Edit2 className="w-4 h-4" />
//                                 Edit
//                               </button>

//                               {warehouse.isActive && (
//                                 <button
//                                   onClick={() => openDeactivateModal(warehouse)}
//                                   className="w-full px-4 py-2.5 text-left text-sm hover:bg-yellow-50 flex items-center gap-2 transition-colors border-t"
//                                   style={{ color: '#E65100', borderColor: '#E8F5E9' }}
//                                 >
//                                   <PowerOff className="w-4 h-4" />
//                                   Deactivate
//                                 </button>
//                               )}

//                               <button
//                                 onClick={() => openDeleteModal(warehouse)}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 transition-colors border-t"
//                                 style={{ color: '#D32F2F', borderColor: '#E8F5E9' }}
//                               >
//                                 <Trash2 className="w-4 h-4" />
//                                 Delete Permanently
//                               </button>
//                             </div>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
            
//             {pagination.pages > 1 && (
//               <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
//                 <div className="text-xs" style={{ color: '#8D6E63' }}>
//                   Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
//                   {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} warehouses
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
//                     disabled={pagination.page === 1}
//                     className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
//                     style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
//                   >
//                     Previous
//                   </button>
//                   <div className="flex gap-1">
//                     {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
//                       let pageNum;
//                       if (pagination.pages <= 5) {
//                         pageNum = i + 1;
//                       } else if (pagination.page <= 3) {
//                         pageNum = i + 1;
//                       } else if (pagination.page >= pagination.pages - 2) {
//                         pageNum = pagination.pages - 4 + i;
//                       } else {
//                         pageNum = pagination.page - 2 + i;
//                       }
                      
//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => setPagination({ ...pagination, page: pageNum })}
//                           className="w-8 h-8 rounded border text-sm transition-all"
//                           style={{
//                             borderColor: '#C8E6C9',
//                             background: pagination.page === pageNum ? '#2E7D32' : 'white',
//                             color: pagination.page === pageNum ? 'white' : '#2E7D32'
//                           }}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                   </div>
//                   <button
//                     onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
//                     disabled={pagination.page === pagination.pages}
//                     className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
//                     style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Global Backdrop for Action Menu */}
//       {Boolean(actionMenuAnchor) && (
//         <div
//           className="fixed inset-0 z-40"
//           onClick={handleActionMenuClose}
//           style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
//         />
//       )}

//       {/* Deactivate Confirmation Modal */}
//       {showDeactivateModal && selectedWarehouseForMenu && (
//         <div className="fixed inset-0 z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
//           <div
//             className="absolute inset-0"
//             style={{
//               position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
//               backgroundColor: 'rgba(0, 0, 0, 0.6)',
//               backdropFilter: 'blur(4px)'
//             }}
//             onClick={() => closeModals()}
//           />
//           <div className="flex items-center justify-center min-h-screen p-4">
//             <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '400px', zIndex: 10000 }}>
//               <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
//                 <div>
//                   <h3 className="text-lg font-semibold" style={{ color: '#E65100' }}>Deactivate Warehouse</h3>
//                   <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Confirm deactivation</p>
//                 </div>
//                 <button onClick={() => closeModals()} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
//                   <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
//                 </button>
//               </div>
//               <div className="p-6">
//                 <div className="flex items-center justify-center mb-4">
//                   <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
//                     <PowerOff className="w-8 h-8" style={{ color: '#E65100' }} />
//                   </div>
//                 </div>
                
//                 {modalError && (
//                   <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
//                     <div className="flex items-start gap-2">
//                       <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
//                       <p className="text-sm text-red-600">{modalError}</p>
//                     </div>
//                   </div>
//                 )}
                
//                 <p className="text-center text-sm mb-2" style={{ color: '#5D4037' }}>
//                   Are you sure you want to deactivate <strong>{selectedWarehouseForMenu.name}</strong>?
//                 </p>
//                 <p className="text-center text-xs" style={{ color: '#8D6E63' }}>
//                   This warehouse will become inactive and cannot be used for future transactions.
//                 </p>
//               </div>
//               <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
//                 <button
//                   onClick={() => closeModals()}
//                   className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
//                   style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleDeactivateWarehouse(selectedWarehouseForMenu)}
//                   disabled={deactivating}
//                   className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
//                   style={{ background: '#E65100' }}
//                 >
//                   {deactivating ? (
//                     <><Loader className="w-4 h-4 animate-spin" /> Deactivating...</>
//                   ) : (
//                     <><PowerOff className="w-4 h-4" /> Deactivate</>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && selectedWarehouseForMenu && (
//         <div className="fixed inset-0 z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
//           <div
//             className="absolute inset-0"
//             style={{
//               position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
//               backgroundColor: 'rgba(0, 0, 0, 0.6)',
//               backdropFilter: 'blur(4px)'
//             }}
//             onClick={() => closeModals()}
//           />
//           <div className="flex items-center justify-center min-h-screen p-4">
//             <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '400px', zIndex: 10000 }}>
//               <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
//                 <div>
//                   <h3 className="text-lg font-semibold" style={{ color: '#D32F2F' }}>Delete Warehouse</h3>
//                   <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Permanently delete warehouse</p>
//                 </div>
//                 <button onClick={() => closeModals()} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
//                   <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
//                 </button>
//               </div>
//               <div className="p-6">
//                 <div className="flex items-center justify-center mb-4">
//                   <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
//                     <Trash2 className="w-8 h-8" style={{ color: '#D32F2F' }} />
//                   </div>
//                 </div>
                
//                 {modalError && (
//                   <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
//                     <div className="flex items-start gap-2">
//                       <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
//                       <p className="text-sm text-red-600">{modalError}</p>
//                     </div>
//                   </div>
//                 )}
                
//                 <p className="text-center text-sm mb-2" style={{ color: '#5D4037' }}>
//                   Are you sure you want to permanently delete <strong>{selectedWarehouseForMenu.name}</strong>?
//                 </p>
//                 <p className="text-center text-xs" style={{ color: '#D32F2F' }}>
//                   This action cannot be undone. All data related to this warehouse will be permanently removed.
//                 </p>
//               </div>
//               <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
//                 <button
//                   onClick={() => closeModals()}
//                   className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
//                   style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleDeleteWarehouse(selectedWarehouseForMenu)}
//                   disabled={deleting}
//                   className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
//                   style={{ background: '#D32F2F' }}
//                 >
//                   {deleting ? (
//                     <><Loader className="w-4 h-4 animate-spin" /> Deleting...</>
//                   ) : (
//                     <><Trash2 className="w-4 h-4" /> Delete Permanently</>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Warehouses;






// src/pages/inventory/Warehouses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Warehouse, Search, Filter, Eye, Edit2, 
  Plus, Download, RefreshCw, Loader, AlertCircle,
  Building, MapPin, User, Phone, Mail, X,
  CheckCircle, XCircle, TrendingUp, Package,
  MoreVertical, PowerOff, Trash2
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Warehouses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
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
  
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedWarehouseForMenu, setSelectedWarehouseForMenu] = useState(null);

  // Modal states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Debounce search term
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

  const fetchWarehouses = useCallback(async () => {
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
        const items = data.data || [];
        const paginationData = data.pagination || {};
        
        setWarehouses(items);
        
        setPagination({
          page: paginationData.page || pagination.page,
          limit: paginationData.limit || pagination.limit,
          total: paginationData.total || 0,
          pages: paginationData.pages || 1
        });
        
        const activeCount = items.filter(w => w.isActive).length;
        const totalCapacity = items.reduce((sum, w) => sum + (w.capacity?.total || 0), 0);
        const totalStock = items.reduce((sum, w) => sum + (w.summary?.totalStockUnits || 0), 0);
        
        setStats({
          totalWarehouses: paginationData.total || items.length,
          activeWarehouses: activeCount,
          totalCapacity,
          totalStock
        });
      } else {
        setError(data.message || t('warehouses.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, isActiveFilter, navigate, t]);

  const handleDeactivateWarehouse = async (warehouse) => {
    setDeactivating(true);
    setModalError(null);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/warehouse/${warehouse._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: false })
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setShowDeactivateModal(false);
        setSelectedWarehouseForMenu(null);
        fetchWarehouses();
      } else {
        setModalError(data.message || data.error || t('warehouses.errors.deactivateFailed'));
      }
    } catch (error) {
      console.error('Error deactivating warehouse:', error);
      setModalError(t('common.networkError'));
    } finally {
      setDeactivating(false);
    }
  };

  const handleDeleteWarehouse = async (warehouse) => {
    setDeleting(true);
    setModalError(null);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/warehouse/${warehouse._id}/hard`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setShowDeleteModal(false);
        setSelectedWarehouseForMenu(null);
        fetchWarehouses();
      } else {
        setModalError(data.message || data.error || t('warehouses.errors.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      setModalError(t('common.networkError'));
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setIsActiveFilter('all');
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchWarehouses();
  };

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleActionMenuOpen = (event, warehouse) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedWarehouseForMenu(warehouse);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedWarehouseForMenu(null);
  };

  const openDeactivateModal = (warehouse) => {
    setSelectedWarehouseForMenu(warehouse);
    setModalError(null);
    setShowDeactivateModal(true);
    setActionMenuAnchor(null);
  };

  const openDeleteModal = (warehouse) => {
    setSelectedWarehouseForMenu(warehouse);
    setModalError(null);
    setShowDeleteModal(true);
    setActionMenuAnchor(null);
  };

  const closeModals = () => {
    setShowDeactivateModal(false);
    setShowDeleteModal(false);
    setSelectedWarehouseForMenu(null);
    setModalError(null);
  };

  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

  // Smart dropdown positioning
  const MENU_HEIGHT = 200;
  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  if (loading && warehouses.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('warehouses.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('warehouses.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('warehouses.subtitle')}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('warehouses.stats.totalWarehouses')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalWarehouses}</p>
            </div>
            <Warehouse className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('warehouses.stats.activeWarehouses')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.activeWarehouses}</p>
            </div>
            <CheckCircle className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('warehouses.stats.totalCapacity')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatNumber(stats.totalCapacity)} {warehouses[0]?.capacity?.unit || t('warehouses.units')}</p>
            </div>
            <Package className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('warehouses.stats.totalStock')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatNumber(stats.totalStock)} {t('warehouses.unitLabel')}</p>
            </div>
            <TrendingUp className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchWarehouses} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
              <input
                type="text"
                placeholder={t('warehouses.searchPlaceholder')}
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
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-[#F1F8E9]' : 'hover:bg-gray-50'}`}
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
            >
              <Filter className="w-4 h-4" />
              {t('common.filter')}
              {(isActiveFilter !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
            {/* <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <Download className="w-4 h-4" />
              {t('common.export')}
            </button> */}
            <button 
              onClick={() => navigate('/warehouses/add')}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <Plus className="w-4 h-4" />
              {t('warehouses.buttons.addWarehouse')}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('warehouses.filters.status')}</label>
                <select 
                  value={isActiveFilter} 
                  onChange={(e) => setIsActiveFilter(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="active">{t('warehouses.status.active')}</option>
                  <option value="inactive">{t('warehouses.status.inactive')}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={clearFilters}
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                {t('common.clearAll')}
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-1 rounded-lg text-white text-sm"
                style={{ background: '#2E7D32' }}
              >
                {t('common.apply')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Warehouses Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
          </div>
        ) : warehouses.length === 0 ? (
          <div className="text-center py-12">
            <Warehouse className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('warehouses.noWarehousesFound')}</p>
            {(searchTerm || isActiveFilter !== 'all') && (
              <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
                {t('common.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.table.code')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.table.name')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.table.location')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.table.manager')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.table.capacity')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.table.stock')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.table.status')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('warehouses.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((warehouse, index) => {
                    const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedWarehouseForMenu?._id === warehouse._id;
                    
                    return (
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
                            <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{warehouse.manager?.name || 'N/A'}</p>
                            {warehouse.manager?.phone && (
                              <p className="text-xs" style={{ color: '#8D6E63' }}>{warehouse.manager?.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{formatNumber(warehouse.capacity?.total)} {warehouse.capacity?.unit}</p>
                            <p className="text-xs" style={{ color: '#8D6E63' }}>{t('warehouses.used')}: {formatNumber(warehouse.capacity?.used)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-semibold" style={{ color: '#FF6F00' }}>{formatNumber(warehouse.summary?.totalStockUnits || 0)} {t('warehouses.unitLabel')}</p>
                            <p className="text-xs" style={{ color: '#8D6E63' }}>{warehouse.summary?.totalProducts || 0} {t('warehouses.productsCount')}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${
                            warehouse.isActive ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'
                          }`}>
                            {warehouse.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {warehouse.isActive ? t('warehouses.status.active') : t('warehouses.status.inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => handleActionMenuOpen(e, warehouse)}
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
                                width: '180px',
                                position: 'fixed',
                                top: openUpward
                                  ? anchorRect.top - MENU_HEIGHT - 4
                                  : anchorRect.bottom + 4,
                                left: anchorRect.left - 120,
                              }}
                            >
                              <button
                                onClick={() => {
                                  navigate(`/warehouses/view/${warehouse._id}`);
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
                                  navigate(`/warehouses/edit/${warehouse._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#FF6F00' }}
                              >
                                <Edit2 className="w-4 h-4" />
                                {t('common.edit')}
                              </button>

                             

                              <button
                                onClick={() => openDeleteModal(warehouse)}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 transition-colors border-t"
                                style={{ color: '#D32F2F', borderColor: '#E8F5E9' }}
                              >
                                <Trash2 className="w-4 h-4" />
                                {t('warehouses.buttons.deletePermanently')}
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
            
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                <div className="text-xs" style={{ color: '#8D6E63' }}>
                  {t('warehouses.pagination.showing', {
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

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && selectedWarehouseForMenu && (
        <div className="fixed inset-0 z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div
            className="absolute inset-0"
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => closeModals()}
          />
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '400px', zIndex: 10000 }}>
              <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#E65100' }}>{t('warehouses.modals.deactivate.title')}</h3>
                  <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('warehouses.modals.deactivate.subtitle')}</p>
                </div>
                <button onClick={() => closeModals()} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                    <PowerOff className="w-8 h-8" style={{ color: '#E65100' }} />
                  </div>
                </div>
                
                {modalError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600">{modalError}</p>
                    </div>
                  </div>
                )}
                
                <p className="text-center text-sm mb-2" style={{ color: '#5D4037' }}>
                  {t('warehouses.modals.deactivate.confirmMessage', { name: selectedWarehouseForMenu.name })}
                </p>
                <p className="text-center text-xs" style={{ color: '#8D6E63' }}>
                  {t('warehouses.modals.deactivate.warningMessage')}
                </p>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
                <button
                  onClick={() => closeModals()}
                  className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
                  style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => handleDeactivateWarehouse(selectedWarehouseForMenu)}
                  disabled={deactivating}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: '#E65100' }}
                >
                  {deactivating ? (
                    <><Loader className="w-4 h-4 animate-spin" /> {t('common.deactivating')}...</>
                  ) : (
                    <><PowerOff className="w-4 h-4" /> {t('warehouses.buttons.deactivate')}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWarehouseForMenu && (
        <div className="fixed inset-0 z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div
            className="absolute inset-0"
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => closeModals()}
          />
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '400px', zIndex: 10000 }}>
              <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#D32F2F' }}>{t('warehouses.modals.delete.title')}</h3>
                  <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('warehouses.modals.delete.subtitle')}</p>
                </div>
                <button onClick={() => closeModals()} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-8 h-8" style={{ color: '#D32F2F' }} />
                  </div>
                </div>
                
                {modalError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-600">{modalError}</p>
                    </div>
                  </div>
                )}
                
                <p className="text-center text-sm mb-2" style={{ color: '#5D4037' }}>
                  {t('warehouses.modals.delete.confirmMessage', { name: selectedWarehouseForMenu.name })}
                </p>
                <p className="text-center text-xs" style={{ color: '#D32F2F' }}>
                  {t('warehouses.modals.delete.warningMessage')}
                </p>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
                <button
                  onClick={() => closeModals()}
                  className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
                  style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => handleDeleteWarehouse(selectedWarehouseForMenu)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: '#D32F2F' }}
                >
                  {deleting ? (
                    <><Loader className="w-4 h-4 animate-spin" /> {t('common.deleting')}...</>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> {t('warehouses.buttons.deletePermanently')}</>
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

export default Warehouses;
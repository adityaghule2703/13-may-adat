// // src/pages/farmers/Farmers.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Users, Search, Filter, Eye, Edit2, 
//   Download, UserPlus, Phone, 
//   DollarSign, Wallet, CheckCircle, XCircle, 
//   Loader, RefreshCw, AlertCircle,
//   User, X,
//   MoreVertical,
//   TrendingUp as AdvanceIcon, PowerOff, Receipt
// } from 'lucide-react';
// import BASE_URL from '../../config/Config';
// import AdvancePaymentModal from './AdvancePaymentModal';

// const Farmers = () => {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [farmers, setFarmers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 5,
//     total: 0,
//     pages: 1
//   });
//   const [stats, setStats] = useState({
//     totalFarmers: 0,
//     totalPurchaseValue: 0,
//     totalPendingDues: 0,
//     activeFarmers: 0
//   });
//   const [showFilters, setShowFilters] = useState(false);
//   const [filters, setFilters] = useState({
//     status: 'all',
//     city: '',
//     state: ''
//   });
  
//   const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
//   const [selectedFarmerForMenu, setSelectedFarmerForMenu] = useState(null);
  
//   const [showAdvanceModal, setShowAdvanceModal] = useState(false);
//   const [selectedFarmer, setSelectedFarmer] = useState(null);

//   const [showDeactivateModal, setShowDeactivateModal] = useState(false);
//   const [deactivating, setDeactivating] = useState(false);

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

//   const fetchFarmers = useCallback(async () => {
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
//       if (filters.status !== 'all') queryParams.append('status', filters.status);
//       if (filters.city) queryParams.append('city', filters.city);
//       if (filters.state) queryParams.append('state', filters.state);

//       const response = await fetch(`${BASE_URL}/farmers?${queryParams}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.status === 401) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('refreshToken');
//         localStorage.removeItem('isLoggedIn');
//         localStorage.removeItem('user');
//         navigate('/login');
//         return;
//       }

//       const data = await response.json();
//       if (data.success) {
//         setFarmers(data.data);
//         setPagination(data.pagination);
//         const totalPurchaseValue = data.data.reduce((sum, f) => sum + (f.totalPurchaseValue || 0), 0);
//         const totalPendingDues = data.data.reduce((sum, f) => sum + (f.pendingDues || 0), 0);
//         const activeFarmers = data.data.filter(f => f.isActive).length;
//         setStats({
//           totalFarmers: data.pagination.total || data.data.length,
//           totalPurchaseValue,
//           totalPendingDues,
//           activeFarmers
//         });
//       } else {
//         setError(data.message || 'Failed to fetch farmers');
//       }
//     } catch (error) {
//       console.error('Error fetching farmers:', error);
//       setError('Network error. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.status, filters.city, filters.state, navigate]);

//   const handleDeactivateFarmer = async (farmer) => {
//     setDeactivating(true);
//     try {
//       const token = getToken();
//       const response = await fetch(`${BASE_URL}/farmers/${farmer._id}/deactivate`, {
//         method: 'PATCH',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
//       if (response.status === 401) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('refreshToken');
//         localStorage.removeItem('isLoggedIn');
//         localStorage.removeItem('user');
//         navigate('/login');
//         return;
//       }
//       const data = await response.json();
//       if (data.success) {
//         setShowDeactivateModal(false);
//         setSelectedFarmer(null);
//         fetchFarmers();
//         alert(`${farmer.name} has been deactivated successfully`);
//       } else {
//         setError(data.message || 'Failed to deactivate farmer');
//         setShowDeactivateModal(false);
//       }
//     } catch (error) {
//       console.error('Error deactivating farmer:', error);
//       setError('Network error. Please try again.');
//     } finally {
//       setDeactivating(false);
//       setActionMenuAnchor(null);
//       setSelectedFarmerForMenu(null);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchFarmers();
//     setRefreshing(false);
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setDebouncedSearchTerm('');
//     setFilters({ status: 'all', city: '', state: '' });
//     setPagination(prev => ({ ...prev, page: 1 }));
//     setShowFilters(false);
//   };

//   const applyFilters = () => {
//     setPagination(prev => ({ ...prev, page: 1 }));
//     setShowFilters(false);
//     fetchFarmers();
//   };

//   useEffect(() => {
//     fetchFarmers();
//   }, [fetchFarmers]);

//   const handleActionMenuOpen = (event, farmer) => {
//     setActionMenuAnchor(event.currentTarget);
//     setSelectedFarmerForMenu(farmer);
//   };

//   const handleActionMenuClose = () => {
//     setActionMenuAnchor(null);
//     setSelectedFarmerForMenu(null);
//   };

//   const openAdvanceModal = (farmer) => {
//     setSelectedFarmer(farmer);
//     setShowAdvanceModal(true);
//     handleActionMenuClose();
//   };

//   const openDeactivateModal = (farmer) => {
//     setSelectedFarmer(farmer);
//     setShowDeactivateModal(true);
//     handleActionMenuClose();
//   };

//   const closeAdvanceModal = () => {
//     setShowAdvanceModal(false);
//     setSelectedFarmer(null);
//   };

//   const handleAdvanceSuccess = () => fetchFarmers();

//   const getStatusColor = (isActive) =>
//     isActive
//       ? { bg: '#E8F5E9', text: '#2E7D32', label: 'Active' }
//       : { bg: '#FFEBEE', text: '#D32F2F', label: 'Inactive' };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString();
//   };

//   const formatCurrency = (amount) =>
//     new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0
//     }).format(amount || 0);

//   // Smart dropdown positioning
//   const MENU_HEIGHT = 230; // Increased height for new button
//   const anchorRect = actionMenuAnchor?.getBoundingClientRect();
//   const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
//   const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

//   if (loading && farmers.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
//         <span className="ml-2" style={{ color: '#2E7D32' }}>Loading farmers...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Farmers</h1>
//           <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Manage and track all your farmers</p>
//         </div>
//       </div>

//       {/* Stats Summary */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Total Farmers</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalFarmers}</p>
//             </div>
//             <Users className="w-8 h-8" style={{ color: '#43A047' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Total Purchase Value</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.totalPurchaseValue)}</p>
//             </div>
//             <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Pending Dues</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#FF6F00' }}>{formatCurrency(stats.totalPendingDues)}</p>
//             </div>
//             <Wallet className="w-8 h-8" style={{ color: '#FF6F00' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Active Farmers</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.activeFarmers}</p>
//             </div>
//             <CheckCircle className="w-8 h-8" style={{ color: '#2E7D32' }} />
//           </div>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
//           <AlertCircle className="w-5 h-5 text-red-500" />
//           <span className="text-sm text-red-600">{error}</span>
//           <button onClick={fetchFarmers} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
//         </div>
//       )}

//       {/* Search and Filter Bar */}
//       <div className="bg-white rounded-xl p-4 shadow-sm">
//         <div className="flex flex-wrap gap-4 items-center justify-between">
//           {/* Search Box */}
//           <div className="w-80">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
//               <input
//                 type="text"
//                 placeholder="Search farmers..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1"
//                 style={{ borderColor: '#C8E6C9', focusRingColor: '#2E7D32' }}
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
//               className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-all ${showFilters ? 'bg-[#F1F8E9]' : 'hover:bg-gray-50'}`}
//               style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
//             >
//               <Filter className="w-4 h-4" />
//               Filters
//               {(filters.status !== 'all' || filters.city || filters.state) && (
//                 <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
//               )}
//             </button>
            
//             <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
//               <Download className="w-4 h-4" />
//               Export
//             </button>
//             <button
//               onClick={() => navigate('/farmers/add')}
//               className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
//               style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//             >
//               <UserPlus className="w-4 h-4" />
//               Add New Farmer
//             </button>
//           </div>
//         </div>

//         {showFilters && (
//           <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Status</label>
//                 <select
//                   value={filters.status}
//                   onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg text-sm"
//                   style={{ borderColor: '#C8E6C9' }}
//                 >
//                   <option value="all">All</option>
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>City</label>
//                 <input
//                   type="text"
//                   value={filters.city}
//                   onChange={(e) => setFilters({ ...filters, city: e.target.value })}
//                   placeholder="Filter by city"
//                   className="w-full px-3 py-2 border rounded-lg text-sm"
//                   style={{ borderColor: '#C8E6C9' }}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>State</label>
//                 <input
//                   type="text"
//                   value={filters.state}
//                   onChange={(e) => setFilters({ ...filters, state: e.target.value })}
//                   placeholder="Filter by state"
//                   className="w-full px-3 py-2 border rounded-lg text-sm"
//                   style={{ borderColor: '#C8E6C9' }}
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-4">
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

//       {/* Farmers Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
//             <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>Loading...</span>
//           </div>
//         ) : farmers.length === 0 ? (
//           <div className="text-center py-12">
//             <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
//             <p className="text-sm" style={{ color: '#8D6E63' }}>No farmers found</p>
//             {(searchTerm || filters.status !== 'all' || filters.city || filters.state) && (
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
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Name</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Contact</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Location</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Purchase Value</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Pending Dues</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Status</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Joined</th>
//                     <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {farmers.map((farmer, index) => {
//                     const statusColors = getStatusColor(farmer.isActive);
//                     const isActionMenuOpen =
//                       Boolean(actionMenuAnchor) && selectedFarmerForMenu?._id === farmer._id;

//                     return (
//                       <tr
//                         key={farmer._id}
//                         className="hover:bg-green-50 transition-colors"
//                         style={{ borderBottom: index !== farmers.length - 1 ? '1px solid #E8F5E9' : 'none' }}
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-2">
//                             <div className="w-8 h-8 rounded-full bg-[#F1F8E9] flex items-center justify-center">
//                               <User className="w-4 h-4" style={{ color: '#2E7D32' }} />
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{farmer.name}</p>
//                               {farmer.gstNumber && (
//                                 <p className="text-xs" style={{ color: '#8D6E63' }}>GST: {farmer.gstNumber}</p>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-1">
//                             <Phone className="w-3 h-3" style={{ color: '#C8E6C9' }} />
//                             <span className="text-sm" style={{ color: '#5D4037' }}>{farmer.mobile}</span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div>
//                             <p className="text-sm" style={{ color: '#5D4037' }}>{farmer.village || 'N/A'}</p>
//                             <p className="text-xs" style={{ color: '#8D6E63' }}>{farmer.city}, {farmer.state}</p>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>
//                             {formatCurrency(farmer.totalPurchaseValue)}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-sm font-semibold" style={{ color: farmer.pendingDues > 0 ? '#FF6F00' : '#4CAF50' }}>
//                             {formatCurrency(farmer.pendingDues)}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{
//                             background: statusColors.bg,
//                             color: statusColors.text
//                           }}>
//                             {farmer.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
//                             {statusColors.label}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-xs" style={{ color: '#8D6E63' }}>{formatDate(farmer.createdAt)}</span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-center">
//                           <button
//                             onClick={(e) => handleActionMenuOpen(e, farmer)}
//                             className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
//                             style={{ color: '#2E7D32' }}
//                           >
//                             <MoreVertical className="w-4 h-4" />
//                             <span className="text-xs font-medium">Actions</span>
//                           </button>

//                           {/* Dropdown — flips upward when near bottom of screen */}
//                           {isActionMenuOpen && anchorRect && (
//                             <div
//                               className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
//                               style={{
//                                 borderColor: '#E8F5E9',
//                                 width: '200px',
//                                 position: 'fixed',
//                                 top: openUpward
//                                   ? anchorRect.top - MENU_HEIGHT - 4
//                                   : anchorRect.bottom + 4,
//                                 left: anchorRect.left - 140,
//                               }}
//                             >
//                               {/* View Details */}
//                               <button
//                                 onClick={() => {
//                                   navigate(`/farmers/view/${farmer._id}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
//                                 style={{ color: '#2E7D32' }}
//                               >
//                                 <Eye className="w-4 h-4" />
//                                 View Details
//                               </button>

//                               {/* Edit */}
//                               <button
//                                 onClick={() => {
//                                   navigate(`/farmers/edit/${farmer._id}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
//                                 style={{ color: '#FF6F00' }}
//                               >
//                                 <Edit2 className="w-4 h-4" />
//                                 Edit
//                               </button>

//                               {/* View Payments */}
//                               <button
//                                 onClick={() => {
//                                   navigate(`/farmers/payments/${farmer._id}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors border-t"
//                                 style={{ color: '#1565C0', borderColor: '#E8F5E9' }}
//                               >
//                                 <Receipt className="w-4 h-4" />
//                                 View Payments
//                               </button>

//                               {/* Dues Button */}
//                               <button
//                                 onClick={() => {
//                                   navigate(`/farmers/dues/${farmer._id}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 transition-colors"
//                                 style={{ color: '#E65100', borderColor: '#E8F5E9' }}
//                               >
//                                 <DollarSign className="w-4 h-4" />
//                                 View Dues
//                               </button>

//                               {/* Deactivate */}
//                               {farmer.isActive && (
//                                 <button
//                                   onClick={() => openDeactivateModal(farmer)}
//                                   className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 transition-colors"
//                                   style={{ color: '#D32F2F' }}
//                                 >
//                                   <PowerOff className="w-4 h-4" />
//                                   Deactivate
//                                 </button>
//                               )}

//                               {/* Advance Payment */}
//                               <button
//                                 onClick={() => openAdvanceModal(farmer)}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors border-t"
//                                 style={{ color: '#43A047', borderColor: '#E8F5E9' }}
//                               >
//                                 <AdvanceIcon className="w-4 h-4" />
//                                 Advance Payment
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

//             {/* Pagination */}
//             {pagination.pages > 1 && (
//               <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
//                 <div className="text-xs" style={{ color: '#8D6E63' }}>
//                   Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
//                   {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} farmers
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
//                       if (pagination.pages <= 5) pageNum = i + 1;
//                       else if (pagination.page <= 3) pageNum = i + 1;
//                       else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
//                       else pageNum = pagination.page - 2 + i;
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
//       {showDeactivateModal && selectedFarmer && (
//         <div
//           className="fixed inset-0 z-50"
//           style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
//         >
//           <div
//             className="absolute inset-0"
//             style={{
//               position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
//               backgroundColor: 'rgba(0, 0, 0, 0.6)',
//               backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'
//             }}
//             onClick={() => { setShowDeactivateModal(false); setSelectedFarmer(null); }}
//           />
//           <div className="flex items-center justify-center min-h-screen p-4">
//             <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '400px', zIndex: 10000 }}>
//               <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
//                 <div>
//                   <h3 className="text-lg font-semibold" style={{ color: '#D32F2F' }}>Deactivate Farmer</h3>
//                   <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Confirm deactivation</p>
//                 </div>
//                 <button
//                   onClick={() => { setShowDeactivateModal(false); setSelectedFarmer(null); }}
//                   className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
//                 >
//                   <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
//                 </button>
//               </div>
//               <div className="p-6">
//                 <div className="flex items-center justify-center mb-4">
//                   <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
//                     <PowerOff className="w-8 h-8 text-red-600" />
//                   </div>
//                 </div>
//                 <p className="text-center text-sm mb-2" style={{ color: '#5D4037' }}>
//                   Are you sure you want to deactivate <strong>{selectedFarmer.name}</strong>?
//                 </p>
//                 <p className="text-center text-xs" style={{ color: '#8D6E63' }}>
//                   This action will deactivate the farmer account. They will not be able to make purchases or access their account until reactivated.
//                 </p>
//               </div>
//               <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
//                 <button
//                   onClick={() => { setShowDeactivateModal(false); setSelectedFarmer(null); }}
//                   className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
//                   style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleDeactivateFarmer(selectedFarmer)}
//                   disabled={deactivating}
//                   className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
//                   style={{ background: '#D32F2F' }}
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

//       {/* Advance Payment Modal */}
//       <AdvancePaymentModal
//         isOpen={showAdvanceModal}
//         farmer={selectedFarmer}
//         onClose={closeAdvanceModal}
//         onSuccess={handleAdvanceSuccess}
//         getToken={getToken}
//         navigate={navigate}
//         formatCurrency={formatCurrency}
//       />
//     </div>
//   );
// };

// export default Farmers;




// src/pages/farmers/Farmers.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { 
//   Users, Search, Filter, Eye, Edit2, 
//   Download, UserPlus, Phone, 
//   DollarSign, Wallet, CheckCircle, XCircle, 
//   Loader, RefreshCw, AlertCircle,
//   User, X,
//   MoreVertical,
//   TrendingUp as AdvanceIcon, PowerOff, Receipt
// } from 'lucide-react';
// import BASE_URL from '../../config/Config';
// import AdvancePaymentModal from './AdvancePaymentModal';

// const Farmers = () => {
//   const { t } = useTranslation();
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [farmers, setFarmers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 5,
//     total: 0,
//     pages: 1
//   });
//   const [stats, setStats] = useState({
//     totalFarmers: 0,
//     totalPurchaseValue: 0,
//     totalPendingDues: 0,
//     activeFarmers: 0
//   });
//   const [showFilters, setShowFilters] = useState(false);
//   const [filters, setFilters] = useState({
//     status: 'all',
//     city: '',
//     state: ''
//   });
  
//   const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
//   const [selectedFarmerForMenu, setSelectedFarmerForMenu] = useState(null);
  
//   const [showAdvanceModal, setShowAdvanceModal] = useState(false);
//   const [selectedFarmer, setSelectedFarmer] = useState(null);

//   const [showDeactivateModal, setShowDeactivateModal] = useState(false);
//   const [deactivating, setDeactivating] = useState(false);

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

//   const fetchFarmers = useCallback(async () => {
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
//       if (filters.status !== 'all') queryParams.append('status', filters.status);
//       if (filters.city) queryParams.append('city', filters.city);
//       if (filters.state) queryParams.append('state', filters.state);

//       const response = await fetch(`${BASE_URL}/farmers?${queryParams}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.status === 401) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('refreshToken');
//         localStorage.removeItem('isLoggedIn');
//         localStorage.removeItem('user');
//         navigate('/login');
//         return;
//       }

//       const data = await response.json();
//       if (data.success) {
//         setFarmers(data.data);
//         setPagination(data.pagination);
//         const totalPurchaseValue = data.data.reduce((sum, f) => sum + (f.totalPurchaseValue || 0), 0);
//         const totalPendingDues = data.data.reduce((sum, f) => sum + (f.pendingDues || 0), 0);
//         const activeFarmers = data.data.filter(f => f.isActive).length;
//         setStats({
//           totalFarmers: data.pagination.total || data.data.length,
//           totalPurchaseValue,
//           totalPendingDues,
//           activeFarmers
//         });
//       } else {
//         setError(data.message || t('farmers.errors.fetchFailed'));
//       }
//     } catch (error) {
//       console.error('Error fetching farmers:', error);
//       setError(t('farmers.errors.networkError'));
//     } finally {
//       setLoading(false);
//     }
//   }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.status, filters.city, filters.state, navigate, t]);

//   const handleDeactivateFarmer = async (farmer) => {
//     setDeactivating(true);
//     try {
//       const token = getToken();
//       const response = await fetch(`${BASE_URL}/farmers/${farmer._id}/deactivate`, {
//         method: 'PATCH',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
//       if (response.status === 401) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('refreshToken');
//         localStorage.removeItem('isLoggedIn');
//         localStorage.removeItem('user');
//         navigate('/login');
//         return;
//       }
//       const data = await response.json();
//       if (data.success) {
//         setShowDeactivateModal(false);
//         setSelectedFarmer(null);
//         fetchFarmers();
//         alert(t('farmers.messages.deactivateSuccess', { name: farmer.name }));
//       } else {
//         setError(data.message || t('farmers.errors.deactivateFailed'));
//         setShowDeactivateModal(false);
//       }
//     } catch (error) {
//       console.error('Error deactivating farmer:', error);
//       setError(t('farmers.errors.networkError'));
//     } finally {
//       setDeactivating(false);
//       setActionMenuAnchor(null);
//       setSelectedFarmerForMenu(null);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchFarmers();
//     setRefreshing(false);
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setDebouncedSearchTerm('');
//     setFilters({ status: 'all', city: '', state: '' });
//     setPagination(prev => ({ ...prev, page: 1 }));
//     setShowFilters(false);
//   };

//   const applyFilters = () => {
//     setPagination(prev => ({ ...prev, page: 1 }));
//     setShowFilters(false);
//     fetchFarmers();
//   };

//   useEffect(() => {
//     fetchFarmers();
//   }, [fetchFarmers]);

//   const handleActionMenuOpen = (event, farmer) => {
//     setActionMenuAnchor(event.currentTarget);
//     setSelectedFarmerForMenu(farmer);
//   };

//   const handleActionMenuClose = () => {
//     setActionMenuAnchor(null);
//     setSelectedFarmerForMenu(null);
//   };

//   const openAdvanceModal = (farmer) => {
//     setSelectedFarmer(farmer);
//     setShowAdvanceModal(true);
//     handleActionMenuClose();
//   };

//   const openDeactivateModal = (farmer) => {
//     setSelectedFarmer(farmer);
//     setShowDeactivateModal(true);
//     handleActionMenuClose();
//   };

//   const closeAdvanceModal = () => {
//     setShowAdvanceModal(false);
//     setSelectedFarmer(null);
//   };

//   const handleAdvanceSuccess = () => fetchFarmers();

//   const getStatusColor = (isActive) =>
//     isActive
//       ? { bg: '#E8F5E9', text: '#2E7D32', label: t('farmers.status.active') }
//       : { bg: '#FFEBEE', text: '#D32F2F', label: t('farmers.status.inactive') };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString();
//   };

//   const formatCurrency = (amount) =>
//     new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0
//     }).format(amount || 0);

//   // Smart dropdown positioning
//   const MENU_HEIGHT = 230;
//   const anchorRect = actionMenuAnchor?.getBoundingClientRect();
//   const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
//   const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

//   if (loading && farmers.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
//         <span className="ml-2" style={{ color: '#2E7D32' }}>{t('farmers.loading')}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('farmers.title')}</h1>
//           <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('farmers.subtitle')}</p>
//         </div>
//       </div>

//       {/* Stats Summary */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.stats.totalFarmers')}</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalFarmers}</p>
//             </div>
//             <Users className="w-8 h-8" style={{ color: '#43A047' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.stats.totalPurchaseValue')}</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.totalPurchaseValue)}</p>
//             </div>
//             <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.stats.pendingDues')}</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#FF6F00' }}>{formatCurrency(stats.totalPendingDues)}</p>
//             </div>
//             <Wallet className="w-8 h-8" style={{ color: '#FF6F00' }} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-4 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.stats.activeFarmers')}</p>
//               <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.activeFarmers}</p>
//             </div>
//             <CheckCircle className="w-8 h-8" style={{ color: '#2E7D32' }} />
//           </div>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
//           <AlertCircle className="w-5 h-5 text-red-500" />
//           <span className="text-sm text-red-600">{error}</span>
//           <button onClick={fetchFarmers} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
//         </div>
//       )}

//       {/* Search and Filter Bar */}
//       <div className="bg-white rounded-xl p-4 shadow-sm">
//         <div className="flex flex-wrap gap-4 items-center justify-between">
//           {/* Search Box */}
//           <div className="w-80">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
//               <input
//                 type="text"
//                 placeholder={t('farmers.searchPlaceholder')}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1"
//                 style={{ borderColor: '#C8E6C9', focusRingColor: '#2E7D32' }}
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
//               className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-all ${showFilters ? 'bg-[#F1F8E9]' : 'hover:bg-gray-50'}`}
//               style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
//             >
//               <Filter className="w-4 h-4" />
//               {t('common.filter')}
//               {(filters.status !== 'all' || filters.city || filters.state) && (
//                 <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
//               )}
//             </button>
            
//             {/* <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
//               <Download className="w-4 h-4" />
//               {t('common.export')}
//             </button> */}
//             <button
//               onClick={() => navigate('/farmers/add')}
//               className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
//               style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//             >
//               <UserPlus className="w-4 h-4" />
//               {t('farmers.buttons.addNew')}
//             </button>
//           </div>
//         </div>

//         {showFilters && (
//           <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('farmers.filters.status')}</label>
//                 <select
//                   value={filters.status}
//                   onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg text-sm"
//                   style={{ borderColor: '#C8E6C9' }}
//                 >
//                   <option value="all">{t('common.all')}</option>
//                   <option value="active">{t('farmers.status.active')}</option>
//                   <option value="inactive">{t('farmers.status.inactive')}</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('farmers.filters.city')}</label>
//                 <input
//                   type="text"
//                   value={filters.city}
//                   onChange={(e) => setFilters({ ...filters, city: e.target.value })}
//                   placeholder={t('farmers.filters.cityPlaceholder')}
//                   className="w-full px-3 py-2 border rounded-lg text-sm"
//                   style={{ borderColor: '#C8E6C9' }}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('farmers.filters.state')}</label>
//                 <input
//                   type="text"
//                   value={filters.state}
//                   onChange={(e) => setFilters({ ...filters, state: e.target.value })}
//                   placeholder={t('farmers.filters.statePlaceholder')}
//                   className="w-full px-3 py-2 border rounded-lg text-sm"
//                   style={{ borderColor: '#C8E6C9' }}
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-4">
//               <button
//                 onClick={() => setShowFilters(false)}
//                 className="px-3 py-1 border rounded-lg text-sm"
//                 style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
//               >
//                 {t('common.cancel')}
//               </button>
//               <button
//                 onClick={applyFilters}
//                 className="px-3 py-1 rounded-lg text-white text-sm"
//                 style={{ background: '#2E7D32' }}
//               >
//                 {t('common.apply')}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Farmers Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
//             <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
//           </div>
//         ) : farmers.length === 0 ? (
//           <div className="text-center py-12">
//             <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
//             <p className="text-sm" style={{ color: '#8D6E63' }}>{t('farmers.noFarmersFound')}</p>
//             {(searchTerm || filters.status !== 'all' || filters.city || filters.state) && (
//               <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
//                 {t('farmers.buttons.clearFilters')}
//               </button>
//             )}
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.name')}</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.contact')}</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.location')}</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.purchaseValue')}</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.pendingDues')}</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.status')}</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.joined')}</th>
//                     <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.actions')}</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {farmers.map((farmer, index) => {
//                     const statusColors = getStatusColor(farmer.isActive);
//                     const isActionMenuOpen =
//                       Boolean(actionMenuAnchor) && selectedFarmerForMenu?._id === farmer._id;

//                     return (
//                       <tr
//                         key={farmer._id}
//                         className="hover:bg-green-50 transition-colors"
//                         style={{ borderBottom: index !== farmers.length - 1 ? '1px solid #E8F5E9' : 'none' }}
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-2">
//                             <div className="w-8 h-8 rounded-full bg-[#F1F8E9] flex items-center justify-center">
//                               <User className="w-4 h-4" style={{ color: '#2E7D32' }} />
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{farmer.name}</p>
//                               {farmer.gstNumber && (
//                                 <p className="text-xs" style={{ color: '#8D6E63' }}>GST: {farmer.gstNumber}</p>
//                               )}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-1">
//                             <Phone className="w-3 h-3" style={{ color: '#C8E6C9' }} />
//                             <span className="text-sm" style={{ color: '#5D4037' }}>{farmer.mobile}</span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div>
//                             <p className="text-sm" style={{ color: '#5D4037' }}>{farmer.village || 'N/A'}</p>
//                             <p className="text-xs" style={{ color: '#8D6E63' }}>{farmer.city}, {farmer.state}</p>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>
//                             {formatCurrency(farmer.totalPurchaseValue)}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-sm font-semibold" style={{ color: farmer.pendingDues > 0 ? '#FF6F00' : '#4CAF50' }}>
//                             {formatCurrency(farmer.pendingDues)}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{
//                             background: statusColors.bg,
//                             color: statusColors.text
//                           }}>
//                             {farmer.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
//                             {statusColors.label}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className="text-xs" style={{ color: '#8D6E63' }}>{formatDate(farmer.createdAt)}</span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-center">
//                           <button
//                             onClick={(e) => handleActionMenuOpen(e, farmer)}
//                             className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
//                             style={{ color: '#2E7D32' }}
//                           >
//                             <MoreVertical className="w-4 h-4" />
//                             <span className="text-xs font-medium">{t('common.actions')}</span>
//                           </button>

//                           {/* Dropdown */}
//                           {isActionMenuOpen && anchorRect && (
//                             <div
//                               className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
//                               style={{
//                                 borderColor: '#E8F5E9',
//                                 width: '200px',
//                                 position: 'fixed',
//                                 top: openUpward
//                                   ? anchorRect.top - MENU_HEIGHT - 4
//                                   : anchorRect.bottom + 4,
//                                 left: anchorRect.left - 140,
//                               }}
//                             >
//                               <button
//                                 onClick={() => {
//                                   navigate(`/farmers/view/${farmer._id}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
//                                 style={{ color: '#2E7D32' }}
//                               >
//                                 <Eye className="w-4 h-4" />
//                                 {t('common.view')}
//                               </button>

//                               <button
//                                 onClick={() => {
//                                   navigate(`/farmers/edit/${farmer._id}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
//                                 style={{ color: '#FF6F00' }}
//                               >
//                                 <Edit2 className="w-4 h-4" />
//                                 {t('common.edit')}
//                               </button>

//                               <button
//                                 onClick={() => {
//                                   navigate(`/farmers/payments/${farmer._id}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors border-t"
//                                 style={{ color: '#1565C0', borderColor: '#E8F5E9' }}
//                               >
//                                 <Receipt className="w-4 h-4" />
//                                 {t('farmers.actions.viewPayments')}
//                               </button>

//                               <button
//                                 onClick={() => {
//                                   navigate(`/farmers/dues/${farmer._id}`);
//                                   handleActionMenuClose();
//                                 }}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 transition-colors"
//                                 style={{ color: '#E65100', borderColor: '#E8F5E9' }}
//                               >
//                                 <DollarSign className="w-4 h-4" />
//                                 {t('farmers.actions.viewDues')}
//                               </button>

//                               {farmer.isActive && (
//                                 <button
//                                   onClick={() => openDeactivateModal(farmer)}
//                                   className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 transition-colors"
//                                   style={{ color: '#D32F2F' }}
//                                 >
//                                   <PowerOff className="w-4 h-4" />
//                                   {t('farmers.actions.deactivate')}
//                                 </button>
//                               )}

//                               <button
//                                 onClick={() => openAdvanceModal(farmer)}
//                                 className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors border-t"
//                                 style={{ color: '#43A047', borderColor: '#E8F5E9' }}
//                               >
//                                 <AdvanceIcon className="w-4 h-4" />
//                                 {t('farmers.actions.advancePayment')}
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

//             {/* Pagination */}
//             {pagination.pages > 1 && (
//               <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
//                 <div className="text-xs" style={{ color: '#8D6E63' }}>
//                   {t('farmers.pagination.showing', {
//                     start: (pagination.page - 1) * pagination.limit + 1,
//                     end: Math.min(pagination.page * pagination.limit, pagination.total),
//                     total: pagination.total
//                   })}
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
//                     disabled={pagination.page === 1}
//                     className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
//                     style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
//                   >
//                     {t('common.previous')}
//                   </button>
//                   <div className="flex gap-1">
//                     {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
//                       let pageNum;
//                       if (pagination.pages <= 5) pageNum = i + 1;
//                       else if (pagination.page <= 3) pageNum = i + 1;
//                       else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
//                       else pageNum = pagination.page - 2 + i;
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
//                     {t('common.next')}
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
//       {showDeactivateModal && selectedFarmer && (
//         <div className="fixed inset-0 z-50">
//           <div
//             className="absolute inset-0"
//             style={{
//               backgroundColor: 'rgba(0, 0, 0, 0.6)',
//               backdropFilter: 'blur(4px)'
//             }}
//             onClick={() => { setShowDeactivateModal(false); setSelectedFarmer(null); }}
//           />
//           <div className="flex items-center justify-center min-h-screen p-4">
//             <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '400px' }}>
//               <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
//                 <div>
//                   <h3 className="text-lg font-semibold" style={{ color: '#D32F2F' }}>{t('farmers.modals.deactivate.title')}</h3>
//                   <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('farmers.modals.deactivate.subtitle')}</p>
//                 </div>
//                 <button
//                   onClick={() => { setShowDeactivateModal(false); setSelectedFarmer(null); }}
//                   className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
//                 >
//                   <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
//                 </button>
//               </div>
//               <div className="p-6">
//                 <div className="flex items-center justify-center mb-4">
//                   <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
//                     <PowerOff className="w-8 h-8 text-red-600" />
//                   </div>
//                 </div>
//                 <p className="text-center text-sm mb-2" style={{ color: '#5D4037' }}>
//                   {t('farmers.modals.deactivate.confirmMessage', { name: selectedFarmer.name })}
//                 </p>
//                 <p className="text-center text-xs" style={{ color: '#8D6E63' }}>
//                   {t('farmers.modals.deactivate.warningMessage')}
//                 </p>
//               </div>
//               <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
//                 <button
//                   onClick={() => { setShowDeactivateModal(false); setSelectedFarmer(null); }}
//                   className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
//                   style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
//                 >
//                   {t('common.cancel')}
//                 </button>
//                 <button
//                   onClick={() => handleDeactivateFarmer(selectedFarmer)}
//                   disabled={deactivating}
//                   className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
//                   style={{ background: '#D32F2F' }}
//                 >
//                   {deactivating ? (
//                     <><Loader className="w-4 h-4 animate-spin" /> {t('common.deactivating')}</>
//                   ) : (
//                     <><PowerOff className="w-4 h-4" /> {t('farmers.buttons.deactivate')}</>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Advance Payment Modal */}
//       <AdvancePaymentModal
//         isOpen={showAdvanceModal}
//         farmer={selectedFarmer}
//         onClose={closeAdvanceModal}
//         onSuccess={handleAdvanceSuccess}
//         getToken={getToken}
//         navigate={navigate}
//         formatCurrency={formatCurrency}
//       />
//     </div>
//   );
// };

// export default Farmers;







import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Users, Search, Filter, Eye, Edit2, 
  Download, UserPlus, Phone, 
  DollarSign, Wallet, CheckCircle, XCircle, 
  Loader, RefreshCw, AlertCircle,
  User, X,
  MoreVertical,
  TrendingUp as AdvanceIcon, PowerOff, Receipt
} from 'lucide-react';
import BASE_URL from '../../config/Config';
import AdvancePaymentModal from './AdvancePaymentModal';

const Farmers = () => {
  const { t } = useTranslation();
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
    status: 'all',
    city: '',
    state: ''
  });
  
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedFarmerForMenu, setSelectedFarmerForMenu] = useState(null);
  
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

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

  const fetchFarmers = useCallback(async () => {
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
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.state) queryParams.append('state', filters.state);

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
        const totalPurchaseValue = data.data.reduce((sum, f) => sum + (f.totalPurchaseValue || 0), 0);
        const totalPendingDues = data.data.reduce((sum, f) => sum + (f.pendingDues || 0), 0);
        const activeFarmers = data.data.filter(f => f.isActive).length;
        setStats({
          totalFarmers: data.pagination.total || data.data.length,
          totalPurchaseValue,
          totalPendingDues,
          activeFarmers
        });
      } else {
        setError(data.message || t('farmers.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
      setError(t('farmers.errors.networkError'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.status, filters.city, filters.state, navigate, t]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFarmers();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilters({ status: 'all', city: '', state: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchFarmers();
  };

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  const handleActionMenuOpen = (event, farmer) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedFarmerForMenu(farmer);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedFarmerForMenu(null);
  };

  const openAdvanceModal = (farmer) => {
    setSelectedFarmer(farmer);
    setShowAdvanceModal(true);
    handleActionMenuClose();
  };

  const closeAdvanceModal = () => {
    setShowAdvanceModal(false);
    setSelectedFarmer(null);
  };

  const handleAdvanceSuccess = () => fetchFarmers();

  const getStatusColor = (isActive) =>
    isActive
      ? { bg: '#E8F5E9', text: '#2E7D32', label: t('farmers.status.active') }
      : { bg: '#FFEBEE', text: '#D32F2F', label: t('farmers.status.inactive') };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);

  // Smart dropdown positioning - adjusted to stay close to button
  const MENU_HEIGHT = 280; // Height for 6 items
  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const spaceAbove = anchorRect ? anchorRect.top : 0;
  
  // Position dropdown closer to button
  let dropdownPosition = {};
  if (anchorRect) {
    if (spaceBelow >= MENU_HEIGHT + 8) {
      // Show below with minimal gap
      dropdownPosition = {
        top: anchorRect.bottom + 4,
        left: Math.min(anchorRect.right - 200, window.innerWidth - 210),
      };
    } else if (spaceAbove >= MENU_HEIGHT + 8) {
      // Show above with minimal gap
      dropdownPosition = {
        top: anchorRect.top - MENU_HEIGHT - 4,
        left: Math.min(anchorRect.right - 200, window.innerWidth - 210),
      };
    } else {
      // Show below with adjusted position if both spaces are limited
      dropdownPosition = {
        top: Math.max(8, anchorRect.bottom + 4),
        left: Math.min(anchorRect.right - 200, window.innerWidth - 210),
      };
    }
  }

  if (loading && farmers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('farmers.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('farmers.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('farmers.subtitle')}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.stats.totalFarmers')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalFarmers}</p>
            </div>
            <Users className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.stats.totalPurchaseValue')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.totalPurchaseValue)}</p>
            </div>
            <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.stats.pendingDues')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#FF6F00' }}>{formatCurrency(stats.totalPendingDues)}</p>
            </div>
            <Wallet className="w-8 h-8" style={{ color: '#FF6F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.stats.activeFarmers')}</p>
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
          <button onClick={fetchFarmers} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
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
                placeholder={t('farmers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1"
                style={{ borderColor: '#C8E6C9', focusRingColor: '#2E7D32' }}
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
              {t('common.filter')}
              {(filters.status !== 'all' || filters.city || filters.state) && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
            
            <button
              onClick={() => navigate('/farmers/add')}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <UserPlus className="w-4 h-4" />
              {t('farmers.buttons.addNew')}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('farmers.filters.status')}</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="active">{t('farmers.status.active')}</option>
                  <option value="inactive">{t('farmers.status.inactive')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('farmers.filters.city')}</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder={t('farmers.filters.cityPlaceholder')}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('farmers.filters.state')}</label>
                <input
                  type="text"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  placeholder={t('farmers.filters.statePlaceholder')}
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

      {/* Farmers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('farmers.noFarmersFound')}</p>
            {(searchTerm || filters.status !== 'all' || filters.city || filters.state) && (
              <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
                {t('farmers.buttons.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.name')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.contact')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.location')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.purchaseValue')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.pendingDues')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.joined')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('farmers.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((farmer, index) => {
                    const statusColors = getStatusColor(farmer.isActive);
                    const isActionMenuOpen =
                      Boolean(actionMenuAnchor) && selectedFarmerForMenu?._id === farmer._id;

                    return (
                      <tr
                        key={farmer._id}
                        className="hover:bg-green-50 transition-colors"
                        style={{ borderBottom: index !== farmers.length - 1 ? '1px solid #E8F5E9' : 'none' }}
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
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => handleActionMenuOpen(e, farmer)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
                            style={{ color: '#2E7D32' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="text-xs font-medium">{t('common.actions')}</span>
                          </button>

                          {/* Dropdown - positioned close to button */}
                          {isActionMenuOpen && anchorRect && (
                            <div
                              className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
                              style={{
                                borderColor: '#E8F5E9',
                                width: '220px',
                                position: 'fixed',
                                ...dropdownPosition
                              }}
                            >
                              <button
                                onClick={() => {
                                  navigate(`/farmers/view/${farmer._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#2E7D32' }}
                              >
                                <Eye className="w-4 h-4" />
                                {t('common.view')}
                              </button>

                              <button
                                onClick={() => {
                                  navigate(`/farmers/edit/${farmer._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#FF6F00' }}
                              >
                                <Edit2 className="w-4 h-4" />
                                {t('common.edit')}
                              </button>

                              <button
                                onClick={() => {
                                  navigate(`/farmers/payments/${farmer._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#1565C0' }}
                              >
                                <Receipt className="w-4 h-4" />
                                {t('farmers.actions.viewPayments')}
                              </button>

                              <button
                                onClick={() => {
                                  navigate(`/farmers/dues/${farmer._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#E65100' }}
                              >
                                <DollarSign className="w-4 h-4" />
                                {t('farmers.actions.viewDues')}
                              </button>

                              <button
                                onClick={() => openAdvanceModal(farmer)}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#43A047' }}
                              >
                                <AdvanceIcon className="w-4 h-4" />
                                {t('farmers.actions.advancePayment')}
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
                  {t('farmers.pagination.showing', {
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

      {/* Advance Payment Modal */}
      <AdvancePaymentModal
        isOpen={showAdvanceModal}
        farmer={selectedFarmer}
        onClose={closeAdvanceModal}
        onSuccess={handleAdvanceSuccess}
        getToken={getToken}
        navigate={navigate}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default Farmers;
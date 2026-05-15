// // src/pages/payment/DueSummary.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { 
//   ArrowLeft, Loader, AlertCircle, TrendingUp, TrendingDown,
//   DollarSign, Users, FileText, Calendar, Phone, User,
//   Clock, Search, X, CheckCircle, XCircle, ChevronDown,
//   ChevronRight, CreditCard, Receipt, PieChart, List,
//   Grid, RefreshCw
// } from 'lucide-react';
// import BASE_URL from '../../config/Config';

// const DueSummary = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const operatorId = queryParams.get('operatorId');
//   const daysOverdue = queryParams.get('daysOverdue') || 30;

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [summaryData, setSummaryData] = useState(null);
//   const [farmerWiseData, setFarmerWiseData] = useState([]);
//   const [allPurchases, setAllPurchases] = useState([]);
//   const [expandedFarmers, setExpandedFarmers] = useState({});
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);
//   const [activeTab, setActiveTab] = useState('summary');

//   // Debounce search term
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
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

//   const fetchDueSummary = useCallback(async () => {
//     if (!isAuthenticated()) return;
//     if (!operatorId) {
//       setError('Operator ID not found');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const token = getToken();
//       const response = await fetch(`${BASE_URL}/payments/due-summary?operatorId=${operatorId}&daysOverdue=${daysOverdue}`, {
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
//         setSummaryData(data.data.summary);
//         setFarmerWiseData(data.data.farmerWise || []);
//         setAllPurchases(data.data.purchases || []);
        
//         const initialExpanded = {};
//         (data.data.farmerWise || []).forEach(farmer => {
//           initialExpanded[farmer.farmerName] = false;
//         });
//         setExpandedFarmers(initialExpanded);
//       } else {
//         setError(data.message || 'Failed to fetch due summary');
//       }
//     } catch (err) {
//       console.error('Error fetching due summary:', err);
//       setError('Network error. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   }, [operatorId, daysOverdue, navigate]);

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchDueSummary();
//     setRefreshing(false);
//   };

//   useEffect(() => {
//     fetchDueSummary();
//   }, [fetchDueSummary]);

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'saved':
//         return { label: 'Pending', color: '#E65100', bg: '#FFF3E0', icon: Clock };
//       case 'partial':
//         return { label: 'Partial Payment', color: '#1565C0', bg: '#E3F2FD', icon: TrendingUp };
//       case 'completed':
//         return { label: 'Completed', color: '#2E7D32', bg: '#E8F5E9', icon: CheckCircle };
//       default:
//         return { label: status, color: '#8D6E63', bg: '#F5F5F5', icon: FileText };
//     }
//   };

//   const toggleFarmer = (farmerName) => {
//     setExpandedFarmers(prev => ({
//       ...prev,
//       [farmerName]: !prev[farmerName]
//     }));
//   };

//   const filteredFarmerData = farmerWiseData.filter(farmer => {
//     const matchesSearch = debouncedSearchTerm === '' || 
//       farmer.farmerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
//       farmer.farmerMobile?.includes(debouncedSearchTerm);
    
//     if (!matchesSearch) return false;
    
//     if (showOnlyOverdue) {
//       return farmer.purchases?.some(purchase => {
//         const purchaseDate = new Date(purchase.purchaseDate);
//         const today = new Date();
//         const daysDiff = Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24));
//         return daysDiff > daysOverdue;
//       });
//     }
    
//     return true;
//   });

//   const filteredPurchases = allPurchases.filter(purchase => {
//     const matchesSearch = debouncedSearchTerm === '' ||
//       purchase.farmerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
//       purchase.receiptNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
//     if (!matchesSearch) return false;
    
//     if (showOnlyOverdue) {
//       return purchase.isOverdue;
//     }
    
//     return true;
//   });

//   if (loading && !summaryData) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
//         <span className="ml-2" style={{ color: '#2E7D32' }}>Loading due summary...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => navigate('/payments')}
//             className="p-2 rounded-lg border hover:bg-gray-50 transition-all"
//             style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
//           >
//             <ArrowLeft className="w-4 h-4" />
//           </button>
//           <div>
//             <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>
//               Due Summary Report
//             </h1>
//             <p className="text-sm mt-0.5" style={{ color: '#8D6E63' }}>
//               Outstanding payments and overdue status
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={handleRefresh}
//           disabled={refreshing}
//           className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
//           style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
//         >
//           <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
//           Refresh
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
//           <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
//           <span className="text-sm text-red-600">{error}</span>
//           <button onClick={fetchDueSummary} className="ml-auto text-sm text-red-600 hover:underline">
//             Retry
//           </button>
//         </div>
//       )}

//       {summaryData && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
//             <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FFEBEE' }}>
//               <DollarSign className="w-5 h-5" style={{ color: '#D32F2F' }} />
//             </div>
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Total Due Amount</p>
//               <p className="text-xl font-bold mt-0.5" style={{ color: '#D32F2F' }}>
//                 {formatCurrency(summaryData.totalDue)}
//               </p>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
//             <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FFF3E0' }}>
//               <Clock className="w-5 h-5" style={{ color: '#E65100' }} />
//             </div>
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Overdue Amount</p>
//               <p className="text-xl font-bold mt-0.5" style={{ color: '#E65100' }}>
//                 {formatCurrency(summaryData.totalOverdue)}
//               </p>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
//             <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#E8F5E9' }}>
//               <ShoppingBag className="w-5 h-5" style={{ color: '#2E7D32' }} />
//             </div>
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Total Purchases</p>
//               <p className="text-xl font-bold mt-0.5" style={{ color: '#2E7D32' }}>
//                 {summaryData.totalPurchases || 0}
//               </p>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
//             <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#E3F2FD' }}>
//               <TrendingDown className="w-5 h-5" style={{ color: '#1565C0' }} />
//             </div>
//             <div>
//               <p className="text-xs" style={{ color: '#8D6E63' }}>Due Purchases</p>
//               <p className="text-xl font-bold mt-0.5" style={{ color: '#1565C0' }}>
//                 {(summaryData.byStatus?.saved || 0) + (summaryData.byStatus?.partial || 0)}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="border-b" style={{ borderColor: '#E8F5E9' }}>
//           <div className="flex">
//             <button
//               onClick={() => setActiveTab('summary')}
//               className={`px-6 py-3 text-sm font-medium transition-all relative ${
//                 activeTab === 'summary'
//                   ? 'text-[#2E7D32]'
//                   : 'text-[#8D6E63] hover:text-[#2E7D32]'
//               }`}
//               style={{
//                 borderBottom: activeTab === 'summary' ? '2px solid #2E7D32' : '2px solid transparent'
//               }}
//             >
//               <div className="flex items-center gap-2">
//                 <PieChart className="w-4 h-4" />
//                 Summary Overview
//               </div>
//             </button>
//             <button
//               onClick={() => setActiveTab('farmer')}
//               className={`px-6 py-3 text-sm font-medium transition-all relative ${
//                 activeTab === 'farmer'
//                   ? 'text-[#2E7D32]'
//                   : 'text-[#8D6E63] hover:text-[#2E7D32]'
//               }`}
//               style={{
//                 borderBottom: activeTab === 'farmer' ? '2px solid #2E7D32' : '2px solid transparent'
//               }}
//             >
//               <div className="flex items-center gap-2">
//                 <Users className="w-4 h-4" />
//                 Farmer Wise
//                 {farmerWiseData.length > 0 && (
//                   <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#E3F2FD', color: '#1565C0' }}>
//                     {farmerWiseData.length}
//                   </span>
//                 )}
//               </div>
//             </button>
//             <button
//               onClick={() => setActiveTab('purchases')}
//               className={`px-6 py-3 text-sm font-medium transition-all relative ${
//                 activeTab === 'purchases'
//                   ? 'text-[#2E7D32]'
//                   : 'text-[#8D6E63] hover:text-[#2E7D32]'
//               }`}
//               style={{
//                 borderBottom: activeTab === 'purchases' ? '2px solid #2E7D32' : '2px solid transparent'
//               }}
//             >
//               <div className="flex items-center gap-2">
//                 <Receipt className="w-4 h-4" />
//                 All Purchases
//                 {allPurchases.length > 0 && (
//                   <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#FFF3E0', color: '#E65100' }}>
//                     {allPurchases.length}
//                   </span>
//                 )}
//               </div>
//             </button>
//           </div>
//         </div>

//         {(activeTab === 'farmer' || activeTab === 'purchases') && (
//           <div className="p-4 border-b" style={{ borderColor: '#E8F5E9' }}>
//             <div className="flex flex-wrap gap-4 items-center justify-between">
//               <div className="w-80">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
//                   <input
//                     type="text"
//                     placeholder={activeTab === 'farmer' ? "Search by farmer name or mobile..." : "Search by farmer name or receipt number..."}
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1"
//                     style={{ borderColor: '#C8E6C9' }}
//                   />
//                   {searchTerm && (
//                     <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                       <X className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                     </button>
//                   )}
//                 </div>
//               </div>
              
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={showOnlyOverdue}
//                   onChange={(e) => setShowOnlyOverdue(e.target.checked)}
//                   className="w-4 h-4 rounded"
//                   style={{ accentColor: '#E65100' }}
//                 />
//                 <span className="text-sm" style={{ color: '#2E7D32' }}>Show only overdue purchases</span>
//               </label>
//             </div>
//           </div>
//         )}

//         {activeTab === 'summary' && summaryData && (
//           <div className="p-6">
//             <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: '#E8F5E9' }}>
//               <h3 className="text-sm font-semibold mb-4" style={{ color: '#1B5E20' }}>
//                 <div className="flex items-center gap-2">
//                   <PieChart className="w-4 h-4" />
//                   Status Breakdown
//                 </div>
//               </h3>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 {Object.entries(summaryData.byStatus || {}).map(([status, count]) => {
//                   const statusConfig = getStatusBadge(status);
//                   const StatusIcon = statusConfig.icon;
//                   return (
//                     <div key={status} className="px-4 py-3 rounded-lg flex items-center justify-between" style={{ background: statusConfig.bg }}>
//                       <div className="flex items-center gap-2">
//                         <StatusIcon className="w-4 h-4" style={{ color: statusConfig.color }} />
//                         <span className="text-sm font-medium" style={{ color: statusConfig.color }}>
//                           {statusConfig.label}
//                         </span>
//                       </div>
//                       <span className="text-lg font-bold" style={{ color: statusConfig.color }}>{count}</span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: '#E8F5E9' }}>
//                 <h3 className="text-sm font-semibold mb-3" style={{ color: '#1B5E20' }}>
//                   <div className="flex items-center gap-2">
//                     <Users className="w-4 h-4" />
//                     Farmers with Dues
//                   </div>
//                 </h3>
//                 <div className="space-y-3">
//                   {farmerWiseData.map((farmer, idx) => (
//                     <div key={idx} className="flex justify-between items-center pb-2 border-b" style={{ borderColor: '#E8F5E9' }}>
//                       <div>
//                         <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{farmer.farmerName}</p>
//                         <p className="text-xs" style={{ color: '#8D6E63' }}>{farmer.purchaseCount} purchases</p>
//                       </div>
//                       <p className="text-sm font-bold" style={{ color: '#D32F2F' }}>{formatCurrency(farmer.totalDue)}</p>
//                     </div>
//                   ))}
//                   {farmerWiseData.length === 0 && (
//                     <p className="text-sm text-center" style={{ color: '#8D6E63' }}>No farmers with dues</p>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: '#E8F5E9' }}>
//                 <h3 className="text-sm font-semibold mb-3" style={{ color: '#1B5E20' }}>
//                   <div className="flex items-center gap-2">
//                     <Clock className="w-4 h-4" />
//                     Overdue Summary
//                   </div>
//                 </h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: '#E8F5E9' }}>
//                     <span className="text-sm" style={{ color: '#5D4037' }}>Total Overdue Amount</span>
//                     <span className="text-sm font-bold" style={{ color: '#E65100' }}>{formatCurrency(summaryData.totalOverdue)}</span>
//                   </div>
//                   <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: '#E8F5E9' }}>
//                     <span className="text-sm" style={{ color: '#5D4037' }}>Overdue Period (days)</span>
//                     <span className="text-sm font-bold" style={{ color: '#E65100' }}>{daysOverdue}+ days</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm" style={{ color: '#5D4037' }}>Overdue Purchases</span>
//                     <span className="text-sm font-bold" style={{ color: '#E65100' }}>
//                       {allPurchases.filter(p => p.isOverdue).length}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'farmer' && (
//           <div>
//             {filteredFarmerData.length === 0 ? (
//               <div className="text-center py-12">
//                 <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
//                 <p className="text-sm" style={{ color: '#8D6E63' }}>No farmers found</p>
//                 {(searchTerm || showOnlyOverdue) && (
//                   <button 
//                     onClick={() => {
//                       setSearchTerm('');
//                       setShowOnlyOverdue(false);
//                     }} 
//                     className="mt-2 text-sm text-[#2E7D32] hover:underline"
//                   >
//                     Clear filters
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <div className="divide-y" style={{ borderColor: '#E8F5E9' }}>
//                 {filteredFarmerData.map((farmer) => {
//                   const isExpanded = expandedFarmers[farmer.farmerName];
//                   return (
//                     <div key={farmer.farmerName}>
//                       <div 
//                         className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
//                         onClick={() => toggleFarmer(farmer.farmerName)}
//                       >
//                         <div className="flex items-center justify-between flex-wrap gap-4">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#E8F5E9' }}>
//                               <User className="w-5 h-5" style={{ color: '#2E7D32' }} />
//                             </div>
//                             <div>
//                               <h3 className="font-semibold" style={{ color: '#1B5E20' }}>{farmer.farmerName}</h3>
//                               {farmer.farmerMobile && (
//                                 <div className="flex items-center gap-1 mt-0.5">
//                                   <Phone className="w-3 h-3" style={{ color: '#8D6E63' }} />
//                                   <span className="text-xs" style={{ color: '#8D6E63' }}>{farmer.farmerMobile}</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-6">
//                             <div className="text-right">
//                               <p className="text-xs" style={{ color: '#8D6E63' }}>Total Due</p>
//                               <p className="text-lg font-bold" style={{ color: '#D32F2F' }}>
//                                 {formatCurrency(farmer.totalDue)}
//                               </p>
//                             </div>
//                             <div className="text-right">
//                               <p className="text-xs" style={{ color: '#8D6E63' }}>Purchases</p>
//                               <p className="text-lg font-bold" style={{ color: '#2E7D32' }}>{farmer.purchaseCount}</p>
//                             </div>
//                             <div>
//                               {isExpanded ? (
//                                 <ChevronDown className="w-5 h-5" style={{ color: '#2E7D32' }} />
//                               ) : (
//                                 <ChevronRight className="w-5 h-5" style={{ color: '#2E7D32' }} />
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {isExpanded && (
//                         <div className="px-5 pb-5">
//                           <div className="overflow-x-auto">
//                             <table className="w-full">
//                               <thead>
//                                 <tr style={{ background: '#F5F5F5' }}>
//                                   <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#1B5E20' }}>Receipt No</th>
//                                   <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#1B5E20' }}>Purchase Date</th>
//                                   <th className="px-4 py-2 text-right text-xs font-semibold" style={{ color: '#1B5E20' }}>Final Payable</th>
//                                   <th className="px-4 py-2 text-right text-xs font-semibold" style={{ color: '#1B5E20' }}>Amount Due</th>
//                                   <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#1B5E20' }}>Status</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {farmer.purchases.map((purchase) => {
//                                   const purchaseDate = new Date(purchase.purchaseDate);
//                                   const today = new Date();
//                                   const daysDiff = Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24));
//                                   const isOverdue = daysDiff > daysOverdue;
//                                   const status = purchase.amountDue === 0 ? 'completed' : 
//                                                 purchase.amountDue === purchase.finalPayable ? 'saved' : 'partial';
//                                   const statusConfig = getStatusBadge(status);
//                                   const StatusIcon = statusConfig.icon;
                                  
//                                   return (
//                                     <tr key={purchase.id} className="border-t" style={{ borderColor: '#E8F5E9' }}>
//                                       <td className="px-4 py-3 whitespace-nowrap">
//                                         <span className="text-sm font-medium" style={{ color: '#BF360C' }}>
//                                           {purchase.receiptNumber}
//                                         </span>
//                                         {isOverdue && (
//                                           <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#FFEBEE', color: '#D32F2F' }}>
//                                             Overdue
//                                           </span>
//                                         )}
//                                       </td>
//                                       <td className="px-4 py-3 whitespace-nowrap">
//                                         <div className="flex items-center gap-1.5">
//                                           <Calendar className="w-3.5 h-3.5" style={{ color: '#A5D6A7' }} />
//                                           <span className="text-sm" style={{ color: '#5D4037' }}>{formatDate(purchase.purchaseDate)}</span>
//                                         </div>
//                                       </td>
//                                       <td className="px-4 py-3 whitespace-nowrap text-right">
//                                         <span className="text-sm" style={{ color: '#2E7D32' }}>{formatCurrency(purchase.finalPayable)}</span>
//                                       </td>
//                                       <td className="px-4 py-3 whitespace-nowrap text-right">
//                                         <span className="text-sm font-bold" style={{ color: purchase.amountDue > 0 ? '#D32F2F' : '#2E7D32' }}>
//                                           {formatCurrency(purchase.amountDue)}
//                                         </span>
//                                       </td>
//                                       <td className="px-4 py-3 whitespace-nowrap">
//                                         <span
//                                           className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit"
//                                           style={{ background: statusConfig.bg, color: statusConfig.color }}
//                                         >
//                                           <StatusIcon className="w-3 h-3" />
//                                           {statusConfig.label}
//                                         </span>
//                                       </td>
//                                     </tr>
//                                   );
//                                 })}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'purchases' && (
//           <div>
//             {filteredPurchases.length === 0 ? (
//               <div className="text-center py-12">
//                 <Receipt className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
//                 <p className="text-sm" style={{ color: '#8D6E63' }}>No purchases found</p>
//                 {(searchTerm || showOnlyOverdue) && (
//                   <button 
//                     onClick={() => {
//                       setSearchTerm('');
//                       setShowOnlyOverdue(false);
//                     }} 
//                     className="mt-2 text-sm text-[#2E7D32] hover:underline"
//                   >
//                     Clear filters
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr style={{ background: '#1B3A1F' }}>
//                       <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Receipt No</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Farmer Name</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Purchase Date</th>
//                       <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Final Payable</th>
//                       <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Amount Due</th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Status</th>
//                       <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Overdue</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredPurchases.map((purchase, index) => {
//                       const statusConfig = getStatusBadge(purchase.status);
//                       const StatusIcon = statusConfig.icon;
                      
//                       return (
//                         <tr
//                           key={purchase.id}
//                           className="hover:bg-green-50 transition-colors"
//                           style={{ borderBottom: index !== filteredPurchases.length - 1 ? '1px solid #E8F5E9' : 'none' }}
//                         >
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center gap-2">
//                               <FileText className="w-4 h-4" style={{ color: '#8D6E63' }} />
//                               <span className="text-sm font-medium" style={{ color: '#BF360C' }}>
//                                 {purchase.receiptNumber}
//                               </span>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className="text-sm" style={{ color: '#2E7D32' }}>{purchase.farmerName}</span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center gap-1.5">
//                               <Calendar className="w-3.5 h-3.5" style={{ color: '#A5D6A7' }} />
//                               <span className="text-sm" style={{ color: '#5D4037' }}>{formatDate(purchase.purchaseDate)}</span>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-right">
//                             <span className="text-sm" style={{ color: '#2E7D32' }}>{formatCurrency(purchase.finalPayable)}</span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-right">
//                             <span className="text-sm font-bold" style={{ color: '#D32F2F' }}>{formatCurrency(purchase.amountDue)}</span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span
//                               className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit"
//                               style={{ background: statusConfig.bg, color: statusConfig.color }}
//                             >
//                               <StatusIcon className="w-3 h-3" />
//                               {statusConfig.label}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-center">
//                             {purchase.isOverdue ? (
//                               <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#FFEBEE', color: '#D32F2F' }}>
//                                 <XCircle className="w-3 h-3 inline mr-1" />
//                                 Yes
//                               </span>
//                             ) : (
//                               <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
//                                 <CheckCircle className="w-3 h-3 inline mr-1" />
//                                 No
//                               </span>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const ShoppingBag = (props) => (
//   <svg
//     {...props}
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
//     <line x1="3" y1="6" x2="21" y2="6" />
//     <path d="M16 10a4 4 0 0 1-8 0" />
//   </svg>
// );

// export default DueSummary;







// src/pages/payment/DueSummary.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Loader, AlertCircle, TrendingUp, TrendingDown,
  DollarSign, Users, FileText, Calendar, Phone, User,
  Clock, Search, X, CheckCircle, XCircle, ChevronDown,
  ChevronRight, CreditCard, Receipt, PieChart, List,
  Grid, RefreshCw
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const DueSummary = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const operatorId = queryParams.get('operatorId');
  const daysOverdue = queryParams.get('daysOverdue') || 30;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [farmerWiseData, setFarmerWiseData] = useState([]);
  const [allPurchases, setAllPurchases] = useState([]);
  const [expandedFarmers, setExpandedFarmers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

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

  const fetchDueSummary = useCallback(async () => {
    if (!isAuthenticated()) return;
    if (!operatorId) {
      setError(t('payments.errors.operatorNotFound'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/payments/due-summary?operatorId=${operatorId}&daysOverdue=${daysOverdue}`, {
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
        setSummaryData(data.data.summary);
        setFarmerWiseData(data.data.farmerWise || []);
        setAllPurchases(data.data.purchases || []);
        
        const initialExpanded = {};
        (data.data.farmerWise || []).forEach(farmer => {
          initialExpanded[farmer.farmerName] = false;
        });
        setExpandedFarmers(initialExpanded);
      } else {
        setError(data.message || t('payments.errors.fetchFailed'));
      }
    } catch (err) {
      console.error('Error fetching due summary:', err);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [operatorId, daysOverdue, navigate, t]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDueSummary();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDueSummary();
  }, [fetchDueSummary]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'saved':
        return { label: t('payments.status.pending'), color: '#E65100', bg: '#FFF3E0', icon: Clock };
      case 'partial':
        return { label: t('payments.status.partialPayment'), color: '#1565C0', bg: '#E3F2FD', icon: TrendingUp };
      case 'completed':
        return { label: t('payments.status.completed'), color: '#2E7D32', bg: '#E8F5E9', icon: CheckCircle };
      default:
        return { label: status, color: '#8D6E63', bg: '#F5F5F5', icon: FileText };
    }
  };

  const toggleFarmer = (farmerName) => {
    setExpandedFarmers(prev => ({
      ...prev,
      [farmerName]: !prev[farmerName]
    }));
  };

  const filteredFarmerData = farmerWiseData.filter(farmer => {
    const matchesSearch = debouncedSearchTerm === '' || 
      farmer.farmerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      farmer.farmerMobile?.includes(debouncedSearchTerm);
    
    if (!matchesSearch) return false;
    
    if (showOnlyOverdue) {
      return farmer.purchases?.some(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate);
        const today = new Date();
        const daysDiff = Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24));
        return daysDiff > daysOverdue;
      });
    }
    
    return true;
  });

  const filteredPurchases = allPurchases.filter(purchase => {
    const matchesSearch = debouncedSearchTerm === '' ||
      purchase.farmerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      purchase.receiptNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (showOnlyOverdue) {
      return purchase.isOverdue;
    }
    
    return true;
  });

  if (loading && !summaryData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('payments.loadingDueSummary')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/payments')}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-all"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>
              {t('payments.dueSummaryTitle')}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#8D6E63' }}>
              {t('payments.dueSummarySubtitle')}
            </p>
          </div>
        </div>
        {/* <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
          style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </button> */}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchDueSummary} className="ml-auto text-sm text-red-600 hover:underline">
            {t('common.retry')}
          </button>
        </div>
      )}

      {summaryData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FFEBEE' }}>
              <DollarSign className="w-5 h-5" style={{ color: '#D32F2F' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.totalDueAmount')}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: '#D32F2F' }}>
                {formatCurrency(summaryData.totalDue)}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#FFF3E0' }}>
              <Clock className="w-5 h-5" style={{ color: '#E65100' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.overdueAmount')}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: '#E65100' }}>
                {formatCurrency(summaryData.totalOverdue)}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#E8F5E9' }}>
              <ShoppingBag className="w-5 h-5" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.totalPurchases')}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: '#2E7D32' }}>
                {summaryData.totalPurchases || 0}
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#E3F2FD' }}>
              <TrendingDown className="w-5 h-5" style={{ color: '#1565C0' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.duePurchases')}</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: '#1565C0' }}>
                {(summaryData.byStatus?.saved || 0) + (summaryData.byStatus?.partial || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b" style={{ borderColor: '#E8F5E9' }}>
          <div className="flex">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${
                activeTab === 'summary'
                  ? 'text-[#2E7D32]'
                  : 'text-[#8D6E63] hover:text-[#2E7D32]'
              }`}
              style={{
                borderBottom: activeTab === 'summary' ? '2px solid #2E7D32' : '2px solid transparent'
              }}
            >
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                {t('payments.summaryOverview')}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('farmer')}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${
                activeTab === 'farmer'
                  ? 'text-[#2E7D32]'
                  : 'text-[#8D6E63] hover:text-[#2E7D32]'
              }`}
              style={{
                borderBottom: activeTab === 'farmer' ? '2px solid #2E7D32' : '2px solid transparent'
              }}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t('payments.farmerWise')}
                {farmerWiseData.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#E3F2FD', color: '#1565C0' }}>
                    {farmerWiseData.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${
                activeTab === 'purchases'
                  ? 'text-[#2E7D32]'
                  : 'text-[#8D6E63] hover:text-[#2E7D32]'
              }`}
              style={{
                borderBottom: activeTab === 'purchases' ? '2px solid #2E7D32' : '2px solid transparent'
              }}
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                {t('payments.allPurchases')}
                {allPurchases.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#FFF3E0', color: '#E65100' }}>
                    {allPurchases.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {(activeTab === 'farmer' || activeTab === 'purchases') && (
          <div className="p-4 border-b" style={{ borderColor: '#E8F5E9' }}>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="w-80">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
                  <input
                    type="text"
                    placeholder={activeTab === 'farmer' ? t('payments.searchFarmerPlaceholder') : t('payments.searchPurchasePlaceholder')}
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
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyOverdue}
                  onChange={(e) => setShowOnlyOverdue(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#E65100' }}
                />
                <span className="text-sm" style={{ color: '#2E7D32' }}>{t('payments.showOnlyOverdue')}</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'summary' && summaryData && (
          <div className="p-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: '#E8F5E9' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: '#1B5E20' }}>
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  {t('payments.statusBreakdown')}
                </div>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(summaryData.byStatus || {}).map(([status, count]) => {
                  const statusConfig = getStatusBadge(status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div key={status} className="px-4 py-3 rounded-lg flex items-center justify-between" style={{ background: statusConfig.bg }}>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" style={{ color: statusConfig.color }} />
                        <span className="text-sm font-medium" style={{ color: statusConfig.color }}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <span className="text-lg font-bold" style={{ color: statusConfig.color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: '#E8F5E9' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#1B5E20' }}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('payments.farmersWithDues')}
                  </div>
                </h3>
                <div className="space-y-3">
                  {farmerWiseData.map((farmer, idx) => (
                    <div key={idx} className="flex justify-between items-center pb-2 border-b" style={{ borderColor: '#E8F5E9' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{farmer.farmerName}</p>
                        <p className="text-xs" style={{ color: '#8D6E63' }}>{farmer.purchaseCount} {t('payments.purchases')}</p>
                      </div>
                      <p className="text-sm font-bold" style={{ color: '#D32F2F' }}>{formatCurrency(farmer.totalDue)}</p>
                    </div>
                  ))}
                  {farmerWiseData.length === 0 && (
                    <p className="text-sm text-center" style={{ color: '#8D6E63' }}>{t('payments.noFarmersWithDues')}</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: '#E8F5E9' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#1B5E20' }}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {t('payments.overdueSummary')}
                  </div>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: '#E8F5E9' }}>
                    <span className="text-sm" style={{ color: '#5D4037' }}>{t('payments.totalOverdueAmount')}</span>
                    <span className="text-sm font-bold" style={{ color: '#E65100' }}>{formatCurrency(summaryData.totalOverdue)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: '#E8F5E9' }}>
                    <span className="text-sm" style={{ color: '#5D4037' }}>{t('payments.overduePeriod')}</span>
                    <span className="text-sm font-bold" style={{ color: '#E65100' }}>{daysOverdue}+ {t('payments.days')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: '#5D4037' }}>{t('payments.overduePurchases')}</span>
                    <span className="text-sm font-bold" style={{ color: '#E65100' }}>
                      {allPurchases.filter(p => p.isOverdue).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'farmer' && (
          <div>
            {filteredFarmerData.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
                <p className="text-sm" style={{ color: '#8D6E63' }}>{t('payments.noFarmersFound')}</p>
                {(searchTerm || showOnlyOverdue) && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setShowOnlyOverdue(false);
                    }} 
                    className="mt-2 text-sm text-[#2E7D32] hover:underline"
                  >
                    {t('common.clearFilters')}
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#E8F5E9' }}>
                {filteredFarmerData.map((farmer) => {
                  const isExpanded = expandedFarmers[farmer.farmerName];
                  return (
                    <div key={farmer.farmerName}>
                      <div 
                        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleFarmer(farmer.farmerName)}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#E8F5E9' }}>
                              <User className="w-5 h-5" style={{ color: '#2E7D32' }} />
                            </div>
                            <div>
                              <h3 className="font-semibold" style={{ color: '#1B5E20' }}>{farmer.farmerName}</h3>
                              {farmer.farmerMobile && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" style={{ color: '#8D6E63' }} />
                                  <span className="text-xs" style={{ color: '#8D6E63' }}>{farmer.farmerMobile}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.totalDue')}</p>
                              <p className="text-lg font-bold" style={{ color: '#D32F2F' }}>
                                {formatCurrency(farmer.totalDue)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.purchases')}</p>
                              <p className="text-lg font-bold" style={{ color: '#2E7D32' }}>{farmer.purchaseCount}</p>
                            </div>
                            <div>
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5" style={{ color: '#2E7D32' }} />
                              ) : (
                                <ChevronRight className="w-5 h-5" style={{ color: '#2E7D32' }} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-5">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr style={{ background: '#F5F5F5' }}>
                                  <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#1B5E20' }}>{t('payments.table.receiptNo')}</th>
                                  <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#1B5E20' }}>{t('payments.table.purchaseDate')}</th>
                                  <th className="px-4 py-2 text-right text-xs font-semibold" style={{ color: '#1B5E20' }}>{t('payments.table.finalPayable')}</th>
                                  <th className="px-4 py-2 text-right text-xs font-semibold" style={{ color: '#1B5E20' }}>{t('payments.table.amountDue')}</th>
                                  <th className="px-4 py-2 text-left text-xs font-semibold" style={{ color: '#1B5E20' }}>{t('payments.table.status')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {farmer.purchases.map((purchase) => {
                                  const purchaseDate = new Date(purchase.purchaseDate);
                                  const today = new Date();
                                  const daysDiff = Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24));
                                  const isOverdue = daysDiff > daysOverdue;
                                  const status = purchase.amountDue === 0 ? 'completed' : 
                                                purchase.amountDue === purchase.finalPayable ? 'saved' : 'partial';
                                  const statusConfig = getStatusBadge(status);
                                  const StatusIcon = statusConfig.icon;
                                  
                                  return (
                                    <tr key={purchase.id} className="border-t" style={{ borderColor: '#E8F5E9' }}>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="text-sm font-medium" style={{ color: '#BF360C' }}>
                                          {purchase.receiptNumber}
                                        </span>
                                        {isOverdue && (
                                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#FFEBEE', color: '#D32F2F' }}>
                                            {t('payments.overdue')}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                          <Calendar className="w-3.5 h-3.5" style={{ color: '#A5D6A7' }} />
                                          <span className="text-sm" style={{ color: '#5D4037' }}>{formatDate(purchase.purchaseDate)}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-right">
                                        <span className="text-sm" style={{ color: '#2E7D32' }}>{formatCurrency(purchase.finalPayable)}</span>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-right">
                                        <span className="text-sm font-bold" style={{ color: purchase.amountDue > 0 ? '#D32F2F' : '#2E7D32' }}>
                                          {formatCurrency(purchase.amountDue)}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <span
                                          className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit"
                                          style={{ background: statusConfig.bg, color: statusConfig.color }}
                                        >
                                          <StatusIcon className="w-3 h-3" />
                                          {statusConfig.label}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'purchases' && (
          <div>
            {filteredPurchases.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
                <p className="text-sm" style={{ color: '#8D6E63' }}>{t('payments.noPurchasesFound')}</p>
                {(searchTerm || showOnlyOverdue) && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setShowOnlyOverdue(false);
                    }} 
                    className="mt-2 text-sm text-[#2E7D32] hover:underline"
                  >
                    {t('common.clearFilters')}
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#1B3A1F' }}>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.receiptNo')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.farmerName')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.purchaseDate')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.finalPayable')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.amountDue')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.status')}</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.overdue')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase, index) => {
                      const statusConfig = getStatusBadge(purchase.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <tr
                          key={purchase.id}
                          className="hover:bg-green-50 transition-colors"
                          style={{ borderBottom: index !== filteredPurchases.length - 1 ? '1px solid #E8F5E9' : 'none' }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" style={{ color: '#8D6E63' }} />
                              <span className="text-sm font-medium" style={{ color: '#BF360C' }}>
                                {purchase.receiptNumber}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm" style={{ color: '#2E7D32' }}>{purchase.farmerName}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" style={{ color: '#A5D6A7' }} />
                              <span className="text-sm" style={{ color: '#5D4037' }}>{formatDate(purchase.purchaseDate)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm" style={{ color: '#2E7D32' }}>{formatCurrency(purchase.finalPayable)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-bold" style={{ color: '#D32F2F' }}>{formatCurrency(purchase.amountDue)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit"
                              style={{ background: statusConfig.bg, color: statusConfig.color }}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {purchase.isOverdue ? (
                              <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#FFEBEE', color: '#D32F2F' }}>
                                <XCircle className="w-3 h-3 inline mr-1" />
                                {t('payments.yes')}
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                {t('payments.no')}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ShoppingBag = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export default DueSummary;
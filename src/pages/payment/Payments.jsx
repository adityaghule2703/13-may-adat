// src/pages/payment/Payments.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Search, Filter, Eye, Edit2, 
  Plus, Download, RefreshCw, Loader, AlertCircle,
  Calendar, DollarSign, TrendingUp, X,
  Banknote, Wallet, Building, CheckCircle, XCircle,
  Clock, FileText, Printer, Users, ChevronDown, Phone  // <-- Add Phone here
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Payments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [farmerSearchTerm, setFarmerSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  
  const [stats, setStats] = useState({
    totalPayments: 0, totalAmount: 0, cashAmount: 0, upiAmount: 0, bankAmount: 0, chequeAmount: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', paymentMode: 'all' });

  const getToken = () => localStorage.getItem('token');

  // Fetch all farmers
  const fetchFarmers = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/farmers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFarmers(data.data);
        setFilteredFarmers(data.data);
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoadingFarmers(false);
    }
  };

  // Filter farmers based on search
  useEffect(() => {
    if (farmerSearchTerm) {
      const filtered = farmers.filter(farmer => 
        farmer.name?.toLowerCase().includes(farmerSearchTerm.toLowerCase()) ||
        farmer.mobile?.includes(farmerSearchTerm)
      );
      setFilteredFarmers(filtered);
      setVisibleCount(5);
    } else {
      setFilteredFarmers(farmers);
      setVisibleCount(5);
    }
  }, [farmerSearchTerm, farmers]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setFarmerSearchTerm('');
        setVisibleCount(5);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load more farmers on scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      if (visibleCount < filteredFarmers.length) {
        setVisibleCount(prev => Math.min(prev + 5, filteredFarmers.length));
      }
    }
  };

  // Fetch payments for selected farmer
  const fetchPaymentsByFarmer = async (farmerId) => {
    if (!farmerId) {
      setPayments([]);
      setStats({ totalPayments: 0, totalAmount: 0, cashAmount: 0, upiAmount: 0, bankAmount: 0, chequeAmount: 0 });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/payments/farmer/${farmerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        let paymentsData = data.data || [];
        
        if (filters.startDate) paymentsData = paymentsData.filter(p => new Date(p.paymentDate) >= new Date(filters.startDate));
        if (filters.endDate) paymentsData = paymentsData.filter(p => new Date(p.paymentDate) <= new Date(filters.endDate));
        if (filters.paymentMode !== 'all') paymentsData = paymentsData.filter(p => p.paymentMode === filters.paymentMode);
        if (searchTerm) {
          paymentsData = paymentsData.filter(p => 
            p.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.chequeNumber?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setPayments(paymentsData);
        
        const totalAmount = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
        const cashAmount = paymentsData.filter(p => p.paymentMode === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0);
        const upiAmount = paymentsData.filter(p => p.paymentMode === 'upi').reduce((sum, p) => sum + (p.amount || 0), 0);
        const bankAmount = paymentsData.filter(p => p.paymentMode === 'bank').reduce((sum, p) => sum + (p.amount || 0), 0);
        const chequeAmount = paymentsData.filter(p => p.paymentMode === 'cheque').reduce((sum, p) => sum + (p.amount || 0), 0);
        
        setStats({ totalPayments: paymentsData.length, totalAmount, cashAmount, upiAmount, bankAmount, chequeAmount });
      } else {
        setError(data.message || 'Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  useEffect(() => {
    if (selectedFarmerId) fetchPaymentsByFarmer(selectedFarmerId);
  }, [selectedFarmerId, filters, searchTerm]);

  const handleFarmerSelect = (farmer) => {
    setSelectedFarmer(farmer);
    setSelectedFarmerId(farmer._id);
    setIsDropdownOpen(false);
    setFarmerSearchTerm('');
    setVisibleCount(5);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  const getPaymentModeIcon = (mode) => {
    switch(mode) {
      case 'cash': return { icon: Wallet, color: '#2E7D32', label: 'Cash', bg: '#E8F5E9' };
      case 'upi': return { icon: TrendingUp, color: '#1976D2', label: 'UPI', bg: '#E3F2FD' };
      case 'bank': return { icon: Building, color: '#F57C00', label: 'Bank Transfer', bg: '#FFF3E0' };
      case 'cheque': return { icon: CreditCard, color: '#7B1FA2', label: 'Cheque', bg: '#F3E5F5' };
      default: return { icon: Banknote, color: '#8D6E63', label: 'Other', bg: '#FAFAFA' };
    }
  };

  const getChequeStatusColor = (status) => {
    switch(status) {
      case 'cleared': return { bg: '#E8F5E9', text: '#2E7D32', label: 'Cleared', icon: CheckCircle };
      case 'bounced': return { bg: '#FFEBEE', text: '#D32F2F', label: 'Bounced', icon: XCircle };
      default: return { bg: '#FFF3E0', text: '#FF6F00', label: 'Pending Clearance', icon: Clock };
    }
  };

  const visibleFarmers = filteredFarmers.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-green-900">Payments</h1><p className="text-sm text-gray-500">Track and manage all farmer payments</p></div>
        <div className="flex gap-2">
          <button onClick={() => { setRefreshing(true); fetchPaymentsByFarmer(selectedFarmerId).finally(() => setRefreshing(false)); }} disabled={refreshing || !selectedFarmerId} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-green-200 text-green-700"><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button>
          <button onClick={() => navigate('/payments/add')} className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 bg-gradient-to-r from-green-700 to-green-600"><Plus className="w-4 h-4" /> New Payment</button>
        </div>
      </div>

      {/* Custom Dropdown for Farmer Selection */}
      <div className="bg-white rounded-xl p-4 shadow-sm" ref={dropdownRef}>
        <label className="block text-xs font-medium mb-1 text-green-800">SELECT FARMER</label>
        <div className="relative">
          {/* Dropdown Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white focus:outline-none "
            style={{ borderColor: '#C8E6C9' }}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className={selectedFarmer ? 'text-gray-800' : 'text-gray-400'}>
                {selectedFarmer ? `${selectedFarmer.name} - ${selectedFarmer.mobile} (${selectedFarmer.village || selectedFarmer.city})` : 'Select a farmer to view payments'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg overflow-hidden" style={{ borderColor: '#C8E6C9' }}>
              {/* Search Input */}
              <div className="p-2 border-b" style={{ borderColor: '#E8F5E9' }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or mobile..."
                    value={farmerSearchTerm}
                    onChange={(e) => setFarmerSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md focus:outline-none "
                    style={{ borderColor: '#C8E6C9' }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Farmer List with Custom Scroll */}
              <div 
                className="max-h-64 overflow-y-auto custom-scroll"
                onScroll={handleScroll}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style>{`
                  .custom-scroll::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {visibleFarmers.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">No farmers found</div>
                ) : (
                  <>
                    {visibleFarmers.map((farmer) => (
                      <button
                        key={farmer._id}
                        onClick={() => handleFarmerSelect(farmer)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors flex items-center justify-between ${
                          selectedFarmerId === farmer._id ? 'bg-green-50' : ''
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">{farmer.name}</p>
                          <p className="text-xs text-gray-500">{farmer.mobile} • {farmer.village || farmer.city}</p>
                        </div>
                        {selectedFarmerId === farmer._id && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </button>
                    ))}
                    {visibleCount < filteredFarmers.length && (
                      <div className="px-4 py-2 text-center text-xs text-gray-400 border-t" style={{ borderColor: '#E8F5E9' }}>
                        Scroll for more...
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {selectedFarmer && (
          <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-600">Selected Farmer</p>
                <p className="text-sm font-semibold text-green-800">{selectedFarmer.name}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" /> {selectedFarmer.mobile}
                </p>
                <p className="text-xs text-gray-600">{selectedFarmer.village}, {selectedFarmer.city}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Pending Dues</p>
                <p className="text-sm font-bold text-orange-600">{formatCurrency(selectedFarmer.pendingDues || 0)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the component remains same... */}
      {selectedFarmerId && payments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm"><div className="flex justify-between"><div><p className="text-xs text-gray-500">Total Payments</p><p className="text-2xl font-bold text-green-800">{stats.totalPayments}</p></div><CreditCard className="w-8 h-8 text-green-600" /></div></div>
          <div className="bg-white rounded-xl p-4 shadow-sm"><div className="flex justify-between"><div><p className="text-xs text-gray-500">Total Amount</p><p className="text-2xl font-bold text-green-800">{formatCurrency(stats.totalAmount)}</p></div><DollarSign className="w-8 h-8 text-orange-500" /></div></div>
          <div className="bg-white rounded-xl p-4 shadow-sm"><div className="flex justify-between"><div><p className="text-xs text-gray-500">Cash</p><p className="text-2xl font-bold text-green-800">{formatCurrency(stats.cashAmount)}</p></div><Wallet className="w-8 h-8 text-green-600" /></div></div>
          <div className="bg-white rounded-xl p-4 shadow-sm"><div className="flex justify-between"><div><p className="text-xs text-gray-500">UPI / Bank</p><p className="text-2xl font-bold text-green-800">{formatCurrency(stats.upiAmount + stats.bankAmount)}</p></div><TrendingUp className="w-8 h-8 text-blue-600" /></div></div>
          <div className="bg-white rounded-xl p-4 shadow-sm"><div className="flex justify-between"><div><p className="text-xs text-gray-500">Cheque</p><p className="text-2xl font-bold text-green-800">{formatCurrency(stats.chequeAmount)}</p></div><CreditCard className="w-8 h-8 text-purple-600" /></div></div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-500" /><span className="text-sm text-red-600">{error}</span><button onClick={() => fetchPaymentsByFarmer(selectedFarmerId)} className="ml-auto text-sm text-red-600 hover:underline">Retry</button></div>}

      {selectedFarmerId && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search by receipt number, reference number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg" /></div></div>
            <div className="flex gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-green-50' : 'hover:bg-gray-50'}`} style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}><Filter className="w-4 h-4" /> Filters</button>
              <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}><Download className="w-4 h-4" /> Export</button>
            </div>
          </div>
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-xs font-medium text-green-800 mb-1">Start Date</label><input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium text-green-800 mb-1">End Date</label><input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium text-green-800 mb-1">Payment Mode</label><select value={filters.paymentMode} onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="all">All Modes</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank">Bank Transfer</option><option value="cheque">Cheque</option></select></div>
              </div>
              <div className="flex justify-end gap-2 mt-4"><button onClick={() => setShowFilters(false)} className="px-3 py-1 border rounded-lg text-sm">Cancel</button><button onClick={() => { setFilters({ startDate: '', endDate: '', paymentMode: 'all' }); setSearchTerm(''); }} className="px-3 py-1 border rounded-lg text-sm text-red-600">Clear All</button><button onClick={() => setShowFilters(false)} className="px-3 py-1 rounded-lg text-white text-sm bg-green-700">Apply Filters</button></div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {!selectedFarmerId ? <div className="text-center py-12"><CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-sm text-gray-500">Select a farmer to view payment history</p></div>
        : loading ? <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin text-green-700" /><span className="ml-2">Loading payments...</span></div>
        : payments.length === 0 ? <div className="text-center py-12"><CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-sm text-gray-500">No payments found for this farmer</p><button onClick={() => navigate(`/payments/add?farmerId=${selectedFarmerId}`)} className="mt-4 px-4 py-2 rounded-lg text-white text-sm bg-gradient-to-r from-green-700 to-green-600"><Plus className="w-4 h-4 inline mr-2" />Record First Payment</button></div>
        : <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr style={{ background: '#F1F8E9' }}><th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Receipt No</th><th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Date</th><th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Purchase</th><th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Amount</th><th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Mode</th><th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Reference</th><th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Cheque Status</th><th className="px-6 py-3 text-left text-xs font-semibold text-green-800">Actions</th></tr></thead>
              <tbody>
                {payments.map((payment, idx) => {
                  const modeData = getPaymentModeIcon(payment.paymentMode);
                  const ModeIcon = modeData.icon;
                  const chequeStatus = getChequeStatusColor(payment.chequeStatus);
                  const ChequeIcon = chequeStatus.icon;
                  return (<tr key={payment._id} className="hover:bg-green-50 border-b border-gray-100">
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-green-800">{payment.receiptNumber || `PAY-${payment._id?.slice(-6)}`}</span></div></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span>{formatDate(payment.paymentDate)}</span></div></td>
                    <td className="px-6 py-4"><p className="text-sm">{payment.purchase?.receiptNumber || payment.purchaseId?.receiptNumber || 'N/A'}</p><p className="text-xs text-gray-500">{formatDate(payment.purchase?.purchaseDate || payment.purchaseId?.purchaseDate)}</p></td>
                    <td className="px-6 py-4"><span className="text-sm font-bold text-orange-600">{formatCurrency(payment.amount)}</span></td>
                    <td className="px-6 py-4"><span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ background: modeData.bg, color: modeData.color }}><ModeIcon className="w-3 h-3" />{modeData.label}</span></td>
                    <td className="px-6 py-4"><span className="text-xs text-gray-500">{payment.referenceNumber || payment.transactionId || payment.chequeNumber || '-'}</span></td>
                    <td className="px-6 py-4">{payment.paymentMode === 'cheque' ? <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ background: chequeStatus.bg, color: chequeStatus.text }}><ChequeIcon className="w-3 h-3" />{chequeStatus.label}</span> : <span className="text-xs text-gray-400">-</span>}</td>
                    <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => navigate(`/payments/view/${payment._id}`)} className="p-1 rounded hover:bg-gray-100"><Eye className="w-4 h-4 text-green-700" /></button>{payment.paymentMode === 'cheque' && (!payment.chequeStatus || payment.chequeStatus !== 'cleared') && <button onClick={() => navigate(`/payments/update-cheque/${payment._id}`)} className="p-1 rounded hover:bg-gray-100"><Edit2 className="w-4 h-4 text-orange-500" /></button>}<button className="p-1 rounded hover:bg-gray-100"><Printer className="w-4 h-4 text-gray-600" /></button></div></td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>}
      </div>
    </div>
  );
};

export default Payments;
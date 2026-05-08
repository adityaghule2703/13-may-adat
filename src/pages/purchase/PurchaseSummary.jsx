// src/pages/purchase/PurchaseSummary.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Calendar, DollarSign, Package, 
  Users, Download, Printer, Filter, X,
  Loader, AlertCircle, ArrowLeft, ShoppingCart
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const PurchaseSummary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const getToken = () => localStorage.getItem('token');

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/purchases/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      console.log('Summary API Response:', data);

      if (data.success) {
        setSummary(data.data);
      } else {
        setError(data.message || 'Failed to fetch summary');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [dateRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading summary...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/purchases')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Purchase Summary</h1>
            <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Overview of purchase transactions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Start Date</label>
            <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>End Date</label>
            <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }} />
          </div>
          <button onClick={fetchSummary} className="px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#2E7D32' }}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchSummary} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>Total Purchases</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{summary.totalPurchases || 0}</p>
              </div>
              <ShoppingCart className="w-8 h-8" style={{ color: '#43A047' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>Total Gross Value</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(summary.totalGrossValue)}</p>
              </div>
              <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>Total Final Value</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(summary.totalFinalValue)}</p>
              </div>
              <TrendingUp className="w-8 h-8" style={{ color: '#2E7D32' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>Total Paid</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(summary.totalPaid)}</p>
              </div>
              <Package className="w-8 h-8" style={{ color: '#43A047' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#8D6E63' }}>Total Due</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#FF6F00' }}>{formatCurrency(summary.totalDue)}</p>
              </div>
              <AlertCircle className="w-8 h-8" style={{ color: '#FF6F00' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseSummary;
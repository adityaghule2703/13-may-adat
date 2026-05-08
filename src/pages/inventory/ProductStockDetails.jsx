// src/pages/inventory/ProductStockDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Building, TrendingUp, ArrowLeftRight,
  Loader, AlertCircle, CheckCircle, AlertTriangle, XCircle
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ProductStockDetails = () => {
  const { productName } = useParams();
  const navigate = useNavigate();
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStock, setTotalStock] = useState(0);

  const getToken = () => localStorage.getItem('token');

  const fetchProductStock = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/inventory/product/${productName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setStockData(data.data);
        const total = data.data.reduce((sum, item) => sum + (item.currentStock || 0), 0);
        setTotalStock(total);
      } else {
        setError(data.message || 'Failed to fetch stock details');
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductStock();
  }, [productName]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { color: '#D32F2F', bg: '#FFEBEE', label: 'Out of Stock', icon: XCircle };
    if (stock <= 10) return { color: '#FF6F00', bg: '#FFF3E0', label: 'Low Stock', icon: AlertTriangle };
    return { color: '#2E7D32', bg: '#E8F5E9', label: 'In Stock', icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading stock details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate('/inventory')} className="mt-4 px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#2E7D32' }}>
          Back to Inventory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/inventory')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{productName}</h1>
            <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Stock details across all warehouses</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/inventory/adjust?product=${productName}`)}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
          >
            <TrendingUp className="w-4 h-4" />
            Adjust Stock
          </button>
          <button 
            onClick={() => navigate(`/inventory/transfer?product=${productName}`)}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF6F00, #FF8F00)' }}
          >
            <ArrowLeftRight className="w-4 h-4" />
            Transfer Stock
          </button>
        </div>
      </div>

      {/* Total Stock Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total Stock Across All Warehouses</p>
            <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>{formatNumber(totalStock)} units</p>
          </div>
          <Package className="w-12 h-12" style={{ color: '#43A047' }} />
        </div>
      </div>

      {/* Stock by Warehouse Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#1B5E20' }}>Stock by Warehouse</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E8F5E9' }}>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Unit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#2E7D32' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((item, index) => {
                const stockStatus = getStockStatus(item.currentStock);
                const StatusIcon = stockStatus.icon;
                
                return (
                  <tr key={item._id} className="border-b border-gray-100 hover:bg-green-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" style={{ color: '#8D6E63' }} />
                        <span className="font-medium" style={{ color: '#2E7D32' }}>{item.warehouse}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${item.currentStock <= 10 ? 'text-red-600' : 'text-green-800'}`}>
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
                          onClick={() => navigate(`/inventory/adjust?product=${item.productName}&warehouse=${item.warehouse}`)}
                          className="p-1 rounded hover:bg-gray-100" title="Adjust Stock"
                        >
                          <TrendingUp className="w-4 h-4" style={{ color: '#FF6F00' }} />
                        </button>
                        <button 
                          onClick={() => navigate(`/inventory/transfer?product=${item.productName}&from=${item.warehouse}`)}
                          className="p-1 rounded hover:bg-gray-100" title="Transfer Stock"
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
      </div>
    </div>
  );
};

export default ProductStockDetails;
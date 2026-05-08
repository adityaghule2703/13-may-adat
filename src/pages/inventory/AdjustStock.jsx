// src/pages/inventory/AdjustStock.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Loader, Package, Building
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const AdjustStock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedProduct = queryParams.get('product');
  const preSelectedWarehouse = queryParams.get('warehouse');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    productName: preSelectedProduct || '',
    warehouse: preSelectedWarehouse || '',
    adjustment: '',
    adjustmentType: 'add',
    reason: ''
  });

  const getToken = () => localStorage.getItem('token');

  // Fetch inventory items to get product list
  const fetchInventory = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load inventory data');
    }
  };

  // Fetch warehouses from warehouse API
  const fetchWarehouses = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/warehouse`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Extract warehouse names from the data
        const warehouseNames = data.data.map(warehouse => warehouse.name);
        setWarehouses(warehouseNames);
      } else {
        // Fallback: try to get from inventory if warehouse API fails
        const token2 = getToken();
        const invResponse = await fetch(`${BASE_URL}/inventory`, {
          headers: { 'Authorization': `Bearer ${token2}` }
        });
        const invData = await invResponse.json();
        if (invData.success) {
          const uniqueWarehouses = [...new Set(invData.data.map(item => item.warehouse))];
          setWarehouses(uniqueWarehouses);
        }
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      // Fallback: get warehouses from inventory
      try {
        const token2 = getToken();
        const invResponse = await fetch(`${BASE_URL}/inventory`, {
          headers: { 'Authorization': `Bearer ${token2}` }
        });
        const invData = await invResponse.json();
        if (invData.success) {
          const uniqueWarehouses = [...new Set(invData.data.map(item => item.warehouse))];
          setWarehouses(uniqueWarehouses);
        }
      } catch (err) {
        console.error('Fallback also failed:', err);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      await Promise.all([fetchInventory(), fetchWarehouses()]);
      setLoadingData(false);
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.productName) {
      errors.productName = 'Please select a product';
      isValid = false;
    }
    if (!formData.warehouse) {
      errors.warehouse = 'Please select a warehouse';
      isValid = false;
    }
    if (!formData.adjustment || parseFloat(formData.adjustment) <= 0) {
      errors.adjustment = 'Please enter a valid adjustment quantity';
      isValid = false;
    }
    if (!formData.reason) {
      errors.reason = 'Please provide a reason for adjustment';
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) setError('Please fill all required fields');
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const adjustmentValue = formData.adjustmentType === 'add' 
        ? parseFloat(formData.adjustment) 
        : -parseFloat(formData.adjustment);

      const adjustData = {
        productName: formData.productName,
        warehouse: formData.warehouse,
        adjustment: adjustmentValue,
        reason: formData.reason
      };

      const response = await fetch(`${BASE_URL}/inventory/adjust`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adjustData)
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/inventory'), 2000);
      } else {
        setError(data.message || 'Failed to adjust stock');
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none border-[#E2E8F0] transition-all bg-white text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold mb-1" style={{ color: '#4B5568' }}>
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 animate-spin text-green-700" />
        <span className="ml-2 text-green-700">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/inventory')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1B5E20' }}>Adjust Stock</h1>
            <p className="text-xs mt-0.5" style={{ color: '#8D6E63' }}>Increase or decrease inventory stock</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/inventory')} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Adjust Stock
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600 flex-1">{error}</span>
          <button onClick={() => setError('')}><X className="w-3 h-3 text-red-500" /></button>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">Stock adjusted successfully! Redirecting...</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" style={{ color: '#2E7D32' }} />
            <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Stock Adjustment Details</h2>
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-5">
            {/* Product Selection */}
            <div>
              <Label required>PRODUCT NAME</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10 ${fieldErrors.productName ? 'border-red-500' : ''}`}
                  disabled={!!preSelectedProduct}
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product._id} value={product.productName}>
                      {product.productName} (Current: {product.currentStock} {product.unit})
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.productName && <p className="text-xs text-red-500 mt-1">{fieldErrors.productName}</p>}
            </div>

            {/* Warehouse Selection - Now from warehouse API */}
            <div>
              <Label required>WAREHOUSE</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="warehouse"
                  value={formData.warehouse}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10 ${fieldErrors.warehouse ? 'border-red-500' : ''}`}
                  disabled={!!preSelectedWarehouse}
                >
                  <option value="">Select a warehouse</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse} value={warehouse}>{warehouse}</option>
                  ))}
                </select>
              </div>
              {fieldErrors.warehouse && <p className="text-xs text-red-500 mt-1">{fieldErrors.warehouse}</p>}
              {warehouses.length === 0 && !loadingData && (
                <p className="text-xs text-orange-500 mt-1">No warehouses found. Please add a warehouse first.</p>
              )}
            </div>

            {/* Adjustment Type */}
            <div>
              <Label required>ADJUSTMENT TYPE</Label>
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, adjustmentType: 'add' }))}
                  className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    formData.adjustmentType === 'add' ? 'text-white shadow-md' : 'hover:bg-gray-50'
                  }`}
                  style={{
                    borderColor: '#C8E6C9',
                    background: formData.adjustmentType === 'add' ? '#2E7D32' : 'white',
                    color: formData.adjustmentType === 'add' ? 'white' : '#666'
                  }}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Add Stock (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, adjustmentType: 'remove' }))}
                  className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    formData.adjustmentType === 'remove' ? 'text-white shadow-md' : 'hover:bg-gray-50'
                  }`}
                  style={{
                    borderColor: '#C8E6C9',
                    background: formData.adjustmentType === 'remove' ? '#D32F2F' : 'white',
                    color: formData.adjustmentType === 'remove' ? 'white' : '#666'
                  }}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Remove Stock (-)</span>
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <Label required>QUANTITY</Label>
              <input
                type="number"
                name="adjustment"
                value={formData.adjustment}
                onChange={handleChange}
                placeholder="Enter quantity"
                className={`${inputClasses} ${fieldErrors.adjustment ? 'border-red-500' : ''}`}
              />
              {fieldErrors.adjustment && <p className="text-xs text-red-500 mt-1">{fieldErrors.adjustment}</p>}
            </div>

            {/* Reason */}
            <div>
              <Label required>REASON FOR ADJUSTMENT</Label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g., New harvest received, Damaged goods, Expired products, etc."
                rows="3"
                className={`${inputClasses} resize-none ${fieldErrors.reason ? 'border-red-500' : ''}`}
              />
              {fieldErrors.reason && <p className="text-xs text-red-500 mt-1">{fieldErrors.reason}</p>}
            </div>

            {/* Info Note */}
            <div className="p-3 rounded-lg" style={{ background: '#FFF3E0', border: '1px solid #FFE0B2' }}>
              <p className="text-xs text-orange-800">
                <strong>Note:</strong> Adding stock will increase inventory. Removing stock will decrease inventory.
                All adjustments are logged for audit purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdjustStock;
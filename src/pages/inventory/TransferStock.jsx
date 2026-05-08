// src/pages/inventory/TransferStock.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, ArrowLeftRight,
  AlertCircle, CheckCircle, Loader, Package, Building
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const TransferStock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedProduct = queryParams.get('product');
  const preSelectedFrom = queryParams.get('from');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedProductStock, setSelectedProductStock] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    productName: preSelectedProduct || '',
    fromWarehouse: preSelectedFrom || '',
    toWarehouse: '',
    qty: ''
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

  // Update stock info when product or source warehouse changes
  useEffect(() => {
    if (formData.productName && formData.fromWarehouse) {
      const product = products.find(
        p => p.productName === formData.productName && p.warehouse === formData.fromWarehouse
      );
      setSelectedProductStock(product);
    } else {
      setSelectedProductStock(null);
    }
  }, [formData.productName, formData.fromWarehouse, products]);

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
    if (!formData.fromWarehouse) {
      errors.fromWarehouse = 'Please select source warehouse';
      isValid = false;
    }
    if (!formData.toWarehouse) {
      errors.toWarehouse = 'Please select destination warehouse';
      isValid = false;
    }
    if (formData.fromWarehouse === formData.toWarehouse) {
      errors.toWarehouse = 'Source and destination warehouses cannot be the same';
      isValid = false;
    }
    if (!formData.qty || parseFloat(formData.qty) <= 0) {
      errors.qty = 'Please enter a valid quantity';
      isValid = false;
    }
    if (selectedProductStock && parseFloat(formData.qty) > selectedProductStock.currentStock) {
      errors.qty = `Insufficient stock. Only ${selectedProductStock.currentStock} ${selectedProductStock.unit} available`;
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) setError('Please correct the errors above');
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const transferData = {
        productName: formData.productName,
        fromWarehouse: formData.fromWarehouse,
        toWarehouse: formData.toWarehouse,
        qty: parseFloat(formData.qty)
      };

      const response = await fetch(`${BASE_URL}/inventory/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transferData)
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
        setError(data.message || 'Failed to transfer stock');
      }
    } catch (error) {
      console.error('Error transferring stock:', error);
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

  // Get available destination warehouses (excluding source)
  const availableWarehouses = warehouses.filter(w => w !== formData.fromWarehouse);

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
            <h1 className="text-xl font-bold" style={{ color: '#1B5E20' }}>Transfer Stock</h1>
            <p className="text-xs mt-0.5" style={{ color: '#8D6E63' }}>Move stock between warehouses</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/inventory')} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #FF6F00, #FF8F00)' }}>
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
            Transfer Stock
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
          <span className="text-sm text-green-700">Stock transferred successfully! Redirecting...</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4" style={{ color: '#2E7D32' }} />
            <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Transfer Details</h2>
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
                  {[...new Set(products.map(p => p.productName))].map(productName => (
                    <option key={productName} value={productName}>{productName}</option>
                  ))}
                </select>
              </div>
              {fieldErrors.productName && <p className="text-xs text-red-500 mt-1">{fieldErrors.productName}</p>}
            </div>

            {/* From Warehouse - Now from warehouse API */}
            <div>
              <Label required>FROM WAREHOUSE (Source)</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="fromWarehouse"
                  value={formData.fromWarehouse}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10 ${fieldErrors.fromWarehouse ? 'border-red-500' : ''}`}
                  disabled={!!preSelectedFrom}
                >
                  <option value="">Select source warehouse</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse} value={warehouse}>{warehouse}</option>
                  ))}
                </select>
              </div>
              {fieldErrors.fromWarehouse && <p className="text-xs text-red-500 mt-1">{fieldErrors.fromWarehouse}</p>}
              {warehouses.length === 0 && !loadingData && (
                <p className="text-xs text-orange-500 mt-1">No warehouses found. Please add a warehouse first.</p>
              )}
            </div>

            {/* To Warehouse */}
            <div>
              <Label required>TO WAREHOUSE (Destination)</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="toWarehouse"
                  value={formData.toWarehouse}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10 ${fieldErrors.toWarehouse ? 'border-red-500' : ''}`}
                >
                  <option value="">Select destination warehouse</option>
                  {availableWarehouses.map(warehouse => (
                    <option key={warehouse} value={warehouse}>{warehouse}</option>
                  ))}
                </select>
              </div>
              {fieldErrors.toWarehouse && <p className="text-xs text-red-500 mt-1">{fieldErrors.toWarehouse}</p>}
            </div>

            {/* Quantity */}
            <div>
              <Label required>QUANTITY TO TRANSFER</Label>
              <input
                type="number"
                name="qty"
                value={formData.qty}
                onChange={handleChange}
                placeholder="Enter quantity"
                className={`${inputClasses} ${fieldErrors.qty ? 'border-red-500' : ''}`}
              />
              {fieldErrors.qty && <p className="text-xs text-red-500 mt-1">{fieldErrors.qty}</p>}
            </div>

            {/* Stock Info */}
            {selectedProductStock && (
              <div className="p-3 rounded-lg" style={{ background: '#E3F2FD', border: '1px solid #BBDEFB' }}>
                <p className="text-xs text-blue-800">
                  <strong>Available Stock:</strong> {selectedProductStock.currentStock} {selectedProductStock.unit} in {selectedProductStock.warehouse}
                </p>
              </div>
            )}

            {/* Transfer Direction Visual */}
            {formData.fromWarehouse && formData.toWarehouse && (
              <div className="p-4 rounded-lg flex items-center justify-between" style={{ background: '#F1F8E9' }}>
                <div className="text-center">
                  <Building className="w-6 h-6 mx-auto text-green-700" />
                  <p className="text-xs font-medium text-green-800 mt-1">{formData.fromWarehouse}</p>
                </div>
                <ArrowLeftRight className="w-6 h-6 text-orange-500" />
                <div className="text-center">
                  <Building className="w-6 h-6 mx-auto text-green-700" />
                  <p className="text-xs font-medium text-green-800 mt-1">{formData.toWarehouse}</p>
                </div>
              </div>
            )}

            {/* Info Note */}
            <div className="p-3 rounded-lg" style={{ background: '#FFF3E0', border: '1px solid #FFE0B2' }}>
              <p className="text-xs text-orange-800">
                <strong>Note:</strong> Transferring stock will decrease quantity from source warehouse
                and increase quantity in destination warehouse.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferStock;
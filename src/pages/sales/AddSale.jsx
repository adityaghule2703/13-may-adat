// src/pages/sales/AddSale.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, User, Calendar, Package, 
  DollarSign, Plus, Trash2, AlertCircle, 
  CheckCircle, Loader, Phone, Building, 
  Percent, CreditCard, Hash, FileText
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const AddSale = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerMobile: '',
    buyerGst: '',
    saleDate: new Date().toISOString().split('T')[0],
    lines: [
      {
        productName: '',
        warehouse: '',
        qty: 1,
        sellingPrice: 0,
        lineTotal: 0
      }
    ],
    gstPercent: 18,
    paymentMode: 'cash',
    referenceNumber: '',
    notes: ''
  });

  const [calculations, setCalculations] = useState({
    subTotal: 0,
    gstAmount: 0,
    grandTotal: 0
  });

  const getToken = () => localStorage.getItem('token');

  // Fetch products from inventory
  const fetchProducts = async () => {
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
      console.error('Error fetching products:', error);
    }
  };

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/warehouse`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setWarehouses(data.data.map(w => w.name));
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      await Promise.all([fetchProducts(), fetchWarehouses()]);
      setLoadingData(false);
    };
    loadData();
  }, []);

  // Calculate totals whenever lines or GST changes
  useEffect(() => {
    let subTotal = 0;
    const updatedLines = [...formData.lines];
    
    updatedLines.forEach((line, idx) => {
      const total = (line.qty || 0) * (line.sellingPrice || 0);
      updatedLines[idx].lineTotal = total;
      subTotal += total;
    });
    
    const gstAmount = (subTotal * formData.gstPercent) / 100;
    const grandTotal = subTotal + gstAmount;
    
    setCalculations({ subTotal, gstAmount, grandTotal });
    
    // Update lines without triggering infinite loop
    if (JSON.stringify(updatedLines) !== JSON.stringify(formData.lines)) {
      setFormData(prev => ({ ...prev, lines: updatedLines }));
    }
  }, [formData.lines, formData.gstPercent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...formData.lines];
    updatedLines[index][field] = value;
    setFormData(prev => ({ ...prev, lines: updatedLines }));
  };

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, { productName: '', warehouse: '', qty: 1, sellingPrice: 0, lineTotal: 0 }]
    }));
  };

  const removeLine = (index) => {
    if (formData.lines.length > 1) {
      setFormData(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.buyerName) {
      errors.buyerName = 'Buyer name is required';
      isValid = false;
    }
    if (!formData.buyerMobile) {
      errors.buyerMobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.buyerMobile)) {
      errors.buyerMobile = 'Enter valid 10-digit mobile number';
      isValid = false;
    }
    if (!formData.saleDate) {
      errors.saleDate = 'Sale date is required';
      isValid = false;
    }
    
    formData.lines.forEach((line, idx) => {
      if (!line.productName) errors[`line_${idx}_product`] = 'Product required';
      if (!line.warehouse) errors[`line_${idx}_warehouse`] = 'Warehouse required';
      if (!line.qty || line.qty <= 0) errors[`line_${idx}_qty`] = 'Valid quantity required';
      if (!line.sellingPrice || line.sellingPrice <= 0) errors[`line_${idx}_price`] = 'Valid price required';
    });

    if ((formData.paymentMode === 'upi' || formData.paymentMode === 'bank') && !formData.referenceNumber) {
      errors.referenceNumber = 'Reference number is required';
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) setError('Please fill all required fields correctly');
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      
      const saleData = {
        buyerName: formData.buyerName,
        buyerMobile: formData.buyerMobile,
        buyerGst: formData.buyerGst || undefined,
        saleDate: formData.saleDate,
        lines: formData.lines.map(line => ({
          productName: line.productName,
          warehouse: line.warehouse,
          qty: parseFloat(line.qty),
          sellingPrice: parseFloat(line.sellingPrice)
        })),
        gstPercent: parseFloat(formData.gstPercent),
        paymentMode: formData.paymentMode,
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined
      };

      const response = await fetch(`${BASE_URL}/sales`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/sales'), 2000);
      } else {
        setError(data.message || 'Failed to create sale');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
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
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sales')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-green-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-green-900">New Sale</h1>
            <p className="text-xs text-gray-500">Create a new sale invoice</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/sales')} className="px-4 py-2 rounded-lg border text-gray-600">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-lg bg-green-700 text-white flex items-center gap-2">
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Sale
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600 flex-1">{error}</span>
          <button onClick={() => setError('')}><X className="w-3 h-3" /></button>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">Sale created successfully! Redirecting...</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Buyer Information */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-green-50">
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Buyer Information</h2></div>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><Label required>Buyer Name</Label><input type="text" name="buyerName" value={formData.buyerName} onChange={handleChange} placeholder="Enter buyer name" className={inputClasses} /></div>
            <div><Label required>Mobile Number</Label><input type="tel" name="buyerMobile" value={formData.buyerMobile} onChange={handleChange} placeholder="10-digit mobile" className={inputClasses} /></div>
            <div><Label>GST Number (Optional)</Label><input type="text" name="buyerGst" value={formData.buyerGst} onChange={handleChange} placeholder="Enter GST number" className={inputClasses} /></div>
            <div><Label required>Sale Date</Label><input type="date" name="saleDate" value={formData.saleDate} onChange={handleChange} className={inputClasses} /></div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-green-50 flex justify-between items-center">
            <div className="flex items-center gap-2"><Package className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Products</h2></div>
            <button onClick={addLine} className="text-sm text-green-600 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Item</button>
          </div>
          <div className="p-5">
            {formData.lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 mb-4 items-end">
                <div className="col-span-3">
                  <Label required>Product</Label>
                  <select value={line.productName} onChange={(e) => handleLineChange(idx, 'productName', e.target.value)} className={inputClasses}>
                    <option value="">Select product</option>
                    {products.map(p => <option key={p._id} value={p.productName}>{p.productName} (Stock: {p.currentStock} {p.unit})</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <Label required>Warehouse</Label>
                  <select value={line.warehouse} onChange={(e) => handleLineChange(idx, 'warehouse', e.target.value)} className={inputClasses}>
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <Label required>Quantity</Label>
                  <input type="number" value={line.qty} onChange={(e) => handleLineChange(idx, 'qty', parseFloat(e.target.value))} placeholder="Qty" className={inputClasses} />
                </div>
                <div className="col-span-2">
                  <Label required>Price (₹)</Label>
                  <input type="number" value={line.sellingPrice} onChange={(e) => handleLineChange(idx, 'sellingPrice', parseFloat(e.target.value))} placeholder="Price" className={inputClasses} />
                </div>
                <div className="col-span-2">
                  <Label>Total</Label>
                  <input type="text" value={(line.qty * line.sellingPrice).toFixed(2)} readOnly className={`${inputClasses} bg-gray-100`} />
                </div>
                <div className="col-span-1">
                  {formData.lines.length > 1 && (
                    <button onClick={() => removeLine(idx)} className="p-2 text-red-500 mt-5"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GST & Payment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><Percent className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">GST Details</h2></div></div>
            <div className="p-5">
              <Label required>GST Percentage (%)</Label>
              <select name="gstPercent" value={formData.gstPercent} onChange={handleChange} className={inputClasses}>
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Payment Details</h2></div></div>
            <div className="p-5">
              <Label required>Payment Mode</Label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {['cash', 'upi', 'bank', 'cheque'].map(mode => (
                  <button key={mode} type="button" onClick={() => setFormData(prev => ({ ...prev, paymentMode: mode }))}
                    className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 ${formData.paymentMode === mode ? 'bg-green-700 text-white' : 'hover:bg-gray-50'}`}>
                    <span className="capitalize">{mode}</span>
                  </button>
                ))}
              </div>
              {(formData.paymentMode === 'upi' || formData.paymentMode === 'bank') && (
                <div><Label required>Reference Number</Label><input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} placeholder="Transaction ID / Reference No" className={inputClasses} /></div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
          <div className="space-y-2">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(calculations.subTotal)}</span></div>
            <div className="flex justify-between"><span>GST ({formData.gstPercent}%):</span><span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(calculations.gstAmount)}</span></div>
            <div className="flex justify-between pt-2 border-t"><span className="text-lg font-bold">Grand Total:</span><span className="text-2xl font-bold text-green-800">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(calculations.grandTotal)}</span></div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Notes</h2></div></div>
          <div className="p-5"><textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className={`${inputClasses} resize-none`} placeholder="Any additional notes..." /></div>
        </div>
      </div>
    </div>
  );
};

export default AddSale;
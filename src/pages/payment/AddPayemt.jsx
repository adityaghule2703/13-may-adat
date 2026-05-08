// src/pages/payment/AddPayment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CreditCard, ArrowLeft, Save, X, User, Calendar, 
  DollarSign, Wallet, Building, Landmark, 
  AlertCircle, CheckCircle, Truck, Banknote,
  TrendingUp, Hash, FileText, Phone, Loader
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const AddPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedFarmerId = queryParams.get('farmerId');
  const preSelectedPurchaseId = queryParams.get('purchaseId');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [farmers, setFarmers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  
  const [formData, setFormData] = useState({
    purchaseId: preSelectedPurchaseId || '',
    amount: '',
    paymentMode: 'cash',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    chequeNumber: '',
    chequeDate: '',
    bankName: '',
    notes: ''
  });

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/farmers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFarmers(data.data);
        if (preSelectedFarmerId) {
          const farmer = data.data.find(f => f._id === preSelectedFarmerId);
          if (farmer) {
            setSelectedFarmer(farmer);
            await fetchPurchases(farmer._id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoadingFarmers(false);
    }
  };

  const fetchPurchases = async (farmerId) => {
    if (!farmerId) return;
    
    setLoadingPurchases(true);
    setError('');
    
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/purchases?farmerId=${farmerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        const pendingPurchases = data.data.filter(purchase => 
          purchase.amountDue > 0 && (purchase.status === 'saved' || purchase.status === 'partial')
        );
        
        setPurchases(pendingPurchases);
        
        if (preSelectedPurchaseId && pendingPurchases.length > 0) {
          const purchase = pendingPurchases.find(p => p._id === preSelectedPurchaseId);
          if (purchase) {
            setSelectedPurchase(purchase);
            setFormData(prev => ({ ...prev, amount: purchase.amountDue.toString() }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setError('Failed to fetch purchases');
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleFarmerSelect = async (farmerId) => {
    const farmer = farmers.find(f => f._id === farmerId);
    setSelectedFarmer(farmer);
    setFormData(prev => ({ ...prev, purchaseId: '', amount: '' }));
    setSelectedPurchase(null);
    setPurchases([]);
    if (farmerId) await fetchPurchases(farmerId);
  };

  const handlePurchaseSelect = (purchaseId) => {
    const purchase = purchases.find(p => p._id === purchaseId);
    setSelectedPurchase(purchase);
    if (purchase) {
      setFormData(prev => ({ 
        ...prev, 
        purchaseId, 
        amount: purchase.amountDue.toString() 
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.purchaseId) {
      errors.purchaseId = 'Please select a purchase';
      isValid = false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
      isValid = false;
    }
    if (!formData.paymentDate) {
      errors.paymentDate = 'Payment date is required';
      isValid = false;
    }
    
    if ((formData.paymentMode === 'upi' || formData.paymentMode === 'bank') && !formData.referenceNumber) {
      errors.referenceNumber = 'Reference number is required';
      isValid = false;
    }
    
    if (formData.paymentMode === 'cheque') {
      if (!formData.chequeNumber) errors.chequeNumber = 'Cheque number is required';
      if (!formData.chequeDate) errors.chequeDate = 'Cheque date is required';
      if (!formData.bankName) errors.bankName = 'Bank name is required';
      isValid = isValid && !!formData.chequeNumber && !!formData.chequeDate && !!formData.bankName;
    }

    if (selectedPurchase && parseFloat(formData.amount) > selectedPurchase.amountDue) {
      errors.amount = `Amount cannot exceed pending amount of ${formatCurrency(selectedPurchase.amountDue)}`;
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
      const paymentData = {
        purchaseId: formData.purchaseId,
        amount: parseFloat(formData.amount),
        paymentMode: formData.paymentMode,
        paymentDate: formData.paymentDate,
        notes: formData.notes || undefined
      };

      if (formData.paymentMode === 'upi' || formData.paymentMode === 'bank') {
        paymentData.referenceNumber = formData.referenceNumber;
      }

      if (formData.paymentMode === 'cheque') {
        paymentData.chequeNumber = formData.chequeNumber;
        paymentData.chequeDate = formData.chequeDate;
        paymentData.bankName = formData.bankName;
      }

      const response = await fetch(`${BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/payments'), 2000);
      } else {
        setError(data.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const inputClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none border-[#E2E8F0] transition-all bg-white text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold mb-1" style={{ color: '#4B5568' }}>
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/payments')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1B5E20' }}>Record Payment</h1>
            <p className="text-xs mt-0.5" style={{ color: '#8D6E63' }}>Record a new payment from farmer</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/payments')} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50"
            style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}>
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Record Payment
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
          <span className="text-sm text-green-700">Payment recorded successfully! Redirecting...</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" style={{ color: '#2E7D32' }} />
              <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Payment Information</h2>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label required>SELECT FARMER</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={selectedFarmer?._id || ''}
                    onChange={(e) => handleFarmerSelect(e.target.value)}
                    className={`${inputClasses} pl-10`}
                  >
                    <option value="">Select a farmer</option>
                    {farmers.map(farmer => (
                      <option key={farmer._id} value={farmer._id}>
                        {farmer.name} - {farmer.mobile} ({farmer.village || farmer.city})
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedFarmer && (
                  <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-600">Selected Farmer</p>
                        <p className="text-sm font-semibold text-green-800">{selectedFarmer.name}</p>
                        <p className="text-xs text-gray-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedFarmer.mobile}</p>
                      </div>
                      <div><p className="text-xs text-gray-500">Pending Dues</p><p className="text-sm font-bold text-orange-600">{formatCurrency(selectedFarmer.pendingDues || 0)}</p></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label required>SELECT PURCHASE</Label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.purchaseId}
                    onChange={(e) => handlePurchaseSelect(e.target.value)}
                    className={`${inputClasses} pl-10 ${fieldErrors.purchaseId ? 'border-red-500' : ''}`}
                    disabled={!selectedFarmer || loadingPurchases}
                  >
                    <option value="">{loadingPurchases ? 'Loading purchases...' : 'Select a purchase'}</option>
                    {purchases.map(purchase => (
                      <option key={purchase._id} value={purchase._id}>
                        {purchase.receiptNumber} - Due: {formatCurrency(purchase.amountDue)} ({new Date(purchase.purchaseDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
                {fieldErrors.purchaseId && <p className="text-xs text-red-500 mt-1">{fieldErrors.purchaseId}</p>}
                
                {selectedPurchase && (
                  <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-600">Purchase Details</p>
                        <p className="text-sm font-semibold text-blue-800">{selectedPurchase.receiptNumber}</p>
                        <p className="text-xs text-gray-600">Date: {new Date(selectedPurchase.purchaseDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Pending Amount</p>
                        <p className="text-sm font-bold text-orange-600">{formatCurrency(selectedPurchase.amountDue)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label required>PAYMENT DATE</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} className={`${inputClasses} pl-10`} />
                </div>
              </div>

              <div>
                <Label required>AMOUNT</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="Enter amount" className={`${inputClasses} pl-10 ${fieldErrors.amount ? 'border-red-500' : ''}`} />
                </div>
                {fieldErrors.amount && <p className="text-xs text-red-500 mt-1">{fieldErrors.amount}</p>}
              </div>

              <div className="md:col-span-2">
                <Label required>PAYMENT MODE</Label>
                <div className="flex gap-3 mt-1 flex-wrap">
                  {[
                    { value: 'cash', label: 'Cash', icon: Wallet, color: '#2E7D32' },
                    { value: 'upi', label: 'UPI', icon: TrendingUp, color: '#1976D2' },
                    { value: 'bank', label: 'Bank Transfer', icon: Building, color: '#F57C00' },
                    { value: 'cheque', label: 'Cheque', icon: CreditCard, color: '#7B1FA2' }
                  ].map(mode => {
                    const Icon = mode.icon;
                    return (
                      <button key={mode.value} type="button" onClick={() => setFormData(prev => ({ ...prev, paymentMode: mode.value }))}
                        className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${formData.paymentMode === mode.value ? 'text-white shadow-md' : 'hover:bg-gray-50'}`}
                        style={{ borderColor: '#C8E6C9', background: formData.paymentMode === mode.value ? mode.color : 'white', color: formData.paymentMode === mode.value ? 'white' : '#666' }}>
                        <Icon className="w-4 h-4" /><span className="text-sm">{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(formData.paymentMode === 'upi' || formData.paymentMode === 'bank') && (
                <div className="md:col-span-2">
                  <Label required>REFERENCE NUMBER</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange}
                      placeholder={formData.paymentMode === 'upi' ? 'UPI Transaction ID' : 'Bank Reference Number'}
                      className={`${inputClasses} pl-10 ${fieldErrors.referenceNumber ? 'border-red-500' : ''}`} />
                  </div>
                </div>
              )}

              {formData.paymentMode === 'cheque' && (
                <>
                  <div><Label required>CHEQUE NUMBER</Label><input type="text" name="chequeNumber" value={formData.chequeNumber} onChange={handleChange} placeholder="Cheque number" className={inputClasses} /></div>
                  <div><Label required>CHEQUE DATE</Label><input type="date" name="chequeDate" value={formData.chequeDate} onChange={handleChange} className={inputClasses} /></div>
                  <div className="md:col-span-2"><Label required>BANK NAME</Label><input type="text" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Bank name" className={inputClasses} /></div>
                </>
              )}

              <div className="md:col-span-2">
                <Label>NOTES</Label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional notes..." rows="3" className={`${inputClasses} resize-none`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPayment;
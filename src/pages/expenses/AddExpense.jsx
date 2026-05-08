// src/pages/expenses/AddExpense.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, Wallet, Calendar, 
  DollarSign, FileText, AlertCircle, 
  CheckCircle, Loader, Truck, Briefcase, 
  Landmark, Warehouse, Building, Wrench, 
  Banknote, Megaphone
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const AddExpense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    category: 'transport_logistics',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paidBy: 'cash',
    paidTo: '',
    referenceNumber: '',
    notes: ''
  });

  // Correct category options as per backend enum
  const categoryOptions = [
    { value: 'transport_logistics', label: 'Transport & Logistics', icon: Truck },
    { value: 'labour_wages', label: 'Labour & Wages', icon: Briefcase },
    { value: 'market_fees', label: 'Market Fees', icon: Landmark },
    { value: 'storage_cold_chain', label: 'Storage & Cold Chain', icon: Warehouse },
    { value: 'shop_office', label: 'Shop & Office', icon: Building },
    { value: 'repairs_maintenance', label: 'Repairs & Maintenance', icon: Wrench },
    { value: 'banking_finance', label: 'Banking & Finance', icon: Banknote },
    { value: 'marketing_misc', label: 'Marketing & Miscellaneous', icon: Megaphone }
  ];

  // Correct paidBy options as per backend enum
  const paymentOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' }
  ];

  const getToken = () => localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.category) {
      errors.category = 'Please select a category';
      isValid = false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
      isValid = false;
    }
    if (!formData.description) {
      errors.description = 'Description is required';
      isValid = false;
    }
    if (!formData.expenseDate) {
      errors.expenseDate = 'Expense date is required';
      isValid = false;
    }
    if (!formData.paidBy) {
      errors.paidBy = 'Payment method is required';
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
      const expenseData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        expenseDate: formData.expenseDate,
        paidBy: formData.paidBy,
        paidTo: formData.paidTo || undefined,
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined
      };

      const response = await fetch(`${BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/expenses'), 2000);
      } else {
        setError(data.message || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/expenses')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-green-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-green-900">Add Expense</h1>
            <p className="text-xs text-gray-500">Record a new business expense</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/expenses')} className="px-4 py-2 rounded-lg border text-gray-600">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-lg bg-green-700 text-white flex items-center gap-2">
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Expense
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
          <span className="text-sm text-green-700">Expense created successfully! Redirecting...</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Expense Details</h2></div></div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><Label required>Category</Label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClasses}>
                {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div><Label required>Amount (₹)</Label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="Enter amount" className={inputClasses} />
            </div>
            <div className="md:col-span-2"><Label required>Description</Label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the expense" rows="2" className={`${inputClasses} resize-none`} />
            </div>
            <div><Label required>Expense Date</Label>
              <input type="date" name="expenseDate" value={formData.expenseDate} onChange={handleChange} className={inputClasses} />
            </div>
            <div><Label required>Paid By</Label>
              <select name="paidBy" value={formData.paidBy} onChange={handleChange} className={inputClasses}>
                {paymentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div><Label>Paid To (Vendor/Person)</Label>
              <input type="text" name="paidTo" value={formData.paidTo} onChange={handleChange} placeholder="Vendor or person name" className={inputClasses} />
            </div>
            <div><Label>Reference Number</Label>
              <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} placeholder="Bill/Invoice/Transaction No." className={inputClasses} />
            </div>
            <div className="md:col-span-2"><Label>Notes (Optional)</Label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional notes..." rows="2" className={`${inputClasses} resize-none`} />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800"><strong>Note:</strong> Expenses under ₹1,000 will be auto-approved. Higher amounts require manager approval.</p>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
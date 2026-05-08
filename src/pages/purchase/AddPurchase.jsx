// src/pages/purchase/AddPurchase.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, ArrowLeft, Save, X, User, Calendar, 
  Package, Scale, DollarSign, Truck, Users, 
  AlertCircle, CheckCircle, Plus, Trash2, 
  ChevronRight, ChevronLeft, 
  ClipboardList, Percent, Briefcase, Landmark,
  TrendingUp, Settings, FileText
} from 'lucide-react';
import BASE_URL from '../../config/Config';


const AddPurchase = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [farmers, setFarmers] = useState([]);
  const formTopRef = useRef(null);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  
  const [formData, setFormData] = useState({
    farmerId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    lines: [
      {
        productName: '',
        pricingType: 'kg',
        bags: 0,
        weightPerBag: 0,
        actualQty: 0,
        qualityDeduction: 0,
        rate: 0,
        notes: ''
      }
    ],
    deductions: {
      transport: 0,
      labour: 0,
      commission: 0,
      commissionType: 'fixed',
      storage: 0,
      storageNote: '',
      returnDeduction: 0,
      returnNote: '',
      advanceAdjusted: 0,
      other: 0,
      otherNote: ''
    },
    notes: ''
  });

  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [calculations, setCalculations] = useState({
    grossTotal: 0,
    totalDeductions: 0,
    finalPayable: 0
  });

  const pricingTypeOptions = [
    { value: 'kg', label: 'KG (Kilogram)' },
    { value: 'quintal', label: 'Quintal (100 KG)' },
    { value: 'piece', label: 'Piece' },
    { value: 'bunch', label: 'Bunch' },
    { value: 'crate', label: 'Crate' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'flat', label: 'Flat' }
  ];

  const steps = ['Purchase Details', 'Product Lines', 'Deductions & Summary'];

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
      if (data.success) setFarmers(data.data);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoadingFarmers(false);
    }
  };

  const calculateLineTotal = (line) => {
    let quantity = line.actualQty || 0;
    if (line.pricingType === 'quintal') quantity = (line.actualQty || 0) * 100;
    const netQty = quantity - (line.qualityDeduction || 0);
    return netQty * (line.rate || 0);
  };

  useEffect(() => {
    let grossTotal = 0;
    formData.lines.forEach(line => { grossTotal += calculateLineTotal(line); });

    const totalDeductions = 
      (parseFloat(formData.deductions.transport) || 0) +
      (parseFloat(formData.deductions.labour) || 0) +
      (parseFloat(formData.deductions.commission) || 0) +
      (parseFloat(formData.deductions.storage) || 0) +
      (parseFloat(formData.deductions.returnDeduction) || 0) +
      (parseFloat(formData.deductions.advanceAdjusted) || 0) +
      (parseFloat(formData.deductions.other) || 0);

    setCalculations({
      grossTotal,
      totalDeductions,
      finalPayable: grossTotal - totalDeductions
    });
  }, [formData.lines, formData.deductions]);

  const handleFarmerSelect = (farmerId) => {
    const farmer = farmers.find(f => f._id === farmerId);
    setSelectedFarmer(farmer);
    setFormData(prev => ({ ...prev, farmerId }));
  };

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...formData.lines];
    updatedLines[index][field] = value;
    
    if ((field === 'bags' || field === 'weightPerBag') && 
        updatedLines[index].bags && updatedLines[index].weightPerBag && 
        updatedLines[index].pricingType === 'kg') {
      updatedLines[index].actualQty = updatedLines[index].bags * updatedLines[index].weightPerBag;
    }
    
    setFormData(prev => ({ ...prev, lines: updatedLines }));
  };

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, {
        productName: '', pricingType: 'kg', bags: 0, weightPerBag: 0,
        actualQty: 0, qualityDeduction: 0, rate: 0, notes: ''
      }]
    }));
  };

  const removeLine = (index) => {
    if (formData.lines.length > 1) {
      setFormData(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));
    }
  };

  const handleDeductionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      deductions: { ...prev.deductions, [field]: value }
    }));
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 0) {
      if (!formData.farmerId) {
        errors.farmerId = 'Please select a farmer';
        isValid = false;
      }
      if (!formData.purchaseDate) {
        errors.purchaseDate = 'Purchase date is required';
        isValid = false;
      }
    } else if (step === 1) {
      formData.lines.forEach((line, idx) => {
        if (!line.productName) {
          errors[`line_${idx}_product`] = 'Product name required';
          isValid = false;
        }
        if (line.rate <= 0) {
          errors[`line_${idx}_rate`] = 'Valid rate required';
          isValid = false;
        }
        if (line.actualQty <= 0) {
          errors[`line_${idx}_qty`] = 'Valid quantity required';
          isValid = false;
        }
      });
    }

    setFieldErrors(errors);
    if (!isValid) setError('Please fill all required fields');
    return isValid;
  };

  const handleNext = () => {
  if (validateStep(currentStep)) {
    setCurrentStep(currentStep + 1);
    setError('');
    // Scroll to top of form
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};
  const handlePrevious = () => {
  setCurrentStep(currentStep - 1);
  setError('');
  // Scroll to top of form
  if (formTopRef.current) {
    formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

  const handleSubmit = async () => {
    if (!formData.farmerId) {
      setError('Please select a farmer');
      return;
    }
    if (formData.lines.some(line => !line.productName || line.rate <= 0 || line.actualQty <= 0)) {
      setError('Please complete all product lines');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const purchaseData = {
        farmerId: formData.farmerId,
        purchaseDate: formData.purchaseDate,
        lines: formData.lines.map(line => ({
          productName: line.productName,
          pricingType: line.pricingType,
          bags: parseInt(line.bags) || 0,
          weightPerBag: parseInt(line.weightPerBag) || 0,
          actualQty: parseFloat(line.actualQty) || 0,
          qualityDeduction: parseFloat(line.qualityDeduction) || 0,
          rate: parseFloat(line.rate) || 0,
          notes: line.notes || ''
        })),
        deductions: {
          transport: parseFloat(formData.deductions.transport) || 0,
          labour: parseFloat(formData.deductions.labour) || 0,
          commission: parseFloat(formData.deductions.commission) || 0,
          commissionType: formData.deductions.commissionType,
          storage: parseFloat(formData.deductions.storage) || 0,
          storageNote: formData.deductions.storageNote || '',
          returnDeduction: parseFloat(formData.deductions.returnDeduction) || 0,
          returnNote: formData.deductions.returnNote || '',
          advanceAdjusted: parseFloat(formData.deductions.advanceAdjusted) || 0,
          other: parseFloat(formData.deductions.other) || 0,
          otherNote: formData.deductions.otherNote || ''
        },
        notes: formData.notes || ''
      };

      const response = await fetch(`${BASE_URL}/purchases`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purchaseData)
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/purchases'), 2000);
      } else {
        setError(data.message || 'Failed to create purchase');
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
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

  const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold mb-1" style={{ color: '#4B5568' }}>
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const inputClasses = "w-full px-3 py-2 border rounded-lg border-[#E2E8F0] focus:outline-none transition-all bg-white text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="h-full flex flex-col" ref={formTopRef}>
      {/* Header */}
      <div className="flex-shrink-0 flex justify-between items-center flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/purchases')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1B5E20' }}>New Purchase</h1>
            <p className="text-xs mt-0.5" style={{ color: '#8D6E63' }}>Record a new purchase transaction</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/purchases')} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50"
            style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}>
            <X className="w-4 h-4" /> Cancel
          </button>
          {currentStep === 2 && (
            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
              {loading ? (<>Processing...</>) : (<><Save className="w-4 h-4" /> Create Purchase</>)}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600 flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-500"><X className="w-3 h-3" /></button>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">Purchase created successfully! Redirecting...</span>
        </div>
      )}

      {/* Stepper */}
      <div className="flex-shrink-0 mb-5">
        <div className="flex items-center justify-center gap-3">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${currentStep >= index ? 'text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}
                  style={currentStep >= index ? { background: 'linear-gradient(135deg, #2E7D32, #43A047)' } : {}}>
                  {currentStep > index ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: currentStep >= index ? '#2E7D32' : '#8D6E63' }}>Step {index + 1}</p>
                  <p className="text-xs font-medium" style={{ color: currentStep >= index ? '#1B5E20' : '#8D6E63' }}>{step}</p>
                </div>
              </div>
              {index < steps.length - 1 && <div className={`w-12 h-0.5 transition-all ${currentStep > index ? 'bg-[#2E7D32]' : 'bg-gray-200'}`}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        {/* Step 1: Purchase Details */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" style={{ color: '#2E7D32' }} />
                <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Basic Information</h2>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Label required>SELECT FARMER</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <select value={formData.farmerId} onChange={(e) => handleFarmerSelect(e.target.value)}
                      className={`${inputClasses} pl-10 ${fieldErrors.farmerId ? 'border-red-500' : 'border-[#E2E8F0]'}`}>
                      <option value="">Select a farmer</option>
                      {farmers.map(farmer => (
                        <option key={farmer._id} value={farmer._id}>{farmer.name} - {farmer.mobile} ({farmer.village}, {farmer.city})</option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.farmerId && <p className="text-xs text-red-500 mt-1">{fieldErrors.farmerId}</p>}
                  
                  {selectedFarmer && (
                    <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-600">Selected Farmer Details</p>
                          <p className="text-sm font-semibold text-green-800">{selectedFarmer.name}</p>
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

                <div>
                  <Label required>PURCHASE DATE</Label>
                  <div className="relative ">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input type="date" value={formData.purchaseDate} onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                      className={`${inputClasses} pl-10`} />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label>ADDITIONAL NOTES</Label>
                  <textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter any additional notes about this purchase..." rows="3" className={`${inputClasses} resize-none`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Product Lines */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {formData.lines.map((line, index) => {
              const lineTotal = calculateLineTotal(line);
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b flex justify-between items-center" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" style={{ color: '#2E7D32' }} />
                      <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Product Line {index + 1}</h2>
                    </div>
                    {formData.lines.length > 1 && (
                      <button onClick={() => removeLine(index)} className="p-1 rounded hover:bg-red-100">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label required>PRODUCT NAME</Label>
                        <input type="text" value={line.productName} onChange={(e) => handleLineChange(index, 'productName', e.target.value)}
                          placeholder="e.g., Wheat, Rice, Corn" className={`${inputClasses} ${fieldErrors[`line_${index}_product`] ? 'border-red-500' : 'border-[#E2E8F0]'}`} />
                      </div>

                      <div>
                        <Label required>PRICING TYPE</Label>
                        <select value={line.pricingType} onChange={(e) => handleLineChange(index, 'pricingType', e.target.value)} className={inputClasses}>
                          {pricingTypeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>

                      <div>
                        <Label required>RATE ({line.pricingType === 'kg' ? '₹/KG' : line.pricingType === 'quintal' ? '₹/Quintal' : '₹/Unit'})</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                          <input type="number" value={line.rate} onChange={(e) => handleLineChange(index, 'rate', parseFloat(e.target.value))}
                            placeholder="Enter rate" className={`${inputClasses} pl-10 ${fieldErrors[`line_${index}_rate`] ? 'border-red-500' : 'border-[#E2E8F0]'}`} />
                        </div>
                      </div>

                      {line.pricingType === 'kg' && (
                        <>
                          <div>
                            <Label>NUMBER OF BAGS</Label>
                            <input type="number" value={line.bags} onChange={(e) => handleLineChange(index, 'bags', parseInt(e.target.value))}
                              placeholder="Number of bags" className={inputClasses} />
                          </div>
                          <div>
                            <Label>WEIGHT PER BAG (KG)</Label>
                            <div className="relative">
                              <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                              <input type="number" value={line.weightPerBag} onChange={(e) => handleLineChange(index, 'weightPerBag', parseInt(e.target.value))}
                                placeholder="Weight per bag" className={`${inputClasses} pl-10`} />
                            </div>
                          </div>
                        </>
                      )}

                      <div>
                        <Label required>QUANTITY</Label>
                        <div className="relative">
                          <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                          <input type="number" value={line.actualQty} onChange={(e) => handleLineChange(index, 'actualQty', parseFloat(e.target.value))}
                            placeholder={`Enter quantity in ${line.pricingType}`} className={`${inputClasses} pl-10 ${fieldErrors[`line_${index}_qty`] ? 'border-red-500' : 'border-[#E2E8F0]'}`} />
                        </div>
                        {line.pricingType === 'kg' && line.bags && line.weightPerBag && (
                          <p className="text-xs text-gray-500 mt-1">Auto-calculated: {line.bags} bags × {line.weightPerBag} kg = {line.actualQty} kg</p>
                        )}
                      </div>

                      <div>
                        <Label>QUALITY DEDUCTION ({line.pricingType === 'kg' ? 'KG' : 'Units'})</Label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                          <input type="number" value={line.qualityDeduction} onChange={(e) => handleLineChange(index, 'qualityDeduction', parseFloat(e.target.value))}
                            placeholder="Quality deduction" className={`${inputClasses} pl-10`} />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <Label>LINE NOTES</Label>
                        <input type="text" value={line.notes} onChange={(e) => handleLineChange(index, 'notes', e.target.value)}
                          placeholder="Any notes for this product line" className={inputClasses} />
                      </div>

                      <div className="md:col-span-2 mt-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Line Total:</span>
                          <span className="text-lg font-bold" style={{ color: '#2E7D32' }}>{formatCurrency(lineTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <button onClick={addLine} className="w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 hover:bg-green-50"
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <Plus className="w-4 h-4" /> Add Another Product
            </button>
          </div>
        )}

        {/* Step 3: Deductions & Summary */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Deductions Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" style={{ color: '#2E7D32' }} />
                  <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Deductions & Charges</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* TRANSPORT CHARGES */}
                  <div>
                    <Label>TRANSPORT CHARGES</Label>
                    <div className="relative">
                      <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.deductions.transport}
                        onChange={(e) => handleDeductionChange('transport', parseFloat(e.target.value))}
                        placeholder="Enter transport charges"
                        className={`${inputClasses} pl-10`}
                      />
                    </div>
                  </div>

                  {/* LABOUR CHARGES */}
                  <div>
                    <Label>LABOUR CHARGES</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.deductions.labour}
                        onChange={(e) => handleDeductionChange('labour', parseFloat(e.target.value))}
                        placeholder="Enter labour charges"
                        className={`${inputClasses} pl-10`}
                      />
                    </div>
                  </div>

                  {/* COMMISSION with Type */}
                  <div>
                    <Label>COMMISSION</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={formData.deductions.commission}
                          onChange={(e) => handleDeductionChange('commission', parseFloat(e.target.value))}
                          placeholder="Commission amount"
                          className={`${inputClasses} pl-10`}
                        />
                      </div>
                      <select
                        value={formData.deductions.commissionType}
                        onChange={(e) => handleDeductionChange('commissionType', e.target.value)}
                        className={`${inputClasses} w-28`}
                      >
                        <option value="fixed">Fixed (₹)</option>
                        <option value="percent">Percent (%)</option>
                      </select>
                    </div>
                  </div>

                  {/* STORAGE CHARGES with Note */}
                  <div>
                    <Label>STORAGE CHARGES</Label>
                    <input
                      type="number"
                      value={formData.deductions.storage}
                      onChange={(e) => handleDeductionChange('storage', parseFloat(e.target.value))}
                      placeholder="Enter storage charges"
                      className={inputClasses}
                    />
                    <input
                      type="text"
                      value={formData.deductions.storageNote}
                      onChange={(e) => handleDeductionChange('storageNote', e.target.value)}
                      placeholder="Storage note (e.g., Cold storage charges)"
                      className={`${inputClasses} mt-2 text-xs bg-gray-50`}
                    />
                  </div>

                  {/* RETURN DEDUCTION with Note */}
                  <div>
                    <Label>RETURN DEDUCTION</Label>
                    <input
                      type="number"
                      value={formData.deductions.returnDeduction}
                      onChange={(e) => handleDeductionChange('returnDeduction', parseFloat(e.target.value))}
                      placeholder="Enter return deduction"
                      className={inputClasses}
                    />
                    <input
                      type="text"
                      value={formData.deductions.returnNote}
                      onChange={(e) => handleDeductionChange('returnNote', e.target.value)}
                      placeholder="Return reason (e.g., Damaged goods)"
                      className={`${inputClasses} mt-2 text-xs bg-gray-50`}
                    />
                  </div>

                  {/* ADVANCE ADJUSTED */}
                  <div>
                    <Label>ADVANCE ADJUSTED</Label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={formData.deductions.advanceAdjusted}
                        onChange={(e) => handleDeductionChange('advanceAdjusted', parseFloat(e.target.value))}
                        placeholder="Advance payment already given"
                        className={`${inputClasses} pl-10`}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Amount already paid as advance to farmer</p>
                  </div>

                  {/* OTHER DEDUCTIONS with Note */}
                  <div>
                    <Label>OTHER DEDUCTIONS</Label>
                    <input
                      type="number"
                      value={formData.deductions.other}
                      onChange={(e) => handleDeductionChange('other', parseFloat(e.target.value))}
                      placeholder="Other charges"
                      className={inputClasses}
                    />
                    <input
                      type="text"
                      value={formData.deductions.otherNote}
                      onChange={(e) => handleDeductionChange('otherNote', e.target.value)}
                      placeholder="Description (e.g., Handling charges)"
                      className={`${inputClasses} mt-2 text-xs bg-gray-50`}
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm overflow-hidden border border-green-200">
              <div className="px-5 py-4">
                <h3 className="text-lg font-bold mb-4" style={{ color: '#1B5E20' }}>Purchase Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-green-200">
                    <span className="text-gray-700">Gross Total</span>
                    <span className="font-semibold">{formatCurrency(calculations.grossTotal)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-green-200">
                    <span className="text-gray-700">Total Deductions</span>
                    <span className="font-semibold text-red-600">- {formatCurrency(calculations.totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-white rounded-lg px-3 -mx-3">
                    <span className="text-lg font-bold" style={{ color: '#1B5E20' }}>Final Payable Amount</span>
                    <span className="text-xl font-bold" style={{ color: '#2E7D32' }}>{formatCurrency(calculations.finalPayable)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Summary Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" style={{ color: '#2E7D32' }} />
                  <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Products Summary</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#FAFAFA' }}>
                      <th className="px-4 py-2 text-left text-xs">Product</th>
                      <th className="px-4 py-2 text-left text-xs">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs">Rate</th>
                      <th className="px-4 py-2 text-right text-xs">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.lines.map((line, idx) => {
                      let quantity = line.actualQty || 0;
                      if (line.pricingType === 'quintal') quantity = line.actualQty * 100;
                      const netQty = quantity - (line.qualityDeduction || 0);
                      return (
                        <tr key={idx} className="border-t border-gray-100">
                          <td className="px-4 py-2 text-sm">{line.productName || '-'}</td>
                          <td className="px-4 py-2 text-sm">{netQty.toFixed(2)} {line.pricingType}</td>
                          <td className="px-4 py-2 text-sm">{formatCurrency(line.rate)}/{line.pricingType === 'kg' ? 'kg' : line.pricingType}</td>
                          <td className="px-4 py-2 text-sm text-right font-semibold">{formatCurrency(calculateLineTotal(line))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-3 pt-5 pb-3 mt-2">
          {currentStep > 0 && (
            <button onClick={handlePrevious} className="px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50"
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
          )}
          {currentStep < 2 && (
            <button onClick={handleNext} className="px-5 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 ml-auto"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPurchase;
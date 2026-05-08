// src/pages/farmers/AddFarmer.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, ArrowLeft, Save, X, User, Phone, 
  MapPin, Building, CreditCard, Landmark, 
  AlertCircle, CheckCircle, Home, 
  Briefcase, FileText, Hash, Globe,
  ChevronRight, ChevronLeft, UserCheck, Banknote,
  Info, Package, Truck, DollarSign
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const AddFarmer = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    village: '',
    city: '',
    state: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: '',
    gstNumber: ''
  });

  const steps = ['Personal Information', 'Bank Details'];

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 0) {
      if (!formData.name.trim()) {
        errors.name = 'Farmer name is required';
        isValid = false;
      }
      if (!formData.mobile.trim()) {
        errors.mobile = 'Mobile number is required';
        isValid = false;
      } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
        errors.mobile = 'Enter a valid 10-digit mobile number';
        isValid = false;
      }
      if (!formData.village.trim()) {
        errors.village = 'Village name is required';
        isValid = false;
      }
      if (!formData.city.trim()) {
        errors.city = 'City is required';
        isValid = false;
      }
      if (!formData.state.trim()) {
        errors.state = 'State is required';
        isValid = false;
      }
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError('Please fill all required fields');
      setTimeout(() => setError(''), 3000);
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(1);
      setError('');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(0);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAllFields = () => {
    const errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Farmer name is required';
      isValid = false;
    }
    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      errors.mobile = 'Enter a valid 10-digit mobile number';
      isValid = false;
    }
    if (!formData.village.trim()) {
      errors.village = 'Village name is required';
      isValid = false;
    }
    if (!formData.city.trim()) {
      errors.city = 'City is required';
      isValid = false;
    }
    if (!formData.state.trim()) {
      errors.state = 'State is required';
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError('Please fill all required fields');
      setTimeout(() => setError(''), 3000);
    }
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = getToken();
      
      const response = await fetch(`${BASE_URL}/farmers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/farmers');
        }, 2000);
      } else {
        setError(data.message || 'Failed to add farmer. Please try again.');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error adding farmer:', error);
      setError('Network error. Please check your connection.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/farmers');
  };

  // Floating Error Alert Component
  const FloatingErrorAlert = ({ error, onClose }) => {
    if (!error) return null;
    
    return (
      <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 animate-shake">
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span className="text-xs text-red-600 flex-1">{error}</span>
        <button onClick={onClose} className="text-red-500 hover:text-red-700">
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  };

  // Label component
  const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold mb-1" style={{ color: '#4B5568', letterSpacing: '0.5px' }}>
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const inputClasses = "w-full px-3 py-2 border rounded-lg border-[#E2E8F0] focus:outline-none  transition-all bg-white text-sm";
  const errorClasses = "text-xs text-red-500 mt-1";

  return (
    <div className="h-full flex flex-col">
      {/* Page Header - Fixed */}
      <div className="flex-shrink-0 flex justify-between items-center flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Back to Farmers"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1B5E20' }}>Add New Farmer</h1>
            <p className="text-xs mt-0.5" style={{ color: '#8D6E63' }}>Register a new farmer in the system</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border transition-all hover:bg-gray-50"
            style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          {currentStep === 1 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Farmer
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Floating Error Alert */}
      <div className="flex-shrink-0">
        <FloatingErrorAlert error={error} onClose={() => setError('')} />
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex-shrink-0 mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">Farmer added successfully! Redirecting...</span>
        </div>
      )}

      {/* Stepper */}
      <div className="flex-shrink-0 mb-5">
        <div className="flex items-center justify-center gap-3">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep >= index 
                      ? 'text-white shadow-md' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  style={currentStep >= index ? { background: 'linear-gradient(135deg, #2E7D32, #43A047)' } : {}}
                >
                  {currentStep > index ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <div>
                  <p className="text-[10px]" style={{ color: currentStep >= index ? '#2E7D32' : '#8D6E63' }}>
                    Step {index + 1}
                  </p>
                  <p className="text-xs font-medium" style={{ color: currentStep >= index ? '#1B5E20' : '#8D6E63' }}>
                    {step}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 transition-all ${currentStep > index ? 'bg-[#2E7D32]' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Scrollable Form Content - Like Material-UI DialogContent */}
      <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
        {/* Step 1: Personal Information */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: '#2E7D32' }} />
                <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Personal Information</h2>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <Label required>FARMER NAME</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter farmer name"
                      className={`${inputClasses} pl-10 ${fieldErrors.name ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                    />
                  </div>
                  {fieldErrors.name && <p className={errorClasses}>{fieldErrors.name}</p>}
                </div>

                {/* Mobile */}
                <div>
                  <Label required>MOBILE NUMBER</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      className={`${inputClasses} pl-10 ${fieldErrors.mobile ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                    />
                  </div>
                  {fieldErrors.mobile && <p className={errorClasses}>{fieldErrors.mobile}</p>}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <Label>ADDRESS</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter full address"
                      rows="2"
                      className={`${inputClasses} pl-10 resize-none`}
                    />
                  </div>
                </div>

                {/* Village */}
                <div>
                  <Label required>VILLAGE</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input
                      type="text"
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                      placeholder="Enter village name"
                      className={`${inputClasses} pl-10 ${fieldErrors.village ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                    />
                  </div>
                  {fieldErrors.village && <p className={errorClasses}>{fieldErrors.village}</p>}
                </div>

                {/* City */}
                <div>
                  <Label required>CITY</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      className={`${inputClasses} pl-10 ${fieldErrors.city ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                    />
                  </div>
                  {fieldErrors.city && <p className={errorClasses}>{fieldErrors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <Label required>STATE</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                      className={`${inputClasses} pl-10 ${fieldErrors.state ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                    />
                  </div>
                  {fieldErrors.state && <p className={errorClasses}>{fieldErrors.state}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Bank Details */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4" style={{ color: '#2E7D32' }} />
                <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Bank Details</h2>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Bank Name */}
                <div>
                  <Label>BANK NAME</Label>
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="Enter bank name"
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                </div>

                {/* Bank Account Number */}
                <div>
                  <Label>BANK ACCOUNT NUMBER</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input
                      type="text"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                      placeholder="Enter account number"
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                </div>

                {/* IFSC Code */}
                <div>
                  <Label>IFSC CODE</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      placeholder="Enter IFSC code"
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                </div>

                {/* GST Number */}
                <div>
                  <Label>GST NUMBER</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      placeholder="Enter GST number"
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons - Inside scrollable area but at bottom */}
        <div className="flex justify-between gap-3 pt-5 pb-3 mt-2">
          {currentStep === 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border transition-all hover:bg-gray-50"
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          )}
          {currentStep === 0 && <div></div>}
          {currentStep === 0 && (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 ml-auto"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {currentStep === 1 && <div></div>}
        </div>
      </div>
    </div>
  );
};

export default AddFarmer;
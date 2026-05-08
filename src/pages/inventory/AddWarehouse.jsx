// // src/pages/inventory/AddWarehouse.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Save, X, Warehouse, Building, MapPin, User, Phone, Mail, Package, AlertCircle, CheckCircle, Loader,FileText } from 'lucide-react';
// import BASE_URL from '../../config/Config';

// const AddWarehouse = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState('');
//   const [fieldErrors, setFieldErrors] = useState({});
  
//   const [formData, setFormData] = useState({
//     name: '',
//     code: '',
//     location: {
//       address: '',
//       city: '',
//       state: '',
//       pincode: ''
//     },
//     manager: {
//       name: '',
//       phone: '',
//       email: ''
//     },
//     capacity: {
//       total: '',
//       used: 0,
//       unit: 'KG'
//     },
//     notes: ''
//   });

//   const getToken = () => localStorage.getItem('token');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name.includes('.')) {
//       const [parent, child] = name.split('.');
//       setFormData(prev => ({
//         ...prev,
//         [parent]: { ...prev[parent], [child]: value }
//       }));
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
//     if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const validateForm = () => {
//     const errors = {};
//     if (!formData.name) errors.name = 'Warehouse name is required';
//     if (!formData.code) errors.code = 'Warehouse code is required';
//     if (!formData.location.city) errors['location.city'] = 'City is required';
//     if (!formData.location.state) errors['location.state'] = 'State is required';
//     if (!formData.manager.name) errors['manager.name'] = 'Manager name is required';
//     if (!formData.manager.phone) errors['manager.phone'] = 'Manager phone is required';
//     if (!formData.capacity.total) errors['capacity.total'] = 'Total capacity is required';
    
//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       setError('Please fill all required fields');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const token = getToken();
//       const response = await fetch(`${BASE_URL}/warehouse`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           ...formData,
//           capacity: { ...formData.capacity, total: parseFloat(formData.capacity.total) }
//         })
//       });

//       const data = await response.json();

//       if (response.status === 401) {
//         localStorage.clear();
//         navigate('/login');
//         return;
//       }

//       if (response.ok && data.success) {
//         setSuccess(true);
//         setTimeout(() => navigate('/warehouses'), 2000);
//       } else {
//         setError(data.message || 'Failed to create warehouse');
//       }
//     } catch (error) {
//       setError('Network error. Please check your connection.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-sm";

//   const Label = ({ children, required }) => (
//     <label className="block text-xs font-semibold mb-1" style={{ color: '#4B5568' }}>
//       {children} {required && <span className="text-red-500">*</span>}
//     </label>
//   );

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
//         <div className="flex items-center gap-3">
//           <button onClick={() => navigate('/warehouses')} className="p-2 rounded-lg hover:bg-gray-100">
//             <ArrowLeft className="w-5 h-5 text-green-700" />
//           </button>
//           <div>
//             <h1 className="text-xl font-bold text-green-900">Add Warehouse</h1>
//             <p className="text-xs text-gray-500">Create a new storage facility</p>
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <button onClick={() => navigate('/warehouses')} className="px-4 py-2 rounded-lg border text-gray-600">Cancel</button>
//           <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-lg bg-green-700 text-white flex items-center gap-2">
//             {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Warehouse
//           </button>
//         </div>
//       </div>

//       {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3"><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-sm text-red-600">{error}</span></div>}
//       {success && <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-sm text-green-700">Warehouse created successfully! Redirecting...</span></div>}

//       <div className="space-y-6">
//         {/* Basic Information */}
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><Warehouse className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Basic Information</h2></div></div>
//           <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
//             <div><Label required>Warehouse Name</Label><input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter warehouse name" className={inputClasses} /></div>
//             <div><Label required>Warehouse Code</Label><input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="e.g., WH001, CS001" className={inputClasses} /></div>
//           </div>
//         </div>

//         {/* Location Details */}
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Location Details</h2></div></div>
//           <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
//             <div className="md:col-span-2"><Label>Address</Label><textarea name="location.address" value={formData.location.address} onChange={handleChange} placeholder="Street address" rows="2" className={`${inputClasses} resize-none`} /></div>
//             <div><Label required>City</Label><input type="text" name="location.city" value={formData.location.city} onChange={handleChange} placeholder="City" className={inputClasses} /></div>
//             <div><Label required>State</Label><input type="text" name="location.state" value={formData.location.state} onChange={handleChange} placeholder="State" className={inputClasses} /></div>
//             <div><Label>Pincode</Label><input type="text" name="location.pincode" value={formData.location.pincode} onChange={handleChange} placeholder="Pincode" className={inputClasses} /></div>
//           </div>
//         </div>

//         {/* Manager Details */}
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><User className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Manager Details</h2></div></div>
//           <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
//             <div><Label required>Manager Name</Label><input type="text" name="manager.name" value={formData.manager.name} onChange={handleChange} placeholder="Full name" className={inputClasses} /></div>
//             <div><Label required>Phone Number</Label><input type="tel" name="manager.phone" value={formData.manager.phone} onChange={handleChange} placeholder="Mobile number" className={inputClasses} /></div>
//             <div className="md:col-span-2"><Label>Email</Label><input type="email" name="manager.email" value={formData.manager.email} onChange={handleChange} placeholder="Email address" className={inputClasses} /></div>
//           </div>
//         </div>

//         {/* Capacity Details */}
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><Package className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Capacity Details</h2></div></div>
//           <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
//             <div><Label required>Total Capacity</Label><input type="number" name="capacity.total" value={formData.capacity.total} onChange={handleChange} placeholder="Total storage capacity" className={inputClasses} /></div>
//             <div><Label>Unit</Label><select name="capacity.unit" value={formData.capacity.unit} onChange={handleChange} className={inputClasses}><option value="KG">KG (Kilograms)</option><option value="TON">TON (Tons)</option><option value="QUINTAL">QUINTAL (100 KG)</option></select></div>
//           </div>
//         </div>

//         {/* Notes */}
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="px-5 py-3 border-b bg-green-50"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Additional Notes</h2></div></div>
//           <div className="p-5"><textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional notes about this warehouse..." rows="3" className={`${inputClasses} resize-none`} /></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddWarehouse;

// src/pages/inventory/AddWarehouse.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Warehouse, ArrowLeft, Save, X, Building, MapPin, 
  User, Phone, Mail, Package, AlertCircle, 
  CheckCircle, Loader, FileText, Hash, Globe,
  ChevronRight, ChevronLeft, Home, Briefcase,
  CreditCard, Landmark, TrendingUp, Ruler
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const AddWarehouse = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    manager: {
      name: '',
      phone: '',
      email: ''
    },
    capacity: {
      total: '',
      used: 0,
      unit: 'KG'
    },
    notes: ''
  });

  const steps = ['Basic Information', 'Location & Manager', 'Capacity & Notes'];

  const getToken = () => localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 0) {
      if (!formData.name.trim()) {
        errors.name = 'Warehouse name is required';
        isValid = false;
      }
      if (!formData.code.trim()) {
        errors.code = 'Warehouse code is required';
        isValid = false;
      }
    } else if (step === 1) {
      if (!formData.location.city.trim()) {
        errors['location.city'] = 'City is required';
        isValid = false;
      }
      if (!formData.location.state.trim()) {
        errors['location.state'] = 'State is required';
        isValid = false;
      }
      if (!formData.manager.name.trim()) {
        errors['manager.name'] = 'Manager name is required';
        isValid = false;
      }
      if (!formData.manager.phone.trim()) {
        errors['manager.phone'] = 'Manager phone is required';
        isValid = false;
      } else if (!/^[0-9]{10}$/.test(formData.manager.phone)) {
        errors['manager.phone'] = 'Enter valid 10-digit mobile number';
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
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const validateAllFields = () => {
    const errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Warehouse name is required';
      isValid = false;
    }
    if (!formData.code.trim()) {
      errors.code = 'Warehouse code is required';
      isValid = false;
    }
    if (!formData.location.city.trim()) {
      errors['location.city'] = 'City is required';
      isValid = false;
    }
    if (!formData.location.state.trim()) {
      errors['location.state'] = 'State is required';
      isValid = false;
    }
    if (!formData.manager.name.trim()) {
      errors['manager.name'] = 'Manager name is required';
      isValid = false;
    }
    if (!formData.manager.phone.trim()) {
      errors['manager.phone'] = 'Manager phone is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.manager.phone)) {
      errors['manager.phone'] = 'Enter a valid 10-digit mobile number';
      isValid = false;
    }
    if (!formData.capacity.total) {
      errors['capacity.total'] = 'Total capacity is required';
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
    if (!validateAllFields()) return;

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/warehouse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          capacity: { 
            ...formData.capacity, 
            total: parseFloat(formData.capacity.total),
            used: parseFloat(formData.capacity.used) || 0
          }
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/warehouses'), 2000);
      } else {
        setError(data.message || 'Failed to create warehouse');
      }
    } catch (error) {
      console.error('Error creating warehouse:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/warehouses');
  };

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

  const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold mb-1" style={{ color: '#4B5568', letterSpacing: '0.5px' }}>
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const inputClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none border-[#E2E8F0] transition-all bg-white text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  const errorClasses = "text-xs text-red-500 mt-1";

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex-shrink-0 flex justify-between items-center flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Back to Warehouses"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1B5E20' }}>Add New Warehouse</h1>
            <p className="text-xs mt-0.5" style={{ color: '#8D6E63' }}>Register a new storage facility</p>
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
          {currentStep === 2 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Warehouse
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      <div className="flex-shrink-0">
        <FloatingErrorAlert error={error} onClose={() => setError('')} />
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex-shrink-0 mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">Warehouse created successfully! Redirecting...</span>
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

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
        
        {/* Step 1: Basic Information */}
        {currentStep === 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4" style={{ color: '#2E7D32' }} />
                <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Basic Information</h2>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Warehouse Name */}
                <div>
                  <Label required>WAREHOUSE NAME</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter warehouse name"
                      className={`${inputClasses} pl-10 ${fieldErrors.name ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                    />
                  </div>
                  {fieldErrors.name && <p className={errorClasses}>{fieldErrors.name}</p>}
                </div>

                {/* Warehouse Code */}
                <div>
                  <Label required>WAREHOUSE CODE</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g., WH001, CS001"
                      className={`${inputClasses} pl-10 ${fieldErrors.code ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                    />
                  </div>
                  {fieldErrors.code && <p className={errorClasses}>{fieldErrors.code}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location & Manager Details */}
        {currentStep === 1 && (
          <div className="space-y-5">
            {/* Location Details */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: '#2E7D32' }} />
                  <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Location Details</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Address */}
                  <div className="md:col-span-2">
                    <Label>ADDRESS</Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 w-4 h-4" style={{ color: '#C8E6C9' }} />
                      <textarea
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleChange}
                        placeholder="Enter full address"
                        rows="2"
                        className={`${inputClasses} pl-10 resize-none`}
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <Label required>CITY</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                      <input
                        type="text"
                        name="location.city"
                        value={formData.location.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        className={`${inputClasses} pl-10 ${fieldErrors['location.city'] ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                      />
                    </div>
                    {fieldErrors['location.city'] && <p className={errorClasses}>{fieldErrors['location.city']}</p>}
                  </div>

                  {/* State */}
                  <div>
                    <Label required>STATE</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                      <input
                        type="text"
                        name="location.state"
                        value={formData.location.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        className={`${inputClasses} pl-10 ${fieldErrors['location.state'] ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                      />
                    </div>
                    {fieldErrors['location.state'] && <p className={errorClasses}>{fieldErrors['location.state']}</p>}
                  </div>

                  {/* Pincode */}
                  <div>
                    <Label>PINCODE</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                      <input
                        type="text"
                        name="location.pincode"
                        value={formData.location.pincode}
                        onChange={handleChange}
                        placeholder="Enter pincode"
                        className={`${inputClasses} pl-10`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Manager Details */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: '#2E7D32' }} />
                  <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Manager Details</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Manager Name */}
                  <div>
                    <Label required>MANAGER NAME</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                      <input
                        type="text"
                        name="manager.name"
                        value={formData.manager.name}
                        onChange={handleChange}
                        placeholder="Enter manager name"
                        className={`${inputClasses} pl-10 ${fieldErrors['manager.name'] ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                      />
                    </div>
                    {fieldErrors['manager.name'] && <p className={errorClasses}>{fieldErrors['manager.name']}</p>}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <Label required>PHONE NUMBER</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                      <input
                        type="tel"
                        name="manager.phone"
                        value={formData.manager.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        className={`${inputClasses} pl-10 ${fieldErrors['manager.phone'] ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                      />
                    </div>
                    {fieldErrors['manager.phone'] && <p className={errorClasses}>{fieldErrors['manager.phone']}</p>}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <Label>EMAIL</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                      <input
                        type="email"
                        name="manager.email"
                        value={formData.manager.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className={`${inputClasses} pl-10`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Capacity & Notes */}
        {currentStep === 2 && (
          <div className="space-y-5">
            {/* Capacity Details */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" style={{ color: '#2E7D32' }} />
                  <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Capacity Details</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Total Capacity */}
                  <div>
                    <Label required>TOTAL CAPACITY</Label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                      <input
                        type="number"
                        name="capacity.total"
                        value={formData.capacity.total}
                        onChange={handleChange}
                        placeholder="Enter total capacity"
                        className={`${inputClasses} pl-10 ${fieldErrors['capacity.total'] ? 'border-red-500' : 'border-[#E2E8F0]'}`}
                      />
                    </div>
                    {fieldErrors['capacity.total'] && <p className={errorClasses}>{fieldErrors['capacity.total']}</p>}
                  </div>

                  {/* Unit */}
                  <div>
                    <Label>UNIT</Label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                      <select
                        name="capacity.unit"
                        value={formData.capacity.unit}
                        onChange={handleChange}
                        className={`${inputClasses} pl-10`}
                      >
                        <option value="KG">KG (Kilograms)</option>
                        <option value="TON">TON (Tons)</option>
                        <option value="QUINTAL">QUINTAL (100 KG)</option>
                      </select>
                    </div>
                  </div>

                  {/* Used Capacity (Optional) */}
                  <div>
                    <Label>USED CAPACITY (Optional)</Label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#C8E6C9' }} />
                      <input
                        type="number"
                        name="capacity.used"
                        value={formData.capacity.used}
                        onChange={handleChange}
                        placeholder="Currently used capacity"
                        className={`${inputClasses} pl-10`}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Leave 0 if not known</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: '#2E7D32' }} />
                  <h2 className="text-base font-semibold" style={{ color: '#1B5E20' }}>Additional Notes</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4" style={{ color: '#C8E6C9' }} />
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Enter any additional notes about this warehouse..."
                    rows="3"
                    className={`${inputClasses} pl-10 resize-none`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-3 pt-5 pb-3 mt-2">
          {currentStep > 0 && (
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
          {currentStep < 2 && (
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
          {currentStep === 2 && <div></div>}
        </div>
      </div>
    </div>
  );
};

export default AddWarehouse;
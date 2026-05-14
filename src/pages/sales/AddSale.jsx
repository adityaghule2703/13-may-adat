// src/pages/sales/AddSale.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  FormControl,
  Autocomplete,
  IconButton,
  Collapse,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Error as ErrorIcon, 
  Delete as DeleteIcon,
  Settings,
  ShoppingCart,
  Check as CheckIcon,
  Inventory as PackageIcon,
  ArrowBack as ArrowBackIcon,
  LocalShipping as TransportIcon,
  Build as LabourIcon,
  MonetizationOn as CommissionIcon,
  Storage as StorageIcon,
  AccountBalance as AdvanceIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../config/Config';

// Color constants
const COLORS = {
  primary: '#1B3A1F',
  primaryLight: '#E8F5E9',
  primaryDark: '#0E2A12',
  text: {
    primary: '#1B5E20',
    secondary: '#4B5568',
    tertiary: '#94A3B8',
    light: '#FFFFFF',
    lightMuted: 'rgba(255, 255, 255, 0.9)'
  },
  background: {
    white: '#FFFFFF',
    light: '#F8FFFC',
    hover: '#F0FDF9',
    tableHeader: '#1B3A1F'
  },
  border: '#E3E8EF'
};

// Pricing types
const pricingTypeOptions = [
  { value: 'kg', label: 'Per KG' },
  { value: 'quintal', label: 'Per Quintal' },
  { value: 'ton', label: 'Per Ton' },
  { value: 'bag', label: 'Per Bag' }
];

// Commission types
const commissionTypeOptions = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'percent', label: 'Percentage' }
];

// Floating Error Alert Component
const FloatingErrorAlert = ({ error, onClose }) => {
  if (!error) return null;
  
  return (
    <Collapse in={!!error}>
      <Alert
        severity="error"
        variant="filled"
        onClose={onClose}
        icon={<ErrorIcon sx={{ fontSize: '1rem' }} />}
        sx={{
          mb: 2,
          borderRadius: 1.5,
          fontSize: '0.75rem',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          '& .MuiAlert-icon': {
            fontSize: '1rem',
            alignItems: 'center'
          },
          '& .MuiAlert-message': {
            py: 0.5,
            fontSize: '0.75rem'
          },
          '& .MuiAlert-action': {
            py: 0,
            alignItems: 'center'
          }
        }}
      >
        {error}
      </Alert>
    </Collapse>
  );
};

const AddSale = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [buyers, setBuyers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingBuyers, setLoadingBuyers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [calculations, setCalculations] = useState({
    grossTotal: 0,
    totalDeductions: 0,
    netAmount: 0
  });

  const [formData, setFormData] = useState({
    buyerId: '',
    saleDate: new Date().toISOString().split('T')[0],
    lines: [
      {
        productId: null,
        productName: '',
        pricingType: 'kg',
        bags: '',
        weightPerBag: '',
        actualQty: '',
        qualityDeduction: '',
        rate: '',
        notes: ''
      }
    ],
    deductions: {
      transport: '',
      labour: '',
      commission: '',
      commissionType: 'fixed',
      storage: '',
      advanceAdjusted: ''
    },
    notes: ''
  });

  const steps = [
    'Buyer Information',
    'Product Lines',
    'Deductions & Summary'
  ];

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchBuyers();
    fetchProducts();
  }, []);

  // Updated fetchBuyers to use the dropdown API
  const fetchBuyers = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/buyers/dropdown`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setBuyers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching buyers:', error);
    } finally {
      setLoadingBuyers(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/products?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        // Filter only active products
        const activeProducts = response.data.data.filter(p => p.isActive === true);
        setProducts(activeProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const calculateLineTotal = (line) => {
    let quantity = parseFloat(line.actualQty) || 0;
    if (line.pricingType === 'quintal') quantity = (parseFloat(line.actualQty) || 0) * 100;
    if (line.pricingType === 'ton') quantity = (parseFloat(line.actualQty) || 0) * 1000;
    const netQty = quantity - (parseFloat(line.qualityDeduction) || 0);
    let total = netQty * (parseFloat(line.rate) || 0);
    
    // For bag pricing, calculate differently
    if (line.pricingType === 'bag') {
      total = (parseFloat(line.bags) || 0) * (parseFloat(line.rate) || 0);
    }
    
    return total;
  };

  useEffect(() => {
    let grossTotal = 0;
    formData.lines.forEach(line => {
      grossTotal += calculateLineTotal(line);
    });

    const commissionValue = parseFloat(formData.deductions.commission) || 0;
    const calculatedCommission =
      formData.deductions.commissionType === 'percent'
        ? (grossTotal * commissionValue) / 100
        : commissionValue;

    const totalDeductions =
      (parseFloat(formData.deductions.transport) || 0) +
      (parseFloat(formData.deductions.labour) || 0) +
      calculatedCommission +
      (parseFloat(formData.deductions.storage) || 0) +
      (parseFloat(formData.deductions.advanceAdjusted) || 0);

    setCalculations({
      grossTotal,
      totalDeductions,
      netAmount: grossTotal - totalDeductions
    });
  }, [formData.lines, formData.deductions]);

  const handleBuyerChange = (event, newValue) => {
    setSelectedBuyer(newValue);
    setFormData(prev => ({ ...prev, buyerId: newValue?._id || '' }));
    if (fieldErrors.buyerId) {
      setFieldErrors(prev => ({ ...prev, buyerId: '' }));
    }
  };

  const handleProductChange = (index, product) => {
    const updatedLines = [...formData.lines];
    updatedLines[index] = {
      ...updatedLines[index],
      productId: product?._id || null,
      productName: product?.productName || '',
      rate: '',
      actualQty: '',
      qualityDeduction: '',
      bags: '',
      weightPerBag: ''
    };
    setFormData(prev => ({ ...prev, lines: updatedLines }));
    
    if (fieldErrors[`line_${index}_product`]) {
      setFieldErrors(prev => ({ ...prev, [`line_${index}_product`]: '' }));
    }
  };

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...formData.lines];
    updatedLines[index][field] = value;

    // Auto-calculate actualQty when bags and weightPerBag are both present (for kg pricing)
    if ((field === 'bags' || field === 'weightPerBag') &&
      updatedLines[index].bags && updatedLines[index].bags !== '' &&
      updatedLines[index].weightPerBag && updatedLines[index].weightPerBag !== '' &&
      updatedLines[index].pricingType === 'kg') {
      const bags = parseFloat(updatedLines[index].bags) || 0;
      const weightPerBag = parseFloat(updatedLines[index].weightPerBag) || 0;
      updatedLines[index].actualQty = (bags * weightPerBag).toString();
    }

    // Auto-calculate bags when actualQty and weightPerBag are present
    if (field === 'actualQty' && updatedLines[index].pricingType === 'kg' &&
      updatedLines[index].weightPerBag && updatedLines[index].weightPerBag !== '') {
      const actualQty = parseFloat(updatedLines[index].actualQty) || 0;
      const weightPerBag = parseFloat(updatedLines[index].weightPerBag) || 0;
      if (weightPerBag > 0) {
        updatedLines[index].bags = Math.ceil(actualQty / weightPerBag).toString();
      }
    }

    setFormData(prev => ({ ...prev, lines: updatedLines }));
  };

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, {
        productId: null,
        productName: '',
        pricingType: 'kg',
        bags: '',
        weightPerBag: '',
        actualQty: '',
        qualityDeduction: '',
        rate: '',
        notes: ''
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
      if (!formData.buyerId) {
        errors.buyerId = 'Please select a buyer';
        isValid = false;
      }
      if (!formData.saleDate) {
        errors.saleDate = 'Sale date is required';
        isValid = false;
      }
    } else if (step === 1) {
      formData.lines.forEach((line, idx) => {
        if (!line.productName) {
          errors[`line_${idx}_product`] = 'Please select a product';
          isValid = false;
        }
        if (!line.rate || parseFloat(line.rate) <= 0) {
          errors[`line_${idx}_rate`] = 'Valid rate required';
          isValid = false;
        }
        if (!line.actualQty || parseFloat(line.actualQty) <= 0) {
          errors[`line_${idx}_qty`] = 'Valid quantity required';
          isValid = false;
        }
      });
    }

    setFieldErrors(errors);
    if (!isValid) setError('Please fill all required fields correctly');
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

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const handleSubmit = async () => {
    if (!formData.buyerId) {
      showError('Please select a buyer');
      return;
    }
    if (formData.lines.some(line => !line.productName || !line.rate || parseFloat(line.rate) <= 0 || !line.actualQty || parseFloat(line.actualQty) <= 0)) {
      showError('Please complete all product lines');
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const saleData = {
        buyerId: formData.buyerId,
        saleDate: formData.saleDate,
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
          advanceAdjusted: parseFloat(formData.deductions.advanceAdjusted) || 0
        },
        notes: formData.notes || ''
      };

      const response = await axios.post(`${BASE_URL}/sales`, saleData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/sales'), 2000);
      } else {
        const errorMessage = response.data.message || response.data.error || 'Failed to create sale';
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Network error. Please check your connection.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Label component
  const Label = ({ children, required }) => (
    <Typography sx={{ 
      fontSize: '0.7rem', 
      fontWeight: 600, 
      color: COLORS.text.secondary, 
      letterSpacing: '0.5px',
      mb: 0.5
    }}>
      {children} {required && <span style={{ color: '#EF4444' }}>*</span>}
    </Typography>
  );

  // Input styling
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontSize: '0.75rem',
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 }
    },
    '& .MuiInputBase-input': {
      py: 1,
      px: 1.5,
      fontSize: '0.75rem',
      color: COLORS.text.primary,
      '&::placeholder': {
        color: COLORS.text.tertiary,
        fontSize: '0.75rem'
      }
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/sales')} 
          sx={{ 
            p: 1, 
            borderRadius: 1.5,
            '&:hover': { bgcolor: COLORS.primaryLight }
          }}
        >
          <ArrowBackIcon sx={{ color: COLORS.primary }} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.text.primary }}>
            New Sale
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            Create a new sale invoice
          </Typography>
        </Box>
      </Box>

      {/* Floating Error Alert */}
      <Box sx={{ mb: 2 }}>
        <FloatingErrorAlert error={error} onClose={() => setError('')} />
      </Box>

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          Sale created successfully! Redirecting...
        </Alert>
      )}

      {/* Stepper - Centered */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Stack direction="row" spacing={3} alignItems="center">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  ...(currentStep >= index 
                    ? { background: 'linear-gradient(135deg, #2E7D32, #43A047)', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } 
                    : { bgcolor: '#E5E7EB', color: '#6B7280' })
                }}>
                  {currentStep > index ? <CheckIcon sx={{ fontSize: '1rem' }} /> : index + 1}
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: currentStep >= index ? '#2E7D32' : '#8D6E63', display: 'block', textAlign: 'left' }}>
                    Step {index + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: currentStep >= index ? '#1B5E20' : '#8D6E63' }}>
                    {step}
                  </Typography>
                </Box>
              </Stack>
              {index < steps.length - 1 && (
                <Box sx={{ width: 48, height: 2, bgcolor: currentStep > index ? '#2E7D32' : '#E5E7EB' }} />
              )}
            </React.Fragment>
          ))}
        </Stack>
      </Box>

      {/* Step 1: Buyer Information */}
      {currentStep === 0 && (
        <Paper sx={{ borderRadius: 2.5, overflow: 'visible', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ShoppingCart sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>Sale Information</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* SELECT BUYER - First column - Using dropdown API */}
              <Box>
                <Label required>Select Buyer</Label>
                <Autocomplete
                  fullWidth
                  options={buyers}
                  loading={loadingBuyers}
                  value={selectedBuyer}
                  onChange={handleBuyerChange}
                  getOptionLabel={(option) => `${option.displayName || option.name} - ${option.mobile}`}
                  isOptionEqualToValue={(option, value) => option._id === value?._id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Search buyer by name or mobile..."
                      error={!!fieldErrors.buyerId}
                      helperText={fieldErrors.buyerId}
                      sx={inputSx}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                            {option.displayName || option.name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                            {option.mobile} • {option.businessName || 'Individual'} • {option.city || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </li>
                  )}
                  ListboxProps={{
                    sx: {
                      maxHeight: '300px',
                      overflowY: 'auto',
                      '& .MuiAutocomplete-option': {
                        fontSize: '0.75rem',
                        py: 1,
                        px: 1.5
                      }
                    }
                  }}
                />
                {selectedBuyer && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: COLORS.primaryLight, borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                      Selected Buyer
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: COLORS.text.primary }}>
                      {selectedBuyer.displayName || selectedBuyer.name}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                      {selectedBuyer.businessName || 'Individual'} • {selectedBuyer.city || 'Location not specified'}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* SALE DATE - Second column */}
              <Box>
                <Label required>Sale Date</Label>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={formData.saleDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, saleDate: e.target.value }))}
                  error={!!fieldErrors.saleDate}
                  helperText={fieldErrors.saleDate}
                  sx={inputSx}
                />
              </Box>

              {/* ADDITIONAL NOTES - spans both columns */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label>Notes</Label>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this sale..."
                  sx={inputSx}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Step 2: Product Lines */}
      {currentStep === 1 && (
        <Stack spacing={2.5}>
          {formData.lines.map((line, index) => {
            const lineTotal = calculateLineTotal(line);
            const selectedPricingType = pricingTypeOptions.find(opt => opt.value === line.pricingType) || null;
            const selectedProduct = products.find(p => p.productName === line.productName) || null;
            
            return (
              <Paper key={index} sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
                <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PackageIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                    <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
                      Product Line {index + 1}
                    </Typography>
                  </Stack>
                  {formData.lines.length > 1 && (
                    <IconButton size="small" onClick={() => removeLine(index)} sx={{ color: '#EF4444' }}>
                      <DeleteIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    {/* PRODUCT NAME - spans both columns - Now with Autocomplete */}
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Label required>Product Name</Label>
                      <Autocomplete
                        fullWidth
                        options={products}
                        loading={loadingProducts}
                        value={selectedProduct}
                        onChange={(event, newValue) => handleProductChange(index, newValue)}
                        getOptionLabel={(option) => option.productName}
                        isOptionEqualToValue={(option, value) => option._id === value?._id}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Search or select product..."
                            error={!!fieldErrors[`line_${index}_product`]}
                            helperText={fieldErrors[`line_${index}_product`]}
                            sx={inputSx}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                                  {option.productName}
                                </Typography>
                                {option.description && (
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                                    {option.description}
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: option.isActive ? '#2E7D32' : '#D32F2F' }}>
                                {option.isActive ? 'Active' : 'Inactive'}
                              </Typography>
                            </Box>
                          </li>
                        )}
                        ListboxProps={{
                          sx: {
                            maxHeight: '300px',
                            overflowY: 'auto',
                            '& .MuiAutocomplete-option': {
                              fontSize: '0.75rem',
                              py: 1,
                              px: 1.5
                            }
                          }
                        }}
                      />
                    </Box>

                    {/* PRICING TYPE - first column */}
                    <Box>
                      <Label required>Pricing Type</Label>
                      <Autocomplete
                        fullWidth
                        options={pricingTypeOptions}
                        value={selectedPricingType}
                        onChange={(event, newValue) => {
                          handleLineChange(index, 'pricingType', newValue?.value || 'kg');
                        }}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) => option.value === value?.value}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Select pricing type"
                            sx={inputSx}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Typography sx={{ fontSize: '0.75rem' }}>{option.label}</Typography>
                          </li>
                        )}
                        ListboxProps={{
                          sx: {
                            maxHeight: '300px',
                            '& .MuiAutocomplete-option': {
                              fontSize: '0.75rem',
                              py: 1,
                              px: 1.5
                            }
                          }
                        }}
                      />
                    </Box>

                    {/* RATE - second column */}
                    <Box>
                      <Label required>Rate</Label>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        value={line.rate}
                        onChange={(e) => handleLineChange(index, 'rate', e.target.value)}
                        placeholder="Enter rate"
                        error={!!fieldErrors[`line_${index}_rate`]}
                        helperText={fieldErrors[`line_${index}_rate`]}
                        sx={inputSx}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          endAdornment: line.pricingType && (
                            <InputAdornment position="end">
                              <Typography sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                                /{line.pricingType === 'kg' ? 'kg' : line.pricingType === 'quintal' ? 'quintal' : line.pricingType === 'ton' ? 'ton' : 'bag'}
                              </Typography>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Box>

                    {/* Bags and Weight - only for KG pricing */}
                    {line.pricingType === 'kg' && (
                      <>
                        <Box>
                          <Label>Number of Bags</Label>
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={line.bags}
                            onChange={(e) => handleLineChange(index, 'bags', e.target.value)}
                            placeholder="Number of bags"
                            sx={inputSx}
                          />
                        </Box>
                        <Box>
                          <Label>Weight Per Bag (kg)</Label>
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={line.weightPerBag}
                            onChange={(e) => handleLineChange(index, 'weightPerBag', e.target.value)}
                            placeholder="Weight per bag"
                            sx={inputSx}
                          />
                        </Box>
                      </>
                    )}

                    {/* QUANTITY - first column */}
                    <Box>
                      <Label required>Quantity</Label>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        value={line.actualQty}
                        onChange={(e) => handleLineChange(index, 'actualQty', e.target.value)}
                        placeholder="Enter quantity"
                        error={!!fieldErrors[`line_${index}_qty`]}
                        helperText={fieldErrors[`line_${index}_qty`]}
                        sx={inputSx}
                      />
                      {line.pricingType === 'kg' && line.bags && line.bags !== '' && line.weightPerBag && line.weightPerBag !== '' && (
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#8D6E63', fontSize: '0.65rem' }}>
                          Auto-calculated: {line.bags} bags × {line.weightPerBag} kg = {parseFloat(line.bags) * parseFloat(line.weightPerBag)} kg
                        </Typography>
                      )}
                    </Box>

                    {/* QUALITY DEDUCTION - second column */}
                    <Box>
                      <Label>Quality Deduction (kg)</Label>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        value={line.qualityDeduction}
                        onChange={(e) => handleLineChange(index, 'qualityDeduction', e.target.value)}
                        placeholder="Quality deduction"
                        sx={inputSx}
                      />
                    </Box>

                    {/* LINE NOTES - spans both columns */}
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Label>Line Notes</Label>
                      <TextField
                        fullWidth
                        size="small"
                        value={line.notes}
                        onChange={(e) => handleLineChange(index, 'notes', e.target.value)}
                        placeholder="Notes for this product line"
                        sx={inputSx}
                      />
                    </Box>

                    {/* LINE TOTAL - spans both columns */}
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Box sx={{ p: 2, bgcolor: COLORS.primaryLight, borderRadius: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                            Line Total:
                          </Typography>
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.primaryDark }}>
                            {formatCurrency(lineTotal)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            );
          })}

          <Button 
            onClick={addLine} 
            variant="outlined" 
            fullWidth
            sx={{ 
              py: 1.5, 
              borderStyle: 'dashed', 
              borderColor: COLORS.border,
              color: COLORS.primary,
              borderRadius: 2.5,
              textTransform: 'none',
              fontSize: '0.75rem',
              '&:hover': { borderColor: COLORS.primary, bgcolor: COLORS.primaryLight }
            }}
          >
            <AddIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> Add Another Product
          </Button>
        </Stack>
      )}

      {/* Step 3: Deductions & Summary */}
      {currentStep === 2 && (
        <Stack spacing={2.5}>
          {/* Deductions Section */}
          <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Settings sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
                  Deductions & Charges
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Label>Transport Charges</Label>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    value={formData.deductions.transport}
                    onChange={(e) => handleDeductionChange('transport', e.target.value)}
                    placeholder="Transport charges"
                    sx={inputSx}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                </Box>

                <Box>
                  <Label>Labour Charges</Label>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    value={formData.deductions.labour}
                    onChange={(e) => handleDeductionChange('labour', e.target.value)}
                    placeholder="Labour charges"
                    sx={inputSx}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                </Box>

                <Box sx={{ gridColumn: 'span 2' }}>
                  <Label>Commission</Label>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      value={formData.deductions.commission}
                      onChange={(e) => handleDeductionChange('commission', e.target.value)}
                      placeholder={formData.deductions.commissionType === 'percent' 
                        ? 'Commission percentage' 
                        : 'Commission amount'}
                      sx={{ ...inputSx, flex: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {formData.deductions.commissionType === 'percent' ? '%' : '₹'}
                          </InputAdornment>
                        )
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Autocomplete
                        fullWidth
                        options={commissionTypeOptions}
                        value={commissionTypeOptions.find(opt => opt.value === formData.deductions.commissionType) || null}
                        onChange={(event, newValue) => {
                          handleDeductionChange('commissionType', newValue?.value || 'fixed');
                        }}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) => option.value === value?.value}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Type"
                            sx={inputSx}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Typography sx={{ fontSize: '0.75rem' }}>{option.label}</Typography>
                          </li>
                        )}
                      />
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Label>Storage Charges</Label>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    value={formData.deductions.storage}
                    onChange={(e) => handleDeductionChange('storage', e.target.value)}
                    placeholder="Storage charges"
                    sx={inputSx}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                </Box>

                <Box>
                  <Label>Advance Adjusted</Label>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    value={formData.deductions.advanceAdjusted}
                    onChange={(e) => handleDeductionChange('advanceAdjusted', e.target.value)}
                    placeholder="Advance amount to adjust"
                    sx={inputSx}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Summary Section */}
          <Paper sx={{ p: 2.5, bgcolor: COLORS.primaryLight, borderRadius: 2.5, border: `1px solid ${COLORS.primary}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: COLORS.primaryDark, mb: 2, fontSize: '0.85rem' }}>
              Sale Summary
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                  Gross Total
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: COLORS.text.primary }}>
                  {formatCurrency(calculations.grossTotal)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                  Total Deductions
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#D32F2F' }}>
                  - {formatCurrency(calculations.totalDeductions)}
                </Typography>
              </Stack>
              <Box sx={{ pt: 1, mt: 1, borderTop: `1px solid ${COLORS.primary}` }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primaryDark }}>
                    Net Amount
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.primaryDark }}>
                    {formatCurrency(calculations.netAmount)}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Paper>

          {/* Products Summary Table */}
          <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PackageIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
                  Products Summary
                </Typography>
              </Stack>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: COLORS.primaryLight }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: COLORS.text.secondary }}>
                      Product
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: COLORS.text.secondary }}>
                      Quantity
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: COLORS.text.secondary }}>
                      Rate
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.7rem', color: COLORS.text.secondary }}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.lines.map((line, idx) => {
                    let quantity = parseFloat(line.actualQty) || 0;
                    if (line.pricingType === 'quintal') quantity = (parseFloat(line.actualQty) || 0) * 100;
                    if (line.pricingType === 'ton') quantity = (parseFloat(line.actualQty) || 0) * 1000;
                    const netQty = quantity - (parseFloat(line.qualityDeduction) || 0);
                    let displayQty = netQty;
                    let displayUnit = line.pricingType;
                    
                    if (line.pricingType === 'quintal') displayUnit = 'kg';
                    if (line.pricingType === 'ton') displayUnit = 'kg';
                    
                    return (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: COLORS.primaryLight } }}>
                        <TableCell sx={{ fontSize: '0.7rem' }}>{line.productName || '-'}</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem' }}>
                          {line.pricingType === 'bag' 
                            ? `${line.bags || 0} bags`
                            : `${displayQty.toFixed(2)} ${displayUnit}`}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.7rem' }}>
                          {formatCurrency(parseFloat(line.rate) || 0)}/{line.pricingType === 'kg' ? 'kg' : line.pricingType === 'quintal' ? 'quintal' : line.pricingType === 'ton' ? 'ton' : 'bag'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.7rem', fontWeight: 600, color: COLORS.primaryDark }}>
                          {formatCurrency(calculateLineTotal(line))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, pb: 2, mt: 2 }}>
        {currentStep > 0 && (
          <Button
            onClick={handlePrevious}
            sx={{
              height: 32,
              px: 2,
              borderRadius: 1.5,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text.secondary,
              fontSize: '0.7rem',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                borderColor: COLORS.primary,
                bgcolor: `${COLORS.primary}10`
              }
            }}
          >
            Previous
          </Button>
        )}
        {currentStep < 2 && (
          <Button
            onClick={handleNext}
            variant="contained"
            sx={{
              ml: 'auto',
              height: 32,
              px: 2,
              borderRadius: 1.5,
              bgcolor: COLORS.primary,
              fontSize: '0.7rem',
              fontWeight: 500,
              textTransform: 'none',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              '&:hover': {
                bgcolor: COLORS.primaryDark,
              }
            }}
          >
            Next
          </Button>
        )}
        {currentStep === 2 && (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="contained"
            sx={{
              height: 32,
              px: 2,
              borderRadius: 1.5,
              bgcolor: COLORS.primary,
              fontSize: '0.7rem',
              fontWeight: 500,
              textTransform: 'none',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              '&:hover': {
                bgcolor: COLORS.primaryDark,
              },
              '&:disabled': {
                bgcolor: COLORS.border,
                color: COLORS.text.tertiary
              }
            }}
          >
            {loading ? 'Creating...' : 'Create Sale'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AddSale;
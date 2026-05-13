// src/pages/purchase/AddPurchase.jsx
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
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../config/Config';

// Color constants matching AddDimensions
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

const AddPurchase = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [farmers, setFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [calculations, setCalculations] = useState({
    grossTotal: 0,
    totalDeductions: 0,
    finalPayable: 0
  });

  const [formData, setFormData] = useState({
    farmerId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    lines: [
      {
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
      storageNote: '',
      returnDeduction: '',
      returnNote: '',
      advanceAdjusted: '',
      other: '',
      otherNote: ''
    },
    notes: ''
  });

  const pricingTypeOptions = [
    { value: 'kg', label: t('purchases.pricingTypes.kg') },
    { value: 'quintal', label: t('purchases.pricingTypes.quintal') },
    { value: 'piece', label: t('purchases.pricingTypes.piece') },
    { value: 'bunch', label: t('purchases.pricingTypes.bunch') },
    { value: 'crate', label: t('purchases.pricingTypes.crate') },
    { value: 'dozen', label: t('purchases.pricingTypes.dozen') },
    { value: 'flat', label: t('purchases.pricingTypes.flat') }
  ];

  const commissionTypeOptions = [
    { value: 'fixed', label: t('purchases.commissionTypes.fixed') },
    { value: 'percent', label: t('purchases.commissionTypes.percent') }
  ];

  const steps = [
    t('purchases.steps.basicInfo'),
    t('purchases.steps.productLines'),
    t('purchases.steps.deductions')
  ];

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/farmers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setFarmers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoadingFarmers(false);
    }
  };

  const calculateLineTotal = (line) => {
    let quantity = parseFloat(line.actualQty) || 0;
    if (line.pricingType === 'quintal') quantity = (parseFloat(line.actualQty) || 0) * 100;
    const netQty = quantity - (parseFloat(line.qualityDeduction) || 0);
    return netQty * (parseFloat(line.rate) || 0);
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
      (parseFloat(formData.deductions.returnDeduction) || 0) +
      (parseFloat(formData.deductions.advanceAdjusted) || 0) +
      (parseFloat(formData.deductions.other) || 0);

    setCalculations({
      grossTotal,
      totalDeductions,
      finalPayable: grossTotal - totalDeductions
    });
  }, [formData.lines, formData.deductions]);

  const handleFarmerChange = (event, newValue) => {
    setSelectedFarmer(newValue);
    setFormData(prev => ({ ...prev, farmerId: newValue?._id || '' }));
    if (fieldErrors.farmerId) {
      setFieldErrors(prev => ({ ...prev, farmerId: '' }));
    }
  };

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...formData.lines];
    updatedLines[index][field] = value;

    // Auto-calculate actualQty when bags and weightPerBag are both present
    if ((field === 'bags' || field === 'weightPerBag') &&
      updatedLines[index].bags && updatedLines[index].bags !== '' &&
      updatedLines[index].weightPerBag && updatedLines[index].weightPerBag !== '' &&
      updatedLines[index].pricingType === 'kg') {
      const bags = parseFloat(updatedLines[index].bags) || 0;
      const weightPerBag = parseFloat(updatedLines[index].weightPerBag) || 0;
      updatedLines[index].actualQty = (bags * weightPerBag).toString();
    }

    setFormData(prev => ({ ...prev, lines: updatedLines }));
  };

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, {
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
      if (!formData.farmerId) {
        errors.farmerId = t('purchases.errors.farmerRequired');
        isValid = false;
      }
      if (!formData.purchaseDate) {
        errors.purchaseDate = t('purchases.errors.dateRequired');
        isValid = false;
      }
    } else if (step === 1) {
      formData.lines.forEach((line, idx) => {
        if (!line.productName) {
          errors[`line_${idx}_product`] = t('purchases.errors.productRequired');
          isValid = false;
        }
        if (!line.rate || parseFloat(line.rate) <= 0) {
          errors[`line_${idx}_rate`] = t('purchases.errors.rateRequired');
          isValid = false;
        }
        if (!line.actualQty || parseFloat(line.actualQty) <= 0) {
          errors[`line_${idx}_qty`] = t('purchases.errors.qtyRequired');
          isValid = false;
        }
      });
    }

    setFieldErrors(errors);
    if (!isValid) setError(t('common.fillCorrectly'));
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
  if (!formData.farmerId) {
    showError(t('purchases.errors.farmerRequired'));
    return;
  }
  if (formData.lines.some(line => !line.productName || !line.rate || parseFloat(line.rate) <= 0 || !line.actualQty || parseFloat(line.actualQty) <= 0)) {
    showError(t('purchases.errors.completeLines'));
    return;
  }

  setLoading(true);

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

    const response = await axios.post(`${BASE_URL}/purchases`, purchaseData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      setSuccess(true);
      setTimeout(() => navigate('/purchases'), 2000);
    } else {
      const errorMessage = response.data.message || response.data.error || t('purchases.errors.createFailed');
      showError(errorMessage);
    }
  } catch (error) {
    console.error('Error creating purchase:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        t('common.networkError');
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

  // Label component matching AddDimensions
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

  // Input styling matching AddDimensions
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
          onClick={() => navigate('/purchases')} 
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
            {t('purchases.addTitle')}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            {t('purchases.addSubtitle')}
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
          {t('purchases.messages.createSuccess')}
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
                    {t('common.step')} {index + 1}
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

      {/* Step 1: Purchase Details */}
      {currentStep === 0 && (
        <Paper sx={{ borderRadius: 2.5, overflow: 'visible', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ShoppingCart sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>{t('purchases.basicInformation')}</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* SELECT FARMER - First column */}
              <Box>
                <Label required>{t('purchases.selectFarmer')}</Label>
                <Autocomplete
                  fullWidth
                  options={farmers}
                  loading={loadingFarmers}
                  value={selectedFarmer}
                  onChange={handleFarmerChange}
                  getOptionLabel={(option) => `${option.name} - ${option.mobile} (${option.village}, ${option.city})`}
                  isOptionEqualToValue={(option, value) => option._id === value?._id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder={t('purchases.placeholders.selectFarmer')}
                      error={!!fieldErrors.farmerId}
                      helperText={fieldErrors.farmerId}
                      sx={inputSx}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                            {option.name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                            {option.mobile} • {option.village}, {option.city}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                            {t('farmers.pendingDues')}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#FF6F00' }}>
                            {formatCurrency(option.pendingDues || 0)}
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
                {selectedFarmer && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: COLORS.primaryLight, borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                      {t('purchases.selectedFarmer')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: COLORS.text.primary }}>
                      {selectedFarmer.name}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                      {selectedFarmer.village}, {selectedFarmer.city}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* PURCHASE DATE - Second column */}
              <Box>
                <Label required>{t('purchases.purchaseDate')}</Label>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  sx={inputSx}
                />
              </Box>

              {/* ADDITIONAL NOTES - spans both columns */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label>{t('common.notes')}</Label>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('purchases.placeholders.notes')}
                  sx={inputSx}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Step 2: Product Lines - With Autocomplete for Pricing Type */}
      {currentStep === 1 && (
        <Stack spacing={2.5}>
          {formData.lines.map((line, index) => {
            const lineTotal = calculateLineTotal(line);
            const selectedPricingType = pricingTypeOptions.find(opt => opt.value === line.pricingType) || null;
            
            return (
              <Paper key={index} sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
                <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PackageIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                    <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
                      {t('purchases.productLine')} {index + 1}
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
                    {/* PRODUCT NAME - spans both columns */}
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Label required>{t('purchases.productName')}</Label>
                      <TextField
                        fullWidth
                        size="small"
                        value={line.productName}
                        onChange={(e) => handleLineChange(index, 'productName', e.target.value)}
                        placeholder={t('purchases.placeholders.productName')}
                        error={!!fieldErrors[`line_${index}_product`]}
                        helperText={fieldErrors[`line_${index}_product`]}
                        sx={inputSx}
                      />
                    </Box>

                    {/* PRICING TYPE - first column - Now using Autocomplete like farmer dropdown */}
                    <Box>
                      <Label required>{t('purchases.pricingType')}</Label>
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
                            placeholder={t('purchases.placeholders.selectPricingType')}
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
                      <Label required>{t('purchases.rate')}</Label>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        value={line.rate}
                        onChange={(e) => handleLineChange(index, 'rate', e.target.value)}
                        placeholder={t('purchases.placeholders.rate')}
                        error={!!fieldErrors[`line_${index}_rate`]}
                        helperText={fieldErrors[`line_${index}_rate`]}
                        sx={inputSx}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>
                        }}
                      />
                    </Box>

                    {/* Bags and Weight - only for KG pricing */}
                    {line.pricingType === 'kg' && (
                      <>
                        <Box>
                          <Label>{t('purchases.numberOfBags')}</Label>
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={line.bags}
                            onChange={(e) => handleLineChange(index, 'bags', e.target.value)}
                            placeholder={t('purchases.placeholders.numberOfBags')}
                            sx={inputSx}
                          />
                        </Box>
                        <Box>
                          <Label>{t('purchases.weightPerBag')}</Label>
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            value={line.weightPerBag}
                            onChange={(e) => handleLineChange(index, 'weightPerBag', e.target.value)}
                            placeholder={t('purchases.placeholders.weightPerBag')}
                            sx={inputSx}
                          />
                        </Box>
                      </>
                    )}

                    {/* QUANTITY - first column */}
                    <Box>
                      <Label required>{t('purchases.quantity')}</Label>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        value={line.actualQty}
                        onChange={(e) => handleLineChange(index, 'actualQty', e.target.value)}
                        placeholder={t('purchases.placeholders.quantity')}
                        error={!!fieldErrors[`line_${index}_qty`]}
                        helperText={fieldErrors[`line_${index}_qty`]}
                        sx={inputSx}
                      />
                      {line.pricingType === 'kg' && line.bags && line.bags !== '' && line.weightPerBag && line.weightPerBag !== '' && (
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#8D6E63', fontSize: '0.65rem' }}>
                          {t('purchases.autoCalculated')}: {line.bags} {t('purchases.bags')} × {line.weightPerBag} kg = {parseFloat(line.bags) * parseFloat(line.weightPerBag)} kg
                        </Typography>
                      )}
                    </Box>

                    {/* QUALITY DEDUCTION - second column */}
                    <Box>
                      <Label>{t('purchases.qualityDeduction')}</Label>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        value={line.qualityDeduction}
                        onChange={(e) => handleLineChange(index, 'qualityDeduction', e.target.value)}
                        placeholder={t('purchases.placeholders.qualityDeduction')}
                        sx={inputSx}
                      />
                    </Box>

                    {/* LINE NOTES - spans both columns */}
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Label>{t('purchases.lineNotes')}</Label>
                      <TextField
                        fullWidth
                        size="small"
                        value={line.notes}
                        onChange={(e) => handleLineChange(index, 'notes', e.target.value)}
                        placeholder={t('purchases.placeholders.lineNotes')}
                        sx={inputSx}
                      />
                    </Box>

                    {/* LINE TOTAL - spans both columns */}
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Box sx={{ p: 2, bgcolor: COLORS.primaryLight, borderRadius: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                            {t('purchases.lineTotal')}:
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
            <AddIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> {t('purchases.addAnotherProduct')}
          </Button>
        </Stack>
      )}

      {/* Step 3: Deductions & Summary - With Autocomplete for Commission Type */}
      {currentStep === 2 && (
        <Stack spacing={2.5}>
          {/* Deductions Section */}
          <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Settings sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
                  {t('purchases.deductionsCharges')}
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Label>{t('purchases.transportCharges')}</Label>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    value={formData.deductions.transport}
                    onChange={(e) => handleDeductionChange('transport', e.target.value)}
                    placeholder={t('purchases.placeholders.transportCharges')}
                    sx={inputSx}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                </Box>

                <Box>
                  <Label>{t('purchases.labourCharges')}</Label>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    value={formData.deductions.labour}
                    onChange={(e) => handleDeductionChange('labour', e.target.value)}
                    placeholder={t('purchases.placeholders.labourCharges')}
                    sx={inputSx}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                </Box>

                <Box sx={{ gridColumn: 'span 2' }}>
                  <Label>{t('purchases.commission')}</Label>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      value={formData.deductions.commission}
                      onChange={(e) => handleDeductionChange('commission', e.target.value)}
                      placeholder={formData.deductions.commissionType === 'percent' 
                        ? t('purchases.placeholders.commissionPercent') 
                        : t('purchases.placeholders.commissionAmount')}
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
                            placeholder={t('purchases.placeholders.commissionType')}
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
                            '& .MuiAutocomplete-option': {
                              fontSize: '0.75rem',
                              py: 1,
                              px: 1.5
                            }
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Label>{t('purchases.storageCharges')}</Label>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    value={formData.deductions.storage}
                    onChange={(e) => handleDeductionChange('storage', e.target.value)}
                    placeholder={t('purchases.placeholders.storageCharges')}
                    sx={inputSx}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.deductions.storageNote}
                    onChange={(e) => handleDeductionChange('storageNote', e.target.value)}
                    placeholder={t('purchases.placeholders.storageNote')}
                    sx={{ ...inputSx, mt: 1 }}
                  />
                </Box>

                <Box>
                  <Label>{t('purchases.returnDeduction')}</Label>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    value={formData.deductions.returnDeduction}
                    onChange={(e) => handleDeductionChange('returnDeduction', e.target.value)}
                    placeholder={t('purchases.placeholders.returnDeduction')}
                    sx={inputSx}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.deductions.returnNote}
                    onChange={(e) => handleDeductionChange('returnNote', e.target.value)}
                    placeholder={t('purchases.placeholders.returnNote')}
                    sx={{ ...inputSx, mt: 1 }}
                  />
                </Box>

                <Box>
                  <Label>{t('purchases.advanceAdjusted')}</Label>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    value={formData.deductions.advanceAdjusted}
                    onChange={(e) => handleDeductionChange('advanceAdjusted', e.target.value)}
                    placeholder={t('purchases.placeholders.advanceAdjusted')}
                    sx={inputSx}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                </Box>

                <Box>
                  <Label>{t('purchases.otherDeductions')}</Label>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    value={formData.deductions.other}
                    onChange={(e) => handleDeductionChange('other', e.target.value)}
                    placeholder={t('purchases.placeholders.otherDeductions')}
                    sx={inputSx}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.deductions.otherNote}
                    onChange={(e) => handleDeductionChange('otherNote', e.target.value)}
                    placeholder={t('purchases.placeholders.otherNote')}
                    sx={{ ...inputSx, mt: 1 }}
                  />
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Summary Section */}
          <Paper sx={{ p: 2.5, bgcolor: COLORS.primaryLight, borderRadius: 2.5, border: `1px solid ${COLORS.primary}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: COLORS.primaryDark, mb: 2, fontSize: '0.85rem' }}>
              {t('purchases.purchaseSummary')}
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                  {t('purchases.grossTotal')}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: COLORS.text.primary }}>
                  {formatCurrency(calculations.grossTotal)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.text.secondary }}>
                  {t('purchases.totalDeductions')}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#D32F2F' }}>
                  - {formatCurrency(calculations.totalDeductions)}
                </Typography>
              </Stack>
              <Box sx={{ pt: 1, mt: 1, borderTop: `1px solid ${COLORS.primary}` }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: COLORS.primaryDark }}>
                    {t('purchases.finalPayableAmount')}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.primaryDark }}>
                    {formatCurrency(calculations.finalPayable)}
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
                  {t('purchases.productsSummary')}
                </Typography>
              </Stack>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: COLORS.primaryLight }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: COLORS.text.secondary }}>
                      {t('purchases.table.product')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: COLORS.text.secondary }}>
                      {t('purchases.table.quantity')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', color: COLORS.text.secondary }}>
                      {t('purchases.table.rate')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.7rem', color: COLORS.text.secondary }}>
                      {t('purchases.table.total')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.lines.map((line, idx) => {
                    let quantity = parseFloat(line.actualQty) || 0;
                    if (line.pricingType === 'quintal') quantity = (parseFloat(line.actualQty) || 0) * 100;
                    const netQty = quantity - (parseFloat(line.qualityDeduction) || 0);
                    return (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: COLORS.primaryLight } }}>
                        <TableCell sx={{ fontSize: '0.7rem' }}>{line.productName || '-'}</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem' }}>{netQty.toFixed(2)} {line.pricingType}</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem' }}>
                          {formatCurrency(parseFloat(line.rate) || 0)}/{line.pricingType === 'kg' ? 'kg' : line.pricingType}
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
            {t('common.previous')}
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
            {t('common.next')}
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
            {loading ? t('common.creating') : t('common.create')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AddPurchase;
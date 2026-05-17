// src/pages/buyers/AddBuyer.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Autocomplete,
  IconButton,
  Collapse,
  Alert,
  Paper,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { 
  Error as ErrorIcon, 
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  Receipt as ReceiptIcon,
  CreditCard as CardIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Notes as NotesIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../config/Config';

// Color constants matching AddFarmer
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

// Business type options with translations
const getBusinessTypes = (t) => [
  { value: 'individual', label: t('buyers.businessTypes.individual') },
  { value: 'proprietorship', label: t('buyers.businessTypes.proprietorship') },
  { value: 'partnership', label: t('buyers.businessTypes.partnership') },
  { value: 'private_limited', label: t('buyers.businessTypes.privateLimited') },
  { value: 'public_limited', label: t('buyers.businessTypes.publicLimited') },
  { value: 'llp', label: t('buyers.businessTypes.llp') },
  { value: 'trust', label: t('buyers.businessTypes.trust') },
  { value: 'society', label: t('buyers.businessTypes.society') }
];

// Payment mode options with translations
const getPaymentModes = (t) => [
  { value: 'cash', label: t('payments.modes.cash') },
  { value: 'upi', label: t('payments.modes.upi') },
  { value: 'bank', label: t('payments.modes.bank') },
  { value: 'cheque', label: t('payments.modes.cheque') },
  { value: 'credit', label: t('payments.modes.credit') }
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

const AddBuyer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    alternateMobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    businessName: '',
    businessType: 'individual',
    creditLimit: '',
    creditDays: '',
    defaultPaymentMode: 'cash',
    notes: ''
  });

  const BUSINESS_TYPES = getBusinessTypes(t);
  const PAYMENT_MODES = getPaymentModes(t);
  const steps = [t('buyers.steps.personalInfo'), t('buyers.steps.businessDetails'), t('buyers.steps.creditTerms')];

  const getToken = () => localStorage.getItem('token');

  // Validation functions
  const validateMobile = (mobile) => {
    if (!mobile) return true;
    return /^[6-9][0-9]{9}$/.test(mobile);
  };

  const validateEmail = (email) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePincode = (pincode) => {
    if (!pincode) return true;
    return /^[1-9][0-9]{5}$/.test(pincode);
  };

  const validateGST = (gst) => {
    if (!gst) return true;
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
  };

  const validatePAN = (pan) => {
    if (!pan) return true;
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  };

  const validateName = (name) => {
    return /^[a-zA-Z\s\.\-]+$/.test(name);
  };

  const validateBusinessName = (businessName) => {
    if (!businessName) return true;
    return /^[a-zA-Z0-9\s\.\-\&]+$/.test(businessName);
  };

  const validateCreditLimit = (limit) => {
    if (!limit) return true;
    return /^\d+(\.\d{1,2})?$/.test(limit) && parseFloat(limit) >= 0;
  };

  const validateCreditDays = (days) => {
    if (!days) return true;
    return /^\d+$/.test(days) && parseInt(days) >= 0 && parseInt(days) <= 365;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (fieldErrors[name]) {
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleUppercaseChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 0) {
      if (!formData.name.trim()) {
        errors.name = t('buyers.errors.nameRequired');
        isValid = false;
      } else if (!validateName(formData.name)) {
        errors.name = t('buyers.errors.nameInvalid');
        isValid = false;
      }
      
      if (formData.email && !validateEmail(formData.email)) {
        errors.email = t('buyers.errors.emailInvalid');
        isValid = false;
      }
      
      if (formData.mobile && !validateMobile(formData.mobile)) {
        errors.mobile = t('buyers.errors.mobileInvalid');
        isValid = false;
      }
      
      if (formData.alternateMobile && !validateMobile(formData.alternateMobile)) {
        errors.alternateMobile = t('buyers.errors.alternateMobileInvalid');
        isValid = false;
      }
      
      if (!formData.city.trim()) {
        errors.city = t('buyers.errors.cityRequired');
        isValid = false;
      }
      
      if (!formData.state.trim()) {
        errors.state = t('buyers.errors.stateRequired');
        isValid = false;
      }
      
      if (formData.pincode && !validatePincode(formData.pincode)) {
        errors.pincode = t('buyers.errors.pincodeInvalid');
        isValid = false;
      }
    } else if (step === 1) {
      if (!formData.businessName.trim()) {
        errors.businessName = t('buyers.errors.businessNameRequired');
        isValid = false;
      } else if (!validateBusinessName(formData.businessName)) {
        errors.businessName = t('buyers.errors.businessNameInvalid');
        isValid = false;
      }
      
      if (formData.gstNumber && !validateGST(formData.gstNumber.toUpperCase())) {
        errors.gstNumber = t('buyers.errors.gstInvalid');
        isValid = false;
      }
      
      if (formData.panNumber && !validatePAN(formData.panNumber.toUpperCase())) {
        errors.panNumber = t('buyers.errors.panInvalid');
        isValid = false;
      }
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError(t('common.fillCorrectly'));
      setTimeout(() => setError(''), 3000);
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError('');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const validateAllFields = () => {
    const errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = t('buyers.errors.nameRequired');
      isValid = false;
    } else if (!validateName(formData.name)) {
      errors.name = t('buyers.errors.nameInvalid');
      isValid = false;
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = t('buyers.errors.emailInvalid');
      isValid = false;
    }
    
    if (formData.mobile && !validateMobile(formData.mobile)) {
      errors.mobile = t('buyers.errors.mobileInvalid');
      isValid = false;
    }
    
    if (formData.alternateMobile && !validateMobile(formData.alternateMobile)) {
      errors.alternateMobile = t('buyers.errors.alternateMobileInvalid');
      isValid = false;
    }
    
    if (!formData.city.trim()) {
      errors.city = t('buyers.errors.cityRequired');
      isValid = false;
    }
    
    if (!formData.state.trim()) {
      errors.state = t('buyers.errors.stateRequired');
      isValid = false;
    }
    
    if (formData.pincode && !validatePincode(formData.pincode)) {
      errors.pincode = t('buyers.errors.pincodeInvalid');
      isValid = false;
    }

    if (!formData.businessName.trim()) {
      errors.businessName = t('buyers.errors.businessNameRequired');
      isValid = false;
    } else if (!validateBusinessName(formData.businessName)) {
      errors.businessName = t('buyers.errors.businessNameInvalid');
      isValid = false;
    }
    
    if (formData.gstNumber && !validateGST(formData.gstNumber.toUpperCase())) {
      errors.gstNumber = t('buyers.errors.gstInvalid');
      isValid = false;
    }
    
    if (formData.panNumber && !validatePAN(formData.panNumber.toUpperCase())) {
      errors.panNumber = t('buyers.errors.panInvalid');
      isValid = false;
    }

    if (formData.creditLimit && !validateCreditLimit(formData.creditLimit)) {
      errors.creditLimit = t('buyers.errors.creditLimitInvalid');
      isValid = false;
    }
    
    if (formData.creditDays && !validateCreditDays(formData.creditDays)) {
      errors.creditDays = t('buyers.errors.creditDaysInvalid');
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError(t('common.fixErrors'));
      setTimeout(() => setError(''), 3000);
    }
    return isValid;
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = getToken();
      
      const submitData = {
        name: formData.name,
        email: formData.email || undefined,
        mobile: formData.mobile || undefined,
        alternateMobile: formData.alternateMobile || undefined,
        address: formData.address || undefined,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode || undefined,
        gstNumber: formData.gstNumber ? formData.gstNumber.toUpperCase() : undefined,
        panNumber: formData.panNumber ? formData.panNumber.toUpperCase() : undefined,
        businessName: formData.businessName,
        businessType: formData.businessType,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
        creditDays: formData.creditDays ? parseInt(formData.creditDays) : undefined,
        defaultPaymentMode: formData.defaultPaymentMode,
        notes: formData.notes || undefined
      };
      
      // Remove undefined values
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined) {
          delete submitData[key];
        }
      });
      
      const response = await axios.post(`${BASE_URL}/buyers`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/buyers'), 2000);
      } else {
        const errorMessage = response.data.message || response.data.error || t('buyers.errors.addFailed');
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error adding buyer:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          t('common.networkError');
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
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
          onClick={() => navigate('/buyers')} 
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
            {t('buyers.addTitle')}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            {t('buyers.addSubtitle')}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          {currentStep === steps.length - 1 && (
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
              {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <><SaveIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> {t('common.save')}</>}
            </Button>
          )}
        </Box>
      </Box>

      {/* Floating Error Alert */}
      <Box sx={{ mb: 2 }}>
        <FloatingErrorAlert error={error} onClose={() => setError('')} />
      </Box>

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {t('buyers.messages.addSuccess')}
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

      {/* Step 1: Personal Information */}
      {currentStep === 0 && (
        <Paper sx={{ borderRadius: 2.5, overflow: 'auto', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>{t('buyers.personalInfo')}</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Name */}
              <Box>
                <Label required>{t('buyers.fullName')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('buyers.placeholders.name')}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>

              {/* Email */}
              <Box>
                <Label>{t('buyers.email')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('buyers.placeholders.email')}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>

              {/* Mobile */}
              <Box>
                <Label>{t('buyers.mobileNumber')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder={t('buyers.placeholders.mobile')}
                  inputProps={{ maxLength: 10 }}
                  error={!!fieldErrors.mobile}
                  helperText={fieldErrors.mobile}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                  {t('buyers.mobileHint')}
                </Typography>
              </Box>

              {/* Alternate Mobile */}
              <Box>
                <Label>{t('buyers.alternateMobile')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleChange}
                  placeholder={t('buyers.placeholders.alternateMobile')}
                  inputProps={{ maxLength: 10 }}
                  error={!!fieldErrors.alternateMobile}
                  helperText={fieldErrors.alternateMobile}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>

              {/* Address - spans both columns */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label>{t('buyers.address')}</Label>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t('buyers.placeholders.address')}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><HomeIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>

              {/* City */}
              <Box>
                <Label required>{t('buyers.city')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t('buyers.placeholders.city')}
                  error={!!fieldErrors.city}
                  helperText={fieldErrors.city}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>

              {/* State */}
              <Box>
                <Label required>{t('buyers.state')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder={t('buyers.placeholders.state')}
                  error={!!fieldErrors.state}
                  helperText={fieldErrors.state}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PublicIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>

              {/* Pincode */}
              <Box>
                <Label>{t('buyers.pincode')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleNumberChange}
                  placeholder={t('buyers.placeholders.pincode')}
                  inputProps={{ maxLength: 6 }}
                  error={!!fieldErrors.pincode}
                  helperText={fieldErrors.pincode}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                  {t('buyers.pincodeHint')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Step 2: Business Details */}
      {currentStep === 1 && (
        <Paper sx={{ borderRadius: 2.5, overflow: 'visible', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BusinessIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>{t('buyers.businessDetails')}</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Business Name */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label required>{t('buyers.businessName')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder={t('buyers.placeholders.businessName')}
                  error={!!fieldErrors.businessName}
                  helperText={fieldErrors.businessName}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>

              {/* Business Type - Autocomplete with search */}
              <Box>
                <Label required>{t('buyers.businessType')}</Label>
                <Autocomplete
                  fullWidth
                  options={BUSINESS_TYPES}
                  value={BUSINESS_TYPES.find(opt => opt.value === formData.businessType) || null}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({ ...prev, businessType: newValue?.value || 'individual' }));
                  }}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.value === value?.value}
                  disableClearable
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder={t('buyers.placeholders.businessType')}
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
                      maxHeight: '250px',
                      '& .MuiAutocomplete-option': {
                        fontSize: '0.75rem',
                        py: 1,
                        px: 1.5
                      }
                    }
                  }}
                />
              </Box>

              {/* GST Number */}
              <Box>
                <Label>{t('buyers.gstNumber')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleUppercaseChange}
                  placeholder={t('buyers.placeholders.gst')}
                  inputProps={{ maxLength: 15 }}
                  error={!!fieldErrors.gstNumber}
                  helperText={fieldErrors.gstNumber}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><ReceiptIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                  {t('buyers.gstHint')}
                </Typography>
              </Box>

              {/* PAN Number */}
              <Box>
                <Label>{t('buyers.panNumber')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleUppercaseChange}
                  placeholder={t('buyers.placeholders.pan')}
                  inputProps={{ maxLength: 10 }}
                  error={!!fieldErrors.panNumber}
                  helperText={fieldErrors.panNumber}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><CardIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                  {t('buyers.panHint')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Step 3: Credit Terms & Additional Info */}
      {currentStep === 2 && (
        <Paper sx={{ borderRadius: 2.5, overflow: 'visible', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <MoneyIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>{t('buyers.creditTerms')}</Typography>
            </Stack>
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#8D6E63', fontSize: '0.65rem' }}>
              {t('buyers.creditOptional')}
            </Typography>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Credit Limit */}
              <Box>
                <Label>{t('buyers.creditLimit')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="creditLimit"
                  type="number"
                  value={formData.creditLimit}
                  onChange={handleNumberChange}
                  placeholder={t('buyers.placeholders.creditLimit')}
                  error={!!fieldErrors.creditLimit}
                  helperText={fieldErrors.creditLimit}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><MoneyIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                  {t('buyers.creditLimitHint')}
                </Typography>
              </Box>

              {/* Credit Days */}
              <Box>
                <Label>{t('buyers.creditDays')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="creditDays"
                  type="number"
                  value={formData.creditDays}
                  onChange={handleNumberChange}
                  placeholder={t('buyers.placeholders.creditDays')}
                  error={!!fieldErrors.creditDays}
                  helperText={fieldErrors.creditDays}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                  {t('buyers.creditDaysHint')}
                </Typography>
              </Box>

              {/* Default Payment Mode - Autocomplete with search */}
              <Box>
                <Label>{t('buyers.defaultPaymentMode')}</Label>
                <Autocomplete
                  fullWidth
                  options={PAYMENT_MODES}
                  value={PAYMENT_MODES.find(opt => opt.value === formData.defaultPaymentMode) || null}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({ ...prev, defaultPaymentMode: newValue?.value || 'cash' }));
                  }}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.value === value?.value}
                  disableClearable
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder={t('buyers.placeholders.paymentMode')}
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
                      maxHeight: '250px',
                      '& .MuiAutocomplete-option': {
                        fontSize: '0.75rem',
                        py: 1,
                        px: 1.5
                      }
                    }
                  }}
                />
              </Box>

              {/* Notes - spans both columns */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label>{t('buyers.notes')}</Label>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t('buyers.placeholders.notes')}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><NotesIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, pt: 3, pb: 2, mt: 2 }}>
        <Button
          onClick={currentStep === 0 ? () => navigate('/buyers') : handlePrevious}
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
          {currentStep === 0 ? t('common.cancel') : t('common.previous')}
        </Button>
        {currentStep < steps.length - 1 && (
          <Button
            onClick={handleNext}
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
              }
            }}
          >
            {t('common.next')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AddBuyer;
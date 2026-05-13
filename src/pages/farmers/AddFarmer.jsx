// src/pages/farmers/AddFarmer.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  IconButton,
  Collapse,
  Alert,
  Paper,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { 
  Error as ErrorIcon, 
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  VpnKey as KeyIcon,
  Receipt as ReceiptIcon,
  Check as CheckIcon,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../config/Config';

// Color constants matching AddPurchase
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
  const { t } = useTranslation();
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

const AddFarmer = () => {
  const { t } = useTranslation();
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

  const steps = [t('farmers.steps.personalInfo'), t('farmers.steps.bankDetails')];

  const getToken = () => localStorage.getItem('token');

  // Validation functions
  const validateMobile = (mobile) => {
    return /^[6-9][0-9]{9}$/.test(mobile);
  };

  const validateBankAccountNumber = (accountNo) => {
    return /^[0-9]{9,18}$/.test(accountNo);
  };

  const validateIFSC = (ifsc) => {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  };

  const validateBankName = (bankName) => {
    if (!bankName) return true;
    return /^[a-zA-Z\s\.\-]+$/.test(bankName);
  };

  const validateGST = (gst) => {
    if (!gst) return true;
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
  };

  const validateName = (name) => {
    return /^[a-zA-Z\s\.\-]+$/.test(name);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
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
        errors.name = t('farmers.errors.nameRequired');
        isValid = false;
      } else if (!validateName(formData.name)) {
        errors.name = t('farmers.errors.nameInvalid');
        isValid = false;
      }
      
      if (!formData.mobile.trim()) {
        errors.mobile = t('farmers.errors.mobileRequired');
        isValid = false;
      } else if (!validateMobile(formData.mobile)) {
        errors.mobile = t('farmers.errors.mobileInvalid');
        isValid = false;
      }
      
      if (!formData.village.trim()) {
        errors.village = t('farmers.errors.villageRequired');
        isValid = false;
      }
      
      if (!formData.city.trim()) {
        errors.city = t('farmers.errors.cityRequired');
        isValid = false;
      }
      
      if (!formData.state.trim()) {
        errors.state = t('farmers.errors.stateRequired');
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
      setCurrentStep(1);
      setError('');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(0);
    setError('');
  };

  const validateAllFields = () => {
    const errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = t('farmers.errors.nameRequired');
      isValid = false;
    } else if (!validateName(formData.name)) {
      errors.name = t('farmers.errors.nameInvalid');
      isValid = false;
    }
    
    if (!formData.mobile.trim()) {
      errors.mobile = t('farmers.errors.mobileRequired');
      isValid = false;
    } else if (!validateMobile(formData.mobile)) {
      errors.mobile = t('farmers.errors.mobileInvalid');
      isValid = false;
    }
    
    if (!formData.village.trim()) {
      errors.village = t('farmers.errors.villageRequired');
      isValid = false;
    }
    
    if (!formData.city.trim()) {
      errors.city = t('farmers.errors.cityRequired');
      isValid = false;
    }
    
    if (!formData.state.trim()) {
      errors.state = t('farmers.errors.stateRequired');
      isValid = false;
    }

    if (formData.bankName && !validateBankName(formData.bankName)) {
      errors.bankName = t('farmers.errors.bankNameInvalid');
      isValid = false;
    }

    if (formData.bankAccountNumber && !validateBankAccountNumber(formData.bankAccountNumber)) {
      errors.bankAccountNumber = t('farmers.errors.accountNumberInvalid');
      isValid = false;
    }

    if (formData.ifscCode && !validateIFSC(formData.ifscCode.toUpperCase())) {
      errors.ifscCode = t('farmers.errors.ifscInvalid');
      isValid = false;
    }

    if (formData.gstNumber && !validateGST(formData.gstNumber.toUpperCase())) {
      errors.gstNumber = t('farmers.errors.gstInvalid');
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
        ...formData,
        ifscCode: formData.ifscCode ? formData.ifscCode.toUpperCase() : '',
        gstNumber: formData.gstNumber ? formData.gstNumber.toUpperCase() : ''
      };
      
      const response = await axios.post(`${BASE_URL}/farmers`, submitData, {
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
        setTimeout(() => navigate('/farmers'), 2000);
      } else {
        const errorMessage = response.data.message || response.data.error || t('farmers.errors.addFailed');
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error adding farmer:', error);
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
          onClick={() => navigate('/farmers')} 
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
            {t('farmers.addTitle')}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            {t('farmers.addSubtitle')}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          {currentStep === 1 && (
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
          {t('farmers.messages.addSuccess')}
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
        <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>{t('farmers.personalInfo')}</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Name */}
              <Box>
                <Label required>{t('farmers.fullName')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('farmers.placeholders.name')}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>

              {/* Mobile */}
              <Box>
                <Label required>{t('farmers.mobileNumber')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder={t('farmers.placeholders.mobile')}
                  inputProps={{ maxLength: 10 }}
                  error={!!fieldErrors.mobile}
                  helperText={fieldErrors.mobile}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                  {t('farmers.mobileHint')}
                </Typography>
              </Box>

              {/* Address - spans both columns */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label>{t('farmers.address')}</Label>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t('farmers.placeholders.address')}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><HomeIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>

              {/* Village */}
              <Box>
                <Label required>{t('farmers.village')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder={t('farmers.placeholders.village')}
                  error={!!fieldErrors.village}
                  helperText={fieldErrors.village}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>

              {/* City */}
              <Box>
                <Label required>{t('farmers.city')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t('farmers.placeholders.city')}
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
                <Label required>{t('farmers.state')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder={t('farmers.placeholders.state')}
                  error={!!fieldErrors.state}
                  helperText={fieldErrors.state}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PublicIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Step 2: Bank Details */}
      {currentStep === 1 && (
        <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BankIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>{t('farmers.bankDetails')}</Typography>
            </Stack>
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#8D6E63', fontSize: '0.65rem' }}>
              {t('farmers.bankOptional')}
            </Typography>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Bank Name */}
              <Box>
                <Label>{t('farmers.bankName')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder={t('farmers.placeholders.bankName')}
                  error={!!fieldErrors.bankName}
                  helperText={fieldErrors.bankName}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><BankIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>

              {/* Bank Account Number */}
              <Box>
                <Label>{t('farmers.accountNumber')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder={t('farmers.placeholders.accountNumber')}
                  error={!!fieldErrors.bankAccountNumber}
                  helperText={fieldErrors.bankAccountNumber}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><CardIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                  {t('farmers.accountHint')}
                </Typography>
              </Box>

              {/* IFSC Code */}
              <Box>
                <Label>{t('farmers.ifscCode')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleUppercaseChange}
                  placeholder={t('farmers.placeholders.ifsc')}
                  inputProps={{ maxLength: 11 }}
                  error={!!fieldErrors.ifscCode}
                  helperText={fieldErrors.ifscCode}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><KeyIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                  {t('farmers.ifscHint')}
                </Typography>
              </Box>

              {/* GST Number */}
              <Box>
                <Label>{t('farmers.gstNumber')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleUppercaseChange}
                  placeholder={t('farmers.placeholders.gst')}
                  inputProps={{ maxLength: 15 }}
                  error={!!fieldErrors.gstNumber}
                  helperText={fieldErrors.gstNumber}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><ReceiptIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                  {t('farmers.gstHint')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, pb: 2, mt: 2 }}>
        {currentStep === 1 && (
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
        {currentStep === 0 && (
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
        {currentStep === 1 && <Box />}
      </Box>
    </Box>
  );
};

export default AddFarmer;
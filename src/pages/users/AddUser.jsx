// src/pages/users/AddUser.jsx
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
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { 
  Add as AddIcon, 
  Error as ErrorIcon, 
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  CheckCircle as CheckCircleIcon,
  ChevronRight,
  ChevronLeft,
  Shield as ShieldIcon,
  SupervisorAccount as AdminIcon
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
    hover: '#F0FDF9'
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

const AddUser = () => {
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
    password: '',
    confirmPassword: '',
    role: 'operator',
    phone: '',
    businessName: '',
    address: '',
    city: '',
    state: '',
    gstNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: ''
  });

  const steps = [t('users.steps.userInfo'), t('users.steps.businessDetails'), t('users.steps.bankDetails')];

  // Role options - Only Super Admin and Operator
  const roleOptions = [
    { value: 'superadmin', label: t('users.roles.superadmin'), icon: <AdminIcon sx={{ fontSize: '1rem' }} />, desc: t('users.roles.superadminDesc') },
    { value: 'operator', label: t('users.roles.operator'), icon: <ShieldIcon sx={{ fontSize: '1rem' }} />, desc: t('users.roles.operatorDesc') }
  ];

  const getToken = () => localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRoleChange = (e) => {
    setFormData(prev => ({ ...prev, role: e.target.value }));
    if (fieldErrors.role) setFieldErrors(prev => ({ ...prev, role: '' }));
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 0) {
      if (!formData.name.trim()) {
        errors.name = t('users.errors.nameRequired');
        isValid = false;
      }
      if (!formData.email.trim()) {
        errors.email = t('users.errors.emailRequired');
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = t('users.errors.emailInvalid');
        isValid = false;
      }
      if (!formData.password) {
        errors.password = t('users.errors.passwordRequired');
        isValid = false;
      } else if (formData.password.length < 6) {
        errors.password = t('users.errors.passwordMinLength');
        isValid = false;
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = t('users.errors.passwordMismatch');
        isValid = false;
      }
      if (!formData.role) {
        errors.role = t('users.errors.roleRequired');
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
      errors.name = t('users.errors.nameRequired');
      isValid = false;
    }
    if (!formData.email.trim()) {
      errors.email = t('users.errors.emailRequired');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('users.errors.emailInvalid');
      isValid = false;
    }
    if (!formData.password) {
      errors.password = t('users.errors.passwordRequired');
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = t('users.errors.passwordMinLength');
      isValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('users.errors.passwordMismatch');
      isValid = false;
    }
    if (!formData.role) {
      errors.role = t('users.errors.roleRequired');
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError(t('common.fillCorrectly'));
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

    try {
      const token = getToken();
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone || undefined,
        businessName: formData.businessName || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        gstNumber: formData.gstNumber || undefined,
        panNumber: formData.panNumber || undefined,
        bankAccountNumber: formData.bankAccountNumber || undefined,
        ifscCode: formData.ifscCode || undefined,
        bankName: formData.bankName || undefined
      };

      const response = await axios.post(`${BASE_URL}/auth/register`, userData, {
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
        setTimeout(() => navigate('/users'), 2000);
      } else {
        const errorMessage = response.data.message || response.data.error || t('users.errors.createFailed');
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating user:', error);
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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/users')} 
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
            {t('users.addTitle')}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            {t('users.addSubtitle')}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
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
              {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <><SaveIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> {t('users.createUser')}</>}
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
          {t('users.messages.createSuccess')}
        </Alert>
      )}

      {/* Stepper */}
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
                  {currentStep > index ? <CheckCircleIcon sx={{ fontSize: '1rem' }} /> : index + 1}
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

      {/* Step 1: User Information */}
      {currentStep === 0 && (
        <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>{t('users.userInformation')}</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Name */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label required>{t('users.fullName')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.name')}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
              </Box>

              {/* Email */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label required>{t('users.email')}</Label>
                <TextField
                  fullWidth
                  type="email"
                  size="small"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.email')}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
              </Box>

              {/* Password */}
              <Box>
                <Label required>{t('users.password')}</Label>
                <TextField
                  fullWidth
                  type="password"
                  size="small"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.password')}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <LockIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
              </Box>

              {/* Confirm Password */}
              <Box>
                <Label required>{t('users.confirmPassword')}</Label>
                <TextField
                  fullWidth
                  type="password"
                  size="small"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.confirmPassword')}
                  error={!!fieldErrors.confirmPassword}
                  helperText={fieldErrors.confirmPassword}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <LockIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
              </Box>

              {/* Phone */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label>{t('users.phone')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.phone')}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
              </Box>

              {/* Role - Only 2 options now */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label required>{t('users.role')}</Label>
                <RadioGroup
                  row
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  sx={{ gap: 2, mt: 0.5, flexWrap: 'wrap' }}
                >
                  {roleOptions.map((role) => (
                    <FormControlLabel
                      key={role.value}
                      value={role.value}
                      control={<Radio size="small" sx={{ color: COLORS.primary, '&.Mui-checked': { color: COLORS.primary } }} />}
                      label={
                        <Box>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            {role.icon}
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{role.label}</Typography>
                          </Stack>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, display: 'block' }}>
                            {role.desc}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        m: 0,
                        p: 1,
                        borderRadius: 1.5,
                        border: `1px solid ${formData.role === role.value ? COLORS.primary : COLORS.border}`,
                        bgcolor: formData.role === role.value ? COLORS.primaryLight : 'transparent',
                        '& .MuiFormControlLabel-label': { width: '100%' }
                      }}
                    />
                  ))}
                </RadioGroup>
                {fieldErrors.role && <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '0.65rem', mt: 0.5, display: 'block' }}>{fieldErrors.role}</Typography>}
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Step 2: Business Details */}
      {currentStep === 1 && (
        <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BusinessIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>{t('users.businessDetails')}</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Business Name - Optional */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label>{t('users.businessName')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.businessName')}
                  error={!!fieldErrors.businessName}
                  helperText={fieldErrors.businessName}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <BusinessIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary, mt: 0.5, display: 'block' }}>
                  {t('users.businessOptional')}
                </Typography>
              </Box>

              {/* Address */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label>{t('users.address')}</Label>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.address')}
                  sx={inputSx}
                />
              </Box>

              {/* City */}
              <Box>
                <Label>{t('users.city')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.city')}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
              </Box>

              {/* State */}
              <Box>
                <Label>{t('users.state')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.state')}
                  sx={inputSx}
                />
              </Box>

              {/* GST Number */}
              <Box>
                <Label>{t('users.gstNumber')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.gstNumber')}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <ReceiptIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
              </Box>

              {/* PAN Number */}
              <Box>
                <Label>{t('users.panNumber')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.panNumber')}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <CreditCardIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Step 3: Bank Details */}
      {currentStep === 2 && (
        <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BankIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>{t('users.bankDetails')}</Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Bank Name */}
              <Box>
                <Label>{t('users.bankName')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.bankName')}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <BankIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
              </Box>

              {/* IFSC Code */}
              <Box>
                <Label>{t('users.ifscCode')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.ifscCode')}
                  sx={inputSx}
                />
              </Box>

              {/* Bank Account Number */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label>{t('users.bankAccountNumber')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder={t('users.placeholders.bankAccountNumber')}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <CreditCardIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Info Note */}
      {currentStep === 2 && (
        <Paper sx={{ p: 2.5, bgcolor: '#E3F2FD', borderRadius: 2.5, border: '1px solid #BBDEFB', mt: 2 }}>
          <Typography variant="caption" sx={{ color: '#1565C0', fontSize: '0.7rem' }}>
            <strong>{t('common.tip')}:</strong> {t('users.welcomeNote')}
          </Typography>
        </Paper>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, pt: 3, pb: 2, mt: 2 }}>
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
            <ChevronLeft sx={{ fontSize: '1rem', mr: 0.5 }} /> {t('common.previous')}
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
            {t('common.next')} <ChevronRight sx={{ fontSize: '1rem', ml: 0.5 }} />
          </Button>
        )}
        {currentStep === 2 && <Box />}
      </Box>
    </Box>
  );
};

export default AddUser;
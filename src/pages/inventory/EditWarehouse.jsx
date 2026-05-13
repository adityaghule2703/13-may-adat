// src/pages/inventory/EditWarehouse.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip
} from '@mui/material';
import { 
  Error as ErrorIcon, 
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Warehouse as WarehouseIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Inventory as PackageIcon,
  Description as FileTextIcon,
  Check as CheckIcon,
  ChevronLeft,
  ChevronRight,
  Lock as LockIcon
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

const EditWarehouse = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
    isActive: true,
    notes: ''
  });

  const unitOptions = [
    { value: 'KG', label: t('inventory.units.kgLabel') },
    { value: 'TON', label: t('inventory.units.tonLabel') },
    { value: 'QUINTAL', label: t('inventory.units.quintalLabel') }
  ];

  const steps = [
    t('warehouses.steps.basicInfo'),
    t('warehouses.steps.locationManager'),
    t('warehouses.steps.capacityNotes')
  ];

  const getToken = () => localStorage.getItem('token');

  const fetchWarehouse = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/warehouse/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.data.success) {
        const warehouse = response.data.data.warehouse;
        setFormData({
          name: warehouse.name || '',
          code: warehouse.code || '',
          location: {
            address: warehouse.location?.address || '',
            city: warehouse.location?.city || '',
            state: warehouse.location?.state || '',
            pincode: warehouse.location?.pincode || ''
          },
          manager: {
            name: warehouse.manager?.name || '',
            phone: warehouse.manager?.phone || '',
            email: warehouse.manager?.email || ''
          },
          capacity: {
            total: warehouse.capacity?.total || '',
            used: warehouse.capacity?.used || 0,
            unit: warehouse.capacity?.unit || 'KG'
          },
          isActive: warehouse.isActive !== undefined ? warehouse.isActive : true,
          notes: warehouse.notes || ''
        });
      } else {
        setError(response.data.message || t('warehouses.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching warehouse:', error);
      setError(error.response?.data?.message || t('common.networkError'));
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, [id]);

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

  const handleUnitChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      capacity: { ...prev.capacity, unit: newValue?.value || 'KG' }
    }));
  };

  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    if (step === 0) {
      if (!formData.name.trim()) {
        errors.name = t('warehouses.errors.nameRequired');
        isValid = false;
      }
      if (!formData.code.trim()) {
        errors.code = t('warehouses.errors.codeRequired');
        isValid = false;
      }
    } else if (step === 1) {
      if (!formData.location.city.trim()) {
        errors['location.city'] = t('warehouses.errors.cityRequired');
        isValid = false;
      }
      if (!formData.location.state.trim()) {
        errors['location.state'] = t('warehouses.errors.stateRequired');
        isValid = false;
      }
      if (!formData.manager.name.trim()) {
        errors['manager.name'] = t('warehouses.errors.managerNameRequired');
        isValid = false;
      }
      if (!formData.manager.phone.trim()) {
        errors['manager.phone'] = t('warehouses.errors.managerPhoneRequired');
        isValid = false;
      } else if (!/^[0-9]{10}$/.test(formData.manager.phone)) {
        errors['manager.phone'] = t('warehouses.errors.invalidPhone');
        isValid = false;
      }
    } else if (step === 2) {
      if (!formData.capacity.total) {
        errors['capacity.total'] = t('warehouses.errors.totalCapacityRequired');
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

    if (!formData.name) {
      errors.name = t('warehouses.errors.nameRequired');
      isValid = false;
    }
    if (!formData.code) {
      errors.code = t('warehouses.errors.codeRequired');
      isValid = false;
    }
    if (!formData.location.city) {
      errors['location.city'] = t('warehouses.errors.cityRequired');
      isValid = false;
    }
    if (!formData.location.state) {
      errors['location.state'] = t('warehouses.errors.stateRequired');
      isValid = false;
    }
    if (!formData.manager.name) {
      errors['manager.name'] = t('warehouses.errors.managerNameRequired');
      isValid = false;
    }
    if (!formData.manager.phone) {
      errors['manager.phone'] = t('warehouses.errors.managerPhoneRequired');
      isValid = false;
    }
    if (!formData.capacity.total) {
      errors['capacity.total'] = t('warehouses.errors.totalCapacityRequired');
      isValid = false;
    }
    
    setFieldErrors(errors);
    if (!isValid) {
      setError(t('common.fillCorrectly'));
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

    try {
      const token = getToken();
      const response = await axios.put(`${BASE_URL}/warehouse/${id}`, {
        ...formData,
        capacity: { 
          ...formData.capacity, 
          total: parseFloat(formData.capacity.total),
          used: parseFloat(formData.capacity.used) || 0
        }
      }, {
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
        setTimeout(() => navigate('/warehouses'), 2000);
      } else {
        showError(response.data.message || t('warehouses.errors.updateFailed'));
      }
    } catch (error) {
      console.error('Error updating warehouse:', error);
      showError(error.response?.data?.message || t('common.networkError'));
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
      '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 1 },
      '&.Mui-disabled': {
        '&:hover fieldset': { borderColor: COLORS.border },
        '& fieldset': { borderColor: COLORS.border }
      }
    },
    '& .MuiInputBase-input': {
      py: 1,
      px: 1.5,
      fontSize: '0.75rem',
      color: COLORS.text.primary,
      '&::placeholder': {
        color: COLORS.text.tertiary,
        fontSize: '0.75rem'
      },
      '&.Mui-disabled': {
        color: '#6B7280',
        WebkitTextFillColor: '#6B7280'
      }
    },
    '& .MuiInputAdornment-root': {
      '& .MuiTypography-root': {
        fontSize: '0.7rem'
      }
    }
  };

  const readOnlyInputSx = {
    ...inputSx,
    '& .MuiOutlinedInput-root': {
      ...inputSx['& .MuiOutlinedInput-root'],
      bgcolor: '#F9FAFB',
      '&.Mui-disabled': {
        bgcolor: '#F9FAFB'
      }
    }
  };

  const selectedUnit = unitOptions.find(opt => opt.value === formData.capacity.unit) || null;

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '96vh' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
        <Typography sx={{ ml: 2, color: '#2E7D32' }}>{t('common.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/warehouses')} 
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
            {t('warehouses.editTitle')}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            {t('warehouses.editSubtitle')}
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
              {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <><SaveIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> {t('common.update')}</>}
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
          {t('warehouses.messages.updateSuccess')}
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

      {/* Step 1: Basic Information */}
      {currentStep === 0 && (
        <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <WarehouseIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
              <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
                {t('warehouses.basicInformation')}
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Warehouse Name - READ ONLY */}
              <Box>
                <Label required>{t('warehouses.name')}</Label>
                <Tooltip title={t('warehouses.nameReadOnlyTooltip')} arrow placement="top">
                  <TextField
                    fullWidth
                    size="small"
                    name="name"
                    value={formData.name}
                    disabled
                    placeholder={t('warehouses.placeholders.name')}
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name}
                    sx={readOnlyInputSx}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ fontSize: '0.8rem', color: '#9CA3AF' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Tooltip>
              </Box>

              {/* Warehouse Code - READ ONLY */}
              <Box>
                <Label required>{t('warehouses.code')}</Label>
                <Tooltip title={t('warehouses.codeReadOnlyTooltip')} arrow placement="top">
                  <TextField
                    fullWidth
                    size="small"
                    name="code"
                    value={formData.code}
                    disabled
                    placeholder={t('warehouses.placeholders.code')}
                    error={!!fieldErrors.code}
                    helperText={fieldErrors.code}
                    sx={readOnlyInputSx}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ fontSize: '0.8rem', color: '#9CA3AF' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Tooltip>
              </Box>

              {/* Status - spans both columns */}
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label>{t('warehouses.status.label')}</Label>
                <RadioGroup
                  row
                  name="isActive"
                  value={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                >
                  <FormControlLabel 
                    value={true} 
                    control={<Radio size="small" />} 
                    label={<Typography sx={{ fontSize: '0.75rem' }}>{t('warehouses.status.active')}</Typography>}
                    sx={{ mr: 3 }}
                  />
                  <FormControlLabel 
                    value={false} 
                    control={<Radio size="small" />} 
                    label={<Typography sx={{ fontSize: '0.75rem' }}>{t('warehouses.status.inactive')}</Typography>}
                  />
                </RadioGroup>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Step 2: Location & Manager Details */}
      {currentStep === 1 && (
        <Stack spacing={2.5}>
          {/* Location Details */}
          <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
                  {t('warehouses.locationDetails')}
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {/* Address - spans both columns */}
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Label>{t('warehouses.address')}</Label>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    placeholder={t('warehouses.placeholders.address')}
                    sx={inputSx}
                  />
                </Box>

                {/* City */}
                <Box>
                  <Label required>{t('warehouses.city')}</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    placeholder={t('warehouses.placeholders.city')}
                    error={!!fieldErrors['location.city']}
                    helperText={fieldErrors['location.city']}
                    sx={inputSx}
                  />
                </Box>

                {/* State */}
                <Box>
                  <Label required>{t('warehouses.state')}</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    placeholder={t('warehouses.placeholders.state')}
                    error={!!fieldErrors['location.state']}
                    helperText={fieldErrors['location.state']}
                    sx={inputSx}
                  />
                </Box>

                {/* Pincode */}
                <Box>
                  <Label>{t('warehouses.pincode')}</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleChange}
                    placeholder={t('warehouses.placeholders.pincode')}
                    sx={inputSx}
                  />
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Manager Details */}
          <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
                  {t('warehouses.managerDetails')}
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {/* Manager Name */}
                <Box>
                  <Label required>{t('warehouses.managerName')}</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="manager.name"
                    value={formData.manager.name}
                    onChange={handleChange}
                    placeholder={t('warehouses.placeholders.managerName')}
                    error={!!fieldErrors['manager.name']}
                    helperText={fieldErrors['manager.name']}
                    sx={inputSx}
                  />
                </Box>

                {/* Phone Number */}
                <Box>
                  <Label required>{t('farmers.mobileNumber')}</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="manager.phone"
                    value={formData.manager.phone}
                    onChange={handleChange}
                    placeholder={t('warehouses.placeholders.managerPhone')}
                    inputProps={{ maxLength: 10 }}
                    error={!!fieldErrors['manager.phone']}
                    helperText={fieldErrors['manager.phone']}
                    sx={inputSx}
                  />
                </Box>

                {/* Email - spans both columns */}
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Label>{t('common.email')}</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="manager.email"
                    value={formData.manager.email}
                    onChange={handleChange}
                    placeholder={t('warehouses.placeholders.managerEmail')}
                    type="email"
                    sx={inputSx}
                  />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Stack>
      )}

      {/* Step 3: Capacity & Notes */}
      {currentStep === 2 && (
        <Stack spacing={2.5}>
          {/* Capacity Details */}
          <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PackageIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
                  {t('warehouses.capacityDetails')}
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {/* Total Capacity */}
                <Box>
                  <Label required>{t('warehouses.totalCapacity')}</Label>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    name="capacity.total"
                    value={formData.capacity.total}
                    onChange={handleChange}
                    placeholder={t('warehouses.placeholders.totalCapacity')}
                    error={!!fieldErrors['capacity.total']}
                    helperText={fieldErrors['capacity.total']}
                    sx={inputSx}
                  />
                </Box>

                {/* Unit - Using Autocomplete */}
                <Box>
                  <Label>{t('warehouses.unit')}</Label>
                  <Autocomplete
                    fullWidth
                    options={unitOptions}
                    value={selectedUnit}
                    onChange={handleUnitChange}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder={t('warehouses.placeholders.selectUnit')}
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

                {/* Used Capacity */}
                <Box>
                  <Label>{t('warehouses.usedCapacity')}</Label>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    name="capacity.used"
                    value={formData.capacity.used}
                    onChange={handleChange}
                    placeholder={t('warehouses.placeholders.usedCapacity')}
                    sx={inputSx}
                  />
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Additional Notes */}
          <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FileTextIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
                <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
                  {t('common.notes')}
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder={t('warehouses.placeholders.notes')}
                sx={inputSx}
              />
            </Box>
          </Paper>
        </Stack>
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

export default EditWarehouse;
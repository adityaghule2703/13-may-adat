// src/pages/expenses/EditExpense.jsx
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
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import { 
  Add as AddIcon, 
  Error as ErrorIcon, 
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Wallet as WalletIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Check as CheckIcon,
  LocalShipping as TruckIcon,
  Work as BriefcaseIcon,
  AccountBalance as LandmarkIcon,
  Warehouse as WarehouseIcon,
  Business as BuildingIcon,
  Build as WrenchIcon,
  AccountBalance as BanknoteIcon,
  Campaign as MegaphoneIcon,
  ChevronRight,
  ChevronLeft,
  Edit as EditIcon
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

// Category options with icons - using translations
const getCategoryOptions = (t) => [
  { value: 'transport_logistics', label: t('expenses.categories.transport'), icon: <TruckIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'labour_wages', label: t('expenses.categories.labour'), icon: <BriefcaseIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'market_fees', label: t('expenses.categories.marketFees'), icon: <LandmarkIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'storage_cold_chain', label: t('expenses.categories.storage'), icon: <WarehouseIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'shop_office', label: t('expenses.categories.shopOffice'), icon: <BuildingIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'repairs_maintenance', label: t('expenses.categories.repairs'), icon: <WrenchIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'banking_finance', label: t('expenses.categories.banking'), icon: <BanknoteIcon sx={{ fontSize: '1rem' }} /> },
  { value: 'marketing_misc', label: t('expenses.categories.marketing'), icon: <MegaphoneIcon sx={{ fontSize: '1rem' }} /> }
];

// Payment options with translations
const getPaymentOptions = (t) => [
  { value: 'cash', label: t('expenses.modes.cash') },
  { value: 'upi', label: t('expenses.modes.upi') },
  { value: 'bank', label: t('expenses.modes.bank') },
  { value: 'cheque', label: t('expenses.modes.cheque') }
];

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

const EditExpense = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [fetchError, setFetchError] = useState('');
  
  const categoryOptions = getCategoryOptions(t);
  const paymentOptions = getPaymentOptions(t);
  
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

  const getToken = () => localStorage.getItem('token');

  // Fetch expense data
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`${BASE_URL}/expenses/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }

        if (response.data.success) {
          const expense = response.data.data;
          setFormData({
            category: expense.category || 'transport_logistics',
            amount: expense.amount || '',
            description: expense.description || '',
            expenseDate: expense.expenseDate ? expense.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0],
            paidBy: expense.paidBy || 'cash',
            paidTo: expense.paidTo || '',
            referenceNumber: expense.referenceNumber || '',
            notes: expense.notes || ''
          });
        } else {
          setFetchError(response.data.message || t('expenses.errors.fetchFailed'));
        }
      } catch (error) {
        console.error('Error fetching expense:', error);
        setFetchError(error.response?.data?.message || t('common.networkError'));
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id, navigate, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCategoryChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, category: newValue?.value || 'transport_logistics' }));
    if (fieldErrors.category) setFieldErrors(prev => ({ ...prev, category: '' }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.category) {
      errors.category = t('expenses.errors.categoryRequired');
      isValid = false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = t('expenses.errors.validAmountRequired');
      isValid = false;
    }
    if (!formData.description) {
      errors.description = t('expenses.errors.descriptionRequired');
      isValid = false;
    }
    if (!formData.expenseDate) {
      errors.expenseDate = t('expenses.errors.dateRequired');
      isValid = false;
    }
    if (!formData.paidBy) {
      errors.paidBy = t('expenses.errors.paymentMethodRequired');
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
    if (!validateForm()) return;

    setSaving(true);
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

      const response = await axios.put(`${BASE_URL}/expenses/${id}`, expenseData, {
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
        setTimeout(() => navigate('/expenses'), 2000);
      } else {
        showError(response.data.message || t('expenses.errors.updateFailed'));
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      showError(error.response?.data?.message || t('common.networkError'));
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 2
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

  // Get selected category for Autocomplete
  const selectedCategory = categoryOptions.find(opt => opt.value === formData.category) || null;

  // Get icon for selected payment method
  const getPaymentIcon = (value) => {
    switch(value) {
      case 'cash': return <PaymentIcon sx={{ fontSize: '1rem' }} />;
      case 'upi': return <PaymentIcon sx={{ fontSize: '1rem' }} />;
      case 'bank': return <BanknoteIcon sx={{ fontSize: '1rem' }} />;
      case 'cheque': return <ReceiptIcon sx={{ fontSize: '1rem' }} />;
      default: return <PaymentIcon sx={{ fontSize: '1rem' }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {fetchError}
        </Alert>
        <Button
          onClick={() => navigate('/expenses')}
          sx={{ mt: 2 }}
        >
          {t('common.backToList')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/expenses')} 
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
            {t('expenses.editTitle')}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            {t('expenses.editSubtitle')}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Button
            onClick={handleSubmit}
            disabled={saving}
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
         {saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <><SaveIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> {t('expenses.update')}</>}
          </Button>
        </Box>
      </Box>

      {/* Floating Error Alert */}
      <Box sx={{ mb: 2 }}>
        <FloatingErrorAlert error={error} onClose={() => setError('')} />
      </Box>

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {t('expenses.messages.updateSuccess')}
        </Alert>
      )}

      {/* Expense Details Form */}
      <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}` }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EditIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
            <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>{t('expenses.expenseDetails')}</Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* Category - Using Autocomplete */}
            <Box>
              <Label required>{t('expenses.category')}</Label>
              <Autocomplete
                fullWidth
                options={categoryOptions}
                value={selectedCategory}
                onChange={handleCategoryChange}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder={t('expenses.placeholders.selectCategory')}
                    error={!!fieldErrors.category}
                    helperText={fieldErrors.category}
                    sx={inputSx}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {option.icon}
                      <Typography sx={{ fontSize: '0.75rem' }}>{option.label}</Typography>
                    </Box>
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

            {/* Amount */}
            <Box>
              <Label required>{t('expenses.amount')}</Label>
              <TextField
                fullWidth
                type="number"
                size="small"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder={t('common.enterAmount')}
                error={!!fieldErrors.amount}
                helperText={fieldErrors.amount}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
            </Box>

            {/* Description - spans both columns */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label required>{t('expenses.description')}</Label>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('expenses.placeholders.description')}
                error={!!fieldErrors.description}
                helperText={fieldErrors.description}
                sx={inputSx}
              />
            </Box>

            {/* Expense Date */}
            <Box>
              <Label required>{t('expenses.expenseDate')}</Label>
              <TextField
                fullWidth
                type="date"
                size="small"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
                error={!!fieldErrors.expenseDate}
                helperText={fieldErrors.expenseDate}
                sx={inputSx}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Payment Information */}
      <Paper sx={{ borderRadius: 2.5, overflow: 'visible', border: `1px solid ${COLORS.border}`, mt: 2.5 }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PaymentIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
            <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>{t('expenses.paymentInformation')}</Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* Paid By */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label required>{t('expenses.paidBy')}</Label>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 2 }}>
                {paymentOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={formData.paidBy === option.value ? 'contained' : 'outlined'}
                    onClick={() => setFormData(prev => ({ ...prev, paidBy: option.value }))}
                    startIcon={getPaymentIcon(option.value)}
                    sx={{
                      py: 0.75,
                      borderRadius: 1.5,
                      textTransform: 'capitalize',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      borderColor: COLORS.border,
                      ...(formData.paidBy === option.value && {
                        bgcolor: COLORS.primary,
                        '&:hover': { bgcolor: COLORS.primaryDark }
                      })
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </Box>
              {fieldErrors.paidBy && <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '0.65rem' }}>{fieldErrors.paidBy}</Typography>}
            </Box>

            {/* Paid To */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label>{t('expenses.paidTo')}</Label>
              <TextField
                fullWidth
                size="small"
                name="paidTo"
                value={formData.paidTo}
                onChange={handleChange}
                placeholder={t('expenses.placeholders.paidTo')}
                sx={inputSx}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                }}
              />
            </Box>

            {/* Reference Number - Only show when payment method is NOT cash */}
            {formData.paidBy !== 'cash' && (
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label>{t('expenses.referenceNumber')}</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder={t('expenses.placeholders.referenceNumber')}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <ReceiptIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary, mr: 0.5 }} />
                  }}
                />
              </Box>
            )}

            {/* Notes */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label>{t('common.notes')}</Label>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder={t('expenses.placeholders.notes')}
                sx={inputSx}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Info Note */}
      <Paper sx={{ p: 2.5, bgcolor: '#E3F2FD', borderRadius: 2.5, border: '1px solid #BBDEFB', mt: 2.5 }}>
        <Typography variant="caption" sx={{ color: '#1565C0', fontSize: '0.7rem' }}>
          <strong>{t('common.note')}:</strong> {t('expenses.autoApprovalNote')}
        </Typography>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, pb: 2, mt: 2 }}>
        <Button
          onClick={() => navigate('/expenses')}
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
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
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
        {saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <><SaveIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> {t('expenses.update')}</>}
        </Button>
      </Box>
    </Box>
  );
};

export default EditExpense;
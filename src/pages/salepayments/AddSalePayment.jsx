// src/pages/salepayments/AddSalePayment.jsx
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
  InputAdornment,
  CircularProgress,
  MenuItem,
  Select
} from '@mui/material';
import { 
  Error as ErrorIcon, 
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CreditCard as CreditCardIcon,
  VpnKey as HashIcon,
  AccountBalance as BankIcon,
  Description as NotesIcon,
  CalendarToday as CalendarIcon,
  Payments as CashIcon,
  QrCode as UpiIcon,
  AccountBalance as BankTransferIcon,
  Receipt as ChequeIcon
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

// Payment mode options with icons
const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash', icon: CashIcon, color: '#2E7D32', bg: '#E8F5E9' },
  { value: 'upi', label: 'UPI', icon: UpiIcon, color: '#1976D2', bg: '#E3F2FD' },
  { value: 'bank', label: 'Bank Transfer', icon: BankTransferIcon, color: '#F57C00', bg: '#FFF3E0' },
  { value: 'cheque', label: 'Cheque', icon: ChequeIcon, color: '#7B1FA2', bg: '#F3E5F5' }
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

const AddSalePayment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [amountDue, setAmountDue] = useState(0);

  const [formData, setFormData] = useState({
    saleId: '',
    amount: '',
    paymentMode: 'cash',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    chequeNumber: '',
    chequeDate: '',
    bankName: '',
    notes: ''
  });

  const getToken = () => localStorage.getItem('token');

  const isAuthenticated = () => {
    const token = getToken();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!token || isLoggedIn !== 'true') {
      navigate('/login');
      return false;
    }
    return true;
  };

  // Fetch sales
  const fetchSales = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/sales?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        // Filter sales that have pending amount due
        const pendingSales = response.data.data.filter(sale => 
          (sale.amountDue > 0) || (sale.status !== 'completed')
        );
        setSales(pendingSales);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to load sales';
      setError(errorMessage);
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchSales();
    }
  }, []);

  // Update amount due when sale is selected
  const handleSaleChange = (event, newValue) => {
    setSelectedSale(newValue);
    setFormData(prev => ({ ...prev, saleId: newValue?._id || '' }));
    if (newValue) {
      setAmountDue(newValue.amountDue || newValue.finalReceivable || 0);
    } else {
      setAmountDue(0);
    }
    if (fieldErrors.saleId) {
      setFieldErrors(prev => ({ ...prev, saleId: '' }));
    }
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

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.saleId) {
      errors.saleId = 'Please select a sale';
      isValid = false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Valid payment amount is required';
      isValid = false;
    }
    if (parseFloat(formData.amount) > amountDue) {
      errors.amount = `Payment amount cannot exceed amount due (${formatCurrency(amountDue)})`;
      isValid = false;
    }
    if (!formData.paymentDate) {
      errors.paymentDate = 'Payment date is required';
      isValid = false;
    }
    if (!formData.paymentMode) {
      errors.paymentMode = 'Payment mode is required';
      isValid = false;
    }
    
    // UPI validation
    if (formData.paymentMode === 'upi' && !formData.referenceNumber) {
      errors.referenceNumber = 'UPI Transaction ID / Reference number is required';
      isValid = false;
    }
    
    // Bank Transfer validation
    if (formData.paymentMode === 'bank') {
      if (!formData.referenceNumber) {
        errors.referenceNumber = 'Bank reference number is required';
        isValid = false;
      }
      if (!formData.bankName) {
        errors.bankName = 'Bank name is required';
        isValid = false;
      }
    }
    
    // Cheque validation
    if (formData.paymentMode === 'cheque') {
      if (!formData.chequeNumber) {
        errors.chequeNumber = 'Cheque number is required';
        isValid = false;
      }
      if (!formData.chequeDate) {
        errors.chequeDate = 'Cheque date is required';
        isValid = false;
      }
      if (!formData.bankName) {
        errors.bankName = 'Bank name is required';
        isValid = false;
      }
    }

    setFieldErrors(errors);
    if (!isValid) {
      setError('Please fill all required fields correctly');
      setTimeout(() => setError(''), 3000);
    }
    return isValid;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated()) return;
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = getToken();
      
      const submitData = {
        saleId: formData.saleId,
        amount: parseFloat(formData.amount),
        paymentMode: formData.paymentMode,
        paymentDate: formData.paymentDate,
        referenceNumber: formData.referenceNumber || undefined,
        chequeNumber: formData.chequeNumber || undefined,
        chequeDate: formData.chequeDate || undefined,
        bankName: formData.bankName || undefined,
        notes: formData.notes || undefined
      };
      
      // Remove undefined values
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined) {
          delete submitData[key];
        }
      });
      
      const response = await axios.post(`${BASE_URL}/sale-payments`, submitData, {
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
        setTimeout(() => navigate('/sale-payments'), 2000);
      } else {
        const errorMessage = response.data.message || response.data.error || 'Failed to add payment';
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Network error. Please try again.';
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

  if (loadingSales) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
        <Typography sx={{ ml: 2, color: COLORS.text.primary }}>
          Loading sales...
        </Typography>
      </Box>
    );
  }

  // Get selected payment mode details
  const selectedPaymentMode = PAYMENT_MODES.find(mode => mode.value === formData.paymentMode);

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/sale-payments')} 
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
            Add Sale Payment
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            Record a payment received from a buyer
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
          Payment added successfully! Redirecting...
        </Alert>
      )}

      {/* Payment Form */}
      <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CreditCardIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
            <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
              Payment Information
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* SELECT SALE */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label required>Select Sale</Label>
              <Autocomplete
                fullWidth
                options={sales}
                loading={loadingSales}
                value={selectedSale}
                onChange={handleSaleChange}
                getOptionLabel={(option) => {
                  const buyerName = option.buyer?.displayName || option.buyer?.name || option.buyerName || 'N/A';
                  return `${option.invoiceNumber} - ${buyerName} (Due: ${formatCurrency(option.amountDue || option.finalReceivable || 0)})`;
                }}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Search by invoice number or buyer name..."
                    error={!!fieldErrors.saleId}
                    helperText={fieldErrors.saleId}
                    sx={inputSx}
                  />
                )}
                renderOption={(props, option) => {
                  const buyerName = option.buyer?.displayName || option.buyer?.name || option.buyerName || 'N/A';
                  const dueAmount = option.amountDue || option.finalReceivable || 0;
                  return (
                    <li {...props}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                            {option.invoiceNumber}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                            {buyerName} • {option.buyer?.mobile || option.buyerMobile || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                            Amount Due
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: dueAmount > 0 ? '#D32F2F' : '#2E7D32' }}>
                            {formatCurrency(dueAmount)}
                          </Typography>
                        </Box>
                      </Box>
                    </li>
                  );
                }}
              />
              {selectedSale && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: COLORS.primaryLight, borderRadius: 1.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                    Selected Sale Details
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', color: COLORS.text.primary }}>
                    Invoice: {selectedSale.invoiceNumber}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                    Buyer: {selectedSale.buyer?.displayName || selectedSale.buyer?.name || selectedSale.buyerName}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary, display: 'block' }}>
                    Amount Due: <span style={{ color: amountDue > 0 ? '#D32F2F' : '#2E7D32', fontWeight: 600 }}>{formatCurrency(amountDue)}</span>
                  </Typography>
                </Box>
              )}
            </Box>

            {/* PAYMENT DATE */}
            <Box>
              <Label required>Payment Date</Label>
              <TextField
                fullWidth
                type="date"
                size="small"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                error={!!fieldErrors.paymentDate}
                helperText={fieldErrors.paymentDate}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><CalendarIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                }}
              />
            </Box>

            {/* AMOUNT */}
            <Box>
              <Label required>Amount</Label>
              <TextField
                fullWidth
                type="number"
                size="small"
                name="amount"
                value={formData.amount}
                onChange={handleNumberChange}
                placeholder="Enter payment amount"
                error={!!fieldErrors.amount}
                helperText={fieldErrors.amount}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
              />
              {selectedSale && amountDue > 0 && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                  Maximum payable: {formatCurrency(amountDue)}
                </Typography>
              )}
            </Box>

            {/* PAYMENT MODE - Enhanced Autocomplete with Search */}
            <Box>
              <Label required>Payment Mode</Label>
              <Autocomplete
                fullWidth
                options={PAYMENT_MODES}
                value={selectedPaymentMode || null}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    paymentMode: newValue?.value || 'cash',
                    // Clear mode-specific fields when switching modes
                    referenceNumber: '',
                    chequeNumber: '',
                    chequeDate: '',
                    bankName: ''
                  }));
                  if (fieldErrors.paymentMode) {
                    setFieldErrors(prev => ({ ...prev, paymentMode: '' }));
                  }
                }}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value?.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Select payment mode"
                    error={!!fieldErrors.paymentMode}
                    helperText={fieldErrors.paymentMode}
                    sx={inputSx}
                  />
                )}
                renderOption={(props, option) => {
                  const Icon = option.icon;
                  return (
                    <li {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Icon sx={{ fontSize: '1rem', color: option.color }} />
                        <Typography sx={{ fontSize: '0.75rem' }}>{option.label}</Typography>
                      </Box>
                    </li>
                  );
                }}
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

            {/* UPI Reference Number */}
            {formData.paymentMode === 'upi' && (
              <Box sx={{ gridColumn: 'span 2' }}>
                <Label required>UPI Transaction ID / Reference Number</Label>
                <TextField
                  fullWidth
                  size="small"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder="e.g., 1234567890@ybl or UPI123456789"
                  error={!!fieldErrors.referenceNumber}
                  helperText={fieldErrors.referenceNumber}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><UpiIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                  }}
                />
              </Box>
            )}

            {/* Bank Transfer Fields */}
            {formData.paymentMode === 'bank' && (
              <>
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Label required>Bank Reference Number</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    placeholder="Bank transaction reference number"
                    error={!!fieldErrors.referenceNumber}
                    helperText={fieldErrors.referenceNumber}
                    sx={inputSx}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><HashIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                    }}
                  />
                </Box>
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Label required>Bank Name</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Enter bank name (e.g., State Bank of India)"
                    error={!!fieldErrors.bankName}
                    helperText={fieldErrors.bankName}
                    sx={inputSx}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><BankIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                    }}
                  />
                </Box>
              </>
            )}

            {/* Cheque Details */}
            {formData.paymentMode === 'cheque' && (
              <>
                <Box>
                  <Label required>Cheque Number</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="chequeNumber"
                    value={formData.chequeNumber}
                    onChange={handleChange}
                    placeholder="Cheque number"
                    error={!!fieldErrors.chequeNumber}
                    helperText={fieldErrors.chequeNumber}
                    sx={inputSx}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><ChequeIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                    }}
                  />
                </Box>

                <Box>
                  <Label required>Cheque Date</Label>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    name="chequeDate"
                    value={formData.chequeDate}
                    onChange={handleChange}
                    error={!!fieldErrors.chequeDate}
                    helperText={fieldErrors.chequeDate}
                    sx={inputSx}
                  />
                </Box>

                <Box sx={{ gridColumn: 'span 2' }}>
                  <Label required>Bank Name</Label>
                  <TextField
                    fullWidth
                    size="small"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Bank name (e.g., State Bank of India)"
                    error={!!fieldErrors.bankName}
                    helperText={fieldErrors.bankName}
                    sx={inputSx}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><BankIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                    }}
                  />
                </Box>
              </>
            )}

            {/* Notes */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label>Notes</Label>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about this payment..."
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><NotesIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, pb: 2, mt: 2 }}>
        <Button
          onClick={() => navigate('/sale-payments')}
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
          Cancel
        </Button>
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
          {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <><SaveIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Record Payment</>}
        </Button>
      </Box>
    </Box>
  );
};

export default AddSalePayment;
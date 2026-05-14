// src/pages/products/AddProduct.jsx
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
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Inventory as PackageIcon,
  Description as DescriptionIcon,
  Check as CheckIcon
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

const AddProduct = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    productName: '',
    description: ''
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

  // Validation functions
  const validateProductName = (name) => {
    return /^[a-zA-Z0-9\s\.\-]+$/.test(name);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.productName.trim()) {
      errors.productName = t('products.errors.nameRequired');
      isValid = false;
    } else if (!validateProductName(formData.productName)) {
      errors.productName = t('products.errors.nameInvalid');
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
    if (!isAuthenticated()) return;
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = getToken();
      
      const submitData = {
        productName: formData.productName.trim(),
        description: formData.description.trim() || ''
      };
      
      const response = await axios.post(`${BASE_URL}/products`, submitData, {
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
        setTimeout(() => navigate('/products'), 2000);
      } else {
        const errorMessage = response.data.message || response.data.error || t('products.errors.addFailed');
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error adding product:', error);
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
          onClick={() => navigate('/products')} 
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
            {t('products.addTitle')}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            {t('products.addSubtitle')}
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
          {t('products.messages.addSuccess')}
        </Alert>
      )}

      {/* Product Form */}
      <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PackageIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
            <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
              {t('products.productInformation')}
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
            {/* Product Name */}
            <Box>
              <Label required>{t('products.productName')}</Label>
              <TextField
                fullWidth
                size="small"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder={t('products.placeholders.productName')}
                error={!!fieldErrors.productName}
                helperText={fieldErrors.productName}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PackageIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                }}
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                {t('products.productNameHint')}
              </Typography>
            </Box>

            {/* Description */}
            <Box>
              <Label>{t('products.description')}</Label>
              <TextField
                fullWidth
                multiline
                rows={4}
                size="small"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('products.placeholders.description')}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><DescriptionIcon sx={{ fontSize: '1rem', color: COLORS.text.tertiary }} /></InputAdornment>
                }}
              />
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#8D6E63', fontSize: '0.65rem' }}>
                {t('products.descriptionHint')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, pb: 2, mt: 2 }}>
        <Button
          onClick={() => navigate('/products')}
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
          {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <><SaveIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> {t('products.saveProduct')}</>}
        </Button>
      </Box>
    </Box>
  );
};

export default AddProduct;
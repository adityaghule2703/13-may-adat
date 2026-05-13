// src/pages/inventory/AdjustStock.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  IconButton,
  Collapse,
  Alert,
  Paper,
  InputAdornment,
  Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
  Error as ErrorIcon, 
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  TrendingUp,
  TrendingDown,
  Inventory as PackageIcon,
  Warehouse as BuildingIcon,
  Assignment as AssignmentIcon
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

const AdjustStock = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedProduct = queryParams.get('product');
  const preSelectedWarehouse = queryParams.get('warehouse');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    productName: preSelectedProduct || '',
    warehouse: preSelectedWarehouse || '',
    adjustment: '',
    adjustmentType: 'add',
    reason: ''
  });

  const getToken = () => localStorage.getItem('token');

  const fetchWarehouses = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/warehouse`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setWarehouses(response.data.data);
        
        if (preSelectedWarehouse) {
          const warehouse = response.data.data.find(w => w.name === preSelectedWarehouse);
          if (warehouse) {
            setSelectedWarehouse(warehouse);
            setFormData(prev => ({ ...prev, warehouse: warehouse.name }));
            const products = warehouse.products || [];
            setFilteredProducts(products);
            
            if (preSelectedProduct) {
              const product = products.find(p => p.productName === preSelectedProduct);
              if (product) {
                setSelectedProduct(product);
                setFormData(prev => ({ ...prev, productName: product.productName }));
              }
            }
          }
        }
      } else {
        const errorMessage = response.data.message || response.data.error || t('inventory.errors.fetchFailed');
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          t('inventory.errors.fetchFailed');
      setError(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleWarehouseChange = (event, newValue) => {
    setSelectedWarehouse(newValue);
    setSelectedProduct(null);
    setFilteredProducts(newValue?.products || []);
    
    setFormData(prev => ({ 
      ...prev, 
      warehouse: newValue?.name || '',
      productName: ''
    }));
    
    if (fieldErrors.warehouse) setFieldErrors(prev => ({ ...prev, warehouse: '' }));
    if (fieldErrors.productName) setFieldErrors(prev => ({ ...prev, productName: '' }));
  };

  const handleProductChange = (event, newValue) => {
    setSelectedProduct(newValue);
    setFormData(prev => ({ ...prev, productName: newValue?.productName || '' }));
    if (fieldErrors.productName) setFieldErrors(prev => ({ ...prev, productName: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.warehouse) {
      errors.warehouse = t('inventory.errors.warehouseRequired');
      isValid = false;
    }
    if (!formData.productName) {
      errors.productName = t('inventory.errors.productRequired');
      isValid = false;
    }
    if (!formData.adjustment || parseFloat(formData.adjustment) <= 0) {
      errors.adjustment = t('inventory.errors.validQuantityRequired');
      isValid = false;
    }
    if (!formData.reason) {
      errors.reason = t('inventory.errors.reasonRequired');
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) setError(t('common.fillCorrectly'));
    return isValid;
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const adjustmentValue = formData.adjustmentType === 'add' 
        ? parseFloat(formData.adjustment) 
        : -parseFloat(formData.adjustment);

      const adjustData = {
        productName: formData.productName,
        warehouse: formData.warehouse,
        adjustment: adjustmentValue,
        reason: formData.reason
      };

      const response = await axios.post(`${BASE_URL}/inventory/adjust`, adjustData, {
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
        setTimeout(() => navigate('/inventory'), 2000);
      } else {
        const errorMessage = response.data.message || response.data.error || t('inventory.errors.adjustFailed');
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
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

  if (loadingData) {
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
          onClick={() => navigate('/inventory')} 
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
            {t('inventory.adjustTitle')}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.text.tertiary }}>
            {t('inventory.adjustSubtitle')}
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
          {t('inventory.messages.adjustSuccess')}
        </Alert>
      )}

      {/* Form Content */}
      <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, bgcolor: COLORS.background.white }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PackageIcon sx={{ fontSize: '1.25rem', color: COLORS.primary }} />
            <Typography sx={{ fontWeight: 600, color: COLORS.text.primary }}>
              {t('inventory.stockAdjustmentDetails')}
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* WAREHOUSE SELECTION */}
            <Box>
              <Label required>{t('inventory.warehouse')}</Label>
              <Autocomplete
                fullWidth
                options={warehouses}
                loading={loadingData}
                value={selectedWarehouse}
                onChange={handleWarehouseChange}
                disabled={!!preSelectedWarehouse}
                getOptionLabel={(option) => `${option.name} (${option.isActive ? t('warehouses.status.active') : t('warehouses.status.inactive')})`}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder={t('inventory.placeholders.selectWarehouse')}
                    error={!!fieldErrors.warehouse}
                    helperText={fieldErrors.warehouse}
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
                          {t('warehouses.table.code')}: {option.code} | {t('warehouses.productsCount')}: {option.products?.length || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                          {t('warehouses.location')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.7rem', color: '#2E7D32' }}>
                          {option.location?.city || 'N/A'}
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
              {warehouses.length === 0 && !loadingData && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#FF6F00', fontSize: '0.65rem' }}>
                  {t('inventory.noWarehousesFound')}
                </Typography>
              )}
            </Box>

            {/* PRODUCT SELECTION */}
            <Box>
              <Label required>{t('inventory.productName')}</Label>
              <Autocomplete
                fullWidth
                options={filteredProducts}
                loading={loadingData}
                value={selectedProduct}
                onChange={handleProductChange}
                disabled={!selectedWarehouse || !!preSelectedProduct}
                getOptionLabel={(option) => `${option.productName} (${t('inventory.current')}: ${option.currentStock} ${option.unit})`}
                isOptionEqualToValue={(option, value) => option.productName === value?.productName}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder={selectedWarehouse ? t('inventory.placeholders.selectProduct') : t('inventory.placeholders.selectWarehouseFirst')}
                    error={!!fieldErrors.productName}
                    helperText={fieldErrors.productName}
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
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: COLORS.text.tertiary }}>
                          {t('inventory.unit')}: {option.unit}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: COLORS.text.tertiary }}>
                          {t('inventory.currentStock')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#2E7D32' }}>
                          {option.currentStock} {option.unit}
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
              {selectedWarehouse && filteredProducts.length === 0 && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#FF6F00', fontSize: '0.65rem' }}>
                  {t('inventory.noProductsInWarehouse')}
                </Typography>
              )}
            </Box>

            {/* ADJUSTMENT TYPE */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label required>{t('inventory.adjustmentType')}</Label>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <Button
                  variant={formData.adjustmentType === 'add' ? 'contained' : 'outlined'}
                  onClick={() => setFormData(prev => ({ ...prev, adjustmentType: 'add' }))}
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderColor: COLORS.border,
                    ...(formData.adjustmentType === 'add' && {
                      bgcolor: '#2E7D32',
                      '&:hover': { bgcolor: '#1B5E20' }
                    })
                  }}
                >
                  <TrendingUp sx={{ fontSize: '1rem', mr: 0.5 }} />
                  {t('inventory.addStock')} (+)
                </Button>
                <Button
                  variant={formData.adjustmentType === 'remove' ? 'contained' : 'outlined'}
                  onClick={() => setFormData(prev => ({ ...prev, adjustmentType: 'remove' }))}
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderColor: COLORS.border,
                    ...(formData.adjustmentType === 'remove' && {
                      bgcolor: '#D32F2F',
                      '&:hover': { bgcolor: '#C62828' }
                    })
                  }}
                >
                  <TrendingDown sx={{ fontSize: '1rem', mr: 0.5 }} />
                  {t('inventory.removeStock')} (-)
                </Button>
              </Box>
            </Box>

            {/* QUANTITY */}
            <Box>
              <Label required>{t('inventory.quantity')}</Label>
              <TextField
                fullWidth
                type="number"
                size="small"
                name="adjustment"
                value={formData.adjustment}
                onChange={handleChange}
                placeholder={t('inventory.placeholders.quantity')}
                error={!!fieldErrors.adjustment}
                helperText={fieldErrors.adjustment}
                sx={inputSx}
              />
            </Box>

            <Box />

            {/* REASON */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Label required>{t('inventory.reasonForAdjustment')}</Label>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder={t('inventory.placeholders.reason')}
                error={!!fieldErrors.reason}
                helperText={fieldErrors.reason}
                sx={inputSx}
              />
            </Box>

            {/* Info Note */}
            <Box sx={{ gridColumn: 'span 2' }}>
              <Box sx={{ p: 2, bgcolor: '#FFF3E0', borderRadius: 1.5, border: '1px solid #FFE0B2' }}>
                <Typography variant="caption" sx={{ color: '#E65100', fontSize: '0.7rem' }}>
                  <strong>{t('common.note')}:</strong> {t('inventory.adjustmentNote')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, pb: 2, mt: 2 }}>
        <Button
          onClick={() => navigate('/inventory')}
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
          {loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : t('inventory.buttons.adjustStock')}
        </Button>
      </Box>
    </Box>
  );
};

export default AdjustStock;
// src/pages/inventory/ViewWarehouse.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Edit2, User, MapPin, Phone, Mail, Package, 
  CheckCircle, XCircle, Loader, AlertCircle, FileText, 
  Building, Calendar, TrendingUp, Box, Layers, 
  AlertTriangle, RefreshCw, Clock, HardDrive, Hash
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewWarehouse = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchWarehouseDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/warehouse/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setWarehouse(data.data.warehouse);
        setProducts(data.data.products || []);
        setSummary(data.data.summary);
      } else {
        setError(data.message || t('warehouses.errors.fetchFailed'));
      }
    } catch (error) {
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWarehouseDetails();
  };

  useEffect(() => {
    fetchWarehouseDetails();
  }, [id]);

  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);
  
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  if (loading && !warehouse) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('warehouses.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => navigate('/warehouses')} 
          className="mt-4 px-4 py-2 rounded-lg text-white text-sm transition-all hover:scale-105" 
          style={{ background: '#2E7D32' }}
        >
          {t('common.backToWarehouses')}
        </button>
      </div>
    );
  }

  const capacityPercent = warehouse?.capacity?.total > 0 
    ? ((warehouse.capacity.used || 0) / warehouse.capacity.total) * 100 
    : 0;

  const hasCapacityData = warehouse?.capacity?.total > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/warehouses')}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-all"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{warehouse?.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: '#8D6E63' }}>
              {t('warehouses.code')}: {warehouse?.code}
            </p>
          </div>
        </div>
        {/* <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
          <button 
            onClick={() => navigate(`/warehouses/edit/${id}`)} 
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
          >
            <Edit2 className="w-4 h-4" /> {t('common.edit')}
          </button>
        </div> */}
      </div>

      {/* Status Banner */}
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden"
        style={{ borderLeft: `4px solid ${warehouse?.isActive ? '#2E7D32' : '#D32F2F'}` }}
      >
        <div className="p-5 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: warehouse?.isActive ? '#E8F5E9' : '#FFEBEE' }}
            >
              {warehouse?.isActive ? (
                <CheckCircle className="w-6 h-6" style={{ color: '#2E7D32' }} />
              ) : (
                <XCircle className="w-6 h-6" style={{ color: '#D32F2F' }} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: warehouse?.isActive ? '#2E7D32' : '#D32F2F' }}>
                {t('warehouses.status.label')}
              </p>
              <p className="text-xl font-bold" style={{ color: warehouse?.isActive ? '#1B5E20' : '#C62828' }}>
                {warehouse?.isActive ? t('warehouses.status.active') : t('warehouses.status.inactive')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('warehouses.createdOn')}</p>
            <p className="text-base font-semibold" style={{ color: '#1B5E20' }}>
              {formatDate(warehouse?.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Warehouse Information */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5" style={{ color: '#2E7D32' }} />
                <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>
                  {t('warehouses.warehouseInformation')}
                </h3>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('warehouses.name')}</p>
                  <p className="text-base font-semibold mt-1" style={{ color: '#1B5E20' }}>
                    {warehouse?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('warehouses.code')}</p>
                  <p className="text-base font-mono font-semibold mt-1" style={{ color: '#BF360C' }}>
                    {warehouse?.code}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('warehouses.createdBy')}</p>
                  <p className="text-sm font-medium mt-1" style={{ color: '#1B5E20' }}>
                    {warehouse?.createdBy?.name || 'N/A'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#A5D6A7' }}>
                    {warehouse?.createdBy?.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('common.lastUpdated')}</p>
                  <p className="text-sm mt-1" style={{ color: '#5D4037' }}>
                    <Clock className="w-3.5 h-3.5 inline mr-1" style={{ color: '#A5D6A7' }} />
                    {formatDateTime(warehouse?.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: '#2E7D32' }} />
                <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>
                  {t('warehouses.location')}
                </h3>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm" style={{ color: '#5D4037' }}>
                {warehouse?.location?.address || t('common.notProvided')}
              </p>
              {(warehouse?.location?.city || warehouse?.location?.state) && (
                <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>
                  {warehouse?.location?.city && `${warehouse.location.city}, `}
                  {warehouse?.location?.state && warehouse.location.state}
                  {warehouse?.location?.pincode && ` - ${warehouse.location.pincode}`}
                </p>
              )}
            </div>
          </div>

          {/* Manager Details */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: '#2E7D32' }} />
                <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>
                  {t('warehouses.managerDetails')}
                </h3>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('warehouses.managerName')}</p>
                  <p className="text-base font-semibold mt-1" style={{ color: '#1B5E20' }}>
                    {warehouse?.manager?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('farmers.mobileNumber')}</p>
                  <p className="text-sm flex items-center gap-1 mt-1" style={{ color: '#5D4037' }}>
                    <Phone className="w-3.5 h-3.5" style={{ color: '#8D6E63' }} />
                    {warehouse?.manager?.phone || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs" style={{ color: '#8D6E63' }}>{t('common.email')}</p>
                  <p className="text-sm flex items-center gap-1 mt-1" style={{ color: '#5D4037' }}>
                    <Mail className="w-3.5 h-3.5" style={{ color: '#8D6E63' }} />
                    {warehouse?.manager?.email || t('common.notProvided')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Capacity Usage */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="w-5 h-5" style={{ color: '#1B5E20' }} />
              <h3 className="font-bold text-base" style={{ color: '#1B5E20' }}>
                {t('warehouses.capacityUsage')}
              </h3>
            </div>
            {hasCapacityData ? (
              <>
                <div className="mb-2 flex justify-between text-sm">
                  <span style={{ color: '#5D4037' }}>
                    {t('warehouses.used')}: {formatNumber(warehouse?.capacity?.used)} {warehouse?.capacity?.unit}
                  </span>
                  <span style={{ color: '#5D4037' }}>
                    {t('warehouses.total')}: {formatNumber(warehouse?.capacity?.total)} {warehouse?.capacity?.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="rounded-full h-2.5 transition-all duration-500" 
                    style={{ width: `${Math.min(capacityPercent, 100)}%`, background: '#2E7D32' }} 
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: '#8D6E63' }}>
                  {capacityPercent.toFixed(1)}% {t('warehouses.capacityUtilized')}
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: '#8D6E63' }}>
                {t('warehouses.noCapacityData')}
              </p>
            )}
          </div>

          {/* Inventory Summary */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" style={{ color: '#2E7D32' }} />
                <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>
                  {t('warehouses.inventorySummary')}
                </h3>
              </div>
            </div>
            <div className="p-5">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-2" style={{ background: '#E8F5E9' }}>
                  <Box className="w-8 h-8" style={{ color: '#2E7D32' }} />
                </div>
                <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>
                  {summary?.totalProducts || 0}
                </p>
                <p className="text-sm" style={{ color: '#8D6E63' }}>{t('warehouses.productsStored')}</p>
              </div>
              <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E8F5E9' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: '#8D6E63' }}>{t('warehouses.totalStockUnits')}</p>
                    <p className="text-2xl font-bold" style={{ color: '#FF6F00' }}>
                      {formatNumber(summary?.totalStockUnits || 0)}
                    </p>
                  </div>
                  {summary?.lowStockCount > 0 && (
                    <div className="text-right">
                      <p className="text-xs flex items-center gap-1" style={{ color: '#E65100' }}>
                        <AlertTriangle className="w-3 h-3" />
                        {t('warehouses.lowStockAlert')}
                      </p>
                      <p className="text-xl font-bold" style={{ color: '#E65100' }}>
                        {summary?.lowStockCount}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {warehouse?.notes && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: '#2E7D32' }} />
              <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>{t('common.notes')}</h3>
            </div>
          </div>
          <div className="p-5">
            <p className="text-gray-700 leading-relaxed">{warehouse.notes}</p>
          </div>
        </div>
      )}

      {/* Stock Details Table */}
      {products.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5" style={{ color: '#2E7D32' }} />
                <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>
                  {t('warehouses.stockDetails')}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                  {products.length} {t('warehouses.products')}
                </span>
                <span className="px-2 py-1 rounded-full text-xs" style={{ background: '#FFF3E0', color: '#E65100' }}>
                  {formatNumber(summary?.totalStockUnits)} {t('warehouses.totalUnits')}
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E8F5E9' }}>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>
                    {t('inventory.table.product')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>
                    {t('inventory.table.currentStock')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>
                    {t('inventory.table.unit')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>
                    {t('inventory.table.lastUpdated')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => {
                  const isLowStock = summary?.lowStockProducts?.some(
                    low => low.productName === item.productName
                  );
                  return (
                    <tr 
                      key={item._id} 
                      className="hover:bg-green-50 transition-colors"
                      style={{ borderBottom: index !== products.length - 1 ? '1px solid #E8F5E9' : 'none' }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>
                            {item.productName || 'Unnamed Product'}
                          </span>
                          {isLowStock && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                              style={{ background: '#FFEBEE', color: '#D32F2F' }}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className={`text-sm font-semibold ${isLowStock ? 'text-red-600' : ''}`}
                          style={!isLowStock ? { color: '#FF6F00' } : {}}
                        >
                          {formatNumber(item.currentStock)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: '#5D4037' }}>
                          {item.unit || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" style={{ color: '#A5D6A7' }} />
                          <span className="text-xs" style={{ color: '#8D6E63' }}>
                            {formatDate(item.lastUpdated)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock Products Section */}
      {summary?.lowStockCount > 0 && summary.lowStockProducts && (
        <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" style={{ color: '#E65100' }} />
            <h3 className="font-semibold text-base" style={{ color: '#E65100' }}>
              {t('warehouses.lowStockProducts')}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {summary.lowStockProducts.map((product, idx) => (
              <div 
                key={idx}
                className="px-3 py-2 rounded-lg bg-white border border-orange-200"
              >
                <span className="font-medium" style={{ color: '#BF360C' }}>{product.productName}</span>
                <span className="text-sm ml-2" style={{ color: '#E65100' }}>
                  ({formatNumber(product.currentStock)} {product.unit})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer with creation info */}
      <div className="text-center text-xs" style={{ color: '#A5D6A7' }}>
        {t('warehouses.createdOn')}: {formatDateTime(warehouse?.createdAt)}
        {warehouse?.updatedAt && warehouse.updatedAt !== warehouse.createdAt && (
          <> | {t('common.lastUpdated')}: {formatDateTime(warehouse?.updatedAt)}</>
        )}
      </div>
    </div>
  );
};

export default ViewWarehouse;
// src/pages/products/ViewProduct.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Printer, Download, Edit2, User,
  Calendar, CheckCircle, XCircle, AlertCircle, Loader,
  Package, FileText, RefreshCw, UserCheck, Tag,
  Clock, Mail, Building, Hash
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewProduct = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchProductDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
      } else {
        setError(data.message || 'Failed to fetch product details');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProductDetails();
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

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

  const getStatusDetails = (isActive) => {
    if (isActive) {
      return { 
        icon: CheckCircle, 
        color: '#2E7D32', 
        bg: '#E8F5E9', 
        label: 'Active',
        border: '#C8E6C9'
      };
    } else {
      return { 
        icon: XCircle, 
        color: '#D32F2F', 
        bg: '#FFEBEE', 
        label: 'Inactive',
        border: '#FFCDD2'
      };
    }
  };

  if (loading && !product) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading product details...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error || 'Product not found'}</p>
          <button 
            onClick={() => navigate('/products')} 
            className="mt-4 px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const statusDetails = getStatusDetails(product.isActive);
  const StatusIcon = statusDetails.icon;

  return (
    <div className=" mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-all"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>
              Product Details
            </h1>
          
          </div>
        </div>
       
      </div>

      {/* Product Status Banner */}
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden"
        style={{ borderLeft: '4px solid #2E7D32' }}
      >
        <div className="p-5 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: '#E8F5E9' }}
            >
              <Package className="w-6 h-6" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>Product Status</p>
              <p className="text-xl font-bold" style={{ color: '#1B5E20' }}>{product.productName}</p>
            </div>
          </div>
          <div className="text-right">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
              style={{ background: statusDetails.bg, color: statusDetails.color, borderColor: statusDetails.border }}
            >
              <StatusIcon className="w-4 h-4" />
              {statusDetails.label}
            </span>
          </div>
        </div>
      </div>

      {/* Product Information Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" style={{ color: '#2E7D32' }} />
            <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>Product Information</h3>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Product Name</p>
              <p className="text-base font-semibold mt-1" style={{ color: '#1B5E20' }}>
                <Package className="w-3.5 h-3.5 inline mr-1" style={{ color: '#A5D6A7' }} />
                {product.productName}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Description</p>
              <p className="text-base mt-1" style={{ color: '#5D4037' }}>
                {product.description || 'No description provided'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Created By Information Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: '#E8F5E9' }}>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" style={{ color: '#2E7D32' }} />
            <h3 className="font-semibold text-lg" style={{ color: '#1B5E20' }}>Created By Information</h3>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Created By</p>
              <p className="text-base font-semibold mt-1" style={{ color: '#1B5E20' }}>
                <UserCheck className="w-3.5 h-3.5 inline mr-1" style={{ color: '#A5D6A7' }} />
                {product.createdBy?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Email</p>
              <p className="text-base mt-1" style={{ color: '#1B5E20' }}>
                <Mail className="w-3.5 h-3.5 inline mr-1" style={{ color: '#A5D6A7' }} />
                {product.createdBy?.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Created Date</p>
              <p className="text-base mt-1" style={{ color: '#1B5E20' }}>
                <Calendar className="w-3.5 h-3.5 inline mr-1" style={{ color: '#A5D6A7' }} />
                {formatDate(product.createdAt)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#A5D6A7' }}>
                {formatDateTime(product.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

     

      {/* Update Information */}
      {product.updatedAt && product.updatedAt !== product.createdAt && (
        <div className="text-center text-xs" style={{ color: '#A5D6A7' }}>
          Last updated: {formatDateTime(product.updatedAt)}
        </div>
      )}
    </div>
  );
};

export default ViewProduct;
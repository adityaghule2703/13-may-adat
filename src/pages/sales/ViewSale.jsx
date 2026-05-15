// src/pages/sales/ViewSale.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Printer, Download, User, Calendar, 
  Package, DollarSign, Phone, FileText, Loader, 
  AlertCircle, CreditCard, Hash, Percent, Building2,
  Truck, Wrench, TrendingDown, Warehouse, Receipt,
  CheckCircle, XCircle, Clock, UserCheck, IndianRupee
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewSale = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchSaleDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/sales/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) setSale(data.data);
      else setError(data.message || t('sales.errors.fetchFailed'));
    } catch (error) {
      console.error('Error fetching sale:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSaleDetails(); }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'completed':
        return { bg: '#E8F5E9', text: '#2E7D32', label: t('sales.status.completed'), icon: CheckCircle };
      case 'partial':
        return { bg: '#FFF3E0', text: '#E65100', label: t('sales.status.partial'), icon: Clock };
      case 'pending':
        return { bg: '#FFF8E1', text: '#F57C00', label: t('sales.status.pending'), icon: AlertCircle };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', label: status || t('sales.status.unknown'), icon: AlertCircle };
    }
  };

  const getCommissionTypeLabel = (type) => {
    return type === 'percent' ? t('sales.commissionTypes.percent') : t('sales.commissionTypes.fixed');
  };

  const formatQuantityDisplay = (line) => {
    if (line.pricingType === 'kg') {
      if (line.bags && line.bags > 0 && line.weightPerBag && line.weightPerBag > 0) {
        return `${line.bags} ${t('sales.bags')} × ${line.weightPerBag}kg = ${line.billedQty || line.actualQty}kg`;
      }
      return `${line.actualQty || 0} kg`;
    } else if (line.pricingType === 'quintal') {
      return `${line.actualQty || 0} ${t('sales.pricingTypes.quintal')} = ${(line.actualQty || 0) * 100} kg`;
    } else if (line.pricingType === 'ton') {
      return `${line.actualQty || 0} ${t('sales.pricingTypes.ton')} = ${(line.actualQty || 0) * 1000} kg`;
    } else if (line.pricingType === 'bag') {
      return `${line.bags || 0} ${t('sales.bags')}`;
    }
    return `${line.actualQty || 0} ${line.unit || line.pricingType || t('sales.units')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error || t('sales.errors.notFound')}</p>
          <button 
            onClick={() => navigate('/sales')} 
            className="mt-4 px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors"
          >
            {t('common.backToList')}
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(sale.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales')}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-all"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>
              {t('sales.viewTitle')}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#8D6E63' }}>
              {t('sales.table.invoiceNo')}: {sale.invoiceNumber}
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)', color: 'white' }}
        >
          <Printer className="w-4 h-4" />
          {t('sales.buttons.printInvoice')}
        </button>
      </div>

      {/* Status Banner */}
      <div
        className="bg-white rounded-xl shadow-sm overflow-hidden"
        style={{ borderLeft: `4px solid ${statusConfig.text}` }}
      >
        <div className="p-5 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: statusConfig.bg }}
            >
              <StatusIcon className="w-6 h-6" style={{ color: statusConfig.text }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: statusConfig.text }}>{t('sales.saleStatus')}</p>
              <p className="text-xl font-bold" style={{ color: '#1B5E20' }}>{statusConfig.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('sales.finalReceivable')}</p>
            <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>
              {formatCurrency(sale.finalReceivable || sale.grandTotal || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Buyer & Sale Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('sales.buyerInformation')}</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('sales.buyerName')}</p>
              <p className="text-base font-semibold" style={{ color: '#2E7D32' }}>{sale.buyer?.displayName || sale.buyer?.name || sale.buyerName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('sales.mobileNumber')}</p>
              <p className="text-base flex items-center gap-2"><Phone className="w-4 h-4" style={{ color: '#8D6E63' }} />{sale.buyer?.mobile || sale.buyerMobile || 'N/A'}</p>
            </div>
            {sale.buyer?.address && (
              <div>
                <p className="text-xs text-gray-500 mb-1">{t('sales.address')}</p>
                <p className="text-sm" style={{ color: '#5D4037' }}>{sale.buyer.fullAddress || sale.buyer.address}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('sales.saleInformation')}</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('sales.table.invoiceNo')}</p>
              <p className="text-base font-semibold" style={{ color: '#2E7D32' }}>{sale.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('sales.saleDate')}</p>
              <p className="text-base" style={{ color: '#5D4037' }}>{formatDate(sale.saleDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('sales.paymentStatus')}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-1 rounded-full inline-flex items-center gap-1" style={{ background: statusConfig.bg, color: statusConfig.text }}>
                  <StatusIcon className="w-3 h-3" />{statusConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" style={{ color: '#FFFFFF' }} />
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('sales.productsSold')}</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E8F5E9' }}>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>{t('sales.table.product')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>{t('sales.quantityDetails')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>{t('sales.table.rate')}</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>{t('sales.table.total')}</th>
              </tr>
            </thead>
            <tbody>
              {sale.lines?.map((line, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-green-50 transition-colors">
                  <td className="px-6 py-4"><span className="text-sm" style={{ color: '#5D4037' }}>{idx + 1}</span></td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm" style={{ color: '#2E7D32' }}>{line.productName}</p>
                    {line.notes && <p className="text-xs mt-1" style={{ color: '#8D6E63' }}>{line.notes}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: '#5D4037' }}>{formatQuantityDisplay(line)}</span>
                    {line.qualityDeduction > 0 && <p className="text-xs mt-1" style={{ color: '#D32F2F' }}>{t('sales.qualityDeduction')}: {line.qualityDeduction} kg</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{formatCurrency(line.rate || line.sellingPrice)}/{line.pricingType === 'kg' ? 'kg' : line.pricingType === 'quintal' ? t('sales.pricingTypes.quintal') : line.pricingType === 'ton' ? t('sales.pricingTypes.ton') : line.pricingType || t('sales.unit')}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-sm" style={{ color: '#FF6F00' }}>{formatCurrency(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary - Corrected Sequence */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-base font-bold mb-4 uppercase tracking-wider" style={{ color: '#1B5E20' }}>{t('sales.financialSummary')}</h3>
        <div className="space-y-3">
          {/* 1. Gross Total */}
          <div className="flex justify-between py-2 border-b border-green-200">
            <span className="text-sm" style={{ color: '#5D4037' }}>{t('sales.grossTotal')}</span>
            <span className="text-sm font-semibold">{formatCurrency(sale.grossTotal || sale.subTotal || 0)}</span>
          </div>
          
          {/* 2. Total Deductions */}
          {sale.totalDeductions > 0 && (
            <div className="flex justify-between py-2 border-b border-green-200">
              <span className="text-sm" style={{ color: '#5D4037' }}>{t('sales.totalDeductions')}</span>
              <span className="text-sm font-semibold text-red-600">- {formatCurrency(sale.totalDeductions)}</span>
            </div>
          )}
          
          {/* 3. Final Receivable (Gross Total - Deductions) */}
          <div className="flex justify-between py-3 bg-white rounded-lg px-4 -mx-4 mt-2 border-l-4" style={{ borderLeftColor: '#2E7D32' }}>
            <span className="text-base font-bold" style={{ color: '#1B5E20' }}>{t('sales.finalReceivable')}</span>
            <span className="text-xl font-bold" style={{ color: '#2E7D32' }}>{formatCurrency(sale.finalReceivable || sale.grandTotal || 0)}</span>
          </div>
          
          {/* 4. Amount Received */}
          <div className="flex justify-between py-2 border-b border-green-200">
            <span className="text-sm" style={{ color: '#5D4037' }}>{t('sales.amountReceived')}</span>
            <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{formatCurrency(sale.amountReceived || 0)}</span>
          </div>
          
          {/* 5. Amount Due (Final Receivable - Amount Received) */}
          <div className="flex justify-between py-2">
            <span className="text-sm font-semibold" style={{ color: '#5D4037' }}>{t('sales.amountDue')}</span>
            <span className="text-base font-bold" style={{ color: sale.amountDue > 0 ? '#E65100' : '#2E7D32' }}>
              {formatCurrency(sale.amountDue || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {sale.notes && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('common.notes')}</h2>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm" style={{ color: '#5D4037' }}>{sale.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSale;
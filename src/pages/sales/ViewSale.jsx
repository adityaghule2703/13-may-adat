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
      else setError(data.message || 'Failed to fetch sale details');
    } catch (error) {
      console.error('Error fetching sale:', error);
      setError('Network error. Please check your connection.');
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
        return { bg: '#E8F5E9', text: '#2E7D32', label: 'Completed', icon: CheckCircle };
      case 'partial':
        return { bg: '#FFF3E0', text: '#E65100', label: 'Partial Payment', icon: Clock };
      case 'pending':
        return { bg: '#FFF8E1', text: '#F57C00', label: 'Pending', icon: AlertCircle };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', label: status || 'Unknown', icon: AlertCircle };
    }
  };

  const getCommissionTypeLabel = (type) => {
    return type === 'percent' ? 'Percentage' : 'Fixed Amount';
  };

  // Format quantity display based on pricing type
  const formatQuantityDisplay = (line) => {
    if (line.pricingType === 'kg') {
      if (line.bags && line.bags > 0 && line.weightPerBag && line.weightPerBag > 0) {
        return `${line.bags} bags × ${line.weightPerBag}kg = ${line.billedQty || line.actualQty}kg`;
      }
      return `${line.actualQty || 0} kg`;
    } else if (line.pricingType === 'quintal') {
      return `${line.actualQty || 0} quintal = ${(line.actualQty || 0) * 100} kg`;
    } else if (line.pricingType === 'ton') {
      return `${line.actualQty || 0} ton = ${(line.actualQty || 0) * 1000} kg`;
    } else if (line.pricingType === 'bag') {
      return `${line.bags || 0} bags`;
    }
    return `${line.actualQty || 0} ${line.unit || line.pricingType || 'units'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading sale details...</span>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error || 'Sale not found'}</p>
          <button 
            onClick={() => navigate('/sales')} 
            className="mt-4 px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors"
          >
            Back to Sales
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(sale.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className=" mx-auto space-y-6">
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
              Sale Details
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#8D6E63' }}>
              Invoice: {sale.invoiceNumber}
            </p>
          </div>
        </div>
     
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
              <p className="text-sm font-medium" style={{ color: statusConfig.text }}>Sale Status</p>
              <p className="text-xl font-bold" style={{ color: '#1B5E20' }}>{statusConfig.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: '#8D6E63' }}>Final Receivable</p>
            <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>
              {formatCurrency(sale.finalReceivable || sale.grandTotal || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Buyer & Sale Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buyer Information Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
                Buyer Information
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Buyer Name</p>
              <p className="text-base font-semibold" style={{ color: '#2E7D32' }}>
                {sale.buyer?.displayName || sale.buyer?.name || sale.buyerName || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
              <p className="text-base flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: '#8D6E63' }} />
                {sale.buyer?.mobile || sale.buyerMobile || 'N/A'}
              </p>
            </div>
            {sale.buyer?.address && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <p className="text-sm" style={{ color: '#5D4037' }}>
                  {sale.buyer.fullAddress || sale.buyer.address}
                </p>
              </div>
            )}
            {sale.buyerGst && (
              <div>
                <p className="text-xs text-gray-500 mb-1">GST Number</p>
                <p className="text-sm" style={{ color: '#5D4037' }}>{sale.buyerGst}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sale Information Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
                Sale Information
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
              <p className="text-base font-semibold" style={{ color: '#2E7D32' }}>{sale.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Sale Date</p>
              <p className="text-base" style={{ color: '#5D4037' }}>{formatDate(sale.saleDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Payment Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs px-2 py-1 rounded-full inline-flex items-center gap-1"
                  style={{ background: statusConfig.bg, color: statusConfig.text }}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
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
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
              Products Sold
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E8F5E9' }}>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Quantity Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Rate</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#5D4037' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.lines?.map((line, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-green-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: '#5D4037' }}>{idx + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm" style={{ color: '#2E7D32' }}>{line.productName}</p>
                    {line.notes && (
                      <p className="text-xs mt-1" style={{ color: '#8D6E63' }}>{line.notes}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: '#5D4037' }}>{formatQuantityDisplay(line)}</span>
                    {line.qualityDeduction > 0 && (
                      <p className="text-xs mt-1" style={{ color: '#D32F2F' }}>
                        Quality deduction: {line.qualityDeduction} kg
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">
                      {formatCurrency(line.rate || line.sellingPrice)}/{line.pricingType === 'kg' ? 'kg' : line.pricingType === 'quintal' ? 'quintal' : line.pricingType === 'ton' ? 'ton' : line.pricingType || 'unit'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-sm" style={{ color: '#FF6F00' }}>
                    {formatCurrency(line.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deductions Section */}
      {(sale.deductions && Object.values(sale.deductions).some(v => v > 0)) && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
                Deductions & Charges
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sale.deductions.transport > 0 && (
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: '#FFF3E0' }}>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" style={{ color: '#E65100' }} />
                    <span className="text-sm">Transport</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#E65100' }}>
                    {formatCurrency(sale.deductions.transport)}
                  </span>
                </div>
              )}
              {sale.deductions.labour > 0 && (
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: '#E8F5E9' }}>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" style={{ color: '#2E7D32' }} />
                    <span className="text-sm">Labour</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>
                    {formatCurrency(sale.deductions.labour)}
                  </span>
                </div>
              )}
              {sale.deductions.commission > 0 && (
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: '#E3F2FD' }}>
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4" style={{ color: '#1565C0' }} />
                    <span className="text-sm">
                      Commission ({getCommissionTypeLabel(sale.deductions.commissionType)})
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#1565C0' }}>
                    {sale.deductions.commissionType === 'percent' 
                      ? `${sale.deductions.commission}%`
                      : formatCurrency(sale.deductions.commission)}
                  </span>
                </div>
              )}
              {sale.deductions.storage > 0 && (
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: '#F3E5F5' }}>
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4" style={{ color: '#7B1FA2' }} />
                    <span className="text-sm">Storage</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#7B1FA2' }}>
                    {formatCurrency(sale.deductions.storage)}
                  </span>
                </div>
              )}
              {sale.deductions.advanceAdjusted > 0 && (
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: '#FFEBEE' }}>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" style={{ color: '#D32F2F' }} />
                    <span className="text-sm">Advance Adjusted</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#D32F2F' }}>
                    {formatCurrency(sale.deductions.advanceAdjusted)}
                  </span>
                </div>
              )}
              {sale.deductions.returnDeduction > 0 && (
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: '#FFF8E1' }}>
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" style={{ color: '#F57C00' }} />
                    <span className="text-sm">Return Deduction</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#F57C00' }}>
                    {formatCurrency(sale.deductions.returnDeduction)}
                  </span>
                </div>
              )}
              {sale.deductions.other > 0 && (
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: '#ECEFF1' }}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: '#607D8B' }} />
                    <span className="text-sm">Other Charges</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#607D8B' }}>
                    {formatCurrency(sale.deductions.other)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-base font-bold mb-4 uppercase tracking-wider" style={{ color: '#1B5E20' }}>
          Financial Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-green-200">
            <span className="text-sm" style={{ color: '#5D4037' }}>Gross Total</span>
            <span className="text-sm font-semibold">{formatCurrency(sale.grossTotal || sale.subTotal || 0)}</span>
          </div>
          {sale.totalDeductions > 0 && (
            <div className="flex justify-between py-2 border-b border-green-200">
              <span className="text-sm" style={{ color: '#5D4037' }}>Total Deductions</span>
              <span className="text-sm font-semibold text-red-600">- {formatCurrency(sale.totalDeductions)}</span>
            </div>
          )}
          {sale.amountReceived > 0 && (
            <div className="flex justify-between py-2 border-b border-green-200">
              <span className="text-sm" style={{ color: '#5D4037' }}>Amount Received</span>
              <span className="text-sm font-semibold text-green-600">{formatCurrency(sale.amountReceived)}</span>
            </div>
          )}
          {sale.amountDue > 0 && (
            <div className="flex justify-between py-2 border-b border-green-200">
              <span className="text-sm" style={{ color: '#5D4037' }}>Amount Due</span>
              <span className="text-sm font-semibold text-orange-600">{formatCurrency(sale.amountDue)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-white rounded-lg px-4 -mx-4 mt-2">
            <span className="text-base font-bold" style={{ color: '#1B5E20' }}>Final Receivable</span>
            <span className="text-xl font-bold" style={{ color: '#2E7D32' }}>
              {formatCurrency(sale.finalReceivable || sale.grandTotal || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Created By Information */}
      {sale.createdBy && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
                Record Information
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Created By</p>
                <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{sale.createdBy.name}</p>
                <p className="text-xs" style={{ color: '#8D6E63' }}>{sale.createdBy.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Created Date</p>
                <p className="text-sm" style={{ color: '#5D4037' }}>{formatDateTime(sale.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {sale.notes && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
                Additional Notes
              </h2>
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
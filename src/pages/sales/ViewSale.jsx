// src/pages/sales/ViewSale.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Printer, Download, User, Calendar, 
  Package, DollarSign, Phone, FileText, Loader, 
  AlertCircle, CreditCard, Hash, Percent
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewSale = () => {
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
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
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error || 'Sale not found'}</p>
        <button onClick={() => navigate('/sales')} className="mt-4 px-4 py-2 rounded-lg text-white text-sm" style={{ background: '#2E7D32' }}>
          Back to Sales
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sales')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E7D32' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Sale Details</h1>
            <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Invoice: {sale.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border hover:bg-gray-50"
            style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-600">Invoice Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-lg font-semibold text-green-700">Completed</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Grand Total</p>
            <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>{formatCurrency(sale.grandTotal)}</p>
          </div>
        </div>
      </div>

      {/* Buyer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
            <div className="flex items-center gap-2"><User className="w-5 h-5" style={{ color: '#2E7D32' }} /><h2 className="text-lg font-semibold" style={{ color: '#1B5E20' }}>Buyer Information</h2></div>
          </div>
          <div className="p-6">
            <div className="mb-3"><p className="text-xs text-gray-500">Buyer Name</p><p className="text-lg font-semibold text-green-800">{sale.buyerName}</p></div>
            <div className="mb-3"><p className="text-xs text-gray-500">Mobile Number</p><p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{sale.buyerMobile}</p></div>
            {sale.buyerGst && <div><p className="text-xs text-gray-500">GST Number</p><p>{sale.buyerGst}</p></div>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
            <div className="flex items-center gap-2"><Calendar className="w-5 h-5" style={{ color: '#2E7D32' }} /><h2 className="text-lg font-semibold" style={{ color: '#1B5E20' }}>Sale Information</h2></div>
          </div>
          <div className="p-6">
            <div className="mb-3"><p className="text-xs text-gray-500">Invoice Number</p><p className="text-lg font-semibold">{sale.invoiceNumber}</p></div>
            <div className="mb-3"><p className="text-xs text-gray-500">Sale Date</p><p>{formatDate(sale.saleDate)}</p></div>
            <div><p className="text-xs text-gray-500">Payment Mode</p><p className="capitalize">{sale.paymentMode}</p>{sale.referenceNumber && <p className="text-xs text-gray-500 mt-1">Ref: {sale.referenceNumber}</p>}</div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
          <div className="flex items-center gap-2"><Package className="w-5 h-5" style={{ color: '#2E7D32' }} /><h2 className="text-lg font-semibold" style={{ color: '#1B5E20' }}>Products Sold</h2></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #E8F5E9' }}>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.lines?.map((line, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="px-6 py-4"><p className="font-medium text-green-800">{line.productName}</p></td>
                  <td className="px-6 py-4"><span className="text-sm">{line.warehouse}</span></td>
                  <td className="px-6 py-4">{line.qty}</td>
                  <td className="px-6 py-4">{line.unit || 'kg'}</td>
                  <td className="px-6 py-4">{formatCurrency(line.sellingPrice)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-orange-600">{formatCurrency(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-xl font-bold mb-4" style={{ color: '#1B5E20' }}>Financial Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-green-200">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-semibold">{formatCurrency(sale.subTotal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-green-200">
            <span className="text-gray-700">GST ({sale.gstPercent}%)</span>
            <span className="font-semibold">{formatCurrency(sale.gstAmount)}</span>
          </div>
          <div className="flex justify-between py-3 bg-white rounded-lg px-4 -mx-4 mt-2">
            <span className="text-lg font-bold" style={{ color: '#1B5E20' }}>Grand Total</span>
            <span className="text-2xl font-bold" style={{ color: '#2E7D32' }}>{formatCurrency(sale.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {sale.notes && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ background: '#F1F8E9', borderColor: '#C8E6C9' }}>
            <div className="flex items-center gap-2"><FileText className="w-5 h-5" style={{ color: '#2E7D32' }} /><h2 className="text-lg font-semibold" style={{ color: '#1B5E20' }}>Additional Notes</h2></div>
          </div>
          <div className="p-6"><p className="text-gray-700">{sale.notes}</p></div>
        </div>
      )}
    </div>
  );
};

export default ViewSale;
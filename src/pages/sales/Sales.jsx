// src/pages/sales/Sales.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingBag, Search, Filter, Eye, 
  Plus, Download, Loader, AlertCircle,
  Calendar, DollarSign, X,
  Package, FileText, Printer, MoreVertical,
  Building2, User, TrendingDown
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Sales = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [stats, setStats] = useState({
    totalSales: 0,
    totalAmount: 0,
    totalItems: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Action Menu State
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const fetchSales = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const response = await fetch(`${BASE_URL}/sales?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSales(data.data);
        setPagination(data.pagination);
        
        // Calculate stats from current page data
        const totalAmount = data.data.reduce((sum, sale) => sum + (sale.finalReceivable || sale.grandTotal || 0), 0);
        const totalItems = data.data.reduce((sum, sale) => sum + (sale.lines?.length || 0), 0);
        
        setStats({
          totalSales: data.pagination.total || data.data.length,
          totalAmount,
          totalItems
        });
      } else {
        setError(data.message || t('sales.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.startDate, filters.endDate, navigate, t]);

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilters({ startDate: '', endDate: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchSales();
  };

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  // Get buyer display name
  const getBuyerDisplayName = (sale) => {
    if (sale.buyer) {
      return sale.buyer.displayName || sale.buyer.name;
    }
    return sale.buyerName || 'N/A';
  };

  // Get buyer mobile
  const getBuyerMobile = (sale) => {
    if (sale.buyer) {
      return sale.buyer.mobile;
    }
    return sale.buyerMobile || 'N/A';
  };

  // Get status badge configuration
  const getStatusConfig = (status) => {
    switch(status) {
      case 'completed':
        return { bg: '#E8F5E9', text: '#2E7D32', label: 'Completed', icon: '' };
      case 'partial':
        return { bg: '#FFF3E0', text: '#E65100', label: 'Partial', icon: '' };
      case 'pending':
        return { bg: '#FFF8E1', text: '#F57C00', label: 'Pending', icon: '' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', label: status || 'Unknown', icon: '' };
    }
  };

  // Convert number to Marathi digits (keeping for compatibility)
  const toMarathiDigits = (num) => {
    const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().replace(/\d/g, digit => marathiDigits[parseInt(digit)]);
  };

  const numberToIndianWords = (num) => {
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    function convertLessThanThousand(n) {
      if (n === 0) return '';
      if (n < 20) return ones[n];
      if (n < 100) {
        const t = Math.floor(n / 10);
        const o = n % 10;
        return tens[t] + (o ? ' ' + ones[o] : '');
      }
      const h = Math.floor(n / 100);
      const rest = n % 100;
      return ones[h] + ' Hundred' + (rest ? ' ' + convertLessThanThousand(rest) : '');
    }
    
    function convert(n) {
      if (n === 0) return '';
      if (n < 1000) return convertLessThanThousand(n);
      
      if (n < 100000) {
        const th = Math.floor(n / 1000);
        const rest = n % 1000;
        return convertLessThanThousand(th) + ' Thousand' + (rest ? ' ' + convertLessThanThousand(rest) : '');
      }
      
      if (n < 10000000) {
        const l = Math.floor(n / 100000);
        const rest = n % 100000;
        return convertLessThanThousand(l) + ' Lakh' + (rest ? ' ' + convert(rest) : '');
      }
      
      const c = Math.floor(n / 10000000);
      const rest = n % 10000000;
      return convertLessThanThousand(c) + ' Crore' + (rest ? ' ' + convert(rest) : '');
    }
    
    return convert(num);
  };

  const handlePrintInvoice = (sale) => {
    const isMarathi = i18n.language === 'mr';
    
    // Format date
    const saleDate = sale.saleDate ? new Date(sale.saleDate) : new Date();
    const day = saleDate.getDate();
    const month = saleDate.getMonth() + 1;
    const year = saleDate.getFullYear();
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    
    // Format amounts
    const formattedSubTotal = formatNumber(sale.grossTotal || sale.subTotal || 0);
    const formattedTotalDeductions = formatNumber(sale.totalDeductions || 0);
    const formattedFinalReceivable = formatNumber(sale.finalReceivable || sale.grandTotal || 0);
    
    // Get buyer name and mobile
    const buyerName = getBuyerDisplayName(sale);
    const buyerMobile = getBuyerMobile(sale);
    
    // Build items table rows
    const itemsRows = sale.lines?.map((line, idx) => {
      let qtyDisplay = '';
      if (line.pricingType === 'kg') {
        qtyDisplay = `${line.bags || 0} bags × ${line.weightPerBag || 0}kg = ${line.billedQty || line.actualQty || 0}kg`;
      } else if (line.pricingType === 'quintal') {
        qtyDisplay = `${line.actualQty || 0} quintal = ${(line.actualQty || 0) * 100}kg`;
      } else if (line.pricingType === 'ton') {
        qtyDisplay = `${line.actualQty || 0} ton = ${(line.actualQty || 0) * 1000}kg`;
      } else {
        qtyDisplay = `${line.actualQty || 0} ${line.unit || line.pricingType || 'units'}`;
      }
      
      const rate = formatNumber(line.rate || line.sellingPrice || 0);
      const lineTotal = formatNumber(line.lineTotal || 0);
      
      return `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>${line.productName || '-'}</td>
          <td style="text-align: center;">${qtyDisplay}</td>
          <td style="text-align: right;">₹ ${rate}</td>
          <td style="text-align: right;">₹ ${lineTotal}</td>
        </tr>
      `;
    }).join('');
    
    const amountInWords = `${numberToIndianWords(sale.finalReceivable || sale.grandTotal || 0)} Rupees Only`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${isMarathi ? 'mr' : 'en'}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${isMarathi ? 'विक्री पावती' : 'Sales Invoice'} - ${sale.invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: #e5e5e5;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 30px 20px;
            font-family: 'Arial', 'Noto Sans', 'Segoe UI', sans-serif;
          }
          .receipt {
            width: 780px;
            max-width: 100%;
            background: #fff;
            border: 2px solid #b3153f;
            color: #b3153f;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .top-header {
            border-bottom: 2px solid #b3153f;
            padding: 12px 15px 8px;
          }
          .top-line {
            display: flex;
            justify-content: center;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 5px;
            letter-spacing: 1px;
          }
          .title-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
          }
          .center-title {
            flex: 1;
            text-align: center;
            padding: 0 10px;
          }
          .center-title h1 {
            font-size: 38px;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 6px;
            letter-spacing: 1px;
          }
          .sub {
            font-size: 16px;
            font-weight: bold;
          }
          .receipt-badge {
            display: inline-block;
            background: #b3153f;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin-top: 8px;
          }
          .contact-row {
            margin-top: 10px;
            border-top: 2px solid #b3153f;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: bold;
            flex-wrap: wrap;
            gap: 5px;
          }
          .details {
            width: 100%;
            border-collapse: collapse;
            color: #b3153f;
          }
          .details td {
            border-bottom: 2px solid #b3153f;
            padding: 10px 12px;
            height: 50px;
            font-size: 16px;
          }
          .label {
            font-weight: bold;
            white-space: nowrap;
            background: #fff;
            padding-right: 10px;
          }
          .value {
            color: #000;
            font-size: 18px;
            font-weight: 500;
            padding-left: 15px;
          }
          .main-table {
            width: 100%;
            border-collapse: collapse;
            color: #b3153f;
            margin: 5px 0;
          }
          .main-table th,
          .main-table td {
            border: 2px solid #b3153f;
            padding: 10px 8px;
            vertical-align: middle;
          }
          .main-table th {
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            background: #fff5f5;
          }
          .main-table td {
            color: #000;
            font-size: 14px;
          }
          .col1 { width: 6%; text-align: center; }
          .col2 { width: 40%; }
          .col3 { width: 20%; text-align: center; }
          .col4 { width: 17%; text-align: right; }
          .col5 { width: 17%; text-align: right; }
          .total-row td {
            font-weight: bold;
            border-top: 2px solid #b3153f;
          }
          .footer {
            border-top: 2px solid #b3153f;
            margin-top: 5px;
          }
          .refno {
            border-top: 2px solid #b3153f;
            margin-top: 5px;
          }
          .footer-row {
            display: flex;
            border-bottom: 2px solid #b3153f;
            flex-wrap: wrap;
          }
          .footer-left {
            flex: 1;
            padding: 12px 15px;
            font-size: 16px;
            font-weight: bold;
            color: #b3153f;
            min-width: 200px;
          }
          .footer-right {
            width: 280px;
            border-left: 2px solid #b3153f;
            padding: 12px 15px;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            white-space: nowrap;
          }
          .footer-right span {
            color: #000;
            font-size: 22px;
            font-weight: bold;
            display: inline-block;
            margin-left: 5px;
          }
          .signature-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 25px 15px 15px;
            min-height: 130px;
          }
          .buyer-sign {
            font-size: 18px;
            font-weight: bold;
            border-top: 1px dashed #b3153f;
            padding-top: 15px;
            min-width: 180px;
            text-align: center;
          }
          .shop-sign {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            position: relative;
            padding-top: 15px;
            border-top: 1px dashed #b3153f;
            min-width: 200px;
          }
          .sign-mark {
            font-size: 50px;
            font-family: cursive;
            position: absolute;
            top: -40px;
            right: 20px;
            color: #000;
            transform: rotate(-10deg);
          }
          .amount-in-words {
            padding: 8px 15px;
            font-size: 14px;
            background: #fff8f0;
            border-top: 1px solid #b3153f;
            color: #555;
          }
          .refinwords {
            padding: 8px 15px;
          }
          @media print {
            body { 
              background: white; 
              padding: 0;
              margin: 0;
            }
            .receipt {
              box-shadow: none;
              margin: 0;
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="top-header">
            <div class="top-line">
              ${isMarathi ? '॥ कळवणच्या न्यायक्षेत्रात ॥' : '॥ Under Kalwan Jurisdiction ॥'}
            </div>
            <div class="title-section">
              <div class="center-title">
                <h1>${isMarathi ? 'जय शिवराय व्हेजिटेबल' : 'Jai Shivrai Vegetable Co.'}</h1>
                <div class="sub">${isMarathi ? 'वेसराणे, ता. कळवण जि. नाशिक' : 'Vesarane, Tal. Kalwan, Dist. Nashik'}</div>
                <div class="receipt-badge">${isMarathi ? 'विक्री पावती' : 'TAX INVOICE'}</div>
              </div>
            </div>
            <div class="contact-row">
              <div>${isMarathi ? 'प्रो. रोकेश हिरे मो. ९०२१६९९९९१ / ९६२३९५६३९६' : 'Prop. Rakesh Hire M: 9021699991 / 9623956396'}</div>
              <div>${isMarathi ? 'प्रो. स्वजित हिरे मो. ९५६५४५९९९१ / ९९१९९९९९९९' : 'Prop. Swajit Hire M: 9565459991 / 9919999999'}</div>
            </div>
          </div>
          
          <table class="details">
            <tr>
              <td style="width: 60%;">
                <span class="label">${isMarathi ? 'पावती नं.' : 'Invoice No.'}:</span>
                <span class="value">${sale.invoiceNumber}</span>
              </td>
              <td style="width: 40%;">
                <span class="label">${isMarathi ? 'दि.' : 'Date'}:</span>
                <span class="value">${formattedDate}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="label">${isMarathi ? 'खरेदीदार' : 'Buyer Name'}:</span>
                <span class="value">${buyerName}</span>
              </td>
              <td>
                <span class="label">${isMarathi ? 'मो. नं.' : 'Mobile'}:</span>
                <span class="value">${buyerMobile}</span>
              </td>
            </tr>
          </table>
          
          <table class="main-table">
            <colgroup>
              <col class="col1"/>
              <col class="col2"/>
              <col class="col3"/>
              <col class="col4"/>
              <col class="col5"/>
            </colgroup>
            <thead>
              <tr>
                <th>${isMarathi ? 'क्र.' : 'Sr.'}</th>
                <th>${isMarathi ? 'उत्पादन' : 'Product'}</th>
                <th>${isMarathi ? 'प्रमाण' : 'Quantity'}</th>
                <th>${isMarathi ? 'दर (₹)' : 'Rate (₹)'}</th>
                <th>${isMarathi ? 'रक्कम (₹)' : 'Amount (₹)'}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
              <tr class="total-row">
                <td colspan="4" style="text-align: right; font-weight: bold;">${isMarathi ? 'एकूण' : 'Gross Total'}:</td>
                <td style="text-align: right; font-weight: bold;">₹ ${formattedSubTotal}</td>
              </tr>
              ${sale.totalDeductions > 0 ? `
              <tr>
                <td colspan="4" style="text-align: right; font-weight: bold; color: #D32F2F;">${isMarathi ? 'एकूण कपात' : 'Total Deductions'}:</td>
                <td style="text-align: right; font-weight: bold; color: #D32F2F;">- ₹ ${formattedTotalDeductions}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td colspan="4" style="text-align: right; font-weight: bold; color: #b3153f;">${isMarathi ? 'अंतिम देय रक्कम' : 'Final Receivable'}:</td>
                <td style="text-align: right; font-weight: bold; color: #b3153f; font-size: 18px;">₹ ${formattedFinalReceivable}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <div class="amount-in-words">
              <strong>${isMarathi ? 'अक्षरी रुपये' : 'Amount in Words'}:</strong> ${amountInWords}
            </div>
            
            ${sale.notes ? `
            <div class="refno">
              <div class="refinwords">
                <strong>${isMarathi ? 'नोंद' : 'Notes'}:</strong> ${sale.notes}
              </div>
            </div>
            ` : ''}
            
            <div class="footer-row">
              <div class="footer-left">
                ${isMarathi ? 'धन्यवाद!' : 'Thank You!'}
              </div>
              <div class="footer-right">
                ${isMarathi ? 'एकूण रक्कम' : 'Total Amount'}:
                <span>₹ ${formattedFinalReceivable}</span>
              </div>
            </div>
            <div class="signature-row">
              <div class="buyer-sign">
                ${isMarathi ? 'खरेदीदाराची सही' : "Buyer's Signature"}
              </div>
              <div class="shop-sign" oncontextmenu="return false;">
                <div class="sign-mark">✓</div>
                ${isMarathi ? 'जय शिवराय व्हेजिटेबल कळवण' : 'Jai Shivrai Vegetable Co., Kalwan'}
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleViewDetails = (saleId) => {
    navigate(`/sales/view/${saleId}`);
  };

  const handleActionMenuOpen = (event, sale) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedSale(sale);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedSale(null);
  };

  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const MENU_HEIGHT = 120;
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  if (loading && sales.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('sales.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('sales.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('sales.subtitle')}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('sales.stats.totalSales')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalSales}</p>
            </div>
            <ShoppingBag className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('sales.stats.totalRevenue')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.totalAmount)}</p>
            </div>
            <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('sales.stats.itemsSold')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{stats.totalItems}</p>
            </div>
            <Package className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchSales} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
              <input
                type="text"
                placeholder={t('sales.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1"
                style={{ borderColor: '#C8E6C9' }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <X className="w-4 h-4" style={{ color: '#8D6E63' }} />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-[#F1F8E9]' : 'hover:bg-gray-50'}`}
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
            >
              <Filter className="w-4 h-4" />
              {t('common.filter')}
              {(filters.startDate || filters.endDate) && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
            <button 
              onClick={() => navigate('/sales/add')}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <Plus className="w-4 h-4" />
              {t('sales.buttons.newSale')}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('sales.filters.startDate')}</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('sales.filters.endDate')}</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={clearFilters}
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                {t('common.clearAll')}
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-1 rounded-lg text-white text-sm"
                style={{ background: '#2E7D32' }}
              >
                {t('common.apply')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('sales.noSalesFound')}</p>
            {(searchTerm || filters.startDate || filters.endDate) && (
              <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
                {t('common.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('sales.table.invoiceNo')}</th>
                   
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('sales.table.buyer')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('sales.table.items')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('sales.table.grossTotal')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('sales.table.deductions')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('sales.table.finalReceivable')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('sales.table.status')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('sales.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, index) => {
                    const statusConfig = getStatusConfig(sale.status);
                    const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedSale?._id === sale._id;
                    return (
                      <tr 
                        key={sale._id} 
                        className="hover:bg-green-50 transition-colors"
                        style={{ 
                          borderBottom: index !== sales.length - 1 ? '1px solid #E8F5E9' : 'none'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>{sale.invoiceNumber}</span>
                          </div>
                        </td>
                       
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{getBuyerDisplayName(sale)}</p>
                            <p className="text-xs" style={{ color: '#8D6E63' }}>{getBuyerMobile(sale)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm" style={{ color: '#5D4037' }}>{sale.lines?.length || 0} {t('sales.items')}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{formatCurrency(sale.grossTotal || sale.subTotal || 0)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm" style={{ color: sale.totalDeductions > 0 ? '#D32F2F' : '#8D6E63' }}>
                            {sale.totalDeductions > 0 ? formatCurrency(sale.totalDeductions) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold" style={{ color: '#FF6F00' }}>{formatCurrency(sale.finalReceivable || sale.grandTotal || 0)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="text-xs px-2 py-1 rounded-full inline-flex items-center gap-1"
                            style={{ background: statusConfig.bg, color: statusConfig.text }}
                          >
                            <span>{statusConfig.icon}</span>
                            <span>{statusConfig.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => handleViewDetails(sale._id)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors" 
                              title={t('common.viewDetails')}
                            >
                              <Eye className="w-4 h-4" style={{ color: '#2E7D32' }} />
                            </button>
                            <button 
                              onClick={(e) => handleActionMenuOpen(e, sale)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1" 
                              style={{ color: '#2E7D32' }}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                          {isActionMenuOpen && anchorRect && (
                            <div 
                              className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
                              style={{ 
                                borderColor: '#E8F5E9', 
                                width: '160px',
                                position: 'fixed', 
                                top: openUpward ? anchorRect.top - MENU_HEIGHT - 4 : anchorRect.bottom + 4,
                                left: anchorRect.left - 80
                              }}
                            >
                              <button 
                                onClick={() => {
                                  handlePrintInvoice(sale);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#1565C0' }}
                              >
                                <Printer className="w-4 h-4" />
                                {t('sales.buttons.printInvoice')}
                              </button>
                              <button 
                                onClick={() => {
                                  handleViewDetails(sale._id);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors border-t"
                                style={{ color: '#2E7D32', borderColor: '#E8F5E9' }}
                              >
                                <Eye className="w-4 h-4" />
                                {t('common.viewDetails')}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Server-side Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                <div className="text-xs" style={{ color: '#8D6E63' }}>
                  {t('sales.pagination.showing', {
                    start: (pagination.page - 1) * pagination.limit + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    {t('common.previous')}
                  </button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination({ ...pagination, page: pageNum })}
                          className="w-8 h-8 rounded border text-sm transition-all"
                          style={{
                            borderColor: '#C8E6C9',
                            background: pagination.page === pageNum ? '#2E7D32' : 'white',
                            color: pagination.page === pageNum ? 'white' : '#2E7D32'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Global Backdrop for Action Menu */}
      {Boolean(actionMenuAnchor) && (
        <div className="fixed inset-0 z-40" onClick={handleActionMenuClose} style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }} />
      )}
    </div>
  );
};

export default Sales;
// src/pages/sales/SalePayments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, Search, Filter, Eye, 
  Download, Loader, AlertCircle,
  Calendar, DollarSign, X,
  Wallet, User, Phone, Building,
  TrendingUp, CheckCircle, XCircle, Clock,
  MoreVertical, Printer, RefreshCw, Plus, FileText
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const SalePayments = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalPayments: 0,
    avgAmount: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentMode: 'all'
  });
  
  // Action Menu State
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Payment modes
  const paymentModes = [
    { value: 'all', label: 'All' },
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' }
  ];

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

  const fetchPayments = useCallback(async () => {
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
      if (filters.paymentMode !== 'all') queryParams.append('paymentMode', filters.paymentMode);
      
      const response = await fetch(`${BASE_URL}/sale-payments?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setPayments(data.data);
        setPagination(data.pagination);
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        setError(data.message || 'Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.startDate, filters.endDate, filters.paymentMode, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilters({ startDate: '', endDate: '', paymentMode: 'all' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchPayments();
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
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
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Convert number to Marathi digits
  const toMarathiDigits = (num) => {
    const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().replace(/\d/g, digit => marathiDigits[parseInt(digit)]);
  };

  // Convert number to Indian English words
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

  const handlePrintReceipt = (payment) => {
    const isMarathi = i18n.language === 'mr';
    
    // Format date from API response
    const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : new Date();
    const day = paymentDate.getDate();
    const month = paymentDate.getMonth() + 1;
    const year = paymentDate.getFullYear();
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    
    // Format amount with commas
    const formattedAmount = new Intl.NumberFormat('en-IN').format(payment.amount || 0);
    
    // Get buyer details
    const buyerName = payment.buyer?.displayName || payment.buyer?.name || 'N/A';
    const buyerVillage = payment.buyer?.village || payment.buyer?.city || '—';
    const buyerMobile = payment.buyer?.mobile || '';
    const buyerGst = payment.buyer?.gstNumber || '';
    
    // Get sale details
    const invoiceNumber = payment.sale?.invoiceNumber || `SALE-${payment._id?.slice(-6)}`;
    const totalAmount = payment.sale?.totalAmount || payment.amount || 0;
    const amountPaid = payment.amount || 0;
    const amountDue = payment.sale?.amountDue || 0;
    
    // Get payment mode display text
    const getPaymentModeText = () => {
      switch(payment.paymentMode) {
        case 'cash': return isMarathi ? 'रोख' : 'Cash';
        case 'upi': return isMarathi ? 'यूपीआय' : 'UPI';
        case 'bank': return isMarathi ? 'बँक ट्रान्सफर' : 'Bank Transfer';
        case 'cheque': return isMarathi ? 'चेक' : 'Cheque';
        default: return payment.paymentMode || (isMarathi ? 'इतर' : 'Other');
      }
    };
    
    // Get payment mode extra info
    const getPaymentExtraInfo = () => {
      switch(payment.paymentMode) {
        case 'cash':
          return '';
        case 'upi':
          return `${isMarathi ? 'संदर्भ क्रमांक' : 'Ref No.'}: ${payment.referenceNumber || '—'}`;
        case 'bank':
          return `${isMarathi ? 'बँक नाव' : 'Bank'}: ${payment.bankName || '—'} | ${isMarathi ? 'संदर्भ क्रमांक' : 'Ref No.'}: ${payment.referenceNumber || '—'}`;
        case 'cheque':
          const chequeDate = payment.chequeDate ? new Date(payment.chequeDate) : null;
          const formattedChequeDate = chequeDate ? `${chequeDate.getDate().toString().padStart(2, '0')}/${(chequeDate.getMonth() + 1).toString().padStart(2, '0')}/${chequeDate.getFullYear()}` : '—';
          const chequeStatusMap = {
            'pending_clearance': isMarathi ? 'प्रलंबित' : 'Pending',
            'cleared': isMarathi ? 'क्लियर' : 'Cleared',
            'bounced': isMarathi ? 'बाउन्स' : 'Bounced'
          };
          return `${isMarathi ? 'चेक क्र.' : 'Cheque No.'}: ${payment.chequeNumber || '—'} | ${isMarathi ? 'चेक तारीख' : 'Cheque Date'}: ${formattedChequeDate} | ${isMarathi ? 'बँक' : 'Bank'}: ${payment.bankName || '—'} | ${isMarathi ? 'स्थिती' : 'Status'}: ${chequeStatusMap[payment.chequeStatus] || (isMarathi ? 'प्रलंबित' : 'Pending')}`;
        default:
          return '';
      }
    };
    
    const paymentModeText = getPaymentModeText();
    const paymentExtraInfo = getPaymentExtraInfo();
    
    // Determine payment status display
    const getStatusDisplay = () => {
      if (amountDue === 0) {
        return {
          text: isMarathi ? 'पूर्ण भरले' : 'Fully Paid',
          color: '#2E7D32',
          bg: '#E8F5E9'
        };
      } else if (amountPaid > 0) {
        return {
          text: isMarathi ? 'अंशतः भरले' : 'Partially Paid',
          color: '#FF6F00',
          bg: '#FFF3E0'
        };
      } else {
        return {
          text: isMarathi ? 'प्रलंबित' : 'Pending',
          color: '#D32F2F',
          bg: '#FFEBEE'
        };
      }
    };
    
    const statusDisplay = getStatusDisplay();
    const remainingAmount = amountDue;
    
    const amountInWords = `${numberToIndianWords(payment.amount)} ${isMarathi ? 'रुपये फक्त' : 'Rupees Only'}`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${isMarathi ? 'mr' : 'en'}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${isMarathi ? 'पेमेंट पावती' : 'Payment Receipt'} - ${invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
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
          /* HEADER */
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
          /* DETAILS TABLE */
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
            position: relative;
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
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            background: ${statusDisplay.bg};
            color: ${statusDisplay.color};
          }
          /* MAIN TABLE */
          .main-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            color: #b3153f;
            margin: 5px 0;
          }
          .main-table th,
          .main-table td {
            border: 2px solid #b3153f;
            padding: 12px 10px;
            vertical-align: middle;
          }
          .main-table th {
            text-align: center;
            font-weight: bold;
            font-size: 18px;
            background: #fff5f5;
          }
          .main-table td {
            color: #000;
            font-size: 16px;
          }
          .col1 { width: 8%; text-align: center; }
          .col2 { width: 42%; }
          .col3 { width: 15%; text-align: right; }
          .col4 { width: 20%; text-align: right; }
          .col5 { width: 15%; text-align: center; }
          .total-row td {
            font-weight: bold;
            border-top: 2px solid #b3153f;
          }
          .payment-row td {
            background: #fff8f0;
          }
          /* FOOTER */
          .footer {
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
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
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
          .payment-summary {
            padding: 10px 15px;
            background: #f9f9f9;
            border-top: 1px solid #b3153f;
            font-size: 14px;
          }
          .payment-summary p {
            margin: 5px 0;
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
          <!-- HEADER -->
          <div class="top-header">
            <div class="top-line">
              ${isMarathi ? '॥ कळवणच्या न्यायक्षेत्रात ॥' : '॥ Under Kalwan Jurisdiction ॥'}
            </div>
            <div class="title-section">
              <div class="center-title">
                <h1>${isMarathi ? 'जय शिवराय व्हेजिटेबल' : 'Jai Shivrai Vegetable Co.'}</h1>
                <div class="sub">${isMarathi ? 'वेसराणे, ता. कळवण जि. नाशिक' : 'Vesarane, Tal. Kalwan, Dist. Nashik'}</div>
                <div class="receipt-badge">${isMarathi ? 'पेमेंट पावती' : 'PAYMENT RECEIPT'}</div>
              </div>
            </div>
            <div class="contact-row">
              <div>${isMarathi ? 'प्रो. रोकेश हिरे मो. ९०२१६९९९९१ / ९६२३९५६३९६' : 'Prop. Rakesh Hire M: 9021699991 / 9623956396'}</div>
              <div>${isMarathi ? 'प्रो. स्वजित हिरे मो. ९५६५४५९९९१ / ९९१९९९९९९९' : 'Prop. Swajit Hire M: 9565459991 / 9919999999'}</div>
            </div>
          </div>
          
          <!-- DETAILS -->
          <table class="details">
            <tr>
              <td style="width: 60%;">
                <span class="label">${isMarathi ? 'पावती नं.' : 'Receipt No.'}:</span>
                <span class="value">${invoiceNumber}</span>
              </td>
              <td style="width: 40%;">
                <span class="label">${isMarathi ? 'दि.' : 'Date'}:</span>
                <span class="value">${formattedDate}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="label">${isMarathi ? 'श्रीमान' : 'Buyer Name'}:</span>
                <span class="value">${buyerName}</span>
              </td>
              <td>
                <span class="label">${isMarathi ? 'मो. नं.' : 'Mobile'}:</span>
                <span class="value">${buyerMobile}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="label">${isMarathi ? 'गाव' : 'Village'}:</span>
                <span class="value">${buyerVillage}</span>
              </td>
              <td style="text-align: right;">
                ${buyerGst ? `<span class="label">${isMarathi ? 'जीएसटी' : 'GST'}:</span> <span class="value">${buyerGst}</span>` : ''}
              </td>
            </tr>
          </table>
          
          <!-- MAIN TABLE -->
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
                <th>${isMarathi ? 'तपशील' : 'Description'}</th>
                <th>${isMarathi ? 'भाव' : 'Rate'}</th>
                <th>${isMarathi ? 'रक्कम' : 'Amount'}</th>
                <th>${isMarathi ? 'स्थिती' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="total-row">
                <td colspan="3" style="text-align: right; font-weight: bold;">${isMarathi ? 'एकूण बिल रक्कम' : 'Total Bill Amount'}:</td>
                <td style="text-align: right; font-weight: bold;">₹ ${new Intl.NumberFormat('en-IN').format(totalAmount)}</td>
                <td style="text-align: center;">—</td>
              </tr>
              <tr class="payment-row">
                <td colspan="3" style="text-align: right; font-weight: bold; color: #b3153f;">${isMarathi ? 'आजचे पेमेंट' : "Today's Payment"}:</td>
                <td style="text-align: right; font-weight: bold; color: #b3153f; font-size: 20px;">₹ ${formattedAmount}</td>
                <td style="text-align: center;">
                  <span style="display: inline-block; width: 20px; height: 20px; background: #4CAF50; border-radius: 50%; color: white; line-height: 20px;">✓</span>
                </td>
              </tr>
              ${remainingAmount > 0 ? `
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold; color: #FF6F00;">${isMarathi ? 'उर्वरित रक्कम' : 'Remaining Amount'}:</td>
                <td style="text-align: right; font-weight: bold; color: #FF6F00;">₹ ${new Intl.NumberFormat('en-IN').format(remainingAmount)}</td>
                <td style="text-align: center;">${isMarathi ? 'बाकी' : 'Due'}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>
          
          <!-- FOOTER -->
          <div class="footer">
            <div class="amount-in-words">
              <strong>${isMarathi ? 'अक्षरी रुपये' : 'Amount in Words'}:</strong> ${amountInWords}
            </div>
            
            ${remainingAmount > 0 ? `
            <div class="payment-summary">
              <p><strong>${isMarathi ? 'पेमेंट सारांश' : 'Payment Summary'}:</strong></p>
              <p>• ${isMarathi ? 'एकूण बिल' : 'Total Bill'}: ₹ ${new Intl.NumberFormat('en-IN').format(totalAmount)}</p>
              <p>• ${isMarathi ? 'आजचे पेमेंट' : "Today's Payment"}: ₹ ${formattedAmount}</p>
              <p>• ${isMarathi ? 'पेमेंट पद्धत' : 'Payment Mode'}: ${paymentModeText}</p>
              ${paymentExtraInfo ? `<p>• ${paymentExtraInfo}</p>` : ''}
              <p>• ${isMarathi ? 'उर्वरित रक्कम' : 'Remaining Amount'}: ₹ ${new Intl.NumberFormat('en-IN').format(remainingAmount)}</p>
              <p>• ${isMarathi ? 'स्थिती' : 'Status'}: ${statusDisplay.text}</p>
            </div>
            ` : `
            <div class="payment-summary">
              <p><strong>${isMarathi ? 'पेमेंट सारांश' : 'Payment Summary'}:</strong></p>
              <p>• ${isMarathi ? 'एकूण बिल' : 'Total Bill'}: ₹ ${new Intl.NumberFormat('en-IN').format(totalAmount)}</p>
              <p>• ${isMarathi ? 'एकूण भरले' : 'Total Paid'}: ₹ ${new Intl.NumberFormat('en-IN').format(totalAmount)}</p>
              <p>• ${isMarathi ? 'पेमेंट पद्धत' : 'Payment Mode'}: ${paymentModeText}</p>
              ${paymentExtraInfo ? `<p>• ${paymentExtraInfo}</p>` : ''}
              <p>• ${isMarathi ? 'स्थिती' : 'Status'}: ${isMarathi ? 'पूर्ण भरले' : 'Fully Paid'} ✓</p>
            </div>
            `}
            
            <div class="footer-row">
              <div class="footer-left">
                ${isMarathi ? 'धन्यवाद!' : 'Thank You!'}
              </div>
              <div class="footer-right">
                ${isMarathi ? 'पेमेंट रक्कम' : 'Payment Amount'}:
                <span>₹ ${formattedAmount}</span>
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

  const getPaymentModeDetails = (mode) => {
    switch(mode) {
      case 'cash':
        return { icon: Wallet, color: '#2E7D32', bg: '#E8F5E9', label: 'Cash' };
      case 'upi':
        return { icon: TrendingUp, color: '#1976D2', bg: '#E3F2FD', label: 'UPI' };
      case 'bank':
        return { icon: Building, color: '#F57C00', bg: '#FFF3E0', label: 'Bank Transfer' };
      case 'cheque':
        return { icon: CreditCard, color: '#7B1FA2', bg: '#F3E5F5', label: 'Cheque' };
      default:
        return { icon: CreditCard, color: '#8D6E63', bg: '#FAFAFA', label: mode || 'Other' };
    }
  };

  const getChequeStatusDetails = (status) => {
    if (!status) return null;
    switch(status) {
      case 'cleared':
        return { icon: CheckCircle, color: '#2E7D32', bg: '#E8F5E9', label: 'Cleared' };
      case 'bounced':
        return { icon: XCircle, color: '#D32F2F', bg: '#FFEBEE', label: 'Bounced' };
      default:
        return { icon: Clock, color: '#FF6F00', bg: '#FFF3E0', label: 'Pending' };
    }
  };

  const handleViewDetails = (paymentId) => {
    navigate(`/sale-payments/view/${paymentId}`);
  };

  const handleAddPayment = () => {
    navigate('/sale-payments/add');
  };

  const handleActionMenuOpen = (event, payment) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedPayment(payment);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedPayment(null);
  };

  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const MENU_HEIGHT = 100;
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>Loading payments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>Sale Payments</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>Manage and track all sale payments</p>
        </div>
        <button
          onClick={handleAddPayment}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
        >
          <Plus className="w-4 h-4" />
          Add Payment
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Total Payments</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{summary.totalPayments}</p>
            </div>
            <CreditCard className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Total Amount</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(summary.totalAmount)}</p>
            </div>
            <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>Average Amount</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(summary.avgAmount)}</p>
            </div>
            <Wallet className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchPayments} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
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
                placeholder="Search by invoice number, buyer name, or mobile..."
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
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all"
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-[#F1F8E9]' : 'hover:bg-gray-50'}`}
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filters.startDate || filters.endDate || filters.paymentMode !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
            <button 
              className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all"
              style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Payment Mode</label>
                <select
                  value={filters.paymentMode}
                  onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  {paymentModes.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>End Date</label>
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
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-1 border rounded-lg text-sm"
                style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-1 rounded-lg text-white text-sm"
                style={{ background: '#2E7D32' }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>Loading...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>No payments found</p>
            {(searchTerm || filters.startDate || filters.endDate || filters.paymentMode !== 'all') && (
              <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
                Clear filters
              </button>
            )}
            <button
              onClick={handleAddPayment}
              className="mt-4 px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 mx-auto hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <Plus className="w-4 h-4" />
              Add First Payment
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Buyer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Payment Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Payment Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Created By</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => {
                    const modeDetails = getPaymentModeDetails(payment.paymentMode);
                    const ModeIcon = modeDetails.icon;
                    const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedPayment?._id === payment._id;
                    
                    return (
                      <tr 
                        key={payment._id} 
                        className="hover:bg-green-50 transition-colors"
                        style={{ 
                          borderBottom: index !== payments.length - 1 ? '1px solid #E8F5E9' : 'none'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>
                              {payment.sale?.invoiceNumber || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>
                              {payment.buyer?.displayName || payment.buyer?.name || 'N/A'}
                            </p>
                            <p className="text-xs" style={{ color: '#8D6E63' }}>
                              <Phone className="w-3 h-3 inline mr-1" />
                              {payment.buyer?.mobile || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <span className="text-sm" style={{ color: '#5D4037' }}>{formatDate(payment.paymentDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-bold" style={{ color: '#2E7D32' }}>
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                            style={{ background: modeDetails.bg, color: modeDetails.color }}
                          >
                            <ModeIcon className="w-3 h-3" />
                            {modeDetails.label}
                          </span>
                          {payment.paymentMode === 'cheque' && payment.chequeStatus && (
                            <span className="text-xs ml-2" style={{ color: '#8D6E63' }}>
                              ({payment.chequeStatus})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {payment.referenceNumber && (
                            <span className="text-xs font-mono" style={{ color: '#8D6E63' }}>
                              {payment.referenceNumber.length > 20 
                                ? `${payment.referenceNumber.substring(0, 20)}...`
                                : payment.referenceNumber}
                            </span>
                          )}
                          {payment.paymentMode === 'cheque' && payment.chequeNumber && (
                            <span className="text-xs" style={{ color: '#8D6E63' }}>
                              Chq: {payment.chequeNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm" style={{ color: '#5D4037' }}>{payment.createdBy?.name || 'N/A'}</p>
                          <p className="text-xs" style={{ color: '#A5D6A7' }}>{formatDate(payment.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button 
                            onClick={() => handleViewDetails(payment._id)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors" 
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" style={{ color: '#2E7D32' }} />
                          </button>
                          <button 
                            onClick={(e) => handleActionMenuOpen(e, payment)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all" 
                            style={{ color: '#2E7D32' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Dropdown Menu */}
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
                                  handleViewDetails(payment._id);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#2E7D32' }}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button 
                                onClick={() => {
                                  handlePrintReceipt(payment);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors border-t"
                                style={{ color: '#1565C0', borderColor: '#E8F5E9' }}
                              >
                                <Printer className="w-4 h-4" />
                                Print Receipt
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
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                <div className="text-xs" style={{ color: '#8D6E63' }}>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payments
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}
                  >
                    Previous
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
                    Next
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

export default SalePayments;
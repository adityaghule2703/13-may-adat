// src/pages/payment/Payments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, Search, Filter, Eye, Edit2, 
  Plus, Download, RefreshCw, Loader, AlertCircle,
  Calendar, DollarSign, TrendingUp, X,
  Banknote, Wallet, Building, CheckCircle, XCircle,
  Clock, FileText, Printer, Users, MoreVertical, FileText as FileTextIcon
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Payments = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentMode: 'all'
  });
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    cashAmount: 0,
    upiAmount: 0,
    bankAmount: 0,
    chequeAmount: 0
  });
  
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedPaymentForMenu, setSelectedPaymentForMenu] = useState(null);
  const [operatorId, setOperatorId] = useState(null);
  const [daysOverdue, setDaysOverdue] = useState(30);

  // Modal states
  const [showChequeModal, setShowChequeModal] = useState(false);
  const [selectedChequePayment, setSelectedChequePayment] = useState(null);
  const [chequeStatus, setChequeStatus] = useState('');
  const [updatingCheque, setUpdatingCheque] = useState(false);
  const [chequeError, setChequeError] = useState(null);

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

  // Fetch current logged-in user to get operator ID
  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setOperatorId(data.user.id);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, []);

  // Fetch payments
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

      const response = await fetch(`${BASE_URL}/payments?${queryParams}`, {
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
          setStats({
            totalPayments: data.summary.totalPayments || 0,
            totalAmount: data.summary.totalAmount || 0,
            cashAmount: data.summary.byPaymentMode?.cash || 0,
            upiAmount: data.summary.byPaymentMode?.upi || 0,
            bankAmount: data.summary.byPaymentMode?.bank || 0,
            chequeAmount: data.summary.byPaymentMode?.cheque || 0
          });
        }
      } else {
        setError(data.message || t('payments.errors.fetchFailed'));
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.startDate, filters.endDate, filters.paymentMode, navigate, t]);

  const handleDueSummary = () => {
    if (operatorId) {
      navigate(`/payments/due-summary?operatorId=${operatorId}&daysOverdue=${daysOverdue}`);
    } else {
      fetchCurrentUser().then(() => {
        if (operatorId) {
          navigate(`/payments/due-summary?operatorId=${operatorId}&daysOverdue=${daysOverdue}`);
        } else {
          alert(t('payments.errors.userInfoFailed'));
        }
      });
    }
    handleActionMenuClose();
  };

  const handleUpdateChequeStatus = (payment) => {
    setSelectedChequePayment(payment);
    setChequeStatus(payment.chequeStatus || 'pending_clearance');
    setChequeError(null);
    setShowChequeModal(true);
    handleActionMenuClose();
  };

  const submitChequeStatusUpdate = async () => {
    if (!selectedChequePayment) return;
    
    setUpdatingCheque(true);
    setChequeError(null);
    
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/payments/${selectedChequePayment._id}/cheque-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: chequeStatus })
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setPayments(prevPayments => 
          prevPayments.map(payment => 
            payment._id === selectedChequePayment._id 
              ? { ...payment, chequeStatus: chequeStatus }
              : payment
          )
        );
        setShowChequeModal(false);
        setSelectedChequePayment(null);
        setChequeStatus('');
        alert(t('payments.messages.chequeStatusUpdated'));
      } else {
        setChequeError(data.message || t('payments.errors.statusUpdateFailed'));
      }
    } catch (error) {
      console.error('Error updating cheque status:', error);
      setChequeError(t('common.networkError'));
    } finally {
      setUpdatingCheque(false);
    }
  };

  const getChequeStatusBadge = (status) => {
    switch(status) {
      case 'cleared':
        return { label: t('payments.chequeStatus.cleared'), color: '#2E7D32', bg: '#E8F5E9', icon: CheckCircle };
      case 'pending_clearance':
        return { label: t('payments.chequeStatus.pending'), color: '#E65100', bg: '#FFF3E0', icon: Clock };
      case 'bounced':
        return { label: t('payments.chequeStatus.bounced'), color: '#D32F2F', bg: '#FFEBEE', icon: XCircle };
      default:
        return { label: t('payments.chequeStatus.notUpdated'), color: '#8D6E63', bg: '#F5F5F5', icon: Clock };
    }
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
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  // Convert number to Marathi digits
  const toMarathiDigits = (num) => {
    const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().replace(/\d/g, digit => marathiDigits[parseInt(digit)]);
  };

  // Format currency in Marathi
  const formatCurrencyMarathi = (amount) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
    return `₹ ${toMarathiDigits(formatted)}`;
  };

  // Format date in Marathi
  const formatDateMarathi = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
    const day = toMarathiDigits(date.getDate());
    const month = months[date.getMonth()];
    const year = toMarathiDigits(date.getFullYear());
    return `${day} ${month} ${year}`;
  };

  // Get display receipt number for payment
  const getPaymentReceiptNumber = (payment) => {
    // Show purchase receipt number if available, otherwise show payment ID
    if (payment.purchase?.receiptNumber) {
      return payment.purchase.receiptNumber;
    }
    // Fallback to payment ID (last 6 chars)
    return `PAY-${payment._id?.slice(-6)}`;
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

const handlePrintReceipt = (paymentId) => {
  const token = getToken();
  
  fetch(`${BASE_URL}/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => response.json())
  .then(data => {
    if (!data.success) {
      alert(t('payments.errors.receiptFetchFailed'));
      return;
    }
    
    const payment = data.data;
    const isMarathi = i18n.language === 'mr';
    
    // Get business details from API response
    const businessDetails = payment.businessDetails || {};
    const businessName = businessDetails.name || (isMarathi ? 'जय शिवराय व्हेजिटेबल' : 'Jai Shivrai Vegetable Co.');
    const businessAddress = businessDetails.address || (isMarathi ? 'वेसराणे, ता. कळवण जि. नाशिक' : 'Vesarane, Tal. Kalwan, Dist. Nashik');
    const businessPhone = businessDetails.phone || (isMarathi ? 'प्रो. रोकेश हिरे मो. ९०२१६९९९९१ / ९६२३९५६३९६' : 'Prop. Rakesh Hire M: 9021699991 / 9623956396');
    const businessEmail = businessDetails.email || '';
    const businessGst = businessDetails.gstNumber || '';
    const businessPan = businessDetails.panNumber || '';
    
    // Format date from API response
    const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : new Date();
    const day = paymentDate.getDate();
    const month = paymentDate.getMonth() + 1;
    const year = paymentDate.getFullYear();
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    
    // Format amount with commas
    const formattedAmount = new Intl.NumberFormat('en-IN').format(payment.amount || 0);
    
    // Get farmer details
    const farmerName = payment.farmer?.name || 'N/A';
    const farmerVillage = payment.farmer?.village || payment.farmer?.city || '—';
    const farmerMobile = payment.farmer?.mobile || '';
    const farmerAddress = payment.farmer?.address || '';
    
    // Get purchase details from purchaseSummary or purchase object
    const receiptNumber = payment.purchaseSummary?.receiptNumber || payment.purchase?.receiptNumber || `PAY-${payment.id?.slice(-6)}`;
    const finalPayable = payment.purchaseSummary?.finalPayable || payment.purchase?.finalPayable || 0;
    const amountPaid = payment.amount || 0;
    const amountDue = payment.purchaseSummary?.amountDue || payment.purchase?.amountDue || 0;
    
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
    
    // Number to words function
    const numberToWords = (num) => {
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
    
    const amountInWords = `${numberToWords(payment.amount)} ${isMarathi ? 'रुपये फक्त' : 'Rupees Only'}`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${isMarathi ? 'mr' : 'en'}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${isMarathi ? 'पेमेंट पावती' : 'Payment Receipt'} - ${receiptNumber}</title>
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
            width: 800px;
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
            font-size: 32px;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 6px;
            letter-spacing: 1px;
          }
          .sub {
            font-size: 14px;
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
            font-size: 11px;
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
            height: auto;
            font-size: 14px;
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
            font-size: 16px;
            font-weight: 500;
            padding-left: 15px;
            word-break: break-word;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: bold;
            background: ${statusDisplay.bg};
            color: ${statusDisplay.color};
          }
          /* MAIN TABLE */
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
            font-size: 14px;
            background: #fff5f5;
          }
          .main-table td {
            color: #000;
            font-size: 13px;
          }
          .col1 { width: 10%; text-align: center; }
          .col2 { width: 35%; }
          .col3 { width: 15%; text-align: right; }
          .col4 { width: 25%; text-align: right; }
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
            font-size: 14px;
            font-weight: bold;
            color: #b3153f;
            min-width: 200px;
          }
          .footer-right {
            width: 280px;
            border-left: 2px solid #b3153f;
            padding: 12px 15px;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            white-space: nowrap;
          }
          .footer-right span {
            color: #000;
            font-size: 20px;
            font-weight: bold;
            display: inline-block;
            margin-left: 5px;
          }
          .signature-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 25px 15px 15px;
            min-height: 120px;
            flex-wrap: wrap;
          }
          .buyer-sign {
            font-size: 16px;
            font-weight: bold;
            border-top: 1px dashed #b3153f;
            padding-top: 15px;
            min-width: 180px;
            text-align: center;
          }
          .shop-sign {
            text-align: center;
            font-size: 16px;
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
            font-size: 45px;
            font-family: cursive;
            position: absolute;
            top: -35px;
            right: 20px;
            color: #000;
            transform: rotate(-10deg);
          }
          .amount-in-words {
            padding: 8px 15px;
            font-size: 12px;
            background: #fff8f0;
            border-top: 1px solid #b3153f;
            color: #555;
            word-break: break-word;
          }
          .payment-summary {
            padding: 10px 15px;
            background: #f9f9f9;
            border-top: 1px solid #b3153f;
            font-size: 13px;
          }
          .payment-summary p {
            margin: 4px 0;
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
          @media (max-width: 768px) {
            .center-title h1 { font-size: 24px; }
            .sub { font-size: 11px; }
            .main-table th, .main-table td { font-size: 11px; padding: 6px 4px; }
            .col4 { width: 30%; }
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
                <h1>${businessName}</h1>
                <div class="sub">${businessAddress}</div>
                ${(businessGst || businessPan) ? `<div style="font-size: 11px; margin-top: 4px;">${businessGst ? `${isMarathi ? 'जीएसटी' : 'GST'}: ${businessGst}` : ''}${businessGst && businessPan ? ' | ' : ''}${businessPan ? `${isMarathi ? 'पॅन' : 'PAN'}: ${businessPan}` : ''}</div>` : ''}
                <div class="receipt-badge">${isMarathi ? 'पेमेंट पावती' : 'PAYMENT RECEIPT'}</div>
              </div>
            </div>
            <div class="contact-row">
              <div>${businessPhone}</div>
              ${businessEmail ? `<div>✉️ ${businessEmail}</div>` : ''}
            </div>
          </div>
          
          <!-- DETAILS -->
          <table class="details">
            <tr>
              <td style="width: 60%;">
                <span class="label">${isMarathi ? 'पावती नं.' : 'Receipt No.'}:</span>
                <span class="value">${receiptNumber}</span>
              </td>
              <td style="width: 40%;">
                <span class="label">${isMarathi ? 'दि.' : 'Date'}:</span>
                <span class="value">${formattedDate}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="label">${isMarathi ? 'श्रीमान' : 'Farmer Name'}:</span>
                <span class="value">${farmerName}</span>
              </td>
              <td>
                <span class="label">${isMarathi ? 'मो. नं.' : 'Mobile'}:</span>
                <span class="value">${farmerMobile}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="label">${isMarathi ? 'गाव' : 'Village'}:</span>
                <span class="value">${farmerVillage}</span>
              </td>
              <td style="text-align: right;">
                <span class="status-badge">${statusDisplay.text}</span>
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
                <th>${isMarathi ? 'दर' : 'Rate'}</th>
                <th>${isMarathi ? 'रक्कम' : 'Amount'}</th>
                <th>${isMarathi ? 'स्थिती' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="total-row">
                <td colspan="3" style="text-align: right; font-weight: bold;">${isMarathi ? 'एकूण बिल रक्कम' : 'Total Bill Amount'}:</td>
                <td style="text-align: right; font-weight: bold;">₹ ${new Intl.NumberFormat('en-IN').format(finalPayable)}</td>
                <td style="text-align: center;">—</td>
              </tr>
              <tr class="payment-row">
                <td colspan="3" style="text-align: right; font-weight: bold; color: #b3153f;">${isMarathi ? 'आजचे पेमेंट' : "Today's Payment"}:</td>
                <td style="text-align: right; font-weight: bold; color: #b3153f; font-size: 18px;">₹ ${formattedAmount}</td>
                <td style="text-align: center;">
                  <span style="display: inline-block; width: 18px; height: 18px; background: #4CAF50; border-radius: 50%; color: white; line-height: 18px; font-size: 12px;">✓</span>
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
              <p>• ${isMarathi ? 'एकूण बिल' : 'Total Bill'}: ₹ ${new Intl.NumberFormat('en-IN').format(finalPayable)}</p>
              <p>• ${isMarathi ? 'आजचे पेमेंट' : "Today's Payment"}: ₹ ${formattedAmount}</p>
              <p>• ${isMarathi ? 'पेमेंट पद्धत' : 'Payment Mode'}: ${paymentModeText}</p>
              ${paymentExtraInfo ? `<p>• ${paymentExtraInfo}</p>` : ''}
              <p>• ${isMarathi ? 'उर्वरित रक्कम' : 'Remaining Amount'}: ₹ ${new Intl.NumberFormat('en-IN').format(remainingAmount)}</p>
              <p>• ${isMarathi ? 'स्थिती' : 'Status'}: ${statusDisplay.text}</p>
            </div>
            ` : `
            <div class="payment-summary">
              <p><strong>${isMarathi ? 'पेमेंट सारांश' : 'Payment Summary'}:</strong></p>
              <p>• ${isMarathi ? 'एकूण बिल' : 'Total Bill'}: ₹ ${new Intl.NumberFormat('en-IN').format(finalPayable)}</p>
              <p>• ${isMarathi ? 'एकूण भरले' : 'Total Paid'}: ₹ ${new Intl.NumberFormat('en-IN').format(finalPayable)}</p>
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
                ${businessName}
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  })
  .catch(error => {
    console.error('Error fetching payment receipt:', error);
    alert(t('common.networkError'));
  });
};

  const getPaymentModeIcon = (mode) => {
    switch(mode) {
      case 'cash': return { icon: Wallet, color: '#2E7D32', label: t('payments.modes.cash'), bg: '#E8F5E9' };
      case 'upi': return { icon: TrendingUp, color: '#1976D2', label: t('payments.modes.upi'), bg: '#E3F2FD' };
      case 'bank': return { icon: Building, color: '#F57C00', label: t('payments.modes.bank'), bg: '#FFF3E0' };
      case 'cheque': return { icon: CreditCard, color: '#7B1FA2', label: t('payments.modes.cheque'), bg: '#F3E5F5' };
      default: return { icon: Banknote, color: '#8D6E63', label: t('payments.modes.other'), bg: '#FAFAFA' };
    }
  };

  const handleActionMenuOpen = (event, payment) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedPaymentForMenu(payment);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedPaymentForMenu(null);
  };

  const MENU_HEIGHT = 200;
  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('payments.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('payments.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('payments.subtitle')}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.stats.totalAmount')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.totalAmount)}</p>
            </div>
            <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.stats.cash')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.cashAmount)}</p>
            </div>
            <Wallet className="w-8 h-8" style={{ color: '#2E7D32' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.stats.upiBank')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.upiAmount + stats.bankAmount)}</p>
            </div>
            <TrendingUp className="w-8 h-8" style={{ color: '#1976D2' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.stats.cheque')}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(stats.chequeAmount)}</p>
            </div>
            <CreditCard className="w-8 h-8" style={{ color: '#7B1FA2' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchPayments} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
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
                placeholder={t('payments.searchPlaceholder')}
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
              <Filter className="w-4 h-4" /> {t('common.filter')}
              {(filters.startDate || filters.endDate || filters.paymentMode !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
            <button
              onClick={() => navigate('/payments/add')}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <Plus className="w-4 h-4" /> {t('payments.buttons.newPayment')}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('payments.filters.startDate')}</label>
                <input 
                  type="date" 
                  value={filters.startDate} 
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('payments.filters.endDate')}</label>
                <input 
                  type="date" 
                  value={filters.endDate} 
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('payments.filters.paymentMode')}</label>
                <select 
                  value={filters.paymentMode} 
                  onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="all">{t('common.allModes')}</option>
                  <option value="cash">{t('payments.modes.cash')}</option>
                  <option value="upi">{t('payments.modes.upi')}</option>
                  <option value="bank">{t('payments.modes.bank')}</option>
                  <option value="cheque">{t('payments.modes.cheque')}</option>
                </select>
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

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('payments.noPaymentsFound')}</p>
            {(searchTerm || filters.startDate || filters.endDate || filters.paymentMode !== 'all') && (
              <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">
                {t('common.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.receiptNo')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.paymentDate')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.farmer')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.purchase')}</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.amount')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.mode')}</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('payments.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => {
                    const modeData = getPaymentModeIcon(payment.paymentMode);
                    const ModeIcon = modeData.icon;
                    const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedPaymentForMenu?._id === payment._id;
                    const receiptNumber = getPaymentReceiptNumber(payment);
                    
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
                              {receiptNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <span className="text-sm" style={{ color: '#5D4037' }}>{formatDate(payment.paymentDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{payment.farmer?.name || 'N/A'}</p>
                            {payment.farmer?.mobile && (
                              <p className="text-xs" style={{ color: '#8D6E63' }}>{payment.farmer.mobile}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>
                              {payment.purchase?.receiptNumber || 'N/A'}
                            </p>
                            <p className="text-xs" style={{ color: '#8D6E63' }}>
                              {formatCurrency(payment.purchase?.finalPayable || 0)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-bold" style={{ color: '#FF6F00' }}>
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ 
                            background: modeData.bg,
                            color: modeData.color
                          }}>
                            <ModeIcon className="w-3 h-3" />
                            {modeData.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => handleActionMenuOpen(e, payment)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
                            style={{ color: '#2E7D32' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="text-xs font-medium">{t('common.actions')}</span>
                          </button>

                          {isActionMenuOpen && anchorRect && (
                            <div
                              className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50"
                              style={{
                                borderColor: '#E8F5E9',
                                width: '200px',
                                position: 'fixed',
                                top: openUpward
                                  ? anchorRect.top - MENU_HEIGHT - 4
                                  : anchorRect.bottom + 4,
                                left: anchorRect.left - 140,
                              }}
                            >
                              <button
                                onClick={() => {
                                  navigate(`/payments/view/${payment._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#2E7D32' }}
                              >
                                <Eye className="w-4 h-4" />
                                {t('common.viewDetails')}
                              </button>

                             
<button
  onClick={() => {
    handlePrintReceipt(payment._id);
    handleActionMenuClose();
  }}
  className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors"
  style={{ color: '#1565C0' }}
>
  <Printer className="w-4 h-4" />
  {t('common.print')}
</button>

                              <button
                                onClick={handleDueSummary}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-purple-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#6A1B9A' }}
                              >
                                <FileTextIcon className="w-4 h-4" />
                                {t('payments.buttons.dueSummary')}
                              </button>

                              {payment.paymentMode === 'cheque' && (!payment.chequeStatus || payment.chequeStatus !== 'cleared') && (
                                <button
                                  onClick={() => handleUpdateChequeStatus(payment)}
                                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 transition-colors border-t"
                                  style={{ color: '#FF6F00', borderColor: '#E8F5E9' }}
                                >
                                  <Edit2 className="w-4 h-4" />
                                  {t('payments.buttons.updateChequeStatus')}
                                </button>
                              )}
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
                  {t('payments.pagination.showing', {
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
                      if (pagination.pages <= 5) pageNum = i + 1;
                      else if (pagination.page <= 3) pageNum = i + 1;
                      else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                      else pageNum = pagination.page - 2 + i;
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

      {/* Cheque Status Update Modal */}
      {showChequeModal && selectedChequePayment && (
        <div className="fixed inset-0 z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div
            className="absolute inset-0"
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'
            }}
            onClick={() => { setShowChequeModal(false); setSelectedChequePayment(null); }}
          />
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full" style={{ maxWidth: '400px', zIndex: 10000 }}>
              <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: '#FF6F00' }}>{t('payments.modals.cheque.title')}</h3>
                  <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('payments.modals.cheque.subtitle')}</p>
                </div>
                <button
                  onClick={() => { setShowChequeModal(false); setSelectedChequePayment(null); }}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <CreditCard className="w-8 h-8" style={{ color: '#FF6F00' }} />
                  </div>
                </div>
                
                <div className="mb-4 p-3 rounded-lg" style={{ background: '#F5F5F5' }}>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.modals.cheque.receiptLabel')}:</span>
                    <span className="text-sm font-medium" style={{ color: '#BF360C' }}>{getPaymentReceiptNumber(selectedChequePayment)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.modals.cheque.amountLabel')}:</span>
                    <span className="text-sm font-bold" style={{ color: '#2E7D32' }}>{formatCurrency(selectedChequePayment.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs" style={{ color: '#8D6E63' }}>{t('payments.modals.cheque.farmerLabel')}:</span>
                    <span className="text-sm" style={{ color: '#5D4037' }}>{selectedChequePayment.farmer?.name}</span>
                  </div>
                </div>

                {chequeError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{chequeError}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1B5E20' }}>
                    {t('payments.modals.cheque.statusLabel')}
                  </label>
                  <select
                    value={chequeStatus}
                    onChange={(e) => setChequeStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                    style={{ borderColor: '#C8E6C9' }}
                  >
                    <option value="pending_clearance">{t('payments.chequeStatus.pending')}</option>
                    <option value="cleared">{t('payments.chequeStatus.cleared')}</option>
                    <option value="bounced">{t('payments.chequeStatus.bounced')}</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
                <button
                  onClick={() => { setShowChequeModal(false); setSelectedChequePayment(null); }}
                  className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
                  style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={submitChequeStatusUpdate}
                  disabled={updatingCheque}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: '#FF6F00' }}
                >
                  {updatingCheque ? (
                    <><Loader className="w-4 h-4 animate-spin" /> {t('common.updating')}...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> {t('payments.buttons.updateStatus')}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Backdrop for Action Menu */}
      {Boolean(actionMenuAnchor) && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleActionMenuClose}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
        />
      )}
    </div>
  );
};

export default Payments;
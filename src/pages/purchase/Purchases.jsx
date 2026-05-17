// src/pages/purchases/Purchases.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart, Search, Filter, Eye, Edit2,
  Plus, Download, RefreshCw, Loader, AlertCircle,
  Calendar, User, DollarSign, TrendingUp, X,
  Truck, Package, Wallet, CheckCircle, XCircle,
  Clock, Printer, FileText, MoreVertical
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Purchases = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 1
  });
  const [stats, setStats] = useState({
    totalPurchases: 0,
    grossTotal: 0,
    totalDeductions: 0,
    finalPayable: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    status: 'all'
  });
  
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedPurchaseForMenu, setSelectedPurchaseForMenu] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getToken = () => localStorage.getItem('token');

  const fetchPurchases = useCallback(async () => {
    const token = getToken();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!token || isLoggedIn !== 'true') {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.status !== 'all') queryParams.append('status', filters.status);

      const response = await fetch(`${BASE_URL}/purchases?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setPurchases(data.data);
        setPagination(data.pagination);

        const grossTotal = data.data.reduce((sum, p) => sum + (p.grossTotal || 0), 0);
        const totalDeductions = data.data.reduce((sum, p) => sum + (p.totalDeductions || 0), 0);
        const finalPayable = data.data.reduce((sum, p) => sum + (p.finalPayable || 0), 0);

        setStats({ totalPurchases: data.pagination.total, grossTotal, totalDeductions, finalPayable });
      } else {
        setError(data.message || t('purchases.errors.fetchFailed'));
      }
    } catch (error) {
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, filters.startDate, filters.endDate, filters.status, navigate, t]);

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilters({ startDate: '', endDate: '', minAmount: '', maxAmount: '', status: 'all' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
    fetchPurchases();
  };

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: '#E8F5E9', text: '#2E7D32', label: t('purchases.status.completed'), icon: CheckCircle };
      case 'saved': return { bg: '#FFF3E0', text: '#FF6F00', label: t('purchases.status.saved'), icon: Clock };
      case 'pending': return { bg: '#E3F2FD', text: '#1976D2', label: t('purchases.status.pending'), icon: Clock };
      case 'partial': return { bg: '#E3F2FD', text: '#1976D2', label: t('purchases.status.partial'), icon: TrendingUp };
      case 'paid': return { bg: '#E8F5E9', text: '#2E7D32', label: t('purchases.status.paid'), icon: CheckCircle };
      case 'cancelled': return { bg: '#FFEBEE', text: '#D32F2F', label: t('purchases.status.cancelled'), icon: XCircle };
      default: return { bg: '#E3F2FD', text: '#1976D2', label: status || t('purchases.status.saved'), icon: AlertCircle };
    }
  };

  const handleEditClick = (purchase) => {
    // Allow edit for draft, saved, partial, AND pending status
    if (purchase.status === 'draft' || purchase.status === 'saved' || purchase.status === 'partial' || purchase.status === 'pending') {
      navigate(`/purchases/edit/${purchase._id}`);
    } else if (purchase.status === 'completed' || purchase.status === 'paid' || purchase.status === 'cancelled') {
      alert(t('purchases.messages.cannotEdit', { status: purchase.status }));
    } else {
      navigate(`/purchases/update-status/${purchase._id}`);
    }
  };

  const getEditButtonTitle = (status) => {
    switch (status) {
      case 'draft':
      case 'saved':
      case 'partial':
      case 'pending':
        return t('purchases.tooltips.editFull');
      case 'completed':
      case 'paid':
      case 'cancelled':
        return t('purchases.tooltips.cannotEdit');
      default:
        return t('purchases.tooltips.updateStatusOnly');
    }
  };

  const handleActionMenuOpen = (event, purchase) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedPurchaseForMenu(purchase);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedPurchaseForMenu(null);
  };

const handlePrintReceipt = (purchaseId) => {
  const token = getToken();
  
  fetch(`${BASE_URL}/purchases/${purchaseId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => response.json())
  .then(data => {
    if (!data.success) {
      alert(t('purchases.errors.receiptFetchFailed'));
      return;
    }
    
    const purchase = data.data;
    const isMarathi = i18n.language === 'mr';
    
    // Get business details from API response (root level, not inside data)
    const businessDetails = data.businessDetails || {};
    const businessName = businessDetails.name || businessDetails.businessName || "N/A";
    const businessAddress = businessDetails.fullAddress || businessDetails.address || businessDetails.businessAddress ||  "N/A";
    const businessPhone = businessDetails.phone || businessDetails.businessPhone ||  "N/A";
    const businessEmail = businessDetails.email || businessDetails.businessEmail || '';
    const businessGst = businessDetails.gstNumber || '';
    const businessPan = businessDetails.panNumber || '';
    
    // Format date
    const purchaseDate = purchase.purchaseDate ? new Date(purchase.purchaseDate) : new Date();
    const day = purchaseDate.getDate();
    const month = purchaseDate.getMonth() + 1;
    const year = purchaseDate.getFullYear();
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    
    // Format amounts
    const formattedGrossTotal = formatNumber(purchase.grossTotal || 0);
    const formattedFinalPayable = formatNumber(purchase.finalPayable || 0);
    
    // Get farmer details
    const farmerName = purchase.farmer?.name || 'N/A';
    const farmerVillage = purchase.farmer?.village || purchase.farmer?.city || '—';
    const farmerMobile = purchase.farmer?.mobile || '';
    
    // Get receipt number
    const receiptNumber = purchase.receiptNumber || `RCP-${purchase._id?.slice(-6)}`;
    
    // Get status display
    const getStatusDisplay = () => {
      switch(purchase.status) {
        case 'paid':
          return {
            text: isMarathi ? 'पूर्ण भरले' : 'Fully Paid',
            color: '#2E7D32',
            bg: '#E8F5E9'
          };
        case 'partial':
          return {
            text: isMarathi ? 'अंशतः भरले' : 'Partially Paid',
            color: '#FF6F00',
            bg: '#FFF3E0'
          };
        case 'saved':
          return {
            text: isMarathi ? 'जतन केले' : 'Saved',
            color: '#1976D2',
            bg: '#E3F2FD'
          };
        case 'completed':
          return {
            text: isMarathi ? 'पूर्ण' : 'Completed',
            color: '#2E7D32',
            bg: '#E8F5E9'
          };
        default:
          return {
            text: purchase.status || (isMarathi ? 'प्रलंबित' : 'Pending'),
            color: '#FF6F00',
            bg: '#FFF3E0'
          };
      }
    };
    
    const statusDisplay = getStatusDisplay();
    
    // Build items table rows
    const itemsRows = purchase.lines?.map((line, idx) => {
      const itemTotal = formatNumber(line.lineTotal || 0);
      const rate = formatNumber(line.rate || 0);
      const qty = line.actualQty || line.billedQty || 0;
      let qtyDisplay = '';
      
      if (line.pricingType === 'bunch') {
        qtyDisplay = `${qty} ${isMarathi ? 'गठ्ठा' : 'bunches'}`;
      } else if (line.unit === 'quintal') {
        qtyDisplay = `${qty} ${isMarathi ? 'क्विंटल' : 'Qtls'}`;
      } else {
        qtyDisplay = `${qty} ${line.unit || ''}`;
      }
      
      return `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>${line.productName || '-'}</td>
          <td style="text-align: right;">${qtyDisplay}</td>
          <td style="text-align: right;">₹ ${rate}</td>
          <td style="text-align: right;">₹ ${itemTotal}</td>
        </tr>
      `;
    }).join('');
    
    // Build deductions rows - FIXED: Removed the extra NonNull78 text
    const deductions = purchase.deductions || {};
    const hasDeductions = (deductions.transport > 0) || (deductions.labour > 0) || 
                          (deductions.commission > 0) || (deductions.storage > 0) || 
                          (deductions.advanceAdjusted > 0) || (deductions.other > 0);
    
    let deductionsHtml = '';
    if (hasDeductions) {
      if (deductions.transport > 0) {
        deductionsHtml += `<tr><td colspan="4" style="text-align: right;">${isMarathi ? 'वाहतूक खर्च' : 'Transport'}:</td><td style="text-align: right;">- ₹ ${formatNumber(deductions.transport)}</td></tr>`;
      }
      if (deductions.labour > 0) {
        deductionsHtml += `<tr><td colspan="4" style="text-align: right;">${isMarathi ? 'मजुरी' : 'Labour'}:</td><td style="text-align: right;">- ₹ ${formatNumber(deductions.labour)}</td></tr>`;
      }
      if (deductions.commission > 0) {
        const commissionDisplay = deductions.commissionType === 'percent' 
          ? `${deductions.commission}%` 
          : `₹ ${formatNumber(deductions.commission)}`;
        deductionsHtml += `<tr><td colspan="4" style="text-align: right;">${isMarathi ? 'कमिशन' : 'Commission'} (${commissionDisplay}):</td><td style="text-align: right;">- ₹ ${formatNumber(deductions.commission)}</td></tr>`;
      }
      if (deductions.storage > 0) {
        deductionsHtml += `<tr><td colspan="4" style="text-align: right;">${isMarathi ? 'गोदाम खर्च' : 'Storage'}:</td><td style="text-align: right;">- ₹ ${formatNumber(deductions.storage)}</td></tr>`;
      }
      if (deductions.advanceAdjusted > 0) {
        deductionsHtml += `<tr><td colspan="4" style="text-align: right;">${isMarathi ? 'अग्रिम समायोजन' : 'Advance Adjusted'}:</td><td style="text-align: right;">- ₹ ${formatNumber(deductions.advanceAdjusted)}</td></tr>`;
      }
      if (deductions.other > 0) {
        deductionsHtml += `<tr><td colspan="4" style="text-align: right;">${isMarathi ? 'इतर कपात' : 'Other Deductions'}:</td><td style="text-align: right;">- ₹ ${formatNumber(deductions.other)}</td></tr>`;
      }
    }
    
    // Number to words function with decimal support
    const numberToWords = (num) => {
      if (num === 0 || num === undefined || num === null) return 'Zero';
      
      // Split into rupees and paise
      const numStr = num.toString();
      const parts = numStr.split('.');
      const rupees = parseInt(parts[0], 10);
      const paise = parts[1] ? parseInt(parts[1].slice(0, 2), 10) : 0;
      
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
      
      // Convert rupees
      const rupeesInWords = rupees === 0 ? '' : convert(rupees);
      
      // Convert paise
      let paiseInWords = '';
      if (paise > 0) {
        paiseInWords = convert(paise);
      }
      
      // Build the final string
      let result = '';
      if (rupeesInWords) {
        result = rupeesInWords + ' Rupees';
      } else if (rupees === 0 && paise === 0) {
        result = 'Zero Rupees';
      } else if (rupees === 0) {
        result = '';
      }
      
      if (paiseInWords) {
        result += (result ? ' and ' : '') + paiseInWords + ' Paise';
      }
      
      return result.trim();
    };
    
    // Marathi number to words function with decimal support
    const numberToWordsMarathi = (num) => {
      if (num === 0 || num === undefined || num === null) return 'शून्य';
      
      // Split into rupees and paise
      const numStr = num.toString();
      const parts = numStr.split('.');
      const rupees = parseInt(parts[0], 10);
      const paise = parts[1] ? parseInt(parts[1].slice(0, 2), 10) : 0;
      
      const ones = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस'];
      const tens = ['', '', 'वीस', 'तीस', 'चाळीस', 'पन्नास', 'साठ', 'सत्तर', 'ऐंशी', 'नव्वद'];
      
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
        return ones[h] + ' शेकडा' + (rest ? ' ' + convertLessThanThousand(rest) : '');
      }
      
      function convert(n) {
        if (n === 0) return '';
        if (n < 1000) return convertLessThanThousand(n);
        if (n < 100000) {
          const th = Math.floor(n / 1000);
          const rest = n % 1000;
          return convertLessThanThousand(th) + ' हजार' + (rest ? ' ' + convertLessThanThousand(rest) : '');
        }
        if (n < 10000000) {
          const l = Math.floor(n / 100000);
          const rest = n % 100000;
          return convertLessThanThousand(l) + ' लाख' + (rest ? ' ' + convert(rest) : '');
        }
        const c = Math.floor(n / 10000000);
        const rest = n % 10000000;
        return convertLessThanThousand(c) + ' कोटी' + (rest ? ' ' + convert(rest) : '');
      }
      
      // Convert rupees
      const rupeesInWords = rupees === 0 ? '' : convert(rupees);
      
      // Convert paise
      let paiseInWords = '';
      if (paise > 0) {
        paiseInWords = convert(paise);
      }
      
      // Build the final string
      let result = '';
      if (rupeesInWords) {
        result = rupeesInWords + ' रुपये';
      } else if (rupees === 0 && paise === 0) {
        result = 'शून्य रुपये';
      } else if (rupees === 0) {
        result = '';
      }
      
      if (paiseInWords) {
        result += (result ? ' आणि ' : '') + paiseInWords + ' पैसे';
      }
      
      return result.trim();
    };
    
    const amountInWords = isMarathi 
      ? `${numberToWordsMarathi(purchase.finalPayable)} फक्त`
      : `${numberToWords(purchase.finalPayable)} Only`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${isMarathi ? 'mr' : 'en'}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${isMarathi ? 'खरेदी पावती' : 'Purchase Receipt'} - ${receiptNumber}</title>
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
            word-break: break-word;
          }
          .sub {
            font-size: 14px;
            font-weight: bold;
            word-break: break-word;
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
            align-items: center;
            font-size: 11px;
            font-weight: bold;
            flex-wrap: wrap;
            gap: 5px;
          }
          .contact-phone {
            flex: 1;
            text-align: left;
          }
          .contact-email {
            flex: 1;
            text-align: right;
            word-break: break-all;
          }
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
            font-size: 15px;
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
          .main-table {
            width: 100%;
            border-collapse: collapse;
            color: #b3153f;
            margin: 5px 0;
          }
          .main-table th,
          .main-table td {
            border: 2px solid #b3153f;
            padding: 8px 6px;
            vertical-align: middle;
          }
          .main-table th {
            text-align: center;
            font-weight: bold;
            font-size: 13px;
            background: #fff5f5;
          }
          .main-table td {
            color: #000;
            font-size: 12px;
          }
          .col1 { width: 6%; text-align: center; }
          .col2 { width: 34%; }
          .col3 { width: 20%; text-align: right; }
          .col4 { width: 20%; text-align: right; }
          .col5 { width: 20%; text-align: right; }
          .total-row td {
            font-weight: bold;
            border-top: 2px solid #b3153f;
          }
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
            font-size: 18px;
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
            .main-table th, .main-table td { font-size: 10px; padding: 6px 4px; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="top-header">
           
            <div class="title-section">
              <div class="center-title">
                <h1>${businessName}</h1>
                <div class="sub">${businessAddress}</div>
                ${(businessGst || businessPan) ? `<div style="font-size: 11px; margin-top: 4px;">${businessGst ? `${isMarathi ? 'जीएसटी' : 'GST'}: ${businessGst}` : ''}${businessGst && businessPan ? ' | ' : ''}${businessPan ? `${isMarathi ? 'पॅन' : 'PAN'}: ${businessPan}` : ''}</div>` : ''}
                <div class="receipt-badge">${isMarathi ? 'खरेदी पावती' : 'PURCHASE RECEIPT'}</div>
              </div>
            </div>
            <div class="contact-row">
              <div class="contact-phone"> ${businessPhone}</div>
              ${businessEmail ? `<div class="contact-email"> ${businessEmail}</div>` : ''}
            </div>
          </div>
          
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
                <th>${isMarathi ? 'दर' : 'Rate'}</th>
                <th>${isMarathi ? 'रक्कम' : 'Amount'}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
              <tr class="total-row">
                <td colspan="4" style="text-align: right; font-weight: bold;">${isMarathi ? 'एकूण' : 'Total'}:</td>
                <td style="text-align: right; font-weight: bold;">₹ ${formattedGrossTotal}</td>
              </tr>
              ${deductionsHtml}
              <tr class="total-row">
                <td colspan="4" style="text-align: right; font-weight: bold; color: #b3153f;">${isMarathi ? 'अंतिम देय रक्कम' : 'Final Payable'}:</td>
                <td style="text-align: right; font-weight: bold; color: #b3153f; font-size: 16px;">₹ ${formattedFinalPayable}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <div class="amount-in-words">
              <strong>${isMarathi ? 'अक्षरी रुपये' : 'Amount in Words'}:</strong> ${amountInWords}
            </div>
            
            <div class="footer-row">
              <div class="footer-left">
                ${isMarathi ? 'धन्यवाद!' : 'Thank You!'}
              </div>
              <div class="footer-right">
                ${isMarathi ? 'देय रक्कम' : 'Amount'}:
                <span>₹ ${formattedFinalPayable}</span>
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
    console.error('Error fetching purchase receipt:', error);
    alert(t('common.networkError'));
  });
};

  // Smart dropdown positioning - Updated height for 3 buttons
  const MENU_HEIGHT = 180; // Reduced from 240 to 180 for 3 buttons (View, Edit, Print)
  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  if (loading && purchases.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('purchases.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('purchases.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('purchases.subtitle')}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('purchases.stats.totalPurchases')}</p>
              <p className="text-2xl font-bold" style={{ color: '#2E7D32' }}>{stats.totalPurchases}</p>
            </div>
            <ShoppingCart className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('purchases.stats.grossTotal')}</p>
              <p className="text-2xl font-bold" style={{ color: '#2E7D32' }}>{formatCurrency(stats.grossTotal)}</p>
            </div>
            <DollarSign className="w-8 h-8" style={{ color: '#FF8F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('purchases.stats.totalDeductions')}</p>
              <p className="text-2xl font-bold" style={{ color: '#FF6F00' }}>{formatCurrency(stats.totalDeductions)}</p>
            </div>
            <Wallet className="w-8 h-8" style={{ color: '#FF6F00' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: '#8D6E63' }}>{t('purchases.stats.finalPayable')}</p>
              <p className="text-2xl font-bold" style={{ color: '#2E7D32' }}>{formatCurrency(stats.finalPayable)}</p>
            </div>
            <TrendingUp className="w-8 h-8" style={{ color: '#43A047' }} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={fetchPurchases} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#8D6E63' }} />
              <input
                type="text"
                placeholder={t('purchases.searchPlaceholder')}
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
              {(filters.startDate || filters.endDate || filters.status !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-[#FF6F00]"></span>
              )}
            </button>
            <button
              onClick={() => navigate('/purchases/add')}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              <Plus className="w-4 h-4" /> {t('purchases.buttons.newPurchase')}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('purchases.filters.startDate')}</label>
                <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('purchases.filters.endDate')}</label>
                <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('purchases.filters.status')}</label>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }}>
                  <option value="all">{t('common.all')}</option>
                  <option value="draft">{t('purchases.status.draft')}</option>
                  <option value="saved">{t('purchases.status.saved')}</option>
                  <option value="pending">{t('purchases.status.pending')}</option>
                  <option value="partial">{t('purchases.status.partial')}</option>
                  <option value="paid">{t('purchases.status.paid')}</option>
                  <option value="completed">{t('purchases.status.completed')}</option>
                  <option value="cancelled">{t('purchases.status.cancelled')}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={clearFilters} className="px-3 py-1 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}>{t('common.clearAll')}</button>
              <button onClick={() => setShowFilters(false)} className="px-3 py-1 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}>{t('common.cancel')}</button>
              <button onClick={applyFilters} className="px-3 py-1 rounded-lg text-white text-sm" style={{ background: '#2E7D32' }}>{t('common.apply')}</button>
            </div>
          </div>
        )}
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} />
            <span className="ml-2" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} />
            <p className="text-sm" style={{ color: '#8D6E63' }}>{t('purchases.noPurchasesFound')}</p>
            {(searchTerm || filters.status !== 'all' || filters.startDate || filters.endDate) && (
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
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.table.receiptNo')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.table.date')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.table.farmer')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.table.products')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.table.grossTotal')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.table.deductions')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.table.finalPayable')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.table.status')}</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('purchases.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase, index) => {
                    const statusColors = getStatusColor(purchase.status);
                    const StatusIcon = statusColors.icon;
                    const productNames = purchase.lines?.map(l => l.productName).join(', ') || '-';
                    const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedPurchaseForMenu?._id === purchase._id;
                    
                    return (
                      <tr
                        key={purchase._id}
                        className="hover:bg-green-50 transition-colors"
                        style={{ borderBottom: index !== purchases.length - 1 ? '1px solid #E8F5E9' : 'none' }}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <span className="text-sm font-medium" style={{ color: '#2E7D32' }}>{purchase.receiptNumber}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <span className="text-sm" style={{ color: '#5D4037' }}>{formatDate(purchase.purchaseDate)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" style={{ color: '#8D6E63' }} />
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#2E7D32' }}>{purchase.farmer?.name || 'N/A'}</p>
                              {purchase.farmer?.mobile && <p className="text-xs" style={{ color: '#8D6E63' }}>{purchase.farmer.mobile}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm truncate max-w-[150px]" style={{ color: '#5D4037' }}>{productNames}</p>
                          <p className="text-xs" style={{ color: '#8D6E63' }}>{purchase.lines?.length || 0} {t('purchases.items')}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{formatCurrency(purchase.grossTotal)}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm" style={{ color: '#D32F2F' }}>- {formatCurrency(purchase.totalDeductions)}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-bold" style={{ color: '#FF6F00' }}>{formatCurrency(purchase.finalPayable)}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit" style={{ background: statusColors.bg, color: statusColors.text }}>
                            <StatusIcon className="w-3 h-3" />{statusColors.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => handleActionMenuOpen(e, purchase)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto"
                            style={{ color: '#2E7D32' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="text-xs font-medium">{t('common.actions')}</span>
                          </button>
                          {/* Dropdown menu - with only 3 buttons */}
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
                              {/* View Details */}
                              <button
                                onClick={() => {
                                  navigate(`/purchases/view/${purchase._id}`);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#2E7D32' }}
                              >
                                <Eye className="w-4 h-4" />
                                {t('common.view')}
                              </button>
                              {/* Edit */}
                              <button
                                onClick={() => {
                                  handleEditClick(purchase);
                                  handleActionMenuClose();
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 transition-colors"
                                style={{ color: '#FF6F00' }}
                                title={getEditButtonTitle(purchase.status)}
                              >
                                <Edit2 className="w-4 h-4" />
                                {t('common.edit')}
                              </button>
                              {/* Print Receipt */}
                              <button
                                onClick={() => handlePrintReceipt(purchase._id)}
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors border-t"
                                style={{ color: '#1565C0', borderColor: '#E8F5E9' }}
                              >
                                <Printer className="w-4 h-4" />
                                {t('purchases.buttons.printReceipt')}
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
                  {t('purchases.pagination.showing', {
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

export default Purchases;
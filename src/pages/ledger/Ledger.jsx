// src/pages/ledger/Ledger.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen, Search, Filter,
  Download, RefreshCw, Loader, AlertCircle,
  User, Phone, Mail, X, Eye, Printer,
  TrendingUp, TrendingDown, DollarSign,
  Calendar, FileText, Users, Receipt, MoreVertical, ShoppingBag
} from 'lucide-react';
import BASE_URL from '../../config/Config';

const Ledger = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('farmers');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [farmersData, setFarmersData] = useState(null);
  const [operatorsData, setOperatorsData] = useState(null);
  const [buyersData, setBuyersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Action Menu State
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

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

  const fetchFarmersLedger = useCallback(async () => {
    if (!isAuthenticated()) return;

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/ledger/all/farmers?page=1&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setFarmersData(data.data);
        setPagination({
          page: 1,
          limit: 10,
          total: data.data.farmers?.length || 0,
          pages: Math.ceil((data.data.farmers?.length || 0) / 10)
        });
      } else {
        setError(data.message || t('ledger.errors.fetchFarmersFailed'));
      }
    } catch (error) {
      console.error('Error fetching farmers ledger:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, t]);

  const fetchOperatorsLedger = useCallback(async () => {
    if (!isAuthenticated()) return;

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/ledger/all/operators?page=1&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setOperatorsData(data.data);
        setPagination({
          page: 1,
          limit: 10,
          total: data.data.operators?.length || 0,
          pages: Math.ceil((data.data.operators?.length || 0) / 10)
        });
      } else {
        setError(data.message || t('ledger.errors.fetchOperatorsFailed'));
      }
    } catch (error) {
      console.error('Error fetching operators ledger:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, t]);

  const fetchBuyersLedger = useCallback(async () => {
    if (!isAuthenticated()) return;

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/ledger/all/buyers?page=1&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setBuyersData(data.data);
        setPagination({
          page: 1,
          limit: 10,
          total: data.data.buyers?.length || 0,
          pages: Math.ceil((data.data.buyers?.length || 0) / 10)
        });
      } else {
        setError(data.message || t('ledger.errors.fetchBuyersFailed'));
      }
    } catch (error) {
      console.error('Error fetching buyers ledger:', error);
      setError(t('common.networkError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, t]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'farmers') {
      await fetchFarmersLedger();
    } else if (activeTab === 'operators') {
      await fetchOperatorsLedger();
    } else if (activeTab === 'buyers') {
      await fetchBuyersLedger();
    }
  };

  useEffect(() => {
    if (activeTab === 'farmers') {
      fetchFarmersLedger();
    } else if (activeTab === 'operators') {
      fetchOperatorsLedger();
    } else if (activeTab === 'buyers') {
      fetchBuyersLedger();
    }
  }, [activeTab, fetchFarmersLedger, fetchOperatorsLedger, fetchBuyersLedger]);

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
    if (activeTab === 'farmers') {
      fetchFarmersLedger();
    } else if (activeTab === 'operators') {
      fetchOperatorsLedger();
    } else if (activeTab === 'buyers') {
      fetchBuyersLedger();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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

  // Get formatted address for farmer
  const getFormattedAddress = (farmer) => {
    const parts = [];
    if (farmer.address && farmer.address.trim()) parts.push(farmer.address);
    if (farmer.village && farmer.village.trim()) parts.push(farmer.village);
    if (farmer.city && farmer.city.trim()) parts.push(farmer.city);
    if (farmer.state && farmer.state.trim()) parts.push(farmer.state);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  const getFilteredFarmers = () => {
    if (!farmersData?.farmers) return [];
    let filtered = [...farmersData.farmers];

    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.farmer.name?.toLowerCase().includes(searchLower) ||
        f.farmer.mobile?.includes(searchLower)
      );
    }

    return filtered;
  };

  const getFilteredOperators = () => {
    if (!operatorsData?.operators) return [];
    let filtered = [...operatorsData.operators];

    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.operator.name?.toLowerCase().includes(searchLower) ||
        o.operator.email?.toLowerCase().includes(searchLower) ||
        o.operator.phone?.includes(searchLower)
      );
    }

    return filtered;
  };

  const getFilteredBuyers = () => {
    if (!buyersData?.buyers) return [];
    let filtered = [...buyersData.buyers];

    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.buyer.name?.toLowerCase().includes(searchLower) ||
        b.buyer.email?.toLowerCase().includes(searchLower) ||
        b.buyer.mobile?.includes(searchLower)
      );
    }

    return filtered;
  };

  const getPaginatedData = (data) => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return data.slice(start, end);
  };

  const handleViewDetails = (item, type) => {
    if (type === 'farmer') {
      navigate(`/ledger/farmers/${item.farmer._id}`);
    } else if (type === 'operator') {
      navigate(`/ledger/operators/${item.operator.id}`);
    } else if (type === 'buyer') {
      navigate(`/ledger/buyers/${item.buyer._id}`);
    }
    handleActionMenuClose();
  };

const printFarmerSummary = (farmerData) => {
  const isMarathi = i18n.language === 'mr';
  const { farmer, totalDebit, totalCredit, currentBalance, transactions, businessDetails } = farmerData;
  
  const formattedDate = formatDate(new Date());
  const formattedAddress = getFormattedAddress(farmer);
  
  // Get business details with fallbacks
  const businessName = businessDetails?.name || (isMarathi ? 'जय शिवराय व्हेजिटेबल' : 'Jai Shivrai Vegetable Co.');
  const businessAddress = businessDetails?.address || (isMarathi ? 'वेसराणे, ता. कळवण जि. नाशिक' : 'Vesarane, Tal. Kalwan, Dist. Nashik');
  const businessPhone = businessDetails?.phone || (isMarathi ? 'प्रो. रोकेश हिरे मो. ९०२१६९९९९१ / ९६२३९५६३९६' : 'Prop. Rakesh Hire M: 9021699991 / 9623956396');
  const businessEmail = businessDetails?.email || '';
  const businessGst = businessDetails?.gstNumber || '';
  const businessPan = businessDetails?.panNumber || '';
  
  // Sort transactions in ascending order (oldest first)
  const sortedTransactions = [...(transactions || [])].sort((a, b) => 
    new Date(a.entryDate) - new Date(b.entryDate)
  );
  
  // Build running balance for display with DR/CR logic
  // For Farmer: Debit = Payment to farmer (Farmer receives money) - Company pays farmer
  // Credit = Goods sold to operator (Farmer supplies goods) - Company receives goods from farmer
  // Balance: Positive means Farmer is owed money (Company needs to pay farmer) - DR
  // Balance: Negative means Farmer owes money (Company has overpaid) - CR
  let runningBalance = 0;
  const transactionsWithRunningBalance = sortedTransactions.map(tx => {
    if (tx.debit > 0) {
      runningBalance += tx.debit;
    } else if (tx.credit > 0) {
      runningBalance -= tx.credit;
    }
    const absBalance = Math.abs(runningBalance);
    const balanceType = runningBalance >= 0 ? (isMarathi ? 'डेबिट' : 'DR') : (runningBalance < 0 ? (isMarathi ? 'क्रेडिट' : 'CR') : '');
    return { ...tx, displayBalance: absBalance, balanceType };
  });
  
  // Build transactions table rows
  const transactionsRows = transactionsWithRunningBalance.map((tx, idx) => {
    const entryDate = new Date(tx.entryDate);
    const formattedTxDate = `${entryDate.getDate().toString().padStart(2, '0')}/${(entryDate.getMonth() + 1).toString().padStart(2, '0')}/${entryDate.getFullYear()}`;
    
    return `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="text-align: center;">${formattedTxDate}</td>
        <td style="text-align: left;">${tx.description || 'N/A'}</td>
        <td style="text-align: right;">${tx.debit > 0 ? '₹ ' + formatNumber(tx.debit) : '-'}</td>
        <td style="text-align: right;">${tx.credit > 0 ? '₹ ' + formatNumber(tx.credit) : '-'}</td>
        <td style="text-align: right;">₹ ${formatNumber(tx.displayBalance)} ${tx.balanceType}</td>
      </tr>
    `;
  }).join('');
  
  const absCurrentBalance = Math.abs(currentBalance);
  const currentBalanceType = currentBalance >= 0 ? (isMarathi ? 'डेबिट' : 'DR') : (currentBalance < 0 ? (isMarathi ? 'क्रेडिट' : 'CR') : '');
  const amountInWords = `${numberToIndianWords(absCurrentBalance)} Rupees Only`;
  const balanceColor = currentBalance >= 0 ? '#2E7D32' : '#D32F2F';
  const balanceText = currentBalance >= 0 ? (isMarathi ? 'देय रक्कम' : 'To Pay') : (currentBalance < 0 ? (isMarathi ? 'मिळणारी रक्कम' : 'To Receive') : (isMarathi ? 'शून्य' : 'Zero'));
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="${isMarathi ? 'mr' : 'en'}">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${isMarathi ? 'शेतकरी खाते पुस्तक' : 'Farmer Ledger'} - ${farmer.name}</title>
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
          width: 100%;
          max-width: 900px;
          background: #fff;
          border: 2px solid #b3153f;
          color: #b3153f;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin: 0 auto;
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
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 6px;
          letter-spacing: 1px;
          word-break: break-word;
        }
        .sub {
          font-size: 12px;
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
          font-size: 10px;
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
        .gst-pan-row {
          font-size: 9px;
          margin-top: 4px;
          color: #666;
          text-align: center;
        }
        .details {
          width: 100%;
          border-collapse: collapse;
          color: #b3153f;
        }
        .details td {
          border-bottom: 2px solid #b3153f;
          padding: 10px 12px;
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
        .summary-cards {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 15px;
          flex-wrap: wrap;
        }
        .summary-card {
          flex: 1;
          min-width: 120px;
          border: 2px solid #b3153f;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          background: #fff5f5;
        }
        .summary-card h4 {
          font-size: 12px;
          margin-bottom: 8px;
          color: #b3153f;
        }
        .summary-card .amount {
          font-size: 20px;
          font-weight: bold;
          color: #000;
        }
        .summary-card.debit .amount { color: #2E7D32; }
        .summary-card.credit .amount { color: #D32F2F; }
        .summary-card.balance .amount { color: ${balanceColor}; }
        .main-table {
          width: 100%;
          border-collapse: collapse;
          color: #b3153f;
          margin: 5px 0;
          table-layout: fixed;
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
          font-size: 12px;
          background: #fff5f5;
        }
        .main-table td {
          color: #000;
          font-size: 11px;
          word-break: break-word;
        }
        .col1 { width: 5%; }
        .col2 { width: 10%; }
        .col3 { width: 30%; }
        .col4 { width: 15%; }
        .col5 { width: 15%; }
        .col6 { width: 25%; }
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
          min-height: 130px;
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
          .summary-card .amount { font-size: 16px; }
          .center-title h1 { font-size: 22px; }
          .footer-right { font-size: 12px; padding: 8px 10px; }
          .footer-right span { font-size: 14px; }
          .contact-email { font-size: 8px; }
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
              ${(businessGst || businessPan) ? `<div class="gst-pan-row">${businessGst ? `${isMarathi ? 'जीएसटी' : 'GST'}: ${businessGst}` : ''}${businessGst && businessPan ? ' | ' : ''}${businessPan ? `${isMarathi ? 'पॅन' : 'PAN'}: ${businessPan}` : ''}</div>` : ''}
              <div class="receipt-badge">${isMarathi ? 'शेतकरी खाते पुस्तक' : 'FARMER LEDGER'}</div>
            </div>
          </div>
          <div class="contact-row">
            <div class="contact-phone">
             Mobile : ${businessPhone}
            </div>
            ${businessEmail ? `
            <div class="contact-email">
             Email : ${businessEmail}
            </div>
            ` : ''}
          </div>
        </div>
        
        <table class="details">
          <tr>
            <td style="width: 60%;">
              <span class="label">${isMarathi ? 'शेतकरी नाव' : 'Farmer Name'}:</span>
              <span class="value">${farmer.name}</span>
            </td>
            <td style="width: 40%;">
              <span class="label">${isMarathi ? 'दि.' : 'Date'}:</span>
              <span class="value">${formattedDate}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span class="label">${isMarathi ? 'मोबाइल' : 'Mobile'}:</span>
              <span class="value">${farmer.mobile || 'N/A'}</span>
            </td>
            <td>
             
            </td>
          </tr>
        </table>
        
        <div class="summary-cards">
          <div class="summary-card debit">
            <h4>${isMarathi ? 'एकूण जमा' : 'Total Debit'}</h4>
            <div class="amount">${formatCurrency(totalDebit)}</div>
          </div>
          <div class="summary-card credit">
            <h4>${isMarathi ? 'एकूण नावे' : 'Total Credit'}</h4>
            <div class="amount">${formatCurrency(totalCredit)}</div>
          </div>
         <div class="summary-card balance">
  <h4>${isMarathi ? 'शिल्लक रक्कम' : 'Balance'}</h4>
  <div class="amount">${formatCurrency(absCurrentBalance)}</div> 
</div>
        </div>
        
        <table class="main-table">
          <colgroup>
            <col class="col1"/>
            <col class="col2"/>
            <col class="col3"/>
            <col class="col4"/>
            <col class="col5"/>
            <col class="col6"/>
          </colgroup>
          <thead>
            <tr>
              <th>${isMarathi ? 'क्र.' : 'Sr.'}</th>
              <th>${isMarathi ? 'तारीख' : 'Date'}</th>
              <th>${isMarathi ? 'वर्णन' : 'Particulars'}</th>
              <th>${isMarathi ? 'जमा (₹)' : 'Debit (₹)'}</th>
              <th>${isMarathi ? 'नावे (₹)' : 'Credit (₹)'}</th>
              <th>${isMarathi ? 'शिल्लक (₹)' : 'Balance (₹)'}</th>
            </tr>
          </thead>
          <tbody>
            ${transactionsRows}
          </tbody>
        </table>
        
        <div class="footer">
          <div class="amount-in-words">
            <strong>${isMarathi ? 'शिल्लक रक्कम शब्दांत' : 'Balance Amount in Words'}:</strong> ${amountInWords}
          </div>
          
          <div class="footer-row">
            <div class="footer-left">
              ${isMarathi ? 'धन्यवाद!' : 'Thank You!'}
            </div>
           <div class="footer-right">
  ${isMarathi ? 'शिल्लक रक्कम' : 'Balance'}:
  <span>${formatCurrency(absCurrentBalance)}</span> 
</div>
          </div>
          <div class="signature-row">
            <div class="buyer-sign">
              ${isMarathi ? 'शेतकऱ्याची सही' : "Farmer's Signature"}
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
};

const printOperatorSummary = (operatorData) => {
  const isMarathi = i18n.language === 'mr';
  const { operator, financialSummary, recentTransactions, businessDetails } = operatorData;
  const netProfit = financialSummary.netProfit || 0;
  
  const formattedDate = formatDate(new Date());
  
  // Get business details with fallbacks
  const businessName = businessDetails?.name || (isMarathi ? 'जय शिवराय व्हेजिटेबल' : 'Jai Shivrai Vegetable Co.');
  const businessAddress = businessDetails?.address || (isMarathi ? 'वेसराणे, ता. कळवण जि. नाशिक' : 'Vesarane, Tal. Kalwan, Dist. Nashik');
  const businessPhone = businessDetails?.phone || (isMarathi ? 'प्रो. रोकेश हिरे मो. ९०२१६९९९९१ / ९६२३९५६३९६' : 'Prop. Rakesh Hire M: 9021699991 / 9623956396');
  const businessEmail = businessDetails?.email || '';
  const businessGst = businessDetails?.gstNumber || '';
  const businessPan = businessDetails?.panNumber || '';
  
  // Sort transactions in ascending order (oldest first)
  const sortedTransactions = [...(recentTransactions || [])].sort((a, b) => 
    new Date(a.entryDate) - new Date(b.entryDate)
  );
  
  // Helper function to get opposite party name from description
  const getOppositeParty = (tx) => {
    const desc = tx.description || '';
    if (desc.includes('Purchase from farmer')) {
      const match = desc.match(/Purchase from farmer ([^-]+)/);
      return match ? match[1].trim() : 'Farmer';
    }
    if (desc.includes('Payment to farmer')) {
      const match = desc.match(/Payment to farmer ([^-]+)/);
      return match ? match[1].trim() : 'Farmer';
    }
    if (desc.includes('Sale to buyer')) {
      const match = desc.match(/Sale to buyer ([^-]+)/);
      return match ? match[1].trim() : 'Buyer';
    }
    if (desc.includes('Payment received from buyer')) {
      const match = desc.match(/Payment received from buyer ([^-]+)/);
      return match ? match[1].trim() : 'Buyer';
    }
    return '-';
  };
  
  // Helper function to determine if transaction involves Farmer or Buyer
  const getTransactionType = (tx) => {
    const desc = tx.description || '';
    if (desc.includes('Purchase from farmer')) return 'purchase_from_farmer';
    if (desc.includes('Payment to farmer')) return 'payment_to_farmer';
    if (desc.includes('Sale to buyer')) return 'sale_to_buyer';
    if (desc.includes('Payment received from buyer')) return 'payment_from_buyer';
    return 'other';
  };
  
  // CORRECT LOGIC FOR OPERATOR LEDGER:
  // For Farmer transactions:
  //   - Purchase from farmer: CREDIT (Operator owes farmer) → Balance becomes CR (Payable)
  //   - Payment to farmer: DEBIT (Operator pays farmer) → Balance reduces CR
  // For Buyer transactions:
  //   - Sale to buyer: DEBIT (Buyer owes operator) → Balance becomes DR (Receivable)
  //   - Payment from buyer: CREDIT (Buyer pays operator) → Balance reduces DR
  //
  // Formula: Balance = Total Debit - Total Credit
  //   - If Balance > 0: DR (Receivable - Company owes operator OR Buyer owes operator)
  //   - If Balance < 0: CR (Payable - Operator owes company OR Operator owes farmer)
  
  let runningBalance = 0;
  const transactionsWithRunningBalance = sortedTransactions.map(tx => {
    const txType = getTransactionType(tx);
    
    // Apply correct logic based on transaction type
    if (txType === 'purchase_from_farmer') {
      // Purchase from farmer: CREDIT increases (Operator owes more)
      runningBalance -= (tx.credit || 0);
    } else if (txType === 'payment_to_farmer') {
      // Payment to farmer: DEBIT decreases liability
      runningBalance += (tx.debit || 0);
    } else if (txType === 'sale_to_buyer') {
      // Sale to buyer: DEBIT increases (Buyer owes operator)
      runningBalance += (tx.debit || 0);
    } else if (txType === 'payment_from_buyer') {
      // Payment from buyer: CREDIT decreases receivable
      runningBalance -= (tx.credit || 0);
    } else {
      // Fallback: Debit increases, Credit decreases
      if (tx.debit > 0) runningBalance += tx.debit;
      if (tx.credit > 0) runningBalance -= tx.credit;
    }
    
    const absBalance = Math.abs(runningBalance);
    // If runningBalance > 0: DR (Receivable)
    // If runningBalance < 0: CR (Payable)
    const balanceType = runningBalance > 0 ? (isMarathi ? 'डेबिट' : 'DR') : (runningBalance < 0 ? (isMarathi ? 'क्रेडिट' : 'CR') : '');
    
    return { ...tx, displayBalance: absBalance, balanceType, runningBalanceValue: runningBalance };
  });
  
  // Build transactions table rows
  const transactionsRows = transactionsWithRunningBalance.map((tx, idx) => {
    const entryDate = new Date(tx.entryDate);
    const formattedTxDate = `${entryDate.getDate().toString().padStart(2, '0')}/${(entryDate.getMonth() + 1).toString().padStart(2, '0')}/${entryDate.getFullYear()}`;
    
    const oppositeParty = getOppositeParty(tx);
    
    // Format Debit and Credit columns based on transaction type for better understanding
    let debitDisplay = '-';
    let creditDisplay = '-';
    const txType = getTransactionType(tx);
    
    if (txType === 'purchase_from_farmer') {
      creditDisplay = '₹ ' + formatNumber(tx.credit);
    } else if (txType === 'payment_to_farmer') {
      debitDisplay = '₹ ' + formatNumber(tx.debit);
    } else if (txType === 'sale_to_buyer') {
      debitDisplay = '₹ ' + formatNumber(tx.debit);
    } else if (txType === 'payment_from_buyer') {
      creditDisplay = '₹ ' + formatNumber(tx.credit);
    } else {
      if (tx.debit > 0) debitDisplay = '₹ ' + formatNumber(tx.debit);
      if (tx.credit > 0) creditDisplay = '₹ ' + formatNumber(tx.credit);
    }
    
    return `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="text-align: center;">${formattedTxDate}</td>
        <td style="text-align: left;">${tx.description || 'N/A'}</td>
        <td style="text-align: left;">${oppositeParty}</td>
        <td style="text-align: right;">${debitDisplay}</td>
        <td style="text-align: right;">${creditDisplay}</td>
        <td style="text-align: right;">${tx.displayBalance > 0 ? '₹ ' + formatNumber(tx.displayBalance) : '₹ 0'} ${tx.balanceType}</td>
      </tr>
    `;
  }).join('');
  
  const absNetProfit = Math.abs(netProfit);
  const profitType = netProfit >= 0 ? (isMarathi ? 'नफा' : 'Profit') : (isMarathi ? 'तोटा' : 'Loss');
  const profitInWords = `${numberToIndianWords(Math.floor(absNetProfit))} Rupees Only`;
  const profitColor = netProfit >= 0 ? '#2E7D32' : '#D32F2F';
  
  // Calculate closing balance from running balance
  const closingBalance = runningBalance;
  const closingBalanceType = closingBalance > 0 ? (isMarathi ? 'डेबिट' : 'DR') : (closingBalance < 0 ? (isMarathi ? 'क्रेडिट' : 'CR') : '');
  const absClosingBalance = Math.abs(closingBalance);
  const balanceText = closingBalance > 0 ? (isMarathi ? 'मिळणारी रक्कम' : 'To Receive') : (closingBalance < 0 ? (isMarathi ? 'देय रक्कम' : 'To Pay') : (isMarathi ? 'शून्य' : 'Zero'));
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="${isMarathi ? 'mr' : 'en'}">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${isMarathi ? 'ऑपरेटर खाते पुस्तक' : 'Operator Ledger'} - ${operator.name}</title>
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
          width: 100%;
          max-width: 1100px;
          background: #fff;
          border: 2px solid #b3153f;
          color: #b3153f;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin: 0 auto;
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
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 6px;
          letter-spacing: 1px;
          word-break: break-word;
        }
        .sub {
          font-size: 12px;
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
          font-size: 10px;
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
        .gst-pan-row {
          font-size: 9px;
          margin-top: 4px;
          color: #666;
          text-align: center;
        }
        .details {
          width: 100%;
          border-collapse: collapse;
          color: #b3153f;
        }
        .details td {
          border-bottom: 2px solid #b3153f;
          padding: 10px 12px;
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
        .summary-cards {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 15px;
          flex-wrap: wrap;
        }
        .summary-card {
          flex: 1;
          min-width: 130px;
          border: 2px solid #b3153f;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          background: #fff5f5;
        }
        .summary-card h4 {
          font-size: 12px;
          margin-bottom: 8px;
          color: #b3153f;
        }
        .summary-card .amount {
          font-size: 18px;
          font-weight: bold;
          color: #000;
        }
        .summary-card.sales .amount { color: #2E7D32; }
        .summary-card.purchases .amount { color: #D32F2F; }
        .summary-card.expenses .amount { color: #FF6F00; }
        .summary-card.profit .amount { color: ${profitColor}; }
        .main-table {
          width: 100%;
          border-collapse: collapse;
          color: #b3153f;
          margin: 5px 0;
          table-layout: fixed;
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
          font-size: 11px;
          background: #fff5f5;
        }
        .main-table td {
          color: #000;
          font-size: 10px;
          word-break: break-word;
        }
        .col1 { width: 5%; }
        .col2 { width: 10%; }
        .col3 { width: 25%; }
        .col4 { width: 15%; }
        .col5 { width: 12%; }
        .col6 { width: 12%; }
        .col7 { width: 21%; }
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
          width: 320px;
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
          min-height: 130px;
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
          .summary-card .amount { font-size: 14px; }
          .center-title h1 { font-size: 22px; }
          .footer-right { font-size: 12px; padding: 8px 10px; }
          .footer-right span { font-size: 14px; }
          .contact-email { font-size: 8px; }
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
              ${(businessGst || businessPan) ? `<div class="gst-pan-row">${businessGst ? `${isMarathi ? 'जीएसटी' : 'GST'}: ${businessGst}` : ''}${businessGst && businessPan ? ' | ' : ''}${businessPan ? `${isMarathi ? 'पॅन' : 'PAN'}: ${businessPan}` : ''}</div>` : ''}
              <div class="receipt-badge">${isMarathi ? 'ऑपरेटर खाते पुस्तक' : 'OPERATOR LEDGER'}</div>
            </div>
          </div>
          <div class="contact-row">
            <div class="contact-phone">
              Mobile : ${businessPhone}
            </div>
            ${businessEmail ? `
            <div class="contact-email">
              Email : ${businessEmail}
            </div>
            ` : ''}
          </div>
        </div>
        
        <table class="details">
          <tr>
            <td style="width: 60%;">
              <span class="label">${isMarathi ? 'ऑपरेटर नाव' : 'Operator Name'}:</span>
              <span class="value">${operator.name}</span>
            </td>
            <td style="width: 40%;">
              <span class="label">${isMarathi ? 'दि.' : 'Date'}:</span>
              <span class="value">${formattedDate}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span class="label">${isMarathi ? 'ईमेल' : 'Email'}:</span>
              <span class="value">${operator.email || 'N/A'}</span>
            </td>
            <td>
              <span class="label">${isMarathi ? 'फोन' : 'Phone'}:</span>
              <span class="value">${operator.phone || 'N/A'}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span class="label">${isMarathi ? 'भूमिका' : 'Role'}:</span>
              <span class="value">${operator.role || 'N/A'}</span>
            </td>
            <td>
            </td>
          </tr>
        </table>
        
        <div class="summary-cards">
          <div class="summary-card sales">
            <h4>${isMarathi ? 'एकूण विक्री' : 'Total Sales'}</h4>
            <div class="amount">${formatCurrency(financialSummary.totalSales || 0)}</div>
          </div>
          <div class="summary-card purchases">
            <h4>${isMarathi ? 'एकूण खरेदी' : 'Total Purchases'}</h4>
            <div class="amount">${formatCurrency(financialSummary.totalPurchases || 0)}</div>
          </div>
          <div class="summary-card expenses">
            <h4>${isMarathi ? 'एकूण खर्च' : 'Total Expenses'}</h4>
            <div class="amount">${formatCurrency(financialSummary.totalExpenses || 0)}</div>
          </div>
         <div class="summary-card profit">
  <h4>${isMarathi ? 'निव्वळ नफा / तोटा' : 'Net Profit / Loss'}</h4>
  <div class="amount">${formatCurrency(absNetProfit)}</div> 
</div>
        </div>
        
       
        
        <table class="main-table">
          <colgroup>
            <col class="col1"/>
            <col class="col2"/>
            <col class="col3"/>
            <col class="col4"/>
            <col class="col5"/>
            <col class="col6"/>
            <col class="col7"/>
          </colgroup>
          <thead>
            <tr>
              <th>${isMarathi ? 'क्र.' : 'Sr.'}</th>
              <th>${isMarathi ? 'तारीख' : 'Date'}</th>
              <th>${isMarathi ? 'वर्णन' : 'Particulars'}</th>
              <th>${isMarathi ? 'शेतकरी/खरेदीदार' : 'Farmer/Buyer'}</th>
              <th>${isMarathi ? 'जमा (₹)' : 'Debit (₹)'}</th>
              <th>${isMarathi ? 'नावे (₹)' : 'Credit (₹)'}</th>
              <th>${isMarathi ? 'शिल्लक (₹)' : 'Balance (₹)'}</th>
            </tr>
          </thead>
          <tbody>
            ${transactionsRows}
          </tbody>
        </table>
        
        <div class="footer">
          <div class="amount-in-words">
          <strong>${isMarathi ? 'शिल्लक रक्कम शब्दांत' : 'Balance Amount in Words'}:</strong> ${numberToIndianWords(Math.floor(absClosingBalance))} Rupees ${Math.round((absClosingBalance % 1) * 100) > 0 ? 'and ' + Math.round((absClosingBalance % 1) * 100) + ' Paise' : 'Only'}
          </div>
          
          <div class="footer-row">
            <div class="footer-left">
              ${isMarathi ? 'धन्यवाद!' : 'Thank You!'}
            </div>
            <div class="footer-right">
              ${isMarathi ? 'शिल्लक रक्कम' : 'Closing Balance'}:
             <span>${absClosingBalance > 0 ? formatCurrency(absClosingBalance) : '₹ 0'}</span>
            </div>
          </div>
          <div class="signature-row">
            <div class="buyer-sign">
              ${isMarathi ? 'ऑपरेटरची सही' : "Operator's Signature"}
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
};

const printBuyerSummary = (buyerData) => {
  const isMarathi = i18n.language === 'mr';
  const { buyer, totalDebit, totalCredit, currentBalance, transactions, businessDetails } = buyerData;
  
  const formattedDate = formatDate(new Date());
  
  // Get business details with fallbacks
  const businessName = businessDetails?.name || (isMarathi ? 'जय शिवराय व्हेजिटेबल' : 'Jai Shivrai Vegetable Co.');
  const businessAddress = businessDetails?.address || (isMarathi ? 'वेसराणे, ता. कळवण जि. नाशिक' : 'Vesarane, Tal. Kalwan, Dist. Nashik');
  const businessPhone = businessDetails?.phone || (isMarathi ? 'प्रो. रोकेश हिरे मो. ९०२१६९९९९१ / ९६२३९५६३९६' : 'Prop. Rakesh Hire M: 9021699991 / 9623956396');
  const businessEmail = businessDetails?.email || '';
  const businessGst = businessDetails?.gstNumber || '';
  const businessPan = businessDetails?.panNumber || '';
  
  // Sort transactions in ascending order (oldest first)
  const sortedTransactions = [...(transactions || [])].sort((a, b) => 
    new Date(a.entryDate) - new Date(b.entryDate)
  );
  
  // CORRECT LOGIC FOR BUYER LEDGER:
  // For Buyer from Company's perspective:
  //   - Credit (Purchase): Buyer owes company → Balance becomes CR (Payable by buyer)
  //   - Debit (Payment): Buyer pays company → Balance reduces CR
  //
  // Formula: runningBalance = Total Credit - Total Debit
  //   - If runningBalance > 0: CR (Payable - Buyer owes company)
  //   - If runningBalance < 0: DR (Receivable - Company owes buyer - Overpayment scenario)
  //   - If runningBalance = 0: Settled
  
  let runningBalance = 0;
  const transactionsWithRunningBalance = sortedTransactions.map(tx => {
    // Credit increases balance (buyer owes more)
    if (tx.credit > 0) {
      runningBalance += tx.credit;
    }
    // Debit decreases balance (buyer pays)
    if (tx.debit > 0) {
      runningBalance -= tx.debit;
    }
    
    const absBalance = Math.abs(runningBalance);
    // If runningBalance > 0: CR (Payable - Buyer owes company)
    // If runningBalance < 0: DR (Receivable - Company owes buyer - Overpayment)
    const balanceType = runningBalance > 0 ? (isMarathi ? 'क्रेडिट' : 'CR') : (runningBalance < 0 ? (isMarathi ? 'डेबिट' : 'DR') : '');
    
    return { ...tx, displayBalance: absBalance, balanceType, runningBalanceValue: runningBalance };
  });
  
  // Build transactions table rows
  const transactionsRows = transactionsWithRunningBalance.map((tx, idx) => {
    const entryDate = new Date(tx.entryDate);
    const formattedTxDate = `${entryDate.getDate().toString().padStart(2, '0')}/${(entryDate.getMonth() + 1).toString().padStart(2, '0')}/${entryDate.getFullYear()}`;
    
    // Format Debit and Credit columns
    let debitDisplay = '-';
    let creditDisplay = '-';
    
    if (tx.debit > 0) {
      debitDisplay = '₹ ' + formatNumber(tx.debit);
    }
    if (tx.credit > 0) {
      creditDisplay = '₹ ' + formatNumber(tx.credit);
    }
    
    return `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="text-align: center;">${formattedTxDate}</td>
        <td style="text-align: left;">${tx.description || 'N/A'}</td>
        <td style="text-align: right;">${debitDisplay}</td>
        <td style="text-align: right;">${creditDisplay}</td>
        <td style="text-align: right;">${tx.displayBalance > 0 ? '₹ ' + formatNumber(tx.displayBalance) : '₹ 0'} ${tx.balanceType}</td>
      </tr>
    `;
  }).join('');
  
  // Calculate final balance
  const finalBalance = runningBalance;
  const finalBalanceType = finalBalance > 0 ? (isMarathi ? 'क्रेडिट' : 'CR') : (finalBalance < 0 ? (isMarathi ? 'डेबिट' : 'DR') : '');
  const absFinalBalance = Math.abs(finalBalance);
 const amountInWords = `${numberToIndianWords(Math.floor(absFinalBalance))} Rupees ${Math.round((absFinalBalance % 1) * 100) > 0 ? 'and ' + Math.round((absFinalBalance % 1) * 100) + ' Paise' : 'Only'}`;
  
  // Balance color: CR (Payable) = Red (D32F2F), DR (Receivable/Overpayment) = Green (2E7D32)
  const balanceColor = finalBalance > 0 ? '#D32F2F' : (finalBalance < 0 ? '#2E7D32' : '#666');
  const balanceText = finalBalance > 0 ? (isMarathi ? 'देणे' : 'To Pay') : (finalBalance < 0 ? (isMarathi ? 'देय' : 'To Receive') : (isMarathi ? 'शून्य' : 'Zero'));
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="${isMarathi ? 'mr' : 'en'}">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${isMarathi ? 'खरेदीदार खाते पुस्तक' : 'Buyer Ledger'} - ${buyer.name}</title>
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
          width: 100%;
          max-width: 900px;
          background: #fff;
          border: 2px solid #b3153f;
          color: #b3153f;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin: 0 auto;
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
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 6px;
          letter-spacing: 1px;
          word-break: break-word;
        }
        .sub {
          font-size: 12px;
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
          font-size: 10px;
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
        .gst-pan-row {
          font-size: 9px;
          margin-top: 4px;
          color: #666;
          text-align: center;
        }
        .details {
          width: 100%;
          border-collapse: collapse;
          color: #b3153f;
        }
        .details td {
          border-bottom: 2px solid #b3153f;
          padding: 10px 12px;
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
        .summary-cards {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 15px;
          flex-wrap: wrap;
        }
        .summary-card {
          flex: 1;
          min-width: 120px;
          border: 2px solid #b3153f;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          background: #fff5f5;
        }
        .summary-card h4 {
          font-size: 12px;
          margin-bottom: 8px;
          color: #b3153f;
        }
        .summary-card .amount {
          font-size: 20px;
          font-weight: bold;
          color: #000;
        }
        .summary-card.debit .amount { color: #2E7D32; }
        .summary-card.credit .amount { color: #D32F2F; }
        .summary-card.balance .amount { color: ${balanceColor}; }
        .main-table {
          width: 100%;
          border-collapse: collapse;
          color: #b3153f;
          margin: 5px 0;
          table-layout: fixed;
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
          font-size: 12px;
          background: #fff5f5;
        }
        .main-table td {
          color: #000;
          font-size: 11px;
          word-break: break-word;
        }
        .col1 { width: 5%; }
        .col2 { width: 10%; }
        .col3 { width: 40%; }
        .col4 { width: 15%; }
        .col5 { width: 15%; }
        .col6 { width: 15%; }
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
          min-height: 130px;
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
          font-size: 12px;
          background: #fff8f0;
          border-top: 1px solid #b3153f;
          color: #555;
          word-break: break-word;
        }
        .note-box {
          padding: 8px 15px;
          background: #fff0e6;
          margin: 5px 0;
          font-size: 11px;
          color: #b3153f;
          text-align: center;
          border-bottom: 1px solid #b3153f;
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
          .summary-card .amount { font-size: 16px; }
          .center-title h1 { font-size: 22px; }
          .footer-right { font-size: 12px; padding: 8px 10px; }
          .footer-right span { font-size: 14px; }
          .contact-email { font-size: 8px; }
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
              ${(businessGst || businessPan) ? `<div class="gst-pan-row">${businessGst ? `${isMarathi ? 'जीएसटी' : 'GST'}: ${businessGst}` : ''}${businessGst && businessPan ? ' | ' : ''}${businessPan ? `${isMarathi ? 'पॅन' : 'PAN'}: ${businessPan}` : ''}</div>` : ''}
              <div class="receipt-badge">${isMarathi ? 'खरेदीदार खाते पुस्तक' : 'BUYER LEDGER'}</div>
            </div>
          </div>
          <div class="contact-row">
            <div class="contact-phone">
              Mobile : ${businessPhone}
            </div>
            ${businessEmail ? `
            <div class="contact-email">
              Email : ${businessEmail}
            </div>
            ` : ''}
          </div>
        </div>
        
        <table class="details">
          <tr>
            <td style="width: 60%;">
              <span class="label">${isMarathi ? 'खरेदीदार नाव' : 'Buyer Name'}:</span>
              <span class="value">${buyer.name}</span>
            </td>
            <td style="width: 40%;">
              <span class="label">${isMarathi ? 'दि.' : 'Date'}:</span>
              <span class="value">${formattedDate}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span class="label">${isMarathi ? 'मोबाइल' : 'Mobile'}:</span>
              <span class="value">${buyer.mobile || 'N/A'}</span>
            </td>
            <td>
              <span class="label">${isMarathi ? 'ईमेल' : 'Email'}:</span>
              <span class="value">${buyer.email || 'N/A'}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span class="label">${isMarathi ? 'पत्ता' : 'Address'}:</span>
              <span class="value">${buyer.fullAddress || buyer.displayName || 'N/A'}</span>
            </td>
            <td>
              </td>
          </tr>
        </table>
        
        <div class="summary-cards">
          <div class="summary-card debit">
            <h4>${isMarathi ? 'एकूण पावत्या' : 'Total Payments (Debit)'}</h4>
            <div class="amount">${formatCurrency(totalDebit)}</div>
          </div>
          <div class="summary-card credit">
            <h4>${isMarathi ? 'एकूण खरेदी' : 'Total Purchases (Credit)'}</h4>
            <div class="amount">${formatCurrency(totalCredit)}</div>
          </div>
          <div class="summary-card balance">
            <h4>${isMarathi ? 'शिल्लक रक्कम' : 'Current Balance'}</h4>
           <div class="amount">${formatCurrency(absFinalBalance)}</div>
          </div>
        </div>
        
       
        
        <table class="main-table">
          <colgroup>
            <col class="col1"/>
            <col class="col2"/>
            <col class="col3"/>
            <col class="col4"/>
            <col class="col5"/>
            <col class="col6"/>
          </colgroup>
          <thead>
            <tr>
              <th>${isMarathi ? 'क्र.' : 'Sr.'}</th>
              <th>${isMarathi ? 'तारीख' : 'Date'}</th>
              <th>${isMarathi ? 'वर्णन' : 'Particulars'}</th>
              <th>${isMarathi ? 'जमा (₹)' : 'Debit (₹)'}</th>
              <th>${isMarathi ? 'नावे (₹)' : 'Credit (₹)'}</th>
              <th>${isMarathi ? 'शिल्लक (₹)' : 'Balance (₹)'}</th>
            </tr>
          </thead>
          <tbody>
            ${transactionsRows}
          </tbody>
        </table>
        
        <div class="footer">
          <div class="amount-in-words">
            <strong>${isMarathi ? 'शिल्लक रक्कम शब्दांत' : 'Balance Amount in Words'}:</strong> ${amountInWords}
          </div>
          
          <div class="footer-row">
            <div class="footer-left">
              ${isMarathi ? 'धन्यवाद!' : 'Thank You!'}
            </div>
            <div class="footer-right">
              ${isMarathi ? 'शिल्लक रक्कम' : 'Balance Amount'}:
             <span>${absFinalBalance > 0 ? formatCurrency(absFinalBalance) : '₹ 0'}</span>
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
};

  const handlePrintSummary = (item, type) => {
    if (type === 'farmer') {
      printFarmerSummary(item);
    } else if (type === 'operator') {
      printOperatorSummary(item);
    } else if (type === 'buyer') {
      printBuyerSummary(item);
    }
    handleActionMenuClose();
  };

  const handleActionMenuOpen = (event, item, type) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedItem(item);
    setSelectedType(type);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedItem(null);
    setSelectedType(null);
  };

  const filteredFarmers = getFilteredFarmers();
  const filteredOperators = getFilteredOperators();
  const filteredBuyers = getFilteredBuyers();
  const paginatedFarmers = getPaginatedData(filteredFarmers);
  const paginatedOperators = getPaginatedData(filteredOperators);
  const paginatedBuyers = getPaginatedData(filteredBuyers);

  const totalPages = activeTab === 'farmers'
    ? Math.ceil(filteredFarmers.length / pagination.limit)
    : activeTab === 'operators'
    ? Math.ceil(filteredOperators.length / pagination.limit)
    : Math.ceil(filteredBuyers.length / pagination.limit);

  const anchorRect = actionMenuAnchor?.getBoundingClientRect();
  const MENU_HEIGHT = 60; // Reduced from 160 to 60 since we only have one button
  const spaceBelow = anchorRect ? window.innerHeight - anchorRect.bottom : 0;
  const openUpward = anchorRect ? spaceBelow < MENU_HEIGHT + 8 : false;

  if (loading && ((activeTab === 'farmers' && !farmersData) || (activeTab === 'operators' && !operatorsData) || (activeTab === 'buyers' && !buyersData))) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('ledger.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('ledger.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('ledger.subtitle')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: '#E8F5E9' }}>
        <div className="flex gap-6">
          <button
            onClick={() => { setActiveTab('farmers'); setPagination(prev => ({ ...prev, page: 1 })); }}
            className={`pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'farmers' ? 'text-[#2E7D32]' : 'text-[#8D6E63] hover:text-[#2E7D32]'}`}
          >
            {t('ledger.tabs.farmersLedger')}
            {activeTab === 'farmers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2E7D32] rounded-full" />}
          </button>
          <button
            onClick={() => { setActiveTab('operators'); setPagination(prev => ({ ...prev, page: 1 })); }}
            className={`pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'operators' ? 'text-[#2E7D32]' : 'text-[#8D6E63] hover:text-[#2E7D32]'}`}
          >
            {t('ledger.tabs.operatorsLedger')}
            {activeTab === 'operators' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2E7D32] rounded-full" />}
          </button>
          <button
            onClick={() => { setActiveTab('buyers'); setPagination(prev => ({ ...prev, page: 1 })); }}
            className={`pb-3 px-1 text-sm font-medium transition-all relative ${activeTab === 'buyers' ? 'text-[#2E7D32]' : 'text-[#8D6E63] hover:text-[#2E7D32]'}`}
          >
            {t('ledger.tabs.buyersLedger')}
            {activeTab === 'buyers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2E7D32] rounded-full" />}
          </button>
        </div>
      </div>

      {/* Summary Stats - Farmers */}
      {activeTab === 'farmers' && farmersData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.stats.totalReceived') || 'Total Received'}</p><p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(farmersData.summary.overallCredit)}</p></div>
              <TrendingUp className="w-8 h-8" style={{ color: '#2E7D32' }} />
            </div>
          </div>
        
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.stats.currentBalance')}</p><p className="text-2xl font-bold mt-1" style={{ color: farmersData.summary.overallBalance >= 0 ? '#2E7D32' : '#D32F2F' }}>{formatCurrency(Math.abs(farmersData.summary.overallBalance))}</p></div>
              <DollarSign className="w-8 h-8" style={{ color: farmersData.summary.overallBalance >= 0 ? '#2E7D32' : '#D32F2F' }} />
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats - Operators */}
      {activeTab === 'operators' && operatorsData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.stats.totalOperators')}</p><p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{operatorsData.summary.totalOperators}</p></div>
              <Users className="w-8 h-8" style={{ color: '#43A047' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.stats.totalSales')}</p><p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(operatorsData.summary.totalSales)}</p></div>
              <DollarSign className="w-8 h-8" style={{ color: '#43A047' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.stats.totalPurchasesOperator')}</p><p className="text-2xl font-bold mt-1" style={{ color: '#D32F2F' }}>{formatCurrency(operatorsData.summary.totalPurchases)}</p></div>
              <TrendingDown className="w-8 h-8" style={{ color: '#D32F2F' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.stats.netProfit')}</p><p className="text-2xl font-bold mt-1" style={{ color: operatorsData.summary.totalNetProfit >= 0 ? '#2E7D32' : '#D32F2F' }}>{formatCurrency(operatorsData.summary.totalNetProfit)}</p></div>
              <TrendingUp className="w-8 h-8" style={{ color: operatorsData.summary.totalNetProfit >= 0 ? '#2E7D32' : '#D32F2F' }} />
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats - Buyers */}
      {activeTab === 'buyers' && buyersData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.stats.totalBuyers')}</p><p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{buyersData.summary.totalBuyers}</p></div>
              <ShoppingBag className="w-8 h-8" style={{ color: '#43A047' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.stats.totalTransactions')}</p><p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{buyersData.summary.totalTransactions}</p></div>
              <Receipt className="w-8 h-8" style={{ color: '#FF8F00' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.stats.totalPayments')}</p><p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>{formatCurrency(buyersData.summary.overallDebit)}</p></div>
              <TrendingUp className="w-8 h-8" style={{ color: '#2E7D32' }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.stats.totalPurchases')}</p><p className="text-2xl font-bold mt-1" style={{ color: '#D32F2F' }}>{formatCurrency(buyersData.summary.overallCredit)}</p></div>
              <TrendingDown className="w-8 h-8" style={{ color: '#D32F2F' }} />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
          <button onClick={handleRefresh} className="ml-auto text-sm text-red-600 hover:underline">{t('common.retry')}</button>
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
                placeholder={activeTab === 'farmers' ? t('ledger.search.farmersPlaceholder') : activeTab === 'operators' ? t('ledger.search.operatorsPlaceholder') : t('ledger.search.buyersPlaceholder')}
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
            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-[#F1F8E9]' : 'hover:bg-gray-50'}`} style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>
              <Filter className="w-4 h-4" /> {t('common.filter')}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: '#E8F5E9', background: '#FAFAFA' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('ledger.filters.startDate')}</label><input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }} /></div>
              <div><label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>{t('ledger.filters.endDate')}</label><input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9' }} /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={clearFilters} className="px-3 py-1 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}>{t('common.clearAll')}</button>
              <button onClick={() => setShowFilters(false)} className="px-3 py-1 border rounded-lg text-sm" style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}>{t('common.cancel')}</button>
              <button onClick={applyFilters} className="px-3 py-1 rounded-lg text-white text-sm" style={{ background: '#2E7D32' }}>{t('common.apply')}</button>
            </div>
          </div>
        )}
      </div>

      {/* Farmers Table */}
      {activeTab === 'farmers' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} /><span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span></div>
          ) : paginatedFarmers.length === 0 ? (
            <div className="text-center py-12"><BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} /><p className="text-sm" style={{ color: '#8D6E63' }}>{t('ledger.noFarmersFound')}</p>{searchTerm && <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">{t('common.clearFilters')}</button>}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.farmer')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.contact')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.totalPaid')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.totalPurchased')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.balance')}</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFarmers.map((farmerData, idx) => {
                      const { farmer, totalDebit, totalCredit, currentBalance } = farmerData;
                      const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedItem?.farmer?._id === farmer._id && selectedType === 'farmer';
                      const balanceColor = currentBalance >= 0 ? '#2E7D32' : '#D32F2F';
                      const formattedAddress = getFormattedAddress(farmer);
                      return (
                        <tr key={farmer._id} className="hover:bg-green-50 transition-colors" style={{ borderBottom: idx !== paginatedFarmers.length - 1 ? '1px solid #E8F5E9' : 'none' }}>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5" style={{ color: '#2E7D32' }} />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{farmer.name}</p>
                                  <p className="text-xs" style={{ color: '#8D6E63' }}>{formattedAddress}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4"><div className="flex items-center gap-2"><Phone className="w-3 h-3" style={{ color: '#8D6E63' }} /><span className="text-xs" style={{ color: '#5D4037' }}>{farmer.mobile || 'N/A'}</span></div></td>
                          <td className="px-6 py-4 text-right"><span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{formatCurrency(totalDebit)}</span></td>
                          <td className="px-6 py-4 text-right"><span className="text-sm font-semibold" style={{ color: '#D32F2F' }}>{formatCurrency(totalCredit)}</span></td>
                          <td className="px-6 py-4 text-right"><span className="text-sm font-bold" style={{ color: balanceColor }}>{formatCurrency(Math.abs(currentBalance))}</span></td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={(e) => handleActionMenuOpen(e, farmerData, 'farmer')} className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto" style={{ color: '#2E7D32' }}><MoreVertical className="w-4 h-4" /><span className="text-xs font-medium">{t('common.actions')}</span></button>
                            {isActionMenuOpen && anchorRect && (
                              <div className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50" style={{ borderColor: '#E8F5E9', width: '180px', position: 'fixed', top: openUpward ? anchorRect.top - MENU_HEIGHT - 4 : anchorRect.bottom + 4, left: anchorRect.left - 100 }}>
                                <button onClick={() => handlePrintSummary(farmerData, 'farmer')} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors" style={{ color: '#1565C0' }}><Printer className="w-4 h-4" />{t('ledger.buttons.printSummary')}</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                  <div className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.pagination.showingFarmers', { start: (pagination.page - 1) * pagination.limit + 1, end: Math.min(pagination.page * pagination.limit, filteredFarmers.length), total: filteredFarmers.length })}</div>
                  <div className="flex gap-2">
                    <button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>{t('common.previous')}</button>
                    <div className="flex gap-1">{[...Array(Math.min(totalPages, 5))].map((_, i) => { let pageNum = totalPages <= 5 ? i + 1 : (pagination.page <= 3 ? i + 1 : (pagination.page >= totalPages - 2 ? totalPages - 4 + i : pagination.page - 2 + i)); return (<button key={pageNum} onClick={() => setPagination({ ...pagination, page: pageNum })} className="w-8 h-8 rounded border text-sm transition-all" style={{ borderColor: '#C8E6C9', background: pagination.page === pageNum ? '#2E7D32' : 'white', color: pagination.page === pageNum ? 'white' : '#2E7D32' }}>{pageNum}</button>); })}</div>
                    <button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === totalPages} className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>{t('common.next')}</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Operators Table */}
      {activeTab === 'operators' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} /><span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span></div>
          ) : paginatedOperators.length === 0 ? (
            <div className="text-center py-12"><BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} /><p className="text-sm" style={{ color: '#8D6E63' }}>{t('ledger.noOperatorsFound')}</p>{searchTerm && <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">{t('common.clearFilters')}</button>}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.operator')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.contact')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.totalSales')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.totalPurchasedOperator')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.netProfit')}</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOperators.map((operatorData, idx) => {
                      const { operator, financialSummary } = operatorData;
                      const netProfit = financialSummary.netProfit || 0;
                      const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedItem?.operator?.id === operator.id && selectedType === 'operator';
                      const profitColor = netProfit >= 0 ? '#2E7D32' : '#D32F2F';
                      return (
                        <tr key={operator.id} className="hover:bg-green-50 transition-colors" style={{ borderBottom: idx !== paginatedOperators.length - 1 ? '1px solid #E8F5E9' : 'none' }}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5" style={{ color: '#2E7D32' }} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{operator.name}</p>
                                <p className="text-xs" style={{ color: '#8D6E63' }}>{operator.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {operator.email && (
                                <div className="flex items-center gap-2 mb-1">
                                  <Mail className="w-3 h-3" style={{ color: '#8D6E63' }} />
                                  <span className="text-xs break-all" style={{ color: '#5D4037' }}>{operator.email}</span>
                                </div>
                              )}
                              {operator.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3 h-3" style={{ color: '#8D6E63' }} />
                                  <span className="text-xs" style={{ color: '#5D4037' }}>{operator.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right"><span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{formatCurrency(financialSummary.totalSales)}</span></td>
                          <td className="px-6 py-4 text-right"><span className="text-sm font-semibold" style={{ color: '#D32F2F' }}>{formatCurrency(financialSummary.totalPurchases)}</span></td>
                          <td className="px-6 py-4 text-right"><span className="text-sm font-bold" style={{ color: profitColor }}>{formatCurrency(netProfit)}</span></td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={(e) => handleActionMenuOpen(e, operatorData, 'operator')} className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto" style={{ color: '#2E7D32' }}><MoreVertical className="w-4 h-4" /><span className="text-xs font-medium">{t('common.actions')}</span></button>
                            {isActionMenuOpen && anchorRect && (
                              <div className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50" style={{ borderColor: '#E8F5E9', width: '180px', position: 'fixed', top: openUpward ? anchorRect.top - MENU_HEIGHT - 4 : anchorRect.bottom + 4, left: anchorRect.left - 100 }}>
                                <button onClick={() => handlePrintSummary(operatorData, 'operator')} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors" style={{ color: '#1565C0' }}><Printer className="w-4 h-4" />{t('ledger.buttons.printSummary')}</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                  <div className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.pagination.showingOperators', { start: (pagination.page - 1) * pagination.limit + 1, end: Math.min(pagination.page * pagination.limit, filteredOperators.length), total: filteredOperators.length })}</div>
                  <div className="flex gap-2"><button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>{t('common.previous')}</button><div className="flex gap-1">{[...Array(Math.min(totalPages, 5))].map((_, i) => { let pageNum = totalPages <= 5 ? i + 1 : (pagination.page <= 3 ? i + 1 : (pagination.page >= totalPages - 2 ? totalPages - 4 + i : pagination.page - 2 + i)); return (<button key={pageNum} onClick={() => setPagination({ ...pagination, page: pageNum })} className="w-8 h-8 rounded border text-sm transition-all" style={{ borderColor: '#C8E6C9', background: pagination.page === pageNum ? '#2E7D32' : 'white', color: pagination.page === pageNum ? 'white' : '#2E7D32' }}>{pageNum}</button>); })}</div><button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === totalPages} className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>{t('common.next')}</button></div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Buyers Table */}
      {activeTab === 'buyers' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin" style={{ color: '#2E7D32' }} /><span className="ml-2 text-sm" style={{ color: '#2E7D32' }}>{t('common.loading')}</span></div>
          ) : paginatedBuyers.length === 0 ? (
            <div className="text-center py-12"><BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: '#C8E6C9' }} /><p className="text-sm" style={{ color: '#8D6E63' }}>{t('ledger.noBuyersFound')}</p>{searchTerm && <button onClick={clearFilters} className="mt-2 text-sm text-[#2E7D32] hover:underline">{t('common.clearFilters')}</button>}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#1B3A1F', borderBottom: '1px solid #2E5A32' }}>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.buyer')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.contact')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.totalPayments')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.totalPurchased')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.balance')}</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>{t('ledger.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBuyers.map((buyerData, idx) => {
                      const { buyer, totalDebit, totalCredit, currentBalance } = buyerData;
                      const isActionMenuOpen = Boolean(actionMenuAnchor) && selectedItem?.buyer?._id === buyer._id && selectedType === 'buyer';
                      const balanceColor = currentBalance <= 0 ? '#D32F2F' : '#2E7D32';
                      return (
                        <tr key={buyer._id} className="hover:bg-green-50 transition-colors" style={{ borderBottom: idx !== paginatedBuyers.length - 1 ? '1px solid #E8F5E9' : 'none' }}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="w-5 h-5" style={{ color: '#2E7D32' }} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{buyer.name}</p>
                                <p className="text-xs" style={{ color: '#8D6E63' }}>{buyer.displayName || buyer.fullAddress || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {buyer.email && (
                                <div className="flex items-center gap-2 mb-1">
                                  <Mail className="w-3 h-3" style={{ color: '#8D6E63' }} />
                                  <span className="text-xs break-all" style={{ color: '#5D4037' }}>{buyer.email}</span>
                                </div>
                              )}
                              {buyer.mobile && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3 h-3" style={{ color: '#8D6E63' }} />
                                  <span className="text-xs" style={{ color: '#5D4037' }}>{buyer.mobile}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right"><span className="text-sm font-semibold" style={{ color: '#2E7D32' }}>{formatCurrency(totalDebit)}</span></td>
                          <td className="px-6 py-4 text-right"><span className="text-sm font-semibold" style={{ color: '#D32F2F' }}>{formatCurrency(totalCredit)}</span></td>
                          <td className="px-6 py-4 text-right"><span className="text-sm font-bold" style={{ color: balanceColor }}>{formatCurrency(Math.abs(currentBalance))}</span></td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={(e) => handleActionMenuOpen(e, buyerData, 'buyer')} className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1 mx-auto" style={{ color: '#2E7D32' }}><MoreVertical className="w-4 h-4" /><span className="text-xs font-medium">{t('common.actions')}</span></button>
                            {isActionMenuOpen && anchorRect && (
                              <div className="fixed bg-white rounded-lg shadow-xl border overflow-hidden z-50" style={{ borderColor: '#E8F5E9', width: '180px', position: 'fixed', top: openUpward ? anchorRect.top - MENU_HEIGHT - 4 : anchorRect.bottom + 4, left: anchorRect.left - 100 }}>
                                <button onClick={() => handlePrintSummary(buyerData, 'buyer')} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors" style={{ color: '#1565C0' }}><Printer className="w-4 h-4" />{t('ledger.buttons.printSummary')}</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex justify-between items-center flex-wrap gap-4" style={{ borderColor: '#E8F5E9' }}>
                  <div className="text-xs" style={{ color: '#8D6E63' }}>{t('ledger.pagination.showingBuyers', { start: (pagination.page - 1) * pagination.limit + 1, end: Math.min(pagination.page * pagination.limit, filteredBuyers.length), total: filteredBuyers.length })}</div>
                  <div className="flex gap-2"><button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>{t('common.previous')}</button><div className="flex gap-1">{[...Array(Math.min(totalPages, 5))].map((_, i) => { let pageNum = totalPages <= 5 ? i + 1 : (pagination.page <= 3 ? i + 1 : (pagination.page >= totalPages - 2 ? totalPages - 4 + i : pagination.page - 2 + i)); return (<button key={pageNum} onClick={() => setPagination({ ...pagination, page: pageNum })} className="w-8 h-8 rounded border text-sm transition-all" style={{ borderColor: '#C8E6C9', background: pagination.page === pageNum ? '#2E7D32' : 'white', color: pagination.page === pageNum ? 'white' : '#2E7D32' }}>{pageNum}</button>); })}</div><button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === totalPages} className="px-3 py-1 rounded border text-sm disabled:opacity-50 hover:bg-gray-50 transition-all" style={{ borderColor: '#C8E6C9', color: '#2E7D32' }}>{t('common.next')}</button></div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Global Backdrop for Action Menu */}
      {Boolean(actionMenuAnchor) && (
        <div className="fixed inset-0 z-40" onClick={handleActionMenuClose} style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }} />
      )}
    </div>
  );
};

export default Ledger;
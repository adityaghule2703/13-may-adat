// // src/pages/openingBalance/OpeningBalance.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import {
//   TrendingUp, Calendar, DollarSign, Wallet, CheckCircle, XCircle,
//   AlertCircle, Loader, Edit2, Save, X, Plus, RefreshCw,
//   Building2, Phone, Mail, MapPin, Clock, History, Banknote,
//   FileText, Shield, User, Settings, Download, Filter, Users,
//   Eye, Printer, FileSpreadsheet
// } from 'lucide-react';
// import axios from 'axios';
// import BASE_URL from '../../config/Config';

// const OpeningBalance = () => {
//   const { t, i18n } = useTranslation();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [showExportModal, setShowExportModal] = useState(false);
//   const [showDayBookModal, setShowDayBookModal] = useState(false);
//   const [businessDetails, setBusinessDetails] = useState(null);
//   const [openingBalance, setOpeningBalance] = useState(null);
//   const [operators, setOperators] = useState([]);
//   const [loadingOperators, setLoadingOperators] = useState(false);
//   const [exporting, setExporting] = useState(false);
//   const [loadingDayBook, setLoadingDayBook] = useState(false);
//   const [dayBookData, setDayBookData] = useState(null);
  
//   const [formData, setFormData] = useState({
//     amount: '',
//     type: 'debit',
//     asOfDate: new Date().toISOString().split('T')[0],
//     notes: ''
//   });

//   const [exportData, setExportData] = useState({
//     startDate: new Date().toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0],
//     operatorId: '',
//     type: ''
//   });

//   const [dayBookFilters, setDayBookFilters] = useState({
//     startDate: new Date().toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0]
//   });

//   const getToken = () => localStorage.getItem('token');

//   const fetchOpeningBalance = async () => {
//     try {
//       const token = getToken();
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       const response = await axios.get(`${BASE_URL}/opening-balance`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         setBusinessDetails(response.data.businessDetails);
//         if (response.data.data) {
//           const asOfDate = response.data.data.asOfDate 
//             ? new Date(response.data.data.asOfDate).toISOString().split('T')[0]
//             : new Date().toISOString().split('T')[0];
          
//           setOpeningBalance({
//             _id: response.data.data._id,
//             amount: response.data.data.amount,
//             type: response.data.data.type,
//             asOfDate: asOfDate,
//             notes: response.data.data.notes || '',
//             createdAt: response.data.data.createdAt,
//             updatedAt: response.data.data.updatedAt,
//             createdBy: response.data.data.createdBy
//           });
//         }
//       }
//     } catch (err) {
//       console.error('Error fetching opening balance:', err);
//       if (err.response?.status === 404) {
//         setOpeningBalance(null);
//       } else {
//         setError(err.response?.data?.message || t('common.networkError'));
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOperators = async () => {
//     setLoadingOperators(true);
//     try {
//       const token = getToken();
//       const response = await axios.get(`${BASE_URL}/auth/all`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         const operatorUsers = response.data.data.filter(user => user.role === 'operator');
//         setOperators(operatorUsers);
//       }
//     } catch (err) {
//       console.error('Error fetching operators:', err);
//       setError(t('common.networkError'));
//     } finally {
//       setLoadingOperators(false);
//     }
//   };

//  const fetchDayBook = async () => {
//   console.log("=== fetchDayBook called ===");
//   console.log("Current filters:", dayBookFilters);
  
//   if (!dayBookFilters.startDate || !dayBookFilters.endDate) {
//     console.error("Missing dates!");
//     setError('Please select both start date and end date');
//     return;
//   }

//   if (new Date(dayBookFilters.startDate) > new Date(dayBookFilters.endDate)) {
//     console.error("Invalid date range!");
//     setError('Start date cannot be after end date');
//     return;
//   }

//   setLoadingDayBook(true);
//   setError(null);

//   try {
//     const token = getToken();
//     console.log("Token exists?", !!token);
    
//     const url = `${BASE_URL}/daybook?startDate=${dayBookFilters.startDate}&endDate=${dayBookFilters.endDate}&format=json`;
//     console.log("Fetching from URL:", url);
    
//     const response = await axios.get(url, {
//       headers: { 'Authorization': `Bearer ${token}` }
//     });

//     console.log("Response status:", response.status);
//     console.log("Response data:", response.data);
//     console.log("Response data structure:", Object.keys(response.data));
    
//     if (response.data.success) {
//       console.log("Success! Data received");
//       console.log("Data.entries:", response.data.data?.entries);
//       console.log("Number of entries:", response.data.data?.entries?.length);
      
//       setDayBookData(response.data);
      
//       // Show success message with entry count
//       const entryCount = response.data.data?.entries?.length || 0;
//       console.log(`Found ${entryCount} entries`);
//       setSuccess(`Found ${entryCount} entries for the selected period`);
//       setTimeout(() => setSuccess(null), 3000);
//     } else {
//       console.error("API returned success=false:", response.data.message);
//       setError(response.data.message || 'Failed to fetch day book data');
//     }
//   } catch (err) {
//     console.error("=== ERROR in fetchDayBook ===");
//     console.error("Error object:", err);
//     console.error("Error response:", err.response);
//     console.error("Error message:", err.message);
//     setError(err.response?.data?.message || 'Network error occurred');
//   } finally {
//     setLoadingDayBook(false);
//     console.log("fetchDayBook completed");
//   }
// };

// const printDayBook = () => {
//   if (!dayBookData) return;

//   const isMarathi = i18n.language === 'mr';
//   const { data, businessDetails: business, generatedAt } = dayBookData;
//   const { period, summary, entries } = data;

//   // Debug business keys
//   console.log("Business object:", JSON.stringify(business));

//   const businessName = business?.businessName || business?.name || (isMarathi ? 'जय शिवराय व्हेजिटेबल' : 'Jai Shivrai Vegetable Co.');
//   const businessAddress = business?.fullAddress || business?.businessAddress || business?.address || (isMarathi ? 'वेसराणे, ता. कळवण जि. नाशिक' : 'Vesarane, Tal. Kalwan, Dist. Nashik');
//   const businessPhone = business?.phone || business?.businessPhone || business?.contactPhone || (isMarathi ? 'प्रो. रोकेश हिरे मो. ९०२१६९९९९१ / ९६२३९५६३९६' : 'Prop. Rakesh Hire M: 9021699991 / 9623956396');
//   const businessEmail = business?.email || business?.businessEmail || '';
//   const businessGst = business?.gstNumber || business?.gst || '';
//   const businessPan = business?.panNumber || business?.pan || '';

//   const formatDate = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     const date = new Date(dateStr);
//     return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
//   };

//   const formatDateTime = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     const date = new Date(dateStr);
//     return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   const getCashFlowBadge = (cashFlow) => {
//     if (cashFlow === 'outflow') {
//       return '<span style="color: #D32F2F; font-weight: bold;">Outflow ▼</span>';
//     } else if (cashFlow === 'inflow') {
//       return '<span style="color: #2E7D32; font-weight: bold;">Inflow ▲</span>';
//     }
//     return '-';
//   };

//   const getTypeBadge = (type) => {
//     const colors = {
//       PURCHASE: '#FF6F00',
//       SALE: '#2E7D32',
//       PAYMENT: '#1565C0',
//       EXPENSE: '#9C27B0',
//       ADVANCE: '#FFB74D'
//     };
//     const color = colors[type] || '#666';
//     return `<span style="background: ${color}20; color: ${color}; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block;">${type}</span>`;
//   };

//   let entriesRows = '';

//   if (entries && Array.isArray(entries) && entries.length > 0) {
//     entriesRows = entries.map((entry, idx) => {
//       let formattedDate = 'N/A';
//       if (entry.date) {
//         const transactionDate = new Date(entry.date);
//         formattedDate = `${transactionDate.getDate().toString().padStart(2, '0')}/${(transactionDate.getMonth() + 1).toString().padStart(2, '0')}/${transactionDate.getFullYear()}`;
//       }

//       const formattedTime = entry.formattedTime || '';
//       const dateDisplay = formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
//       const partyName = entry.party?.name || entry.party || '-';

//       let description = entry.description || 'N/A';
//       if (entry.referenceNo) {
//         description += `<div style="font-size: 9px; color: #888; margin-top: 3px;">Ref: ${entry.referenceNo}</div>`;
//       }

//       const subtype = entry.subtype ? `<div style="font-size: 9px; color: #999; margin-top: 2px;">${entry.subtype}</div>` : '';
//       const paymentMode = entry.paymentMode ? `<div style="font-size: 9px; color: #999;">Mode: ${entry.paymentMode}</div>` : '';

//       return `
//         <tr>
//           <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">${idx + 1}</td>
//           <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">
//             ${dateDisplay}
//             ${subtype}
//           </td>
//           <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">
//             ${getTypeBadge(entry.type)}
//           </td>
//           <td style="text-align: left; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">
//             ${description}
//             ${paymentMode}
//           </td>
//           <td style="text-align: left; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">${partyName}</td>
//           <td style="text-align: right; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top; font-weight: ${entry.debit > 0 ? 'bold' : 'normal'}; color: ${entry.debit > 0 ? '#D32F2F' : '#333'};">${entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
//           <td style="text-align: right; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top; font-weight: ${entry.credit > 0 ? 'bold' : 'normal'}; color: ${entry.credit > 0 ? '#2E7D32' : '#333'};">${entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
//           <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">${getCashFlowBadge(entry.cashFlow)}</td>
//           <td style="text-align: right; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top; font-weight: bold;">${formatCurrency(Math.abs(entry.runningBalance || 0))}</td>
//         </tr>
//       `;
//     }).join('');
//   } else {
//     entriesRows = `
//       <tr>
//         <td colspan="9" style="text-align: center; padding: 40px; border: 1px solid #b3153f;">
//           <div style="font-size: 14px; color: #999;">No entries found for the selected period</div>
//         </td>
//       </tr>
//     `;
//   }

//   const printWindow = window.open('', '_blank');

//   const htmlContent = `
//     <!DOCTYPE html>
//     <html lang="${isMarathi ? 'mr' : 'en'}">
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//       <title>Day Book - ${formatDate(period.start)} to ${formatDate(period.end)}</title>
//       <style>
//         * { margin: 0; padding: 0; box-sizing: border-box; }
//         body {
//           background: #e5e5e5;
//           display: flex;
//           justify-content: center;
//           align-items: flex-start;
//           padding: 30px 20px;
//           font-family: 'Arial', 'Noto Sans', 'Segoe UI', sans-serif;
//         }
//         .receipt {
//           width: 100%;
//           max-width: 1400px;
//           background: #fff;
//           border: 2px solid #b3153f;
//           color: #b3153f;
//           box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//           margin: 0 auto;
//         }
//         .top-header {
//           border-bottom: 2px solid #b3153f;
//           padding: 12px 15px 0px;
//         }
//         .title-section {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }
//         .center-title {
//           flex: 1;
//           text-align: center;
//           padding: 0 10px 10px;
//         }
//         .center-title h1 {
//           font-size: 28px;
//           font-weight: 700;
//           line-height: 1.2;
//           margin-bottom: 6px;
//           letter-spacing: 1px;
//           word-break: break-word;
//         }
//         .sub {
//           font-size: 12px;
//           font-weight: bold;
//           word-break: break-word;
//         }
//         .receipt-badge {
//           display: inline-block;
//           background: #b3153f;
//           color: white;
//           padding: 5px 15px;
//           border-radius: 20px;
//           font-size: 14px;
//           font-weight: bold;
//           margin-top: 8px;
//         }
//         .gst-pan-row {
//           font-size: 9px;
//           margin-top: 4px;
//           color: #666;
//           text-align: center;
//         }
//         .contact-row {
//           border-top: 2px solid #b3153f;
//           padding: 8px 15px;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           font-size: 11px;
//           font-weight: bold;
//           flex-wrap: wrap;
//           gap: 5px;
//           min-height: 36px;
//         }
//         .contact-phone {
//           flex: 1;
//           text-align: left;
//           color: #b3153f;
//         }
//         .contact-email {
//           flex: 1;
//           text-align: right;
//           color: #b3153f;
//           word-break: break-all;
//         }
//         .period-header {
//           background: #fff5f0;
//           padding: 10px 15px;
//           text-align: center;
//           font-size: 14px;
//           font-weight: bold;
//           border-bottom: 1px solid #b3153f;
//           color: #b3153f;
//         }
//         .summary-cards {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 12px;
//           padding: 15px;
//           background: #fffaf5;
//           border-bottom: 2px solid #b3153f;
//         }
//         .summary-card {
//           flex: 1;
//           min-width: 130px;
//           border: 1px solid #b3153f;
//           border-radius: 8px;
//           padding: 10px;
//           text-align: center;
//           background: white;
//         }
//         .summary-card h4 {
//           font-size: 11px;
//           margin-bottom: 6px;
//           color: #b3153f;
//         }
//         .summary-card .amount {
//           font-size: 16px;
//           font-weight: bold;
//         }
//         .main-table {
//           width: 100%;
//           border-collapse: collapse;
//           font-size: 11px;
//         }
//         .main-table th,
//         .main-table td {
//           border: 1px solid #b3153f;
//           padding: 8px 6px;
//           vertical-align: middle;
//         }
//         .main-table th {
//           background: #fff5f5;
//           font-weight: bold;
//           text-align: center;
//         }
//         .footer {
//           border-top: 2px solid #b3153f;
//           margin-top: 5px;
//         }
//         .footer-row {
//           display: flex;
//           border-bottom: 2px solid #b3153f;
//           flex-wrap: wrap;
//         }
//         .footer-left {
//           flex: 1;
//           padding: 12px 15px;
//           font-size: 14px;
//           font-weight: bold;
//           color: #b3153f;
//         }
//         .footer-right {
//           width: 320px;
//           border-left: 2px solid #b3153f;
//           padding: 12px 15px;
//           font-size: 16px;
//           font-weight: bold;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 10px;
//           color: #b3153f;
//         }
//         .footer-right span {
//           color: #000;
//           font-size: 18px;
//           font-weight: bold;
//         }
//         .generated-info {
//           padding: 8px 15px;
//           font-size: 9px;
//           color: #999;
//           text-align: right;
//         }
//         @media print {
//           body { background: white; padding: 0; margin: 0; }
//           .receipt { box-shadow: none; margin: 0; width: 100%; }
//           .main-table th { background: #fff5f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//           .summary-cards { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//         }
//         @media (max-width: 768px) {
//           .main-table { font-size: 8px; }
//           .summary-card .amount { font-size: 12px; }
//           .center-title h1 { font-size: 22px; }
//         }
//       </style>
//     </head>
//     <body>
//       <div class="receipt">

//         <!-- HEADER -->
//         <div class="top-header">
//           <div class="title-section">
//             <div class="center-title">
//               <h1>${businessName}</h1>
//               <div class="sub">${businessAddress}</div>
//               ${(businessGst || businessPan)
//                 ? `<div class="gst-pan-row">${businessGst ? `GST: ${businessGst}` : ''}${businessGst && businessPan ? ' | ' : ''}${businessPan ? `PAN: ${businessPan}` : ''}</div>`
//                 : ''}
//               <div class="receipt-badge">DAY BOOK</div>
//             </div>
//           </div>

//           <!-- HORIZONTAL LINE + CONTACT ROW BELOW IT -->
//           <div class="contact-row">
//             <div class="contact-phone">Mobile : ${businessPhone}</div>
//             ${businessEmail ? `<div class="contact-email">Email : ${businessEmail}</div>` : '<div></div>'}
//           </div>
//         </div>

//         <!-- PERIOD -->
//         <div class="period-header">
//            Period: ${formatDate(period.start)} to ${formatDate(period.end)}
//         </div>

//         <!-- SUMMARY CARDS -->
//         <div class="summary-cards">
//           <div class="summary-card">
//             <h4>Total Purchases</h4>
//             <div class="amount" style="color: #D32F2F;">${formatCurrency(summary.totalPurchases)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Total Sales</h4>
//             <div class="amount" style="color: #2E7D32;">${formatCurrency(summary.totalSales)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Payments Out</h4>
//             <div class="amount" style="color: #D32F2F;">${formatCurrency(summary.totalPaymentsOut)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Payments In</h4>
//             <div class="amount" style="color: #2E7D32;">${formatCurrency(summary.totalPaymentsIn)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Total Expenses</h4>
//             <div class="amount" style="color: #FF6F00;">${formatCurrency(summary.totalExpenses)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Net Cash Flow</h4>
//             <div class="amount" style="color: ${summary.netCashFlow >= 0 ? '#2E7D32' : '#D32F2F'};">${formatCurrency(Math.abs(summary.netCashFlow))}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Opening Balance</h4>
//             <div class="amount" style="color: #1565C0;">${formatCurrency(summary.openingBalance)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Closing Balance</h4>
//             <div class="amount" style="color: ${summary.closingBalance >= 0 ? '#2E7D32' : '#D32F2F'};">${formatCurrency(Math.abs(summary.closingBalance))}</div>
//           </div>
//         </div>

//         <!-- ENTRIES TABLE -->
//         <table class="main-table">
//           <thead>
//             <tr>
//               <th style="width: 5%;">#</th>
//               <th style="width: 12%;">Date</th>
//               <th style="width: 10%;">Type</th>
//               <th style="width: 25%;">Description</th>
//               <th style="width: 12%;">Party</th>
//               <th style="width: 10%;">Debit (₹)</th>
//               <th style="width: 10%;">Credit (₹)</th>
//               <th style="width: 8%;">Cash Flow</th>
//               <th style="width: 8%;">Balance (₹)</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${entriesRows}
//           </tbody>
//         </table>

//         <!-- FOOTER -->
//         <div class="footer">
//           <div class="footer-row">
//             <div class="footer-left">
//                Total Entries: ${summary.totalEntries || 0} &nbsp;|&nbsp; ${isMarathi ? 'धन्यवाद!' : 'Thank You!'}
//             </div>
//             <div class="footer-right">
//               Closing Balance:
//               <span>${formatCurrency(Math.abs(summary.closingBalance))}</span>
//             </div>
//           </div>
//           <div class="generated-info">
//             Generated on: ${formatDateTime(generatedAt)}
//           </div>
//         </div>

//       </div>
//     </body>
//     </html>
//   `;

//   printWindow.document.write(htmlContent);
//   printWindow.document.close();
//   printWindow.focus();
//   setTimeout(() => {
//     printWindow.print();
//   }, 500);
// };

//   const openDayBookModal = () => {
//     setDayBookFilters({
//       startDate: new Date().toISOString().split('T')[0],
//       endDate: new Date().toISOString().split('T')[0]
//     });
//     setDayBookData(null);
//     setShowDayBookModal(true);
//     setError(null);
//   };

//   const closeDayBookModal = () => {
//     setShowDayBookModal(false);
//     setDayBookData(null);
//     setError(null);
//   };

//   const handleDayBookView = async () => {
//     await fetchDayBook();
//   };

//   useEffect(() => {
//     fetchOpeningBalance();
//   }, []);

//   const openModal = () => {
//     if (openingBalance) {
//       setFormData({
//         amount: openingBalance.amount.toString(),
//         type: openingBalance.type,
//         asOfDate: openingBalance.asOfDate,
//         notes: openingBalance.notes
//       });
//     } else {
//       setFormData({
//         amount: '',
//         type: 'debit',
//         asOfDate: new Date().toISOString().split('T')[0],
//         notes: ''
//       });
//     }
//     setShowModal(true);
//     setError(null);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setError(null);
//   };

//   const openExportModal = () => {
//     setExportData({
//       startDate: new Date().toISOString().split('T')[0],
//       endDate: new Date().toISOString().split('T')[0],
//       operatorId: '',
//       type: ''
//     });
//     setShowExportModal(true);
//     fetchOperators();
//     setError(null);
//   };

//   const closeExportModal = () => {
//     setShowExportModal(false);
//     setError(null);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleExportInputChange = (e) => {
//     const { name, value } = e.target;
//     setExportData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleDayBookFilterChange = (e) => {
//     const { name, value } = e.target;
//     setDayBookFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     if (!formData.amount || parseFloat(formData.amount) <= 0) {
//       setError(t('openingBalance.errors.validAmountRequired'));
//       return false;
//     }
//     if (!formData.asOfDate) {
//       setError(t('openingBalance.errors.dateRequired'));
//       return false;
//     }
//     if (!formData.type) {
//       setError(t('openingBalance.errors.typeRequired'));
//       return false;
//     }
//     return true;
//   };

//   const validateExportForm = () => {
//     if (!exportData.startDate) {
//       setError(t('daybook.errors.startDateRequired'));
//       return false;
//     }
//     if (!exportData.endDate) {
//       setError(t('daybook.errors.endDateRequired'));
//       return false;
//     }
//     if (new Date(exportData.startDate) > new Date(exportData.endDate)) {
//       setError(t('daybook.errors.invalidDateRange'));
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     setSaving(true);
//     setError(null);

//     try {
//       const token = getToken();
//       const payload = {
//         amount: parseFloat(formData.amount),
//         type: formData.type,
//         asOfDate: formData.asOfDate,
//         notes: formData.notes || ''
//       };

//       const response = await axios.post(`${BASE_URL}/opening-balance`, payload, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         setSuccess(openingBalance 
//           ? t('openingBalance.messages.updateSuccess')
//           : t('openingBalance.messages.createSuccess')
//         );
//         closeModal();
//         fetchOpeningBalance();
//         setTimeout(() => setSuccess(null), 3000);
//       }
//     } catch (err) {
//       console.error('Error saving opening balance:', err);
//       setError(err.response?.data?.message || t('common.networkError'));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleExport = async () => {
//     if (!validateExportForm()) return;

//     setExporting(true);
//     setError(null);

//     try {
//       const token = getToken();
//       const queryParams = new URLSearchParams({
//         startDate: exportData.startDate,
//         endDate: exportData.endDate
//       });
      
//       if (exportData.operatorId) queryParams.append('operatorId', exportData.operatorId);
//       if (exportData.type) queryParams.append('type', exportData.type);

//       // Changed from CSV to Excel export
//       const response = await axios.get(`${BASE_URL}/daybook/export/excel?${queryParams}`, {
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//         },
//         responseType: 'blob'
//       });

//       // Create blob with Excel MIME type
//       const blob = new Blob([response.data], { 
//         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
//       });
      
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `daybook_${exportData.startDate}_to_${exportData.endDate}.xlsx`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);

//       setSuccess(t('daybook.messages.exportSuccess'));
//       closeExportModal();
//       setTimeout(() => setSuccess(null), 3000);
//     } catch (err) {
//       console.error('Error exporting daybook:', err);
//       setError(err.response?.data?.message || t('common.networkError'));
//     } finally {
//       setExporting(false);
//     }
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   const formatDate = (date) => {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const formatDateTime = (date) => {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
//         <span className="ml-2" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('openingBalance.title')}</h1>
//           <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('openingBalance.subtitle')}</p>
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={openDayBookModal}
//             className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
//             style={{ borderColor: '#C8E6C9', color: '#1565C0', background: '#E3F2FD' }}
//           >
//             <Eye className="w-4 h-4" />
//             View Day Book
//           </button>
//           <button
//             onClick={openExportModal}
//             className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
//             style={{ borderColor: '#C8E6C9', color: '#1976D2', background: '#E3F2FD' }}
//           >
//             <FileSpreadsheet className="w-4 h-4" />
//             Export to Excel
//           </button>
//           <button
//             onClick={openModal}
//             className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//             style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//           >
//             <Plus className="w-4 h-4" />
//             {openingBalance ? t('openingBalance.updateBalance') : t('openingBalance.addBalance')}
//           </button>
//         </div>
//       </div>

//       {/* Success Message */}
//       {success && (
//         <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
//           <CheckCircle className="w-5 h-5 text-green-600" />
//           <span className="text-sm text-green-600">{success}</span>
//         </div>
//       )}

//       {/* Business Information Card */}
//       {businessDetails && (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
//             <div className="flex items-center gap-2">
//               <Building2 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
//               <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
//                 {t('openingBalance.businessInformation')}
//               </h2>
//             </div>
//           </div>
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div className="flex items-start gap-3">
//                 <Building2 className="w-5 h-5 mt-0.5" style={{ color: '#2E7D32' }} />
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                     {t('openingBalance.businessName')}
//                   </p>
//                   <p className="text-base font-semibold mt-1" style={{ color: '#1F2937' }}>
//                     {businessDetails.businessName || businessDetails.name}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <MapPin className="w-5 h-5 mt-0.5" style={{ color: '#FF6F00' }} />
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                     {t('openingBalance.address')}
//                   </p>
//                   <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
//                     {businessDetails.fullAddress || businessDetails.address}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <Phone className="w-5 h-5 mt-0.5" style={{ color: '#1976D2' }} />
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                     {t('openingBalance.phone')}
//                   </p>
//                   <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
//                     {businessDetails.phone || businessDetails.businessPhone}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <Mail className="w-5 h-5 mt-0.5" style={{ color: '#D32F2F' }} />
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                     {t('openingBalance.email')}
//                   </p>
//                   <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
//                     {businessDetails.email || businessDetails.businessEmail}
//                   </p>
//                 </div>
//               </div>
//               {businessDetails.gstNumber && (
//                 <div className="flex items-start gap-3">
//                   <FileText className="w-5 h-5 mt-0.5" style={{ color: '#9C27B0' }} />
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                       {t('openingBalance.gstNumber')}
//                     </p>
//                     <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
//                       {businessDetails.gstNumber}
//                     </p>
//                   </div>
//                 </div>
//               )}
//               {businessDetails.panNumber && (
//                 <div className="flex items-start gap-3">
//                   <Shield className="w-5 h-5 mt-0.5" style={{ color: '#607D8B' }} />
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                       {t('openingBalance.panNumber')}
//                     </p>
//                     <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
//                       {businessDetails.panNumber}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Opening Balance Card */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
//           <div className="flex items-center gap-2">
//             <History className="w-5 h-5" style={{ color: '#FFFFFF' }} />
//             <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
//               {t('openingBalance.openingBalanceDetails')}
//             </h2>
//           </div>
//         </div>
        
//         <div className="p-6">
//           {openingBalance ? (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div>
//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
//                   <div className="flex items-center justify-between mb-4">
//                     <p className="text-sm font-medium flex items-center gap-2" style={{ color: '#6B7280' }}>
//                       <Banknote className="w-4 h-4" />
//                       {t('openingBalance.currentBalance')}
//                     </p>
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                       openingBalance.type === 'debit' 
//                         ? 'bg-green-100 text-green-700' 
//                         : 'bg-orange-100 text-orange-700'
//                     }`}>
//                       {openingBalance.type === 'debit' ? t('openingBalance.debit') : t('openingBalance.credit')}
//                     </span>
//                   </div>
//                   <p className="text-4xl font-bold" style={{ color: '#2E7D32' }}>
//                     {formatCurrency(openingBalance.amount)}
//                   </p>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div className="flex items-start gap-3 pb-3 border-b" style={{ borderColor: '#E8F5E9' }}>
//                   <Calendar className="w-5 h-5 mt-0.5" style={{ color: '#FF6F00' }} />
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                       {t('openingBalance.asOfDate')}
//                     </p>
//                     <p className="text-base font-semibold mt-1" style={{ color: '#1F2937' }}>
//                       {formatDate(openingBalance.asOfDate)}
//                     </p>
//                   </div>
//                 </div>
                
//                 {openingBalance.notes && (
//                   <div className="flex items-start gap-3 pb-3 border-b" style={{ borderColor: '#E8F5E9' }}>
//                     <FileText className="w-5 h-5 mt-0.5" style={{ color: '#9C27B0' }} />
//                     <div>
//                       <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                         {t('common.notes')}
//                       </p>
//                       <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
//                         {openingBalance.notes}
//                       </p>
//                     </div>
//                   </div>
//                 )}
                
//                 {openingBalance.createdBy && (
//                   <div className="flex items-start gap-3">
//                     <User className="w-5 h-5 mt-0.5" style={{ color: '#1976D2' }} />
//                     <div>
//                       <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                         {t('openingBalance.createdBy')}
//                       </p>
//                       <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
//                         {openingBalance.createdBy.name}
//                       </p>
//                       <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
//                         {formatDateTime(openingBalance.createdAt)}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-50 flex items-center justify-center">
//                 <AlertCircle className="w-10 h-10" style={{ color: '#FFB74D' }} />
//               </div>
//               <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F2937' }}>
//                 {t('openingBalance.noBalanceFound')}
//               </h3>
//               <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
//                 {t('openingBalance.noBalanceDescription')}
//               </p>
//               <button
//                 onClick={openModal}
//                 className="px-6 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 mx-auto hover:scale-105 transition-all"
//                 style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//               >
//                 <Plus className="w-4 h-4" />
//                 {t('openingBalance.addBalance')}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Information Card */}
//       <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
//         <div className="flex items-start gap-3">
//           <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
//             <TrendingUp className="w-5 h-5" style={{ color: '#1976D2' }} />
//           </div>
//           <div>
//             <h3 className="text-sm font-semibold mb-1" style={{ color: '#1E3A8A' }}>
//               {t('openingBalance.whatIsOpeningBalance')}
//             </h3>
//             <p className="text-sm" style={{ color: '#1E40AF' }}>
//               {t('openingBalance.description')}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Opening Balance Modal */}
//       {showModal && (
//         <>
//           <div 
//             className="fixed inset-0 z-50 transition-all duration-300"
//             style={{
//               backgroundColor: 'rgba(0, 0, 0, 0.3)',
//               backdropFilter: 'blur(4px)',
//               WebkitBackdropFilter: 'blur(4px)'
//             }}
//             onClick={closeModal}
//           />
          
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all duration-300">
//                 <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
//                   <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1B5E20' }}>
//                     <Banknote className="w-5 h-5" />
//                     {openingBalance ? t('openingBalance.updateBalance') : t('openingBalance.addBalance')}
//                   </h3>
//                   <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
//                     <X className="w-5 h-5" style={{ color: '#6B7280' }} />
//                   </button>
//                 </div>

//                 <div className="px-6 py-6">
//                   {error && (
//                     <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
//                       <AlertCircle className="w-4 h-4 text-red-500" />
//                       <span className="text-sm text-red-600">{error}</span>
//                     </div>
//                   )}

//                   <div className="space-y-5">
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('openingBalance.amount')} <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
//                         <input
//                           type="number"
//                           name="amount"
//                           value={formData.amount}
//                           onChange={handleInputChange}
//                           placeholder="0.00"
//                           className="w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
//                           style={{ borderColor: '#D1D5DB' }}
//                           autoFocus
//                         />
//                       </div>
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('openingBalance.type')} <span className="text-red-500">*</span>
//                       </label>
//                       <select
//                         name="type"
//                         value={formData.type}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                       >
//                         <option value="debit">{t('openingBalance.debit')} (Positive Balance)</option>
//                         <option value="credit">{t('openingBalance.credit')} (Negative Balance)</option>
//                       </select>
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('openingBalance.asOfDate')} <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="asOfDate"
//                         value={formData.asOfDate}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('common.notes')}
//                       </label>
//                       <textarea
//                         name="notes"
//                         value={formData.notes}
//                         onChange={handleInputChange}
//                         rows="3"
//                         placeholder={t('openingBalance.notesPlaceholder')}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
//                         style={{ borderColor: '#D1D5DB' }}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
//                   <button
//                     onClick={closeModal}
//                     disabled={saving}
//                     className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
//                     style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
//                   >
//                     {t('common.cancel')}
//                   </button>
//                   <button
//                     onClick={handleSubmit}
//                     disabled={saving}
//                     className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//                     style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//                   >
//                     {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                     {saving ? t('common.saving') : t('common.save')}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Export Day Book Modal - Updated for Excel */}
//       {showExportModal && (
//         <>
//           <div 
//             className="fixed inset-0 z-50 transition-all duration-300"
//             style={{
//               backgroundColor: 'rgba(0, 0, 0, 0.3)',
//               backdropFilter: 'blur(4px)',
//               WebkitBackdropFilter: 'blur(4px)'
//             }}
//             onClick={closeExportModal}
//           />
          
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300">
//                 <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
//                   <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1976D2' }}>
//                     <FileSpreadsheet className="w-5 h-5" />
//                     Export to Excel
//                   </h3>
//                   <button onClick={closeExportModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
//                     <X className="w-5 h-5" style={{ color: '#6B7280' }} />
//                   </button>
//                 </div>

//                 <div className="px-6 py-6">
//                   {error && (
//                     <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
//                       <AlertCircle className="w-4 h-4 text-red-500" />
//                       <span className="text-sm text-red-600">{error}</span>
//                     </div>
//                   )}

//                   <div className="space-y-5">
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         Start Date <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="startDate"
//                         value={exportData.startDate}
//                         onChange={handleExportInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         End Date <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="endDate"
//                         value={exportData.endDate}
//                         onChange={handleExportInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         Operator (Optional)
//                       </label>
//                       <select
//                         name="operatorId"
//                         value={exportData.operatorId}
//                         onChange={handleExportInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                       >
//                         <option value="">All Operators</option>
//                         {operators.map(operator => (
//                           <option key={operator.id} value={operator.id}>
//                             {operator.name} - {operator.email}
//                           </option>
//                         ))}
//                       </select>
//                       {loadingOperators && (
//                         <div className="flex items-center gap-2 mt-1">
//                           <Loader className="w-3 h-3 animate-spin" style={{ color: '#1976D2' }} />
//                           <span className="text-xs" style={{ color: '#6B7280' }}>Loading operators...</span>
//                         </div>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         Transaction Type (Optional)
//                       </label>
//                       <select
//                         name="type"
//                         value={exportData.type}
//                         onChange={handleExportInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                       >
//                         <option value="">All Types</option>
//                         <option value="credit">Credit</option>
//                         <option value="debit">Debit</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
//                   <button
//                     onClick={closeExportModal}
//                     disabled={exporting}
//                     className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
//                     style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
//                   >
//                     {t('common.cancel')}
//                   </button>
//                   <button
//                     onClick={handleExport}
//                     disabled={exporting}
//                     className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//                     style={{ background: 'linear-gradient(135deg, #1976D2, #42A5F5)' }}
//                   >
//                     {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
//                     {exporting ? 'Exporting...' : 'Export to Excel'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//      {/* View Day Book Modal */}
// {showDayBookModal && (
//   <>
//     <div 
//       className="fixed inset-0 z-50 transition-all duration-300"
//       style={{
//         backgroundColor: 'rgba(0, 0, 0, 0.3)',
//         backdropFilter: 'blur(4px)',
//         WebkitBackdropFilter: 'blur(4px)'
//       }}
//       onClick={closeDayBookModal}
//     />
    
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300">
//           <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
//             <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1565C0' }}>
//               <Eye className="w-5 h-5" />
//               {t('daybook.viewDayBook')}
//             </h3>
//             <button onClick={closeDayBookModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
//               <X className="w-5 h-5" style={{ color: '#6B7280' }} />
//             </button>
//           </div>

//           <div className="px-6 py-6">
//             {error && (
//               <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
//                 <AlertCircle className="w-4 h-4 text-red-500" />
//                 <span className="text-sm text-red-600">{error}</span>
//               </div>
//             )}

//             <div className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                   {t('daybook.startDate')} <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="startDate"
//                   value={dayBookFilters.startDate}
//                   onChange={handleDayBookFilterChange}
//                   className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                   style={{ borderColor: '#D1D5DB' }}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                   {t('daybook.endDate')} <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="endDate"
//                   value={dayBookFilters.endDate}
//                   onChange={handleDayBookFilterChange}
//                   className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                   style={{ borderColor: '#D1D5DB' }}
//                   required
//                 />
//               </div>
//             </div>

//             {dayBookData && (
//               <div className="mt-4 p-3 bg-green-50 rounded-lg">
//                 <p className="text-sm text-green-700">
//                   {t('daybook.messages.entriesFound', { count: dayBookData.data.summary.totalEntries })}
//                 </p>
//               </div>
//             )}
//           </div>

//           <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
//             <button
//               onClick={closeDayBookModal}
//               disabled={loadingDayBook}
//               className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
//               style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
//             >
//               {t('common.close')}
//             </button>
//             {dayBookData ? (
//               <button
//                 onClick={printDayBook}
//                 className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//                 style={{ background: 'linear-gradient(135deg, #1565C0, #42A5F5)' }}
//               >
//                 <Printer className="w-4 h-4" />
//                 {t('common.print')}
//               </button>
//             ) : (
//               <button
//                 onClick={handleDayBookView}
//                 disabled={loadingDayBook}
//                 className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//                 style={{ background: 'linear-gradient(135deg, #1565C0, #42A5F5)' }}
//               >
//                 {loadingDayBook ? <Loader className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
//                 {loadingDayBook ? t('common.loading') : t('common.view')}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   </>
// )}
//     </div>
//   );
// };

// export default OpeningBalance;









// // src/pages/openingBalance/OpeningBalance.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import {
//   TrendingUp, Calendar, DollarSign, Wallet, CheckCircle, XCircle,
//   AlertCircle, Loader, Edit2, Save, X, Plus, RefreshCw,
//   Building2, Phone, Mail, MapPin, Clock, History, Banknote,
//   FileText, Shield, User, Settings, Download, Filter, Users,
//   Eye, Printer
// } from 'lucide-react';
// import axios from 'axios';
// import BASE_URL from '../../config/Config';

// const OpeningBalance = () => {
//   const { t, i18n } = useTranslation();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [showExportModal, setShowExportModal] = useState(false);
//   const [showDayBookModal, setShowDayBookModal] = useState(false);
//   const [businessDetails, setBusinessDetails] = useState(null);
//   const [openingBalance, setOpeningBalance] = useState(null);
//   const [operators, setOperators] = useState([]);
//   const [loadingOperators, setLoadingOperators] = useState(false);
//   const [exporting, setExporting] = useState(false);
//   const [loadingDayBook, setLoadingDayBook] = useState(false);
//   const [dayBookData, setDayBookData] = useState(null);
  
//   const [formData, setFormData] = useState({
//     amount: '',
//     type: 'debit',
//     asOfDate: new Date().toISOString().split('T')[0],
//     notes: ''
//   });

//   const [exportData, setExportData] = useState({
//     startDate: new Date().toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0],
//     operatorId: '',
//     type: ''
//   });

//   const [dayBookFilters, setDayBookFilters] = useState({
//     startDate: new Date().toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0]
//   });

//   const getToken = () => localStorage.getItem('token');

//   const fetchOpeningBalance = async () => {
//     try {
//       const token = getToken();
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       const response = await axios.get(`${BASE_URL}/opening-balance`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         setBusinessDetails(response.data.businessDetails);
//         if (response.data.data) {
//           const asOfDate = response.data.data.asOfDate 
//             ? new Date(response.data.data.asOfDate).toISOString().split('T')[0]
//             : new Date().toISOString().split('T')[0];
          
//           setOpeningBalance({
//             _id: response.data.data._id,
//             amount: response.data.data.amount,
//             type: response.data.data.type,
//             asOfDate: asOfDate,
//             notes: response.data.data.notes || '',
//             createdAt: response.data.data.createdAt,
//             updatedAt: response.data.data.updatedAt,
//             createdBy: response.data.data.createdBy
//           });
//         }
//       }
//     } catch (err) {
//       console.error('Error fetching opening balance:', err);
//       if (err.response?.status === 404) {
//         setOpeningBalance(null);
//       } else {
//         setError(err.response?.data?.message || t('common.networkError'));
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOperators = async () => {
//     setLoadingOperators(true);
//     try {
//       const token = getToken();
//       const response = await axios.get(`${BASE_URL}/auth/all`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         const operatorUsers = response.data.data.filter(user => user.role === 'operator');
//         setOperators(operatorUsers);
//       }
//     } catch (err) {
//       console.error('Error fetching operators:', err);
//       setError(t('common.networkError'));
//     } finally {
//       setLoadingOperators(false);
//     }
//   };

//  const fetchDayBook = async () => {
//   console.log("=== fetchDayBook called ===");
//   console.log("Current filters:", dayBookFilters);
  
//   if (!dayBookFilters.startDate || !dayBookFilters.endDate) {
//     console.error("Missing dates!");
//     setError('Please select both start date and end date');
//     return;
//   }

//   if (new Date(dayBookFilters.startDate) > new Date(dayBookFilters.endDate)) {
//     console.error("Invalid date range!");
//     setError('Start date cannot be after end date');
//     return;
//   }

//   setLoadingDayBook(true);
//   setError(null);

//   try {
//     const token = getToken();
//     console.log("Token exists?", !!token);
    
//     const url = `${BASE_URL}/daybook?startDate=${dayBookFilters.startDate}&endDate=${dayBookFilters.endDate}&format=json`;
//     console.log("Fetching from URL:", url);
    
//     const response = await axios.get(url, {
//       headers: { 'Authorization': `Bearer ${token}` }
//     });

//     console.log("Response status:", response.status);
//     console.log("Response data:", response.data);
//     console.log("Response data structure:", Object.keys(response.data));
    
//     if (response.data.success) {
//       console.log("Success! Data received");
//       console.log("Data.entries:", response.data.data?.entries);
//       console.log("Number of entries:", response.data.data?.entries?.length);
      
//       setDayBookData(response.data);
      
//       // Show success message with entry count
//       const entryCount = response.data.data?.entries?.length || 0;
//       console.log(`Found ${entryCount} entries`);
//       setSuccess(`Found ${entryCount} entries for the selected period`);
//       setTimeout(() => setSuccess(null), 3000);
//     } else {
//       console.error("API returned success=false:", response.data.message);
//       setError(response.data.message || 'Failed to fetch day book data');
//     }
//   } catch (err) {
//     console.error("=== ERROR in fetchDayBook ===");
//     console.error("Error object:", err);
//     console.error("Error response:", err.response);
//     console.error("Error message:", err.message);
//     setError(err.response?.data?.message || 'Network error occurred');
//   } finally {
//     setLoadingDayBook(false);
//     console.log("fetchDayBook completed");
//   }
// };

// const printDayBook = () => {
//   if (!dayBookData) return;

//   const isMarathi = i18n.language === 'mr';
//   const { data, businessDetails: business, generatedAt } = dayBookData;
//   const { period, summary, entries } = data;

//   // Debug business keys
//   console.log("Business object:", JSON.stringify(business));

//   const businessName = business?.businessName || business?.name || (isMarathi ? 'जय शिवराय व्हेजिटेबल' : 'Jai Shivrai Vegetable Co.');
//   const businessAddress = business?.fullAddress || business?.businessAddress || business?.address || (isMarathi ? 'वेसराणे, ता. कळवण जि. नाशिक' : 'Vesarane, Tal. Kalwan, Dist. Nashik');
//   const businessPhone = business?.phone || business?.businessPhone || business?.contactPhone || (isMarathi ? 'प्रो. रोकेश हिरे मो. ९०२१६९९९९१ / ९६२३९५६३९६' : 'Prop. Rakesh Hire M: 9021699991 / 9623956396');
//   const businessEmail = business?.email || business?.businessEmail || '';
//   const businessGst = business?.gstNumber || business?.gst || '';
//   const businessPan = business?.panNumber || business?.pan || '';

//   const formatDate = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     const date = new Date(dateStr);
//     return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
//   };

//   const formatDateTime = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     const date = new Date(dateStr);
//     return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   const getCashFlowBadge = (cashFlow) => {
//     if (cashFlow === 'outflow') {
//       return '<span style="color: #D32F2F; font-weight: bold;">Outflow ▼</span>';
//     } else if (cashFlow === 'inflow') {
//       return '<span style="color: #2E7D32; font-weight: bold;">Inflow ▲</span>';
//     }
//     return '-';
//   };

//   const getTypeBadge = (type) => {
//     const colors = {
//       PURCHASE: '#FF6F00',
//       SALE: '#2E7D32',
//       PAYMENT: '#1565C0',
//       EXPENSE: '#9C27B0',
//       ADVANCE: '#FFB74D'
//     };
//     const color = colors[type] || '#666';
//     return `<span style="background: ${color}20; color: ${color}; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block;">${type}</span>`;
//   };

//   let entriesRows = '';

//   if (entries && Array.isArray(entries) && entries.length > 0) {
//     entriesRows = entries.map((entry, idx) => {
//       let formattedDate = 'N/A';
//       if (entry.date) {
//         const transactionDate = new Date(entry.date);
//         formattedDate = `${transactionDate.getDate().toString().padStart(2, '0')}/${(transactionDate.getMonth() + 1).toString().padStart(2, '0')}/${transactionDate.getFullYear()}`;
//       }

//       const formattedTime = entry.formattedTime || '';
//       const dateDisplay = formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
//       const partyName = entry.party?.name || entry.party || '-';

//       let description = entry.description || 'N/A';
//       if (entry.referenceNo) {
//         description += `<div style="font-size: 9px; color: #888; margin-top: 3px;">Ref: ${entry.referenceNo}</div>`;
//       }

//       const subtype = entry.subtype ? `<div style="font-size: 9px; color: #999; margin-top: 2px;">${entry.subtype}</div>` : '';
//       const paymentMode = entry.paymentMode ? `<div style="font-size: 9px; color: #999;">Mode: ${entry.paymentMode}</div>` : '';

//       return `
//         <tr>
//           <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">${idx + 1}</td>
//           <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">
//             ${dateDisplay}
//             ${subtype}
//           </td>
//           <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">
//             ${getTypeBadge(entry.type)}
//           </td>
//           <td style="text-align: left; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">
//             ${description}
//             ${paymentMode}
//           </td>
//           <td style="text-align: left; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">${partyName}</td>
//           <td style="text-align: right; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top; font-weight: ${entry.debit > 0 ? 'bold' : 'normal'}; color: ${entry.debit > 0 ? '#D32F2F' : '#333'};">${entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
//           <td style="text-align: right; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top; font-weight: ${entry.credit > 0 ? 'bold' : 'normal'}; color: ${entry.credit > 0 ? '#2E7D32' : '#333'};">${entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
//           <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">${getCashFlowBadge(entry.cashFlow)}</td>
//           <td style="text-align: right; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top; font-weight: bold;">${formatCurrency(Math.abs(entry.runningBalance || 0))}</td>
//         </tr>
//       `;
//     }).join('');
//   } else {
//     entriesRows = `
//       <tr>
//         <td colspan="9" style="text-align: center; padding: 40px; border: 1px solid #b3153f;">
//           <div style="font-size: 14px; color: #999;">No entries found for the selected period</div>
//         </td>
//       </tr>
//     `;
//   }

//   const printWindow = window.open('', '_blank');

//   const htmlContent = `
//     <!DOCTYPE html>
//     <html lang="${isMarathi ? 'mr' : 'en'}">
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//       <title>Day Book - ${formatDate(period.start)} to ${formatDate(period.end)}</title>
//       <style>
//         * { margin: 0; padding: 0; box-sizing: border-box; }
//         body {
//           background: #e5e5e5;
//           display: flex;
//           justify-content: center;
//           align-items: flex-start;
//           padding: 30px 20px;
//           font-family: 'Arial', 'Noto Sans', 'Segoe UI', sans-serif;
//         }
//         .receipt {
//           width: 100%;
//           max-width: 1400px;
//           background: #fff;
//           border: 2px solid #b3153f;
//           color: #b3153f;
//           box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//           margin: 0 auto;
//         }
//         .top-header {
//           border-bottom: 2px solid #b3153f;
//           padding: 12px 15px 0px;
//         }
//         .title-section {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }
//         .center-title {
//           flex: 1;
//           text-align: center;
//           padding: 0 10px 10px;
//         }
//         .center-title h1 {
//           font-size: 28px;
//           font-weight: 700;
//           line-height: 1.2;
//           margin-bottom: 6px;
//           letter-spacing: 1px;
//           word-break: break-word;
//         }
//         .sub {
//           font-size: 12px;
//           font-weight: bold;
//           word-break: break-word;
//         }
//         .receipt-badge {
//           display: inline-block;
//           background: #b3153f;
//           color: white;
//           padding: 5px 15px;
//           border-radius: 20px;
//           font-size: 14px;
//           font-weight: bold;
//           margin-top: 8px;
//         }
//         .gst-pan-row {
//           font-size: 9px;
//           margin-top: 4px;
//           color: #666;
//           text-align: center;
//         }
//         .contact-row {
//           border-top: 2px solid #b3153f;
//           padding: 8px 15px;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           font-size: 11px;
//           font-weight: bold;
//           flex-wrap: wrap;
//           gap: 5px;
//           min-height: 36px;
//         }
//         .contact-phone {
//           flex: 1;
//           text-align: left;
//           color: #b3153f;
//         }
//         .contact-email {
//           flex: 1;
//           text-align: right;
//           color: #b3153f;
//           word-break: break-all;
//         }
//         .period-header {
//           background: #fff5f0;
//           padding: 10px 15px;
//           text-align: center;
//           font-size: 14px;
//           font-weight: bold;
//           border-bottom: 1px solid #b3153f;
//           color: #b3153f;
//         }
//         .summary-cards {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 12px;
//           padding: 15px;
//           background: #fffaf5;
//           border-bottom: 2px solid #b3153f;
//         }
//         .summary-card {
//           flex: 1;
//           min-width: 130px;
//           border: 1px solid #b3153f;
//           border-radius: 8px;
//           padding: 10px;
//           text-align: center;
//           background: white;
//         }
//         .summary-card h4 {
//           font-size: 11px;
//           margin-bottom: 6px;
//           color: #b3153f;
//         }
//         .summary-card .amount {
//           font-size: 16px;
//           font-weight: bold;
//         }
//         .main-table {
//           width: 100%;
//           border-collapse: collapse;
//           font-size: 11px;
//         }
//         .main-table th,
//         .main-table td {
//           border: 1px solid #b3153f;
//           padding: 8px 6px;
//           vertical-align: middle;
//         }
//         .main-table th {
//           background: #fff5f5;
//           font-weight: bold;
//           text-align: center;
//         }
//         .footer {
//           border-top: 2px solid #b3153f;
//           margin-top: 5px;
//         }
//         .footer-row {
//           display: flex;
//           border-bottom: 2px solid #b3153f;
//           flex-wrap: wrap;
//         }
//         .footer-left {
//           flex: 1;
//           padding: 12px 15px;
//           font-size: 14px;
//           font-weight: bold;
//           color: #b3153f;
//         }
//         .footer-right {
//           width: 320px;
//           border-left: 2px solid #b3153f;
//           padding: 12px 15px;
//           font-size: 16px;
//           font-weight: bold;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 10px;
//           color: #b3153f;
//         }
//         .footer-right span {
//           color: #000;
//           font-size: 18px;
//           font-weight: bold;
//         }
//         .generated-info {
//           padding: 8px 15px;
//           font-size: 9px;
//           color: #999;
//           text-align: right;
//         }
//         @media print {
//           body { background: white; padding: 0; margin: 0; }
//           .receipt { box-shadow: none; margin: 0; width: 100%; }
//           .main-table th { background: #fff5f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//           .summary-cards { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//         }
//         @media (max-width: 768px) {
//           .main-table { font-size: 8px; }
//           .summary-card .amount { font-size: 12px; }
//           .center-title h1 { font-size: 22px; }
//         }
//       </style>
//     </head>
//     <body>
//       <div class="receipt">

//         <!-- HEADER -->
//         <div class="top-header">
//           <div class="title-section">
//             <div class="center-title">
//               <h1>${businessName}</h1>
//               <div class="sub">${businessAddress}</div>
//               ${(businessGst || businessPan)
//                 ? `<div class="gst-pan-row">${businessGst ? `GST: ${businessGst}` : ''}${businessGst && businessPan ? ' | ' : ''}${businessPan ? `PAN: ${businessPan}` : ''}</div>`
//                 : ''}
//               <div class="receipt-badge">DAY BOOK</div>
//             </div>
//           </div>

//           <!-- HORIZONTAL LINE + CONTACT ROW BELOW IT -->
//           <div class="contact-row">
//             <div class="contact-phone">Mobile : ${businessPhone}</div>
//             ${businessEmail ? `<div class="contact-email">Email : ${businessEmail}</div>` : '<div></div>'}
//           </div>
//         </div>

//         <!-- PERIOD -->
//         <div class="period-header">
//            Period: ${formatDate(period.start)} to ${formatDate(period.end)}
//         </div>

//         <!-- SUMMARY CARDS -->
//         <div class="summary-cards">
//           <div class="summary-card">
//             <h4>Total Purchases</h4>
//             <div class="amount" style="color: #D32F2F;">${formatCurrency(summary.totalPurchases)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Total Sales</h4>
//             <div class="amount" style="color: #2E7D32;">${formatCurrency(summary.totalSales)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Payments Out</h4>
//             <div class="amount" style="color: #D32F2F;">${formatCurrency(summary.totalPaymentsOut)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Payments In</h4>
//             <div class="amount" style="color: #2E7D32;">${formatCurrency(summary.totalPaymentsIn)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Total Expenses</h4>
//             <div class="amount" style="color: #FF6F00;">${formatCurrency(summary.totalExpenses)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Net Cash Flow</h4>
//             <div class="amount" style="color: ${summary.netCashFlow >= 0 ? '#2E7D32' : '#D32F2F'};">${formatCurrency(Math.abs(summary.netCashFlow))}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Opening Balance</h4>
//             <div class="amount" style="color: #1565C0;">${formatCurrency(summary.openingBalance)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Closing Balance</h4>
//             <div class="amount" style="color: ${summary.closingBalance >= 0 ? '#2E7D32' : '#D32F2F'};">${formatCurrency(Math.abs(summary.closingBalance))}</div>
//           </div>
//         </div>

//         <!-- ENTRIES TABLE -->
//         <table class="main-table">
//           <thead>
//             <tr>
//               <th style="width: 5%;">#</th>
//               <th style="width: 12%;">Date</th>
//               <th style="width: 10%;">Type</th>
//               <th style="width: 25%;">Description</th>
//               <th style="width: 12%;">Party</th>
//               <th style="width: 10%;">Debit (₹)</th>
//               <th style="width: 10%;">Credit (₹)</th>
//               <th style="width: 8%;">Cash Flow</th>
//               <th style="width: 8%;">Balance (₹)</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${entriesRows}
//           </tbody>
//         </table>

//         <!-- FOOTER -->
//         <div class="footer">
//           <div class="footer-row">
//             <div class="footer-left">
//                Total Entries: ${summary.totalEntries || 0} &nbsp;|&nbsp; ${isMarathi ? 'धन्यवाद!' : 'Thank You!'}
//             </div>
//             <div class="footer-right">
//               Closing Balance:
//               <span>${formatCurrency(Math.abs(summary.closingBalance))}</span>
//             </div>
//           </div>
//           <div class="generated-info">
//             Generated on: ${formatDateTime(generatedAt)}
//           </div>
//         </div>

//       </div>
//     </body>
//     </html>
//   `;

//   printWindow.document.write(htmlContent);
//   printWindow.document.close();
//   printWindow.focus();
//   setTimeout(() => {
//     printWindow.print();
//   }, 500);
// };

//   const openDayBookModal = () => {
//     setDayBookFilters({
//       startDate: new Date().toISOString().split('T')[0],
//       endDate: new Date().toISOString().split('T')[0]
//     });
//     setDayBookData(null);
//     setShowDayBookModal(true);
//     setError(null);
//   };

//   const closeDayBookModal = () => {
//     setShowDayBookModal(false);
//     setDayBookData(null);
//     setError(null);
//   };

//   const handleDayBookView = async () => {
//     await fetchDayBook();
//   };

//   useEffect(() => {
//     fetchOpeningBalance();
//   }, []);

//   const openModal = () => {
//     if (openingBalance) {
//       setFormData({
//         amount: openingBalance.amount.toString(),
//         type: openingBalance.type,
//         asOfDate: openingBalance.asOfDate,
//         notes: openingBalance.notes
//       });
//     } else {
//       setFormData({
//         amount: '',
//         type: 'debit',
//         asOfDate: new Date().toISOString().split('T')[0],
//         notes: ''
//       });
//     }
//     setShowModal(true);
//     setError(null);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setError(null);
//   };

//   const openExportModal = () => {
//     setExportData({
//       startDate: new Date().toISOString().split('T')[0],
//       endDate: new Date().toISOString().split('T')[0],
//       operatorId: '',
//       type: ''
//     });
//     setShowExportModal(true);
//     fetchOperators();
//     setError(null);
//   };

//   const closeExportModal = () => {
//     setShowExportModal(false);
//     setError(null);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleExportInputChange = (e) => {
//     const { name, value } = e.target;
//     setExportData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleDayBookFilterChange = (e) => {
//     const { name, value } = e.target;
//     setDayBookFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     if (!formData.amount || parseFloat(formData.amount) <= 0) {
//       setError(t('openingBalance.errors.validAmountRequired'));
//       return false;
//     }
//     if (!formData.asOfDate) {
//       setError(t('openingBalance.errors.dateRequired'));
//       return false;
//     }
//     if (!formData.type) {
//       setError(t('openingBalance.errors.typeRequired'));
//       return false;
//     }
//     return true;
//   };

//   const validateExportForm = () => {
//     if (!exportData.startDate) {
//       setError(t('daybook.errors.startDateRequired'));
//       return false;
//     }
//     if (!exportData.endDate) {
//       setError(t('daybook.errors.endDateRequired'));
//       return false;
//     }
//     if (new Date(exportData.startDate) > new Date(exportData.endDate)) {
//       setError(t('daybook.errors.invalidDateRange'));
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     setSaving(true);
//     setError(null);

//     try {
//       const token = getToken();
//       const payload = {
//         amount: parseFloat(formData.amount),
//         type: formData.type,
//         asOfDate: formData.asOfDate,
//         notes: formData.notes || ''
//       };

//       const response = await axios.post(`${BASE_URL}/opening-balance`, payload, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         setSuccess(openingBalance 
//           ? t('openingBalance.messages.updateSuccess')
//           : t('openingBalance.messages.createSuccess')
//         );
//         closeModal();
//         fetchOpeningBalance();
//         setTimeout(() => setSuccess(null), 3000);
//       }
//     } catch (err) {
//       console.error('Error saving opening balance:', err);
//       setError(err.response?.data?.message || t('common.networkError'));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleExport = async () => {
//     if (!validateExportForm()) return;

//     setExporting(true);
//     setError(null);

//     try {
//       const token = getToken();
//       const queryParams = new URLSearchParams({
//         startDate: exportData.startDate,
//         endDate: exportData.endDate
//       });
      
//       if (exportData.operatorId) queryParams.append('operatorId', exportData.operatorId);
//       if (exportData.type) queryParams.append('type', exportData.type);

//       const response = await axios.get(`${BASE_URL}/daybook/export/excel?${queryParams}`, {
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'text/csv'
//         },
//         responseType: 'blob'
//       });

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `daybook_${exportData.startDate}_to_${exportData.endDate}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);

//       setSuccess(t('daybook.messages.exportSuccess'));
//       closeExportModal();
//       setTimeout(() => setSuccess(null), 3000);
//     } catch (err) {
//       console.error('Error exporting daybook:', err);
//       setError(err.response?.data?.message || t('common.networkError'));
//     } finally {
//       setExporting(false);
//     }
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   const formatDate = (date) => {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const formatDateTime = (date) => {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
//         <span className="ml-2" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('openingBalance.title')}</h1>
//           <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('openingBalance.subtitle')}</p>
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={openDayBookModal}
//             className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
//             style={{ borderColor: '#C8E6C9', color: '#1565C0', background: '#E3F2FD' }}
//           >
//             <Eye className="w-4 h-4" />
//             View Day Book
//           </button>
//           <button
//             onClick={openExportModal}
//             className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
//             style={{ borderColor: '#C8E6C9', color: '#1976D2', background: '#E3F2FD' }}
//           >
//             <Download className="w-4 h-4" />
//             Export Day Book
//           </button>
//           <button
//             onClick={openModal}
//             className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//             style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//           >
//             <Plus className="w-4 h-4" />
//             {openingBalance ? t('openingBalance.updateBalance') : t('openingBalance.addBalance')}
//           </button>
//         </div>
//       </div>

//       {/* Success Message */}
//       {success && (
//         <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
//           <CheckCircle className="w-5 h-5 text-green-600" />
//           <span className="text-sm text-green-600">{success}</span>
//         </div>
//       )}

//       {/* Business Information Card */}
//       {businessDetails && (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
//             <div className="flex items-center gap-2">
//               <Building2 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
//               <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
//                 {t('openingBalance.businessInformation')}
//               </h2>
//             </div>
//           </div>
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div className="flex items-start gap-3">
//                 <Building2 className="w-5 h-5 mt-0.5" style={{ color: '#2E7D32' }} />
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                     {t('openingBalance.businessName')}
//                   </p>
//                   <p className="text-base font-semibold mt-1" style={{ color: '#1F2937' }}>
//                     {businessDetails.businessName || businessDetails.name}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <MapPin className="w-5 h-5 mt-0.5" style={{ color: '#FF6F00' }} />
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                     {t('openingBalance.address')}
//                   </p>
//                   <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
//                     {businessDetails.fullAddress || businessDetails.address}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <Phone className="w-5 h-5 mt-0.5" style={{ color: '#1976D2' }} />
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                     {t('openingBalance.phone')}
//                   </p>
//                   <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
//                     {businessDetails.phone || businessDetails.businessPhone}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <Mail className="w-5 h-5 mt-0.5" style={{ color: '#D32F2F' }} />
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                     {t('openingBalance.email')}
//                   </p>
//                   <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
//                     {businessDetails.email || businessDetails.businessEmail}
//                   </p>
//                 </div>
//               </div>
//               {businessDetails.gstNumber && (
//                 <div className="flex items-start gap-3">
//                   <FileText className="w-5 h-5 mt-0.5" style={{ color: '#9C27B0' }} />
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                       {t('openingBalance.gstNumber')}
//                     </p>
//                     <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
//                       {businessDetails.gstNumber}
//                     </p>
//                   </div>
//                 </div>
//               )}
//               {businessDetails.panNumber && (
//                 <div className="flex items-start gap-3">
//                   <Shield className="w-5 h-5 mt-0.5" style={{ color: '#607D8B' }} />
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                       {t('openingBalance.panNumber')}
//                     </p>
//                     <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
//                       {businessDetails.panNumber}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Opening Balance Card */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
//           <div className="flex items-center gap-2">
//             <History className="w-5 h-5" style={{ color: '#FFFFFF' }} />
//             <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
//               {t('openingBalance.openingBalanceDetails')}
//             </h2>
//           </div>
//         </div>
        
//         <div className="p-6">
//           {openingBalance ? (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div>
//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
//                   <div className="flex items-center justify-between mb-4">
//                     <p className="text-sm font-medium flex items-center gap-2" style={{ color: '#6B7280' }}>
//                       <Banknote className="w-4 h-4" />
//                       {t('openingBalance.currentBalance')}
//                     </p>
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                       openingBalance.type === 'debit' 
//                         ? 'bg-green-100 text-green-700' 
//                         : 'bg-orange-100 text-orange-700'
//                     }`}>
//                       {openingBalance.type === 'debit' ? t('openingBalance.debit') : t('openingBalance.credit')}
//                     </span>
//                   </div>
//                   <p className="text-4xl font-bold" style={{ color: '#2E7D32' }}>
//                     {formatCurrency(openingBalance.amount)}
//                   </p>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div className="flex items-start gap-3 pb-3 border-b" style={{ borderColor: '#E8F5E9' }}>
//                   <Calendar className="w-5 h-5 mt-0.5" style={{ color: '#FF6F00' }} />
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                       {t('openingBalance.asOfDate')}
//                     </p>
//                     <p className="text-base font-semibold mt-1" style={{ color: '#1F2937' }}>
//                       {formatDate(openingBalance.asOfDate)}
//                     </p>
//                   </div>
//                 </div>
                
//                 {openingBalance.notes && (
//                   <div className="flex items-start gap-3 pb-3 border-b" style={{ borderColor: '#E8F5E9' }}>
//                     <FileText className="w-5 h-5 mt-0.5" style={{ color: '#9C27B0' }} />
//                     <div>
//                       <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                         {t('common.notes')}
//                       </p>
//                       <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
//                         {openingBalance.notes}
//                       </p>
//                     </div>
//                   </div>
//                 )}
                
//                 {openingBalance.createdBy && (
//                   <div className="flex items-start gap-3">
//                     <User className="w-5 h-5 mt-0.5" style={{ color: '#1976D2' }} />
//                     <div>
//                       <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                         {t('openingBalance.createdBy')}
//                       </p>
//                       <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
//                         {openingBalance.createdBy.name}
//                       </p>
//                       <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
//                         {formatDateTime(openingBalance.createdAt)}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-50 flex items-center justify-center">
//                 <AlertCircle className="w-10 h-10" style={{ color: '#FFB74D' }} />
//               </div>
//               <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F2937' }}>
//                 {t('openingBalance.noBalanceFound')}
//               </h3>
//               <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
//                 {t('openingBalance.noBalanceDescription')}
//               </p>
//               <button
//                 onClick={openModal}
//                 className="px-6 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 mx-auto hover:scale-105 transition-all"
//                 style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//               >
//                 <Plus className="w-4 h-4" />
//                 {t('openingBalance.addBalance')}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Information Card */}
//       <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
//         <div className="flex items-start gap-3">
//           <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
//             <TrendingUp className="w-5 h-5" style={{ color: '#1976D2' }} />
//           </div>
//           <div>
//             <h3 className="text-sm font-semibold mb-1" style={{ color: '#1E3A8A' }}>
//               {t('openingBalance.whatIsOpeningBalance')}
//             </h3>
//             <p className="text-sm" style={{ color: '#1E40AF' }}>
//               {t('openingBalance.description')}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Opening Balance Modal */}
//       {showModal && (
//         <>
//           <div 
//             className="fixed inset-0 z-50 transition-all duration-300"
//             style={{
//               backgroundColor: 'rgba(0, 0, 0, 0.3)',
//               backdropFilter: 'blur(4px)',
//               WebkitBackdropFilter: 'blur(4px)'
//             }}
//             onClick={closeModal}
//           />
          
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all duration-300">
//                 <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
//                   <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1B5E20' }}>
//                     <Banknote className="w-5 h-5" />
//                     {openingBalance ? t('openingBalance.updateBalance') : t('openingBalance.addBalance')}
//                   </h3>
//                   <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
//                     <X className="w-5 h-5" style={{ color: '#6B7280' }} />
//                   </button>
//                 </div>

//                 <div className="px-6 py-6">
//                   {error && (
//                     <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
//                       <AlertCircle className="w-4 h-4 text-red-500" />
//                       <span className="text-sm text-red-600">{error}</span>
//                     </div>
//                   )}

//                   <div className="space-y-5">
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('openingBalance.amount')} <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
//                         <input
//                           type="number"
//                           name="amount"
//                           value={formData.amount}
//                           onChange={handleInputChange}
//                           placeholder="0.00"
//                           className="w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
//                           style={{ borderColor: '#D1D5DB' }}
//                           autoFocus
//                         />
//                       </div>
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('openingBalance.type')} <span className="text-red-500">*</span>
//                       </label>
//                       <select
//                         name="type"
//                         value={formData.type}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                       >
//                         <option value="debit">{t('openingBalance.debit')} (Positive Balance)</option>
//                         <option value="credit">{t('openingBalance.credit')} (Negative Balance)</option>
//                       </select>
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('openingBalance.asOfDate')} <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="asOfDate"
//                         value={formData.asOfDate}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('common.notes')}
//                       </label>
//                       <textarea
//                         name="notes"
//                         value={formData.notes}
//                         onChange={handleInputChange}
//                         rows="3"
//                         placeholder={t('openingBalance.notesPlaceholder')}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
//                         style={{ borderColor: '#D1D5DB' }}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
//                   <button
//                     onClick={closeModal}
//                     disabled={saving}
//                     className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
//                     style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
//                   >
//                     {t('common.cancel')}
//                   </button>
//                   <button
//                     onClick={handleSubmit}
//                     disabled={saving}
//                     className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//                     style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//                   >
//                     {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                     {saving ? t('common.saving') : t('common.save')}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Export Day Book Modal */}
//       {showExportModal && (
//         <>
//           <div 
//             className="fixed inset-0 z-50 transition-all duration-300"
//             style={{
//               backgroundColor: 'rgba(0, 0, 0, 0.3)',
//               backdropFilter: 'blur(4px)',
//               WebkitBackdropFilter: 'blur(4px)'
//             }}
//             onClick={closeExportModal}
//           />
          
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300">
//                 <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
//                   <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1976D2' }}>
//                     <Download className="w-5 h-5" />
//                     Export Day Book
//                   </h3>
//                   <button onClick={closeExportModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
//                     <X className="w-5 h-5" style={{ color: '#6B7280' }} />
//                   </button>
//                 </div>

//                 <div className="px-6 py-6">
//                   {error && (
//                     <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
//                       <AlertCircle className="w-4 h-4 text-red-500" />
//                       <span className="text-sm text-red-600">{error}</span>
//                     </div>
//                   )}

//                   <div className="space-y-5">
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         Start Date <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="startDate"
//                         value={exportData.startDate}
//                         onChange={handleExportInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         End Date <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="endDate"
//                         value={exportData.endDate}
//                         onChange={handleExportInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         Operator (Optional)
//                       </label>
//                       <select
//                         name="operatorId"
//                         value={exportData.operatorId}
//                         onChange={handleExportInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                       >
//                         <option value="">All Operators</option>
//                         {operators.map(operator => (
//                           <option key={operator.id} value={operator.id}>
//                             {operator.name} - {operator.email}
//                           </option>
//                         ))}
//                       </select>
//                       {loadingOperators && (
//                         <div className="flex items-center gap-2 mt-1">
//                           <Loader className="w-3 h-3 animate-spin" style={{ color: '#1976D2' }} />
//                           <span className="text-xs" style={{ color: '#6B7280' }}>Loading operators...</span>
//                         </div>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         Transaction Type (Optional)
//                       </label>
//                       <select
//                         name="type"
//                         value={exportData.type}
//                         onChange={handleExportInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                       >
//                         <option value="">All Types</option>
//                         <option value="credit">Credit</option>
//                         <option value="debit">Debit</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
//                   <button
//                     onClick={closeExportModal}
//                     disabled={exporting}
//                     className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
//                     style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
//                   >
//                     {t('common.cancel')}
//                   </button>
//                   <button
//                     onClick={handleExport}
//                     disabled={exporting}
//                     className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//                     style={{ background: 'linear-gradient(135deg, #1976D2, #42A5F5)' }}
//                   >
//                     {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
//                     {exporting ? 'Exporting...' : 'Export'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//      {/* View Day Book Modal */}
// {showDayBookModal && (
//   <>
//     <div 
//       className="fixed inset-0 z-50 transition-all duration-300"
//       style={{
//         backgroundColor: 'rgba(0, 0, 0, 0.3)',
//         backdropFilter: 'blur(4px)',
//         WebkitBackdropFilter: 'blur(4px)'
//       }}
//       onClick={closeDayBookModal}
//     />
    
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300">
//           <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
//             <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1565C0' }}>
//               <Eye className="w-5 h-5" />
//               {t('daybook.viewDayBook')}
//             </h3>
//             <button onClick={closeDayBookModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
//               <X className="w-5 h-5" style={{ color: '#6B7280' }} />
//             </button>
//           </div>

//           <div className="px-6 py-6">
//             {error && (
//               <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
//                 <AlertCircle className="w-4 h-4 text-red-500" />
//                 <span className="text-sm text-red-600">{error}</span>
//               </div>
//             )}

//             <div className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                   {t('daybook.startDate')} <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="startDate"
//                   value={dayBookFilters.startDate}
//                   onChange={handleDayBookFilterChange}
//                   className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                   style={{ borderColor: '#D1D5DB' }}
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                   {t('daybook.endDate')} <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="endDate"
//                   value={dayBookFilters.endDate}
//                   onChange={handleDayBookFilterChange}
//                   className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                   style={{ borderColor: '#D1D5DB' }}
//                   required
//                 />
//               </div>
//             </div>

//             {dayBookData && (
//               <div className="mt-4 p-3 bg-green-50 rounded-lg">
//                 <p className="text-sm text-green-700">
//                   {t('daybook.messages.entriesFound', { count: dayBookData.data.summary.totalEntries })}
//                 </p>
//               </div>
//             )}
//           </div>

//           <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
//             <button
//               onClick={closeDayBookModal}
//               disabled={loadingDayBook}
//               className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
//               style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
//             >
//               {t('common.close')}
//             </button>
//             {dayBookData ? (
//               <button
//                 onClick={printDayBook}
//                 className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//                 style={{ background: 'linear-gradient(135deg, #1565C0, #42A5F5)' }}
//               >
//                 <Printer className="w-4 h-4" />
//                 {t('common.print')}
//               </button>
//             ) : (
//               <button
//                 onClick={handleDayBookView}
//                 disabled={loadingDayBook}
//                 className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//                 style={{ background: 'linear-gradient(135deg, #1565C0, #42A5F5)' }}
//               >
//                 {loadingDayBook ? <Loader className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
//                 {loadingDayBook ? t('common.loading') : t('common.view')}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   </>
// )}
//     </div>
//   );
// };

// export default OpeningBalance;

// src/pages/openingBalance/OpeningBalance.jsx

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import {
//   TrendingUp, Calendar, DollarSign, Wallet, CheckCircle, XCircle,
//   AlertCircle, Loader, Edit2, Save, X, Plus, RefreshCw,
//   Building2, Phone, Mail, MapPin, Clock, History, Banknote,
//   FileText, Shield, User, Settings, Download, Filter, Users,
//   Eye, Printer
// } from 'lucide-react';
// import axios from 'axios';
// import BASE_URL from '../../config/Config';

// const OpeningBalance = () => {
//   const { t, i18n } = useTranslation();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [showExportModal, setShowExportModal] = useState(false);
//   const [showDayBookModal, setShowDayBookModal] = useState(false);
//   const [businessDetails, setBusinessDetails] = useState(null);
//   const [openingBalance, setOpeningBalance] = useState(null);
//   const [operators, setOperators] = useState([]);
//   const [loadingOperators, setLoadingOperators] = useState(false);
//   const [exporting, setExporting] = useState(false);
//   const [loadingDayBook, setLoadingDayBook] = useState(false);
//   const [dayBookData, setDayBookData] = useState(null);
  
//   const [formData, setFormData] = useState({
//     amount: '',
//     type: 'debit',
//     asOfDate: new Date().toISOString().split('T')[0],
//     notes: ''
//   });

//   const [exportData, setExportData] = useState({
//     startDate: new Date().toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0],
//     operatorId: '',
//     type: ''
//   });

//   const [dayBookFilters, setDayBookFilters] = useState({
//     startDate: new Date().toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0]
//   });

//   const getToken = () => localStorage.getItem('token');

//   const fetchOpeningBalance = async () => {
//     try {
//       const token = getToken();
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       const response = await axios.get(`${BASE_URL}/opening-balance`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         setBusinessDetails(response.data.businessDetails);
//         if (response.data.data) {
//           const asOfDate = response.data.data.asOfDate 
//             ? new Date(response.data.data.asOfDate).toISOString().split('T')[0]
//             : new Date().toISOString().split('T')[0];
          
//           setOpeningBalance({
//             _id: response.data.data._id,
//             amount: response.data.data.amount,
//             type: response.data.data.type,
//             asOfDate: asOfDate,
//             notes: response.data.data.notes || '',
//             createdAt: response.data.data.createdAt,
//             updatedAt: response.data.data.updatedAt,
//             createdBy: response.data.data.createdBy
//           });
//         }
//       }
//     } catch (err) {
//       console.error('Error fetching opening balance:', err);
//       if (err.response?.status === 404) {
//         setOpeningBalance(null);
//       } else {
//         setError(err.response?.data?.message || t('common.networkError'));
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOperators = async () => {
//     setLoadingOperators(true);
//     try {
//       const token = getToken();
//       const response = await axios.get(`${BASE_URL}/auth/all`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         const operatorUsers = response.data.data.filter(user => user.role === 'operator');
//         setOperators(operatorUsers);
//       }
//     } catch (err) {
//       console.error('Error fetching operators:', err);
//       setError(t('common.networkError'));
//     } finally {
//       setLoadingOperators(false);
//     }
//   };

//   const fetchDayBook = async () => {
//     console.log("=== fetchDayBook called ===");
//     console.log("Current filters:", dayBookFilters);
    
//     if (!dayBookFilters.startDate || !dayBookFilters.endDate) {
//       console.error("Missing dates!");
//       setError('Please select both start date and end date');
//       return;
//     }

//     if (new Date(dayBookFilters.startDate) > new Date(dayBookFilters.endDate)) {
//       console.error("Invalid date range!");
//       setError('Start date cannot be after end date');
//       return;
//     }

//     setLoadingDayBook(true);
//     setError(null);

//     try {
//       const token = getToken();
//       console.log("Token exists?", !!token);
      
//       const url = `${BASE_URL}/daybook?startDate=${dayBookFilters.startDate}&endDate=${dayBookFilters.endDate}&format=json`;
//       console.log("Fetching from URL:", url);
      
//       const response = await axios.get(url, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       console.log("Response status:", response.status);
//       console.log("Response data:", response.data);
//       console.log("Response data structure:", Object.keys(response.data));
      
//       if (response.data.success) {
//         console.log("Success! Data received");
//         console.log("Data.entries:", response.data.data?.entries);
//         console.log("Number of entries:", response.data.data?.entries?.length);
        
//         setDayBookData(response.data);
        
//         // Show success message with entry count
//         const entryCount = response.data.data?.entries?.length || 0;
//         console.log(`Found ${entryCount} entries`);
//         setSuccess(`Found ${entryCount} entries for the selected period`);
//         setTimeout(() => setSuccess(null), 3000);
//       } else {
//         console.error("API returned success=false:", response.data.message);
//         setError(response.data.message || 'Failed to fetch day book data');
//       }
//     } catch (err) {
//       console.error("=== ERROR in fetchDayBook ===");
//       console.error("Error object:", err);
//       console.error("Error response:", err.response);
//       console.error("Error message:", err.message);
//       setError(err.response?.data?.message || 'Network error occurred');
//     } finally {
//       setLoadingDayBook(false);
//       console.log("fetchDayBook completed");
//     }
//   };

//  const printDayBook = () => {
//   if (!dayBookData) return;

//   const isMarathi = i18n.language === 'mr';
//   const { data, businessDetails: business, generatedAt } = dayBookData;
//   const { period, summary, entries } = data;

//   console.log("Business object:", JSON.stringify(business));

//   const businessName = business?.businessName || business?.name || (isMarathi ? 'जय शिवराय व्हेजिटेबल' : 'Jai Shivrai Vegetable Co.');
//   const businessAddress = business?.fullAddress || business?.businessAddress || business?.address || (isMarathi ? 'वेसराणे, ता. कळवण जि. नाशिक' : 'Vesarane, Tal. Kalwan, Dist. Nashik');
//   const businessPhone = business?.phone || business?.businessPhone || business?.contactPhone || (isMarathi ? 'प्रो. रोकेश हिरे मो. ९०२१६९९९९१ / ९६२३९५६३९६' : 'Prop. Rakesh Hire M: 9021699991 / 9623956396');
//   const businessEmail = business?.email || business?.businessEmail || '';
//   const businessGst = business?.gstNumber || business?.gst || '';
//   const businessPan = business?.panNumber || business?.pan || '';

//   const formatDate = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     const date = new Date(dateStr);
//     return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
//   };

//   const formatDateTime = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     const date = new Date(dateStr);
//     return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   const getTypeBadge = (type) => {
//     const colors = {
//       PURCHASE: '#FF6F00',
//       SALE: '#2E7D32',
//       PAYMENT: '#1565C0',
//       EXPENSE: '#9C27B0',
//       ADVANCE: '#FFB74D'
//     };
//     const color = colors[type] || '#666';
//     return `<span style="background: ${color}20; color: ${color}; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block;">${type}</span>`;
//   };

//   let entriesRows = '';

//   if (entries && Array.isArray(entries) && entries.length > 0) {
//     entriesRows = entries.map((entry, idx) => {
//       let formattedDate = 'N/A';
//       if (entry.date) {
//         const transactionDate = new Date(entry.date);
//         formattedDate = `${transactionDate.getDate().toString().padStart(2, '0')}/${(transactionDate.getMonth() + 1).toString().padStart(2, '0')}/${transactionDate.getFullYear()}`;
//       }

//       const formattedTime = entry.formattedTime || '';
//       const dateDisplay = formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
//       const partyName = entry.party?.name || entry.party || '-';

//       let description = entry.description || 'N/A';
//       if (entry.referenceNo) {
//         description += `<div style="font-size: 9px; color: #888; margin-top: 3px;">Ref: ${entry.referenceNo}</div>`;
//       }

//       const subtype = entry.subtype ? `<div style="font-size: 9px; color: #999; margin-top: 2px;">${entry.subtype}</div>` : '';
//       const paymentMode = entry.paymentMode ? `<div style="font-size: 9px; color: #999;">Mode: ${entry.paymentMode}</div>` : '';

//       return `
//         <tr>
//           <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">${idx + 1}</td>
//           <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">
//             ${dateDisplay}
//             ${subtype}
//           </td>
//           <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">
//             ${getTypeBadge(entry.type)}
//           </td>
//           <td style="text-align: left; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">
//             ${description}
//             ${paymentMode}
//           </td>
//           <td style="text-align: left; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">${partyName}</td>
//           <td style="text-align: right; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top; font-weight: ${entry.debit > 0 ? 'bold' : 'normal'}; color: ${entry.debit > 0 ? '#D32F2F' : '#333'};">${entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
//           <td style="text-align: right; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top; font-weight: ${entry.credit > 0 ? 'bold' : 'normal'}; color: ${entry.credit > 0 ? '#2E7D32' : '#333'};">${entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
//           <td style="text-align: right; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top; font-weight: bold;">${formatCurrency(Math.abs(entry.runningBalance || 0))}</td>
//         </tr>
//       `;
//     }).join('');
//   } else {
//     entriesRows = `
//       <tr>
//         <td colspan="8" style="text-align: center; padding: 40px; border: 1px solid #b3153f;">
//           <div style="font-size: 14px; color: #999;">No entries found for the selected period</div>
//         </td>
//       </tr>
//     `;
//   }

//   const printWindow = window.open('', '_blank');

//   const htmlContent = `
//     <!DOCTYPE html>
//     <html lang="${isMarathi ? 'mr' : 'en'}">
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//       <title>Day Book - ${formatDate(period.start)} to ${formatDate(period.end)}</title>
//       <style>
//         * { margin: 0; padding: 0; box-sizing: border-box; }
//         body {
//           background: #e5e5e5;
//           display: flex;
//           justify-content: center;
//           align-items: flex-start;
//           padding: 30px 20px;
//           font-family: 'Arial', 'Noto Sans', 'Segoe UI', sans-serif;
//         }
//         .receipt {
//           width: 100%;
//           max-width: 1400px;
//           background: #fff;
//           border: 2px solid #b3153f;
//           color: #b3153f;
//           box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//           margin: 0 auto;
//         }
//         .top-header {
//           border-bottom: 2px solid #b3153f;
//           padding: 12px 15px 0px;
//         }
//         .title-section {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }
//         .center-title {
//           flex: 1;
//           text-align: center;
//           padding: 0 10px 10px;
//         }
//         .center-title h1 {
//           font-size: 28px;
//           font-weight: 700;
//           line-height: 1.2;
//           margin-bottom: 6px;
//           letter-spacing: 1px;
//           word-break: break-word;
//         }
//         .sub {
//           font-size: 12px;
//           font-weight: bold;
//           word-break: break-word;
//         }
//         .receipt-badge {
//           display: inline-block;
//           background: #b3153f;
//           color: white;
//           padding: 5px 15px;
//           border-radius: 20px;
//           font-size: 14px;
//           font-weight: bold;
//           margin-top: 8px;
//         }
//         .gst-pan-row {
//           font-size: 9px;
//           margin-top: 4px;
//           color: #666;
//           text-align: center;
//         }
//         .contact-row {
//           border-top: 2px solid #b3153f;
//           padding: 8px 15px;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           font-size: 11px;
//           font-weight: bold;
//           flex-wrap: wrap;
//           gap: 5px;
//           min-height: 36px;
//         }
//         .contact-phone {
//           flex: 1;
//           text-align: left;
//           color: #b3153f;
//         }
//         .contact-email {
//           flex: 1;
//           text-align: right;
//           color: #b3153f;
//           word-break: break-all;
//         }
//         .period-header {
//           background: #fff5f0;
//           padding: 10px 15px;
//           text-align: center;
//           font-size: 14px;
//           font-weight: bold;
//           border-bottom: 1px solid #b3153f;
//           color: #b3153f;
//         }
//         .summary-cards {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 12px;
//           padding: 15px;
//           background: #fffaf5;
//           border-bottom: 2px solid #b3153f;
//         }
//         .summary-card {
//           flex: 1;
//           min-width: 130px;
//           border: 1px solid #b3153f;
//           border-radius: 8px;
//           padding: 10px;
//           text-align: center;
//           background: white;
//         }
//         .summary-card h4 {
//           font-size: 11px;
//           margin-bottom: 6px;
//           color: #b3153f;
//         }
//         .summary-card .amount {
//           font-size: 16px;
//           font-weight: bold;
//         }
//         .main-table {
//           width: 100%;
//           border-collapse: collapse;
//           font-size: 11px;
//         }
//         .main-table th,
//         .main-table td {
//           border: 1px solid #b3153f;
//           padding: 8px 6px;
//           vertical-align: middle;
//         }
//         .main-table th {
//           background: #fff5f5;
//           font-weight: bold;
//           text-align: center;
//         }
//         .footer {
//           border-top: 2px solid #b3153f;
//           margin-top: 5px;
//         }
//         .footer-row {
//           display: flex;
//           border-bottom: 2px solid #b3153f;
//           flex-wrap: wrap;
//         }
//         .footer-left {
//           flex: 1;
//           padding: 12px 15px;
//           font-size: 14px;
//           font-weight: bold;
//           color: #b3153f;
//         }
//         .footer-right {
//           width: 320px;
//           border-left: 2px solid #b3153f;
//           padding: 12px 15px;
//           font-size: 16px;
//           font-weight: bold;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 10px;
//           color: #b3153f;
//         }
//         .footer-right span {
//           color: #000;
//           font-size: 18px;
//           font-weight: bold;
//         }
//         .generated-info {
//           padding: 8px 15px;
//           font-size: 9px;
//           color: #999;
//           text-align: right;
//         }
//         @media print {
//           body { background: white; padding: 0; margin: 0; }
//           .receipt { box-shadow: none; margin: 0; width: 100%; }
//           .main-table th { background: #fff5f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//           .summary-cards { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//         }
//         @media (max-width: 768px) {
//           .main-table { font-size: 8px; }
//           .summary-card .amount { font-size: 12px; }
//           .center-title h1 { font-size: 22px; }
//         }
//       </style>
//     </head>
//     <body>
//       <div class="receipt">

//         <!-- HEADER -->
//         <div class="top-header">
//           <div class="title-section">
//             <div class="center-title">
//               <h1>${businessName}</h1>
//               <div class="sub">${businessAddress}</div>
//               ${(businessGst || businessPan)
//                 ? `<div class="gst-pan-row">${businessGst ? `GST: ${businessGst}` : ''}${businessGst && businessPan ? ' | ' : ''}${businessPan ? `PAN: ${businessPan}` : ''}</div>`
//                 : ''}
//               <div class="receipt-badge">DAY BOOK</div>
//             </div>
//           </div>

//           <!-- HORIZONTAL LINE + CONTACT ROW BELOW IT -->
//           <div class="contact-row">
//             <div class="contact-phone">Mobile : ${businessPhone}</div>
//             ${businessEmail ? `<div class="contact-email">Email : ${businessEmail}</div>` : '<div></div>'}
//           </div>
//         </div>

//         <!-- PERIOD -->
//         <div class="period-header">
//            Period: ${formatDate(period.start)} to ${formatDate(period.end)}
//         </div>

//         <!-- SUMMARY CARDS -->
//         <div class="summary-cards">
//           <div class="summary-card">
//             <h4>Total Purchases</h4>
//             <div class="amount" style="color: #D32F2F;">${formatCurrency(summary.totalPurchases)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Total Sales</h4>
//             <div class="amount" style="color: #2E7D32;">${formatCurrency(summary.totalSales)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Payments Out</h4>
//             <div class="amount" style="color: #D32F2F;">${formatCurrency(summary.totalPaymentsOut)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Payments In</h4>
//             <div class="amount" style="color: #2E7D32;">${formatCurrency(summary.totalPaymentsIn)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Total Expenses</h4>
//             <div class="amount" style="color: #FF6F00;">${formatCurrency(summary.totalExpenses)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Opening Balance</h4>
//             <div class="amount" style="color: #1565C0;">${formatCurrency(summary.openingBalance)}</div>
//           </div>
//           <div class="summary-card">
//             <h4>Closing Balance</h4>
//             <div class="amount" style="color: ${summary.closingBalance >= 0 ? '#2E7D32' : '#D32F2F'};">${formatCurrency(Math.abs(summary.closingBalance))}</div>
//           </div>
//         </div>

//         <!-- ENTRIES TABLE -->
//         <table class="main-table">
//           <thead>
//             <tr>
//               <th style="width: 5%;">#</th>
//               <th style="width: 12%;">Date</th>
//               <th style="width: 10%;">Type</th>
//               <th style="width: 30%;">Description</th>
//               <th style="width: 15%;">Party</th>
//               <th style="width: 13%;">Debit (₹)</th>
//               <th style="width: 13%;">Credit (₹)</th>
//               <th style="width: 12%;">Balance (₹)</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${entriesRows}
//           </tbody>
//         </table>

//         <!-- FOOTER -->
//         <div class="footer">
//           <div class="footer-row">
//             <div class="footer-left">
//                Total Entries: ${summary.totalEntries || 0} &nbsp;|&nbsp; ${isMarathi ? 'धन्यवाद!' : 'Thank You!'}
//             </div>
//             <div class="footer-right">
//               Closing Balance:
//               <span>${formatCurrency(Math.abs(summary.closingBalance))}</span>
//             </div>
//           </div>
//           <div class="generated-info">
//             Generated on: ${formatDateTime(generatedAt)}
//           </div>
//         </div>

//       </div>
//     </body>
//     </html>
//   `;

//   printWindow.document.write(htmlContent);
//   printWindow.document.close();
//   printWindow.focus();
//   setTimeout(() => {
//     printWindow.print();
//   }, 500);
// };

//   const openDayBookModal = () => {
//     setDayBookFilters({
//       startDate: new Date().toISOString().split('T')[0],
//       endDate: new Date().toISOString().split('T')[0]
//     });
//     setDayBookData(null);
//     setShowDayBookModal(true);
//     setError(null);
//   };

//   const closeDayBookModal = () => {
//     setShowDayBookModal(false);
//     setDayBookData(null);
//     setError(null);
//   };

//   const handleDayBookView = async () => {
//     await fetchDayBook();
//   };

//   useEffect(() => {
//     fetchOpeningBalance();
//   }, []);

//   const openModal = () => {
//     if (openingBalance) {
//       setFormData({
//         amount: openingBalance.amount.toString(),
//         type: openingBalance.type,
//         asOfDate: openingBalance.asOfDate,
//         notes: openingBalance.notes
//       });
//     } else {
//       setFormData({
//         amount: '',
//         type: 'debit',
//         asOfDate: new Date().toISOString().split('T')[0],
//         notes: ''
//       });
//     }
//     setShowModal(true);
//     setError(null);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setError(null);
//   };

//   const openExportModal = () => {
//     setExportData({
//       startDate: new Date().toISOString().split('T')[0],
//       endDate: new Date().toISOString().split('T')[0],
//       operatorId: '',
//       type: ''
//     });
//     setShowExportModal(true);
//     fetchOperators();
//     setError(null);
//   };

//   const closeExportModal = () => {
//     setShowExportModal(false);
//     setError(null);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleExportInputChange = (e) => {
//     const { name, value } = e.target;
//     setExportData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleDayBookFilterChange = (e) => {
//     const { name, value } = e.target;
//     setDayBookFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     if (!formData.amount || parseFloat(formData.amount) <= 0) {
//       setError(t('openingBalance.errors.validAmountRequired'));
//       return false;
//     }
//     if (!formData.asOfDate) {
//       setError(t('openingBalance.errors.dateRequired'));
//       return false;
//     }
//     if (!formData.type) {
//       setError(t('openingBalance.errors.typeRequired'));
//       return false;
//     }
//     return true;
//   };

//   const validateExportForm = () => {
//     if (!exportData.startDate) {
//       setError(t('daybook.errors.startDateRequired'));
//       return false;
//     }
//     if (!exportData.endDate) {
//       setError(t('daybook.errors.endDateRequired'));
//       return false;
//     }
//     if (new Date(exportData.startDate) > new Date(exportData.endDate)) {
//       setError(t('daybook.errors.invalidDateRange'));
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     setSaving(true);
//     setError(null);

//     try {
//       const token = getToken();
//       const payload = {
//         amount: parseFloat(formData.amount),
//         type: formData.type,
//         asOfDate: formData.asOfDate,
//         notes: formData.notes || ''
//       };

//       const response = await axios.post(`${BASE_URL}/opening-balance`, payload, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         setSuccess(openingBalance 
//           ? t('openingBalance.messages.updateSuccess')
//           : t('openingBalance.messages.createSuccess')
//         );
//         closeModal();
//         fetchOpeningBalance();
//         setTimeout(() => setSuccess(null), 3000);
//       }
//     } catch (err) {
//       console.error('Error saving opening balance:', err);
//       setError(err.response?.data?.message || t('common.networkError'));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Update the handleExport function - change the URL from:
// // `${BASE_URL}/api/daybook/export/excel?${queryParams}`
// // to:
// // `${BASE_URL}/daybook/export/excel?${queryParams}`

// const handleExport = async () => {
//   if (!validateExportForm()) return;

//   setExporting(true);
//   setError(null);

//   try {
//     const token = getToken();
//     const queryParams = new URLSearchParams({
//       startDate: exportData.startDate,
//       endDate: exportData.endDate
//     });
    
//     if (exportData.operatorId) queryParams.append('operatorId', exportData.operatorId);
//     if (exportData.type) queryParams.append('type', exportData.type);

//     // FIXED: Remove duplicate /api from the URL
//     const response = await axios.get(`${BASE_URL}/daybook/export/excel?${queryParams}`, {
//       headers: { 
//         'Authorization': `Bearer ${token}`
//       },
//       responseType: 'blob'
//     });

//     // Extract filename from Content-Disposition header or create default
//     const contentDisposition = response.headers['content-disposition'];
//     let filename = `Daybook_Report_${exportData.startDate}_to_${exportData.endDate}.xlsx`;
    
//     if (contentDisposition) {
//       const filenameMatch = contentDisposition.match(/filename="(.+)"/);
//       if (filenameMatch && filenameMatch[1]) {
//         filename = filenameMatch[1];
//       }
//     }

//     // Create download link
//     const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', filename);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);

//     setSuccess(t('daybook.messages.exportSuccess'));
//     closeExportModal();
//     setTimeout(() => setSuccess(null), 3000);
//   } catch (err) {
//     console.error('Error exporting daybook:', err);
//     setError(err.response?.data?.message || t('common.networkError'));
//   } finally {
//     setExporting(false);
//   }
// };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   const formatDate = (date) => {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const formatDateTime = (date) => {
//     if (!date) return 'N/A';
//     return new Date(date).toLocaleString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
//         <span className="ml-2" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('openingBalance.title')}</h1>
//           <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('openingBalance.subtitle')}</p>
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={openDayBookModal}
//             className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
//             style={{ borderColor: '#C8E6C9', color: '#1565C0', background: '#E3F2FD' }}
//           >
//             <Eye className="w-4 h-4" />
//             View Day Book
//           </button>
//           <button
//             onClick={openExportModal}
//             className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
//             style={{ borderColor: '#C8E6C9', color: '#1976D2', background: '#E3F2FD' }}
//           >
//             <Download className="w-4 h-4" />
//             Export Day Book
//           </button>
//           <button
//             onClick={openModal}
//             className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//             style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//           >
//             <Plus className="w-4 h-4" />
//             {openingBalance ? t('openingBalance.updateBalance') : t('openingBalance.addBalance')}
//           </button>
//         </div>
//       </div>

//       {/* Success Message */}
//       {success && (
//         <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
//           <CheckCircle className="w-5 h-5 text-green-600" />
//           <span className="text-sm text-green-600">{success}</span>
//         </div>
//       )}

//       {/* Business Information Card */}
//       {businessDetails && (
//         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//           <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
//             <div className="flex items-center gap-2">
//               <Building2 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
//               <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
//                 {t('openingBalance.businessInformation')}
//               </h2>
//             </div>
//           </div>
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div className="flex items-start gap-3">
//                 <Building2 className="w-5 h-5 mt-0.5" style={{ color: '#2E7D32' }} />
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                     {t('openingBalance.businessName')}
//                   </p>
//                   <p className="text-base font-semibold mt-1" style={{ color: '#1F2937' }}>
//                     {businessDetails.businessName || businessDetails.name}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <MapPin className="w-5 h-5 mt-0.5" style={{ color: '#FF6F00' }} />
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                     {t('openingBalance.address')}
//                   </p>
//                   <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
//                     {businessDetails.fullAddress || businessDetails.address}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <Phone className="w-5 h-5 mt-0.5" style={{ color: '#1976D2' }} />
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                     {t('openingBalance.phone')}
//                   </p>
//                   <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
//                     {businessDetails.phone || businessDetails.businessPhone}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <Mail className="w-5 h-5 mt-0.5" style={{ color: '#D32F2F' }} />
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                     {t('openingBalance.email')}
//                   </p>
//                   <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
//                     {businessDetails.email || businessDetails.businessEmail}
//                   </p>
//                 </div>
//               </div>
//               {businessDetails.gstNumber && (
//                 <div className="flex items-start gap-3">
//                   <FileText className="w-5 h-5 mt-0.5" style={{ color: '#9C27B0' }} />
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                       {t('openingBalance.gstNumber')}
//                     </p>
//                     <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
//                       {businessDetails.gstNumber}
//                     </p>
//                   </div>
//                 </div>
//               )}
//               {businessDetails.panNumber && (
//                 <div className="flex items-start gap-3">
//                   <Shield className="w-5 h-5 mt-0.5" style={{ color: '#607D8B' }} />
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                       {t('openingBalance.panNumber')}
//                     </p>
//                     <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
//                       {businessDetails.panNumber}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Opening Balance Card */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
//           <div className="flex items-center gap-2">
//             <History className="w-5 h-5" style={{ color: '#FFFFFF' }} />
//             <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
//               {t('openingBalance.openingBalanceDetails')}
//             </h2>
//           </div>
//         </div>
        
//         <div className="p-6">
//           {openingBalance ? (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div>
//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
//                   <div className="flex items-center justify-between mb-4">
//                     <p className="text-sm font-medium flex items-center gap-2" style={{ color: '#6B7280' }}>
//                       <Banknote className="w-4 h-4" />
//                       {t('openingBalance.currentBalance')}
//                     </p>
//                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                       openingBalance.type === 'debit' 
//                         ? 'bg-green-100 text-green-700' 
//                         : 'bg-orange-100 text-orange-700'
//                     }`}>
//                       {openingBalance.type === 'debit' ? t('openingBalance.debit') : t('openingBalance.credit')}
//                     </span>
//                   </div>
//                   <p className="text-4xl font-bold" style={{ color: '#2E7D32' }}>
//                     {formatCurrency(openingBalance.amount)}
//                   </p>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div className="flex items-start gap-3 pb-3 border-b" style={{ borderColor: '#E8F5E9' }}>
//                   <Calendar className="w-5 h-5 mt-0.5" style={{ color: '#FF6F00' }} />
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                       {t('openingBalance.asOfDate')}
//                     </p>
//                     <p className="text-base font-semibold mt-1" style={{ color: '#1F2937' }}>
//                       {formatDate(openingBalance.asOfDate)}
//                     </p>
//                   </div>
//                 </div>
                
//                 {openingBalance.notes && (
//                   <div className="flex items-start gap-3 pb-3 border-b" style={{ borderColor: '#E8F5E9' }}>
//                     <FileText className="w-5 h-5 mt-0.5" style={{ color: '#9C27B0' }} />
//                     <div>
//                       <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                         {t('common.notes')}
//                       </p>
//                       <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
//                         {openingBalance.notes}
//                       </p>
//                     </div>
//                   </div>
//                 )}
                
//                 {openingBalance.createdBy && (
//                   <div className="flex items-start gap-3">
//                     <User className="w-5 h-5 mt-0.5" style={{ color: '#1976D2' }} />
//                     <div>
//                       <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
//                         {t('openingBalance.createdBy')}
//                       </p>
//                       <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
//                         {openingBalance.createdBy.name}
//                       </p>
//                       <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
//                         {formatDateTime(openingBalance.createdAt)}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-50 flex items-center justify-center">
//                 <AlertCircle className="w-10 h-10" style={{ color: '#FFB74D' }} />
//               </div>
//               <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F2937' }}>
//                 {t('openingBalance.noBalanceFound')}
//               </h3>
//               <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
//                 {t('openingBalance.noBalanceDescription')}
//               </p>
//               <button
//                 onClick={openModal}
//                 className="px-6 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 mx-auto hover:scale-105 transition-all"
//                 style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//               >
//                 <Plus className="w-4 h-4" />
//                 {t('openingBalance.addBalance')}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Information Card */}
//       <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
//         <div className="flex items-start gap-3">
//           <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
//             <TrendingUp className="w-5 h-5" style={{ color: '#1976D2' }} />
//           </div>
//           <div>
//             <h3 className="text-sm font-semibold mb-1" style={{ color: '#1E3A8A' }}>
//               {t('openingBalance.whatIsOpeningBalance')}
//             </h3>
//             <p className="text-sm" style={{ color: '#1E40AF' }}>
//               {t('openingBalance.description')}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Opening Balance Modal */}
//       {showModal && (
//         <>
//           <div 
//             className="fixed inset-0 z-50 transition-all duration-300"
//             style={{
//               backgroundColor: 'rgba(0, 0, 0, 0.3)',
//               backdropFilter: 'blur(4px)',
//               WebkitBackdropFilter: 'blur(4px)'
//             }}
//             onClick={closeModal}
//           />
          
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all duration-300">
//                 <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
//                   <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1B5E20' }}>
//                     <Banknote className="w-5 h-5" />
//                     {openingBalance ? t('openingBalance.updateBalance') : t('openingBalance.addBalance')}
//                   </h3>
//                   <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
//                     <X className="w-5 h-5" style={{ color: '#6B7280' }} />
//                   </button>
//                 </div>

//                 <div className="px-6 py-6">
//                   {error && (
//                     <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
//                       <AlertCircle className="w-4 h-4 text-red-500" />
//                       <span className="text-sm text-red-600">{error}</span>
//                     </div>
//                   )}

//                   <div className="space-y-5">
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('openingBalance.amount')} <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
//                         <input
//                           type="number"
//                           name="amount"
//                           value={formData.amount}
//                           onChange={handleInputChange}
//                           placeholder="0.00"
//                           className="w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
//                           style={{ borderColor: '#D1D5DB' }}
//                           autoFocus
//                         />
//                       </div>
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('openingBalance.type')} <span className="text-red-500">*</span>
//                       </label>
//                       <select
//                         name="type"
//                         value={formData.type}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                       >
//                         <option value="debit">{t('openingBalance.debit')} (Positive Balance)</option>
//                         <option value="credit">{t('openingBalance.credit')} (Negative Balance)</option>
//                       </select>
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('openingBalance.asOfDate')} <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="asOfDate"
//                         value={formData.asOfDate}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('common.notes')}
//                       </label>
//                       <textarea
//                         name="notes"
//                         value={formData.notes}
//                         onChange={handleInputChange}
//                         rows="3"
//                         placeholder={t('openingBalance.notesPlaceholder')}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
//                         style={{ borderColor: '#D1D5DB' }}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
//                   <button
//                     onClick={closeModal}
//                     disabled={saving}
//                     className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
//                     style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
//                   >
//                     {t('common.cancel')}
//                   </button>
//                   <button
//                     onClick={handleSubmit}
//                     disabled={saving}
//                     className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//                     style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
//                   >
//                     {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                     {saving ? t('common.saving') : t('common.save')}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Export Day Book Modal */}
//       {showExportModal && (
//         <>
//           <div 
//             className="fixed inset-0 z-50 transition-all duration-300"
//             style={{
//               backgroundColor: 'rgba(0, 0, 0, 0.3)',
//               backdropFilter: 'blur(4px)',
//               WebkitBackdropFilter: 'blur(4px)'
//             }}
//             onClick={closeExportModal}
//           />
          
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300">
//                 <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
//                   <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1976D2' }}>
//                     <Download className="w-5 h-5" />
//                     Export Day Book
//                   </h3>
//                   <button onClick={closeExportModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
//                     <X className="w-5 h-5" style={{ color: '#6B7280' }} />
//                   </button>
//                 </div>

//                 <div className="px-6 py-6">
//                   {error && (
//                     <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
//                       <AlertCircle className="w-4 h-4 text-red-500" />
//                       <span className="text-sm text-red-600">{error}</span>
//                     </div>
//                   )}

//                   <div className="space-y-5">
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         Start Date <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="startDate"
//                         value={exportData.startDate}
//                         onChange={handleExportInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         End Date <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="endDate"
//                         value={exportData.endDate}
//                         onChange={handleExportInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         Operator (Optional)
//                       </label>
//                       <select
//                         name="operatorId"
//                         value={exportData.operatorId}
//                         onChange={handleExportInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                       >
//                         <option value="">All Operators</option>
//                         {operators.map(operator => (
//                           <option key={operator.id} value={operator.id}>
//                             {operator.name} - {operator.email}
//                           </option>
//                         ))}
//                       </select>
//                       {loadingOperators && (
//                         <div className="flex items-center gap-2 mt-1">
//                           <Loader className="w-3 h-3 animate-spin" style={{ color: '#1976D2' }} />
//                           <span className="text-xs" style={{ color: '#6B7280' }}>Loading operators...</span>
//                         </div>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         Transaction Type (Optional)
//                       </label>
//                       <select
//                         name="type"
//                         value={exportData.type}
//                         onChange={handleExportInputChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                       >
//                         <option value="">All Types</option>
//                         <option value="credit">Credit</option>
//                         <option value="debit">Debit</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
//                   <button
//                     onClick={closeExportModal}
//                     disabled={exporting}
//                     className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
//                     style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
//                   >
//                     {t('common.cancel')}
//                   </button>
//                   <button
//                     onClick={handleExport}
//                     disabled={exporting}
//                     className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//                     style={{ background: 'linear-gradient(135deg, #1976D2, #42A5F5)' }}
//                   >
//                     {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
//                     {exporting ? 'Exporting...' : 'Export'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* View Day Book Modal */}
//       {showDayBookModal && (
//         <>
//           <div 
//             className="fixed inset-0 z-50 transition-all duration-300"
//             style={{
//               backgroundColor: 'rgba(0, 0, 0, 0.3)',
//               backdropFilter: 'blur(4px)',
//               WebkitBackdropFilter: 'blur(4px)'
//             }}
//             onClick={closeDayBookModal}
//           />
          
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4">
//               <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300">
//                 <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
//                   <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1565C0' }}>
//                     <Eye className="w-5 h-5" />
//                     {t('daybook.viewDayBook')}
//                   </h3>
//                   <button onClick={closeDayBookModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
//                     <X className="w-5 h-5" style={{ color: '#6B7280' }} />
//                   </button>
//                 </div>

//                 <div className="px-6 py-6">
//                   {error && (
//                     <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
//                       <AlertCircle className="w-4 h-4 text-red-500" />
//                       <span className="text-sm text-red-600">{error}</span>
//                     </div>
//                   )}

//                   <div className="space-y-5">
//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('daybook.startDate')} <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="startDate"
//                         value={dayBookFilters.startDate}
//                         onChange={handleDayBookFilterChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
//                         {t('daybook.endDate')} <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="endDate"
//                         value={dayBookFilters.endDate}
//                         onChange={handleDayBookFilterChange}
//                         className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                         style={{ borderColor: '#D1D5DB' }}
//                         required
//                       />
//                     </div>
//                   </div>

//                   {dayBookData && (
//                     <div className="mt-4 p-3 bg-green-50 rounded-lg">
//                       <p className="text-sm text-green-700">
//                         {t('daybook.messages.entriesFound', { count: dayBookData.data.summary.totalEntries })}
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
//                   <button
//                     onClick={closeDayBookModal}
//                     disabled={loadingDayBook}
//                     className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
//                     style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
//                   >
//                     {t('common.close')}
//                   </button>
//                   {dayBookData ? (
//                     <button
//                       onClick={printDayBook}
//                       className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//                       style={{ background: 'linear-gradient(135deg, #1565C0, #42A5F5)' }}
//                     >
//                       <Printer className="w-4 h-4" />
//                       {t('common.print')}
//                     </button>
//                   ) : (
//                     <button
//                       onClick={handleDayBookView}
//                       disabled={loadingDayBook}
//                       className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
//                       style={{ background: 'linear-gradient(135deg, #1565C0, #42A5F5)' }}
//                     >
//                       {loadingDayBook ? <Loader className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
//                       {loadingDayBook ? t('common.loading') : t('common.view')}
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default OpeningBalance;


// src/pages/openingBalance/OpeningBalance.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, Calendar, DollarSign, Wallet, CheckCircle, XCircle,
  AlertCircle, Loader, Edit2, Save, X, Plus, RefreshCw,
  Building2, Phone, Mail, MapPin, Clock, History, Banknote,
  FileText, Shield, User, Settings, Download, Filter, Users,
  Eye, Printer
} from 'lucide-react';
import axios from 'axios';
import BASE_URL from '../../config/Config';

const OpeningBalance = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDayBookModal, setShowDayBookModal] = useState(false);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [openingBalance, setOpeningBalance] = useState(null);
  const [operators, setOperators] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loadingDayBook, setLoadingDayBook] = useState(false);
  const [dayBookData, setDayBookData] = useState(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'debit',
    asOfDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [exportData, setExportData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    operatorId: '',
    type: ''
  });

  const [dayBookFilters, setDayBookFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const getToken = () => localStorage.getItem('token');

  const fetchOpeningBalance = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${BASE_URL}/opening-balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setBusinessDetails(response.data.businessDetails);
        if (response.data.data) {
          const asOfDate = response.data.data.asOfDate 
            ? new Date(response.data.data.asOfDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
          
          setOpeningBalance({
            _id: response.data.data._id,
            amount: response.data.data.amount,
            type: response.data.data.type,
            asOfDate: asOfDate,
            notes: response.data.data.notes || '',
            createdAt: response.data.data.createdAt,
            updatedAt: response.data.data.updatedAt,
            createdBy: response.data.data.createdBy
          });
        }
      }
    } catch (err) {
      console.error('Error fetching opening balance:', err);
      if (err.response?.status === 404) {
        setOpeningBalance(null);
      } else {
        setError(err.response?.data?.message || t('common.networkError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOperators = async () => {
    setLoadingOperators(true);
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/auth/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const operatorUsers = response.data.data.filter(user => user.role === 'operator');
        setOperators(operatorUsers);
      }
    } catch (err) {
      console.error('Error fetching operators:', err);
      setError(t('common.networkError'));
    } finally {
      setLoadingOperators(false);
    }
  };

  const fetchDayBook = async () => {
    console.log("=== fetchDayBook called ===");
    console.log("Current filters:", dayBookFilters);
    
    if (!dayBookFilters.startDate || !dayBookFilters.endDate) {
      console.error("Missing dates!");
      setError(t('daybook.errors.startDateRequired'));
      return;
    }

    if (new Date(dayBookFilters.startDate) > new Date(dayBookFilters.endDate)) {
      console.error("Invalid date range!");
      setError(t('daybook.errors.invalidDateRange'));
      return;
    }

    setLoadingDayBook(true);
    setError(null);

    try {
      const token = getToken();
      console.log("Token exists?", !!token);
      
      const url = `${BASE_URL}/daybook?startDate=${dayBookFilters.startDate}&endDate=${dayBookFilters.endDate}&format=json`;
      console.log("Fetching from URL:", url);
      
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      console.log("Response data structure:", Object.keys(response.data));
      
      if (response.data.success) {
        console.log("Success! Data received");
        console.log("Data.entries:", response.data.data?.entries);
        console.log("Number of entries:", response.data.data?.entries?.length);
        
        setDayBookData(response.data);
        
        const entryCount = response.data.data?.entries?.length || 0;
        console.log(`Found ${entryCount} entries`);
        setSuccess(t('daybook.messages.entriesFound', { count: entryCount }));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        console.error("API returned success=false:", response.data.message);
        setError(response.data.message || t('daybook.errors.fetchFailed'));
      }
    } catch (err) {
      console.error("=== ERROR in fetchDayBook ===");
      console.error("Error object:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);
      setError(err.response?.data?.message || t('common.networkError'));
    } finally {
      setLoadingDayBook(false);
      console.log("fetchDayBook completed");
    }
  };

  const printDayBook = () => {
    if (!dayBookData) return;

    const isMarathi = i18n.language === 'mr';
    const { data, businessDetails: business, generatedAt } = dayBookData;
    const { period, summary, entries } = data;

    console.log("Business object:", JSON.stringify(business));

    const businessName = business?.businessName || business?.name || (isMarathi ? 'जय शिवराय व्हेजिटेबल' : 'Jai Shivrai Vegetable Co.');
    const businessAddress = business?.fullAddress || business?.businessAddress || business?.address || (isMarathi ? 'वेसराणे, ता. कळवण जि. नाशिक' : 'Vesarane, Tal. Kalwan, Dist. Nashik');
    const businessPhone = business?.phone || business?.businessPhone || business?.contactPhone || (isMarathi ? 'प्रो. रोकेश हिरे मो. ९०२१६९९९९१ / ९६२३९५६३९६' : 'Prop. Rakesh Hire M: 9021699991 / 9623956396');
    const businessEmail = business?.email || business?.businessEmail || '';
    const businessGst = business?.gstNumber || business?.gst || '';
    const businessPan = business?.panNumber || business?.pan || '';

    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const formatDateTime = (dateStr) => {
      if (!dateStr) return 'N/A';
      const date = new Date(dateStr);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    };

    const getTypeBadge = (type) => {
      const colors = {
        PURCHASE: '#FF6F00',
        SALE: '#2E7D32',
        PAYMENT: '#1565C0',
        EXPENSE: '#9C27B0',
        ADVANCE: '#FFB74D'
      };
      const color = colors[type] || '#666';
      return `<span style="background: ${color}20; color: ${color}; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; display: inline-block;">${type}</span>`;
    };

    let entriesRows = '';

    if (entries && Array.isArray(entries) && entries.length > 0) {
      entriesRows = entries.map((entry, idx) => {
        let formattedDate = 'N/A';
        if (entry.date) {
          const transactionDate = new Date(entry.date);
          formattedDate = `${transactionDate.getDate().toString().padStart(2, '0')}/${(transactionDate.getMonth() + 1).toString().padStart(2, '0')}/${transactionDate.getFullYear()}`;
        }

        const formattedTime = entry.formattedTime || '';
        const dateDisplay = formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
        const partyName = entry.party?.name || entry.party || '-';

        let description = entry.description || 'N/A';
        if (entry.referenceNo) {
          description += `<div style="font-size: 9px; color: #888; margin-top: 3px;">Ref: ${entry.referenceNo}</div>`;
        }

        const subtype = entry.subtype ? `<div style="font-size: 9px; color: #999; margin-top: 2px;">${entry.subtype}</div>` : '';
        const paymentMode = entry.paymentMode ? `<div style="font-size: 9px; color: #999;">Mode: ${entry.paymentMode}</div>` : '';

        return `
          <tr>
            <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">${idx + 1}</td>
            <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">
              ${dateDisplay}
              ${subtype}
            </td>
            <td style="text-align: center; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">
              ${getTypeBadge(entry.type)}
            </td>
            <td style="text-align: left; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">
              ${description}
              ${paymentMode}
            </td>
            <td style="text-align: left; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top;">${partyName}</td>
            <td style="text-align: right; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top; font-weight: ${entry.debit > 0 ? 'bold' : 'normal'}; color: ${entry.debit > 0 ? '#D32F2F' : '#333'};">${entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
            <td style="text-align: right; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top; font-weight: ${entry.credit > 0 ? 'bold' : 'normal'}; color: ${entry.credit > 0 ? '#2E7D32' : '#333'};">${entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
            <td style="text-align: right; padding: 10px 8px; border: 1px solid #b3153f; vertical-align: top; font-weight: bold;">${formatCurrency(Math.abs(entry.runningBalance || 0))}</td>
          </tr>
        `;
      }).join('');
    } else {
      entriesRows = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; border: 1px solid #b3153f;">
            <div style="font-size: 14px; color: #999;">No entries found for the selected period</div>
          </td>
        </tr>
      `;
    }

    const printWindow = window.open('', '_blank');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${isMarathi ? 'mr' : 'en'}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Day Book - ${formatDate(period.start)} to ${formatDate(period.end)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
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
            max-width: 1400px;
            background: #fff;
            border: 2px solid #b3153f;
            color: #b3153f;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin: 0 auto;
          }
          .top-header {
            border-bottom: 2px solid #b3153f;
            padding: 12px 15px 0px;
          }
          .title-section {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .center-title {
            flex: 1;
            text-align: center;
            padding: 0 10px 10px;
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
          .gst-pan-row {
            font-size: 9px;
            margin-top: 4px;
            color: #666;
            text-align: center;
          }
          .contact-row {
            border-top: 2px solid #b3153f;
            padding: 8px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            font-weight: bold;
            flex-wrap: wrap;
            gap: 5px;
            min-height: 36px;
          }
          .contact-phone {
            flex: 1;
            text-align: left;
            color: #b3153f;
          }
          .contact-email {
            flex: 1;
            text-align: right;
            color: #b3153f;
            word-break: break-all;
          }
          .period-header {
            background: #fff5f0;
            padding: 10px 15px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px solid #b3153f;
            color: #b3153f;
          }
          .summary-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            padding: 15px;
            background: #fffaf5;
            border-bottom: 2px solid #b3153f;
          }
          .summary-card {
            flex: 1;
            min-width: 130px;
            border: 1px solid #b3153f;
            border-radius: 8px;
            padding: 10px;
            text-align: center;
            background: white;
          }
          .summary-card h4 {
            font-size: 11px;
            margin-bottom: 6px;
            color: #b3153f;
          }
          .summary-card .amount {
            font-size: 16px;
            font-weight: bold;
          }
          .main-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          .main-table th,
          .main-table td {
            border: 1px solid #b3153f;
            padding: 8px 6px;
            vertical-align: middle;
          }
          .main-table th {
            background: #fff5f5;
            font-weight: bold;
            text-align: center;
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
            color: #b3153f;
          }
          .footer-right span {
            color: #000;
            font-size: 18px;
            font-weight: bold;
          }
          .generated-info {
            padding: 8px 15px;
            font-size: 9px;
            color: #999;
            text-align: right;
          }
          @media print {
            body { background: white; padding: 0; margin: 0; }
            .receipt { box-shadow: none; margin: 0; width: 100%; }
            .main-table th { background: #fff5f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .summary-cards { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          @media (max-width: 768px) {
            .main-table { font-size: 8px; }
            .summary-card .amount { font-size: 12px; }
            .center-title h1 { font-size: 22px; }
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
                ${(businessGst || businessPan)
                  ? `<div class="gst-pan-row">${businessGst ? `GST: ${businessGst}` : ''}${businessGst && businessPan ? ' | ' : ''}${businessPan ? `PAN: ${businessPan}` : ''}</div>`
                  : ''}
                <div class="receipt-badge">DAY BOOK</div>
              </div>
            </div>
            <div class="contact-row">
              <div class="contact-phone">Mobile : ${businessPhone}</div>
              ${businessEmail ? `<div class="contact-email">Email : ${businessEmail}</div>` : '<div></div>'}
            </div>
          </div>
          <div class="period-header">
             Period: ${formatDate(period.start)} to ${formatDate(period.end)}
          </div>
          <div class="summary-cards">
            <div class="summary-card">
              <h4>Total Purchases</h4>
              <div class="amount" style="color: #D32F2F;">${formatCurrency(summary.totalPurchases)}</div>
            </div>
            <div class="summary-card">
              <h4>Total Sales</h4>
              <div class="amount" style="color: #2E7D32;">${formatCurrency(summary.totalSales)}</div>
            </div>
            <div class="summary-card">
              <h4>Payments Out</h4>
              <div class="amount" style="color: #D32F2F;">${formatCurrency(summary.totalPaymentsOut)}</div>
            </div>
            <div class="summary-card">
              <h4>Payments In</h4>
              <div class="amount" style="color: #2E7D32;">${formatCurrency(summary.totalPaymentsIn)}</div>
            </div>
            <div class="summary-card">
              <h4>Total Expenses</h4>
              <div class="amount" style="color: #FF6F00;">${formatCurrency(summary.totalExpenses)}</div>
            </div>
            <div class="summary-card">
              <h4>Opening Balance</h4>
              <div class="amount" style="color: #1565C0;">${formatCurrency(summary.openingBalance)}</div>
            </div>
            <div class="summary-card">
              <h4>Closing Balance</h4>
              <div class="amount" style="color: ${summary.closingBalance >= 0 ? '#2E7D32' : '#D32F2F'};">${formatCurrency(Math.abs(summary.closingBalance))}</div>
            </div>
          </div>
          <table class="main-table">
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 12%;">Date</th>
                <th style="width: 10%;">Type</th>
                <th style="width: 30%;">Description</th>
                <th style="width: 15%;">Party</th>
                <th style="width: 13%;">Debit (₹)</th>
                <th style="width: 13%;">Credit (₹)</th>
                <th style="width: 12%;">Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${entriesRows}
            </tbody>
          </table>
          <div class="footer">
            <div class="footer-row">
              <div class="footer-left">
                 Total Entries: ${summary.totalEntries || 0} &nbsp;|&nbsp; ${isMarathi ? 'धन्यवाद!' : 'Thank You!'}
              </div>
              <div class="footer-right">
                Closing Balance:
                <span>${formatCurrency(Math.abs(summary.closingBalance))}</span>
              </div>
            </div>
            <div class="generated-info">
              Generated on: ${formatDateTime(generatedAt)}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const openDayBookModal = () => {
    setDayBookFilters({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    setDayBookData(null);
    setShowDayBookModal(true);
    setError(null);
  };

  const closeDayBookModal = () => {
    setShowDayBookModal(false);
    setDayBookData(null);
    setError(null);
  };

  const handleDayBookView = async () => {
    await fetchDayBook();
  };

  useEffect(() => {
    fetchOpeningBalance();
  }, []);

  const openModal = () => {
    if (openingBalance) {
      setFormData({
        amount: openingBalance.amount.toString(),
        type: openingBalance.type,
        asOfDate: openingBalance.asOfDate,
        notes: openingBalance.notes
      });
    } else {
      setFormData({
        amount: '',
        type: 'debit',
        asOfDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setError(null);
  };

  const openExportModal = () => {
    setExportData({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      operatorId: '',
      type: ''
    });
    setShowExportModal(true);
    fetchOperators();
    setError(null);
  };

  const closeExportModal = () => {
    setShowExportModal(false);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExportInputChange = (e) => {
    const { name, value } = e.target;
    setExportData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayBookFilterChange = (e) => {
    const { name, value } = e.target;
    setDayBookFilters(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError(t('openingBalance.errors.validAmountRequired'));
      return false;
    }
    if (!formData.asOfDate) {
      setError(t('openingBalance.errors.dateRequired'));
      return false;
    }
    if (!formData.type) {
      setError(t('openingBalance.errors.typeRequired'));
      return false;
    }
    return true;
  };

  const validateExportForm = () => {
    if (!exportData.startDate) {
      setError(t('daybook.errors.startDateRequired'));
      return false;
    }
    if (!exportData.endDate) {
      setError(t('daybook.errors.endDateRequired'));
      return false;
    }
    if (new Date(exportData.startDate) > new Date(exportData.endDate)) {
      setError(t('daybook.errors.invalidDateRange'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const token = getToken();
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        asOfDate: formData.asOfDate,
        notes: formData.notes || ''
      };

      const response = await axios.post(`${BASE_URL}/opening-balance`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess(openingBalance 
          ? t('openingBalance.messages.updateSuccess')
          : t('openingBalance.messages.createSuccess')
        );
        closeModal();
        fetchOpeningBalance();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error saving opening balance:', err);
      setError(err.response?.data?.message || t('common.networkError'));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!validateExportForm()) return;

    setExporting(true);
    setError(null);

    try {
      const token = getToken();
      const queryParams = new URLSearchParams({
        startDate: exportData.startDate,
        endDate: exportData.endDate
      });
      
      if (exportData.operatorId) queryParams.append('operatorId', exportData.operatorId);
      if (exportData.type) queryParams.append('type', exportData.type);

      const response = await axios.get(`${BASE_URL}/daybook/export/excel?${queryParams}`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = `Daybook_Report_${exportData.startDate}_to_${exportData.endDate}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(t('daybook.messages.exportSuccess'));
      closeExportModal();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error exporting daybook:', err);
      setError(err.response?.data?.message || t('common.networkError'));
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#2E7D32' }} />
        <span className="ml-2" style={{ color: '#2E7D32' }}>{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{t('openingBalance.title')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>{t('openingBalance.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openDayBookModal}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
            style={{ borderColor: '#C8E6C9', color: '#1565C0', background: '#E3F2FD' }}
          >
            <Eye className="w-4 h-4" />
            {t('daybook.viewDayBook')}
          </button>
          <button
            onClick={openExportModal}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 border"
            style={{ borderColor: '#C8E6C9', color: '#1976D2', background: '#E3F2FD' }}
          >
            <Download className="w-4 h-4" />
            {t('daybook.exportDayBook')}
          </button>
          <button
            onClick={openModal}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
            style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
          >
            <Plus className="w-4 h-4" />
            {openingBalance ? t('openingBalance.updateBalance') : t('openingBalance.addBalance')}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-600">{success}</span>
        </div>
      )}

      {/* Business Information Card */}
      {businessDetails && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
                {t('openingBalance.businessInformation')}
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 mt-0.5" style={{ color: '#2E7D32' }} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                    {t('openingBalance.businessName')}
                  </p>
                  <p className="text-base font-semibold mt-1" style={{ color: '#1F2937' }}>
                    {businessDetails.businessName || businessDetails.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5" style={{ color: '#FF6F00' }} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                    {t('openingBalance.address')}
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
                    {businessDetails.fullAddress || businessDetails.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5" style={{ color: '#1976D2' }} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                    {t('openingBalance.phone')}
                  </p>
                  <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
                    {businessDetails.phone || businessDetails.businessPhone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5" style={{ color: '#D32F2F' }} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                    {t('openingBalance.email')}
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
                    {businessDetails.email || businessDetails.businessEmail}
                  </p>
                </div>
              </div>
              {businessDetails.gstNumber && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-0.5" style={{ color: '#9C27B0' }} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                      {t('openingBalance.gstNumber')}
                    </p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
                      {businessDetails.gstNumber}
                    </p>
                  </div>
                </div>
              )}
              {businessDetails.panNumber && (
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 mt-0.5" style={{ color: '#607D8B' }} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                      {t('openingBalance.panNumber')}
                    </p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
                      {businessDetails.panNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Opening Balance Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ background: '#1B3A1F', borderColor: '#2E5A32' }}>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
              {t('openingBalance.openingBalanceDetails')}
            </h2>
          </div>
        </div>
        
        <div className="p-6">
          {openingBalance ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium flex items-center gap-2" style={{ color: '#6B7280' }}>
                      <Banknote className="w-4 h-4" />
                      {t('openingBalance.currentBalance')}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      openingBalance.type === 'debit' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {openingBalance.type === 'debit' ? t('openingBalance.debit') : t('openingBalance.credit')}
                    </span>
                  </div>
                  <p className="text-4xl font-bold" style={{ color: '#2E7D32' }}>
                    {formatCurrency(openingBalance.amount)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-3 border-b" style={{ borderColor: '#E8F5E9' }}>
                  <Calendar className="w-5 h-5 mt-0.5" style={{ color: '#FF6F00' }} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                      {t('openingBalance.asOfDate')}
                    </p>
                    <p className="text-base font-semibold mt-1" style={{ color: '#1F2937' }}>
                      {formatDate(openingBalance.asOfDate)}
                    </p>
                  </div>
                </div>
                
                {openingBalance.notes && (
                  <div className="flex items-start gap-3 pb-3 border-b" style={{ borderColor: '#E8F5E9' }}>
                    <FileText className="w-5 h-5 mt-0.5" style={{ color: '#9C27B0' }} />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                        {t('common.notes')}
                      </p>
                      <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
                        {openingBalance.notes}
                      </p>
                    </div>
                  </div>
                )}
                
                {openingBalance.createdBy && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 mt-0.5" style={{ color: '#1976D2' }} />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8D6E63' }}>
                        {t('openingBalance.createdBy')}
                      </p>
                      <p className="text-sm font-medium mt-1" style={{ color: '#1F2937' }}>
                        {openingBalance.createdBy.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                        {formatDateTime(openingBalance.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-50 flex items-center justify-center">
                <AlertCircle className="w-10 h-10" style={{ color: '#FFB74D' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F2937' }}>
                {t('openingBalance.noBalanceFound')}
              </h3>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                {t('openingBalance.noBalanceDescription')}
              </p>
              <button
                onClick={openModal}
                className="px-6 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 mx-auto hover:scale-105 transition-all"
                style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
              >
                <Plus className="w-4 h-4" />
                {t('openingBalance.addBalance')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" style={{ color: '#1976D2' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: '#1E3A8A' }}>
              {t('openingBalance.whatIsOpeningBalance')}
            </h3>
            <p className="text-sm" style={{ color: '#1E40AF' }}>
              {t('openingBalance.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Opening Balance Modal */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 z-50 transition-all duration-300"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
            onClick={closeModal}
          />
          
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all duration-300">
                <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
                  <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1B5E20' }}>
                    <Banknote className="w-5 h-5" />
                    {openingBalance ? t('openingBalance.updateBalance') : t('openingBalance.addBalance')}
                  </h3>
                  <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" style={{ color: '#6B7280' }} />
                  </button>
                </div>

                <div className="px-6 py-6">
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">{error}</span>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('openingBalance.amount')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                          style={{ borderColor: '#D1D5DB' }}
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('openingBalance.type')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                      >
                        <option value="debit">{t('openingBalance.debit')} (Positive Balance)</option>
                        <option value="credit">{t('openingBalance.credit')} (Negative Balance)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('openingBalance.asOfDate')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="asOfDate"
                        value={formData.asOfDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('common.notes')}
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder={t('openingBalance.notesPlaceholder')}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                        style={{ borderColor: '#D1D5DB' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
                  <button
                    onClick={closeModal}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
                  >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? t('common.saving') : t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Export Day Book Modal */}
      {showExportModal && (
        <>
          <div 
            className="fixed inset-0 z-50 transition-all duration-300"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
            onClick={closeExportModal}
          />
          
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300">
                <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
                  <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1976D2' }}>
                    <Download className="w-5 h-5" />
                    {t('daybook.exportDayBook')}
                  </h3>
                  <button onClick={closeExportModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" style={{ color: '#6B7280' }} />
                  </button>
                </div>

                <div className="px-6 py-6">
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">{error}</span>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('daybook.startDate')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={exportData.startDate}
                        onChange={handleExportInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('daybook.endDate')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={exportData.endDate}
                        onChange={handleExportInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('daybook.operator')}
                      </label>
                      <select
                        name="operatorId"
                        value={exportData.operatorId}
                        onChange={handleExportInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                      >
                        <option value="">{t('daybook.allOperators')}</option>
                        {operators.map(operator => (
                          <option key={operator.id} value={operator.id}>
                            {operator.name} - {operator.email}
                          </option>
                        ))}
                      </select>
                      {loadingOperators && (
                        <div className="flex items-center gap-2 mt-1">
                          <Loader className="w-3 h-3 animate-spin" style={{ color: '#1976D2' }} />
                          <span className="text-xs" style={{ color: '#6B7280' }}>{t('common.loading')}...</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('daybook.transactionType')}
                      </label>
                      <select
                        name="type"
                        value={exportData.type}
                        onChange={handleExportInputChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                      >
                        <option value="">{t('daybook.allTypes')}</option>
                        <option value="credit">{t('daybook.credit')}</option>
                        <option value="debit">{t('daybook.debit')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
                  <button
                    onClick={closeExportModal}
                    disabled={exporting}
                    className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(135deg, #1976D2, #42A5F5)' }}
                  >
                    {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {exporting ? t('common.exporting') : t('common.export')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Day Book Modal */}
      {showDayBookModal && (
        <>
          <div 
            className="fixed inset-0 z-50 transition-all duration-300"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
            onClick={closeDayBookModal}
          />
          
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300">
                <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: '#E5E7EB' }}>
                  <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1565C0' }}>
                    <Eye className="w-5 h-5" />
                    {t('daybook.viewDayBook')}
                  </h3>
                  <button onClick={closeDayBookModal} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" style={{ color: '#6B7280' }} />
                  </button>
                </div>

                <div className="px-6 py-6">
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">{error}</span>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('daybook.startDate')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={dayBookFilters.startDate}
                        onChange={handleDayBookFilterChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        {t('daybook.endDate')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={dayBookFilters.endDate}
                        onChange={handleDayBookFilterChange}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        style={{ borderColor: '#D1D5DB' }}
                        required
                      />
                    </div>
                  </div>

                  {dayBookData && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        {t('daybook.messages.entriesFound', { count: dayBookData.data.summary.totalEntries })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E7EB' }}>
                  <button
                    onClick={closeDayBookModal}
                    disabled={loadingDayBook}
                    className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-all"
                    style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
                  >
                    {t('common.close')}
                  </button>
                  {dayBookData ? (
                    <button
                      onClick={printDayBook}
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
                      style={{ background: 'linear-gradient(135deg, #1565C0, #42A5F5)' }}
                    >
                      <Printer className="w-4 h-4" />
                      {t('common.print')}
                    </button>
                  ) : (
                    <button
                      onClick={handleDayBookView}
                      disabled={loadingDayBook}
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all"
                      style={{ background: 'linear-gradient(135deg, #1565C0, #42A5F5)' }}
                    >
                      {loadingDayBook ? <Loader className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                      {loadingDayBook ? t('common.loading') : t('common.view')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OpeningBalance;
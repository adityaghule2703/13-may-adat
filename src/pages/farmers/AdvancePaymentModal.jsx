// src/pages/farmers/AdvancePaymentModal.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertCircle, Loader, Wallet } from 'lucide-react';
import BASE_URL from '../../config/Config';

const AdvancePaymentModal = ({ 
  isOpen, 
  farmer, 
  onClose, 
  onSuccess, 
  getToken, 
  navigate,
  formatCurrency 
}) => {
  const { t } = useTranslation();
  const [advanceForm, setAdvanceForm] = useState({
    amount: '',
    paymentMode: 'cash',
    referenceNumber: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens with new farmer
  React.useEffect(() => {
    if (isOpen && farmer) {
      setAdvanceForm({
        amount: '',
        paymentMode: 'cash',
        referenceNumber: '',
        notes: ''
      });
      setError('');
    }
  }, [isOpen, farmer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdvanceForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!advanceForm.amount || advanceForm.amount <= 0) {
      setError(t('farmers.errors.validAmountRequired'));
      return;
    }

    if (!advanceForm.paymentMode) {
      setError(t('farmers.errors.paymentModeRequired'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/farmers/${farmer._id}/advance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Number(advanceForm.amount),
          paymentMode: advanceForm.paymentMode,
          referenceNumber: advanceForm.referenceNumber || undefined,
          notes: advanceForm.notes || undefined
        })
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || t('farmers.errors.advanceFailed'));
      }
    } catch (error) {
      console.error('Error submitting advance:', error);
      setError(t('common.networkError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !farmer) return null;

  return (
    <div 
      className="fixed inset-0 z-50"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      {/* Backdrop with black background and blur */}
      <div 
        className="absolute inset-0"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal Container - Centered */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal Content - Increased width from max-w-md to max-w-lg */}
        <div 
          className="relative bg-white rounded-xl shadow-xl w-full"
          style={{ 
            maxWidth: '600px', // Increased from default max-w-md (448px) to 600px
            maxHeight: '90vh', 
            overflowY: 'auto',
            zIndex: 10000
          }}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E8F5E9' }}>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#1B5E20' }}>
                {t('farmers.modals.advance.title', { name: farmer.name })}
              </h3>
              <p className="text-sm mt-1" style={{ color: '#8D6E63' }}>
                {t('farmers.modals.advance.subtitle')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" style={{ color: '#8D6E63' }} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            {/* Two Column Layout for better width utilization */}
            <div className="grid grid-cols-2 gap-4">
              {/* Amount Field */}
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>
                  {t('common.amount')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={advanceForm.amount}
                    onChange={handleChange}
                    placeholder={t('common.enterAmount')}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                    style={{ borderColor: '#C8E6C9' }}
                  />
                </div>
              </div>

              {/* Payment Mode Field */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>
                  {t('payments.modes.paymentMode')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="paymentMode"
                  value={advanceForm.paymentMode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                  style={{ borderColor: '#C8E6C9' }}
                >
                  <option value="cash">{t('payments.modes.cash')}</option>
                  <option value="cheque">{t('payments.modes.cheque')}</option>
                  <option value="bank_transfer">{t('payments.modes.bank')}</option>
                  <option value="upi">{t('payments.modes.upi')}</option>
                  <option value="credit_card">{t('payments.modes.creditCard')}</option>
                  <option value="debit_card">{t('payments.modes.debitCard')}</option>
                </select>
              </div>

              {/* Reference Number Field (Optional) */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>
                  {t('payments.referenceNumber')} <span className="text-gray-400">({t('common.optional')})</span>
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={advanceForm.referenceNumber}
                  onChange={handleChange}
                  placeholder={t('payments.referencePlaceholder')}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                  style={{ borderColor: '#C8E6C9' }}
                />
              </div>
            </div>

            {/* Notes Field (Optional) - Full width */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#2E7D32' }}>
                {t('common.notes')} <span className="text-gray-400">({t('common.optional')})</span>
              </label>
              <textarea
                name="notes"
                value={advanceForm.notes}
                onChange={handleChange}
                rows="3"
                placeholder={t('common.notesPlaceholder')}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent resize-none"
                style={{ borderColor: '#C8E6C9' }}
              />
            </div>

            {/* Current Dues Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#8D6E63' }}>{t('farmers.modals.advance.currentDues')}:</span>
                <span className="font-semibold" style={{ color: '#FF6F00' }}>
                  {formatCurrency(farmer.pendingDues)}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: '#E8F5E9' }}>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-gray-50"
              style={{ borderColor: '#C8E6C9', color: '#8D6E63' }}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  {t('farmers.actions.advancePayment')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancePaymentModal;
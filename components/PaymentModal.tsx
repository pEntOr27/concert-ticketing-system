'use client';

import React, { useState } from 'react';
import { CreditCard, QrCode, Building2, CheckCircle2, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface PaymentModalProps {
  isOpen: boolean;
  bookingId: string;
  totalAmount: number;
  onClose: () => void;
  onSuccess: (ticketUrl: string) => void;
}

export default function PaymentModal({
  isOpen,
  bookingId,
  totalAmount,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'PROMPTPAY' | 'CREDIT_CARD' | 'BANK_TRANSFER'>('PROMPTPAY');
  const [promoCode, setPromoCode] = useState('SUMMER10');
  const [discount, setDiscount] = useState<number>(0);
  const [promoId, setPromoId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const finalPrice = Math.max(0, totalAmount - discount);

  const handleApplyPromo = async () => {
    setError('');
    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, totalAmount }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || 'โค้ดส่วนลดไม่ถูกต้อง');
        return;
      }
      setDiscount(data.data.discountAmount);
      setPromoId(data.data.id);
    } catch {
      setError('เกิดข้อผิดพลาดในการใช้โค้ดส่วนลด');
    }
  };

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentMethod,
          promotionId: promoId,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || 'สร้างรายการชำระเงินไม่สำเร็จ');
        setLoading(false);
        return;
      }

      setPaymentId(data.data.paymentId);
      setQrCodeUrl(data.data.qrDataUrl);
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (simulateSuccess: boolean = true) => {
    if (!paymentId) return;
    setVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, simulateSuccess }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'การชำระเงินล้มเหลว');
        setVerifying(false);
        return;
      }

      onSuccess(data.data.ticketUrl);
      onClose();
    } catch {
      setError('เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">ชำระเงินค่าตั๋วคอนเสิร์ต (Simulation)</h3>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Promotion Code input */}
        <div className="mb-5 p-3 rounded-2xl bg-sky-50/70 border border-sky-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1">ส่วนลดโปรโมชั่น</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="SUMMER10"
              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs uppercase font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <button
              onClick={handleApplyPromo}
              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition"
            >
              ใช้โค้ด
            </button>
          </div>
          {discount > 0 && (
            <p className="text-[11px] text-emerald-600 font-semibold mt-1.5">
              ✓ ส่วนลด ฿{discount.toLocaleString()} บาท
            </p>
          )}
        </div>

        {/* Amount Summary */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5">
          <span className="text-xs font-semibold text-slate-600">ยอดชำระสุทธิ:</span>
          <span className="text-2xl font-extrabold text-sky-600">฿{finalPrice.toLocaleString()}</span>
        </div>

        {/* Payment Methods Selection */}
        {!paymentId ? (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700">เลือกช่องทางการชำระเงิน</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('PROMPTPAY')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-bold transition ${
                  paymentMethod === 'PROMPTPAY'
                    ? 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>PromptPay QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-bold transition ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>บัตรเครดิต</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-bold transition ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>โอนผ่านธนาคาร</span>
              </button>
            </div>

            <button
              onClick={handleInitiatePayment}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-200 transition disabled:opacity-50 mt-4"
            >
              {loading ? 'กำลังสร้างช่องทางชำระเงิน...' : 'สร้าง QR Code / ดำเนินการชำระเงิน'}
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            {paymentMethod === 'PROMPTPAY' && qrCodeUrl && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 inline-block">
                <img src={qrCodeUrl} alt="PromptPay QR Code" className="w-48 h-48 mx-auto" />
                <p className="text-[11px] text-slate-500 font-semibold mt-2">สแกนด้วยแอปพลิเคชันธนาคารทุกแห่ง</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleConfirmPayment(true)}
                disabled={verifying}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{verifying ? 'กำลังตรวจสอบ...' : 'จำลองการชำระเงินสำเร็จ'}</span>
              </button>

              <button
                onClick={() => handleConfirmPayment(false)}
                disabled={verifying}
                className="py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs border border-rose-200 transition disabled:opacity-50"
              >
                จำลองชำระเงินล้มเหลว
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ShieldCheck, X, KeyRound, AlertCircle } from 'lucide-react';

interface OtpModalProps {
  isOpen: boolean;
  phone: string;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OtpModal({ isOpen, phone, email, onClose, onSuccess }: OtpModalProps) {
  const [code, setCode] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email, code }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'รหัส OTP ไม่ถูกต้อง');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError('เกิดข้อผิดพลาดในการตรวจสอบ OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-sky-100 p-6 text-center">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-800">ยืนยันรหัส OTP (Demo)</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          ส่งรหัสไปยังเบอร์ <span className="font-semibold text-slate-700">{phone || '08X-XXX-XXXX'}</span>
        </p>

        <div className="mb-4 p-2.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
          🔑 รหัส Demo OTP: <span className="text-sky-600 underline">123456</span>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            placeholder="123456"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-200 transition disabled:opacity-50"
          >
            {loading ? 'กำลังยืนยัน...' : 'ยืนยันรหัส OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}

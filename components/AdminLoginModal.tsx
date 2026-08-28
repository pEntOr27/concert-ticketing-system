'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, KeyRound, UserCheck, ShieldAlert, Mail, UserPlus, LogIn, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FaceScanModal from './FaceScanModal';
import OtpModal from './OtpModal';

interface AdminLoginModalProps {
  isOpen: boolean;
  initialTab?: 'customer' | 'register' | 'admin';
  onClose: () => void;
}

export default function AdminLoginModal({ isOpen, initialTab = 'admin', onClose }: AdminLoginModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'customer' | 'register' | 'admin'>(initialTab);

  // Login form state
  const [email, setEmail] = useState('admin@concert.com');
  const [password, setPassword] = useState('Admin@123456');

  // Register form state
  const [firstName, setFirstName] = useState('ณัฐวุฒิ');
  const [lastName, setLastName] = useState('สุขสวัสดิ์');
  const [phone, setPhone] = useState('0896629567');
  const [nationality, setNationality] = useState('THAI');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Multi-step Registration Verification Modals State
  const [isRegisterFaceScanOpen, setIsRegisterFaceScanOpen] = useState(false);
  const [isRegisterOtpOpen, setIsRegisterOtpOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError('');
      setSuccessMsg('');
      if (initialTab === 'admin') {
        setEmail('admin@concert.com');
        setPassword('Admin@123456');
      } else if (initialTab === 'customer') {
        setEmail('somchai@gmail.com');
        setPassword('Customer@123456');
      } else if (initialTab === 'register') {
        const rand = Math.floor(1000 + Math.random() * 9000);
        setFirstName('ณัฐวุฒิ');
        setLastName('สุขสวัสดิ์');
        setEmail(`nattawut${rand}@gmail.com`);
        setPhone(`089${rand}567`);
        setPassword('Customer@123456');
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleTabChange = (tab: 'customer' | 'register' | 'admin') => {
    setActiveTab(tab);
    setError('');
    setSuccessMsg('');
    if (tab === 'admin') {
      setEmail('admin@concert.com');
      setPassword('Admin@123456');
    } else if (tab === 'customer') {
      setEmail('somchai@gmail.com');
      setPassword('Customer@123456');
    } else if (tab === 'register') {
      const rand = Math.floor(1000 + Math.random() * 9000);
      setFirstName('ณัฐวุฒิ');
      setLastName('สุขสวัสดิ์');
      setEmail(`nattawut${rand}@gmail.com`);
      setPhone(`089${rand}567`);
      setPassword('Customer@123456');
    }
  };

  const handleAutofillAdmin = () => {
    setEmail('admin@concert.com');
    setPassword('Admin@123456');
  };

  const handleAutofillCustomer = () => {
    setEmail('somchai@gmail.com');
    setPassword('Customer@123456');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (activeTab === 'register') {
      // Basic Validation for Registration
      if (!firstName || !lastName || !email || !phone || !password) {
        setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
      }
      if (password.length < 8) {
        setError('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
        return;
      }

      // Step 2: Open Face Scan Liveness Verification Modal
      setIsRegisterFaceScanOpen(true);
      return;
    }

    // Handle Standard Login (Customer or Admin)
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          isAdminLogin: activeTab === 'admin',
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'การเข้าสู่ระบบไม่สำเร็จ');
        setLoading(false);
        return;
      }

      onClose();
      if (activeTab === 'admin') {
        router.push('/admin');
      } else {
        window.location.reload();
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  // Finalize Registration after Face Scan & OTP
  const executeFinalRegistration = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          nationality,
          password,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || 'การสมัครสมาชิกไม่สำเร็จ');
        setLoading(false);
        return;
      }

      // Auto login after successful registration
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isAdminLogin: false }),
      });
      const loginData = await loginRes.json();

      if (loginData.success) {
        onClose();
        window.location.reload();
      } else {
        setSuccessMsg('สมัครสมาชิกและยืนยันตัวตนสำเร็จเรียบร้อย! กรุณาเข้าสู่ระบบ');
        setActiveTab('customer');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการสมัครสมาชิก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden">
          {/* Header Bar with 3 Tabs */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleTabChange('customer')}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === 'customer'
                    ? 'bg-white text-sky-600 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                เข้าสู่ระบบสมาชิก
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === 'register'
                    ? 'bg-white text-sky-600 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                สมัครสมาชิกใหม่
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  activeTab === 'admin'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-200 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Admin Login
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Title & Subtitle */}
          <div className="px-8 pt-4 pb-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {activeTab === 'admin' && 'เข้าสู่ระบบผู้ดูแลระบบ (Admin)'}
              {activeTab === 'customer' && 'เข้าสู่ระบบสมาชิก (Customer Login)'}
              {activeTab === 'register' && 'สมัครสมาชิกใหม่ (Register)'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {activeTab === 'admin' && 'สำหรับผู้ดูแลระบบ Admin Full Control เท่านั้น'}
              {activeTab === 'customer' && 'เข้าสู่ระบบเพื่อดำเนินการเลือกที่นั่งและจัดการตั๋วคอนเสิร์ต'}
              {activeTab === 'register' && 'กรอกข้อมูลและยืนยันตัวตน (สแกนใบหน้า + OTP) เพื่อเปิดใช้งานระบบจองตั๋ว'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mx-8 mt-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="mx-8 mt-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <UserCheck className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Dynamic Form Content */}
          <form onSubmit={handleSubmit} className="px-8 py-4 space-y-4">
            {activeTab === 'register' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
                      placeholder="ณัฐวุฒิ"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">นามสกุล</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
                      placeholder="สุขสวัสดิ์"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมลของคุณ</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
                    placeholder="nattawut@gmail.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ (10 หลัก)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
                      placeholder="0896629567"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">สัญชาติ</label>
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none font-semibold"
                    >
                      <option value="THAI">ไทย (THAI)</option>
                      <option value="FOREIGNER">ต่างชาติ (FOREIGNER)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">กำหนดรหัสผ่าน (อย่างน้อย 8 ตัวอักษร)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            ) : (
              /* LOGIN TABS */
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {activeTab === 'admin' ? 'อีเมลผู้ดูแลระบบ' : 'อีเมลของคุณ'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeTab === 'admin' ? 'admin@concert.com' : 'somchai@gmail.com'}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {activeTab === 'admin' ? 'Security Password / Key' : 'รหัสผ่าน'}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition font-medium"
                    />
                  </div>
                </div>

                {/* Quick Demo Helper Banner for Login */}
                {activeTab === 'admin' && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs">
                    <span className="text-slate-600 font-medium text-xs">ทดสอบเข้าสู่ระบบ Admin:</span>
                    <button
                      type="button"
                      onClick={handleAutofillAdmin}
                      className="px-3 py-1.5 rounded-xl bg-white text-sky-700 font-bold border border-sky-200 hover:bg-sky-100 transition shadow-xs"
                    >
                      ใส่รหัส Admin
                    </button>
                  </div>
                )}

                {activeTab === 'customer' && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs">
                    <span className="text-slate-600 font-medium text-xs">ทดสอบเข้าสู่ระบบ Customer:</span>
                    <button
                      type="button"
                      onClick={handleAutofillCustomer}
                      className="px-3 py-1.5 rounded-xl bg-white text-sky-700 font-bold border border-sky-200 hover:bg-sky-100 transition shadow-xs"
                    >
                      ใส่รหัส Customer Demo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-200 transition disabled:opacity-50 mt-2"
            >
              {activeTab === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิกใหม่ (สแกนใบหน้า + OTP)'}</span>
                </>
              ) : activeTab === 'admin' ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ Admin Panel'}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบสมาชิก'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Step 2 Verification Modal: AI Face Scan / Liveness */}
      <FaceScanModal
        isOpen={isRegisterFaceScanOpen}
        onClose={() => setIsRegisterFaceScanOpen(false)}
        onSuccess={() => {
          setIsRegisterFaceScanOpen(false);
          // Step 3 Verification Modal: SMS OTP Verification
          setIsRegisterOtpOpen(true);
        }}
      />

      {/* Step 3 Verification Modal: SMS OTP */}
      <OtpModal
        isOpen={isRegisterOtpOpen}
        phone={phone}
        email={email}
        onClose={() => setIsRegisterOtpOpen(false)}
        onSuccess={() => {
          setIsRegisterOtpOpen(false);
          // Step 4 Finalize Registration & Auto Login
          executeFinalRegistration();
        }}
      />
    </>
  );
}

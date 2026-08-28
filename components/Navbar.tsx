'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, UserCheck, LayoutDashboard, LogIn, LogOut, UserPlus, Bell, Menu, X } from 'lucide-react';
import AdminLoginModal from './AdminLoginModal';
import FaceScanModal from './FaceScanModal';
import HowToBookModal from './HowToBookModal';

interface NavbarProps {
  user?: any;
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'customer' | 'register' | 'admin'>('admin');
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isHowToModalOpen, setIsHowToModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('super_admin');

  const openAuthModal = (tab: 'customer' | 'register' | 'admin') => {
    setModalTab(tab);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & System Name */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-200 shrink-0">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">ระบบจำหน่ายตั๋วคอนเสิร์ต</h1>
              <p className="text-[10px] sm:text-xs text-sky-600 font-medium">Online Concert Ticketing</p>
            </div>
          </Link>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100">
            <Link href="/" className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white shadow-sm border border-slate-100">
              หน้าหลัก
            </Link>
            <Link href="/#concerts" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-white/60 transition">
              คอนเสิร์ต
            </Link>
            <Link href="/promotions" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-white/60 transition">
              โปรโมชั่น
            </Link>
            <Link href="/my-tickets" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-white/60 transition">
              ตั๋วของฉัน
            </Link>
            <button
              onClick={() => setIsHowToModalOpen(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-white/60 transition"
            >
              วิธีการจอง
            </button>
          </nav>

          {/* Action Buttons & Status */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Notification Icon */}
            <button className="relative p-2 sm:p-2.5 rounded-xl text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full animate-ping" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full" />
            </button>

            {/* AI Face Scan Liveness Trigger */}
            <button
              onClick={() => setIsFaceModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold hover:bg-sky-100 transition"
            >
              <UserCheck className="w-4 h-4 text-sky-500" />
              <span>{user?.faceVerifiedAt ? 'ยืนยันตัวตนแล้ว' : 'ยืนยันตัวตนก่อนจอง'}</span>
            </button>

            {/* Admin Login Modal Trigger Button */}
            <button
              onClick={() => openAuthModal('admin')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-semibold transition border border-slate-200"
            >
              <LayoutDashboard className="w-4 h-4 text-sky-500" />
              <span>{isAdmin ? 'เข้าสู่ Admin Dashboard' : 'เข้าสู่โหมด Admin'}</span>
            </button>

            {/* Customer User Account / Auth Actions */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden xl:block">
                  <p className="text-xs font-bold text-slate-800">{user.firstName} {user.lastName}</p>
                  <p className="text-[10px] text-sky-600 font-medium">{user.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-slate-200 transition"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  <UserPlus className="w-3.5 h-3.5 text-sky-500" />
                  <span>สมัครสมาชิก</span>
                </button>
                <button
                  onClick={() => openAuthModal('customer')}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition shadow-md shadow-sky-200"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบ</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-sky-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 bg-white rounded-3xl border border-sky-100 shadow-xl space-y-3 animate-fadeIn">
            <nav className="flex flex-col space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-sky-50"
              >
                หน้าหลัก
              </Link>
              <Link
                href="/#concerts"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                คอนเสิร์ต
              </Link>
              <Link
                href="/promotions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                โปรโมชั่น
              </Link>
              <Link
                href="/my-tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                ตั๋วของฉัน
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsHowToModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 text-left"
              >
                วิธีการจอง
              </button>
            </nav>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setIsFaceModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-sky-50 text-sky-700 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-sky-500" />
                <span>{user?.faceVerifiedAt ? 'ยืนยันตัวตนแล้ว' : 'สแกนใบหน้า ยืนยันตัวตน'}</span>
              </button>

              <button
                onClick={() => openAuthModal('admin')}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4 text-sky-500" />
                <span>{isAdmin ? 'เข้าสู่ Admin Dashboard' : 'เข้าสู่โหมด Admin'}</span>
              </button>

              {!user && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => openAuthModal('register')}
                    className="py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    สมัครสมาชิก
                  </button>
                  <button
                    onClick={() => openAuthModal('customer')}
                    className="py-2.5 rounded-xl bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-200"
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AdminLoginModal
        isOpen={authModalOpen}
        initialTab={modalTab}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Face Scan Liveness Verification Modal */}
      <FaceScanModal isOpen={isFaceModalOpen} onClose={() => setIsFaceModalOpen(false)} />

      {/* How To Book Guide Modal */}
      <HowToBookModal isOpen={isHowToModalOpen} onClose={() => setIsHowToModalOpen(false)} />
    </>
  );
}

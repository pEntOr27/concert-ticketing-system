'use client';

import React from 'react';
import Link from 'next/link';
import { User, LogOut, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  user?: any;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-sky-100 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 pl-16 lg:pl-8">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] lg:text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>ระบบทำงานปกติ (High Traffic Ready 500 TPS)</span>
        </div>
      </div>

      {/* Admin Profile & Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-sky-50 hover:text-sky-600 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ดูหน้าเว็บ Customer</span>
        </Link>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 font-bold text-xs shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold text-slate-800 leading-snug">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin Support'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
              {user?.email || 'admin@concert.com'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { DollarSign, Download, CreditCard, QrCode } from 'lucide-react';

export default function AdminRevenuePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.data));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f4f9fd] text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">วิเคราะห์รายได้ (Revenue Analytics)</h1>
              <p className="text-xs text-slate-500 mt-1">สรุปยอดขายรายได้รวม ยอดชำระผ่าน PromptPay และบัตรเครดิต</p>
            </div>
            <a
              href="/api/admin/export/bookings"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Revenue XLSX</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">รายได้รวมสุทธิ</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">฿2,466,200</h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">+14.2% Growth</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">PromptPay QR</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">฿1,849,650</h3>
                <p className="text-[11px] text-sky-600 font-medium mt-1">75% ของยอดรวม</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">บัตรเครดิต & โอนเงิน</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">฿616,550</h3>
                <p className="text-[11px] text-sky-600 font-medium mt-1">25% ของยอดรวม</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

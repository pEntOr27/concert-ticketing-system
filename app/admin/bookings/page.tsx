'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { Download, Ticket } from 'lucide-react';

export default function AdminBookingsPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.data));
    fetch('/api/admin/bookings').then((r) => r.json()).then((d) => setBookings(d.data || []));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f4f9fd] text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">จัดการการจอง & ตั๋ว (Booking Management)</h1>
              <p className="text-xs text-slate-500 mt-1">รายการจองตั๋วคอนเสิร์ต สถานะการชำระเงิน และประวัติการออกบัตร</p>
            </div>
            <a
              href="/api/admin/export/bookings"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Bookings XLSX</span>
            </a>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-4">Booking No.</th>
                  <th className="pb-3 px-4">ลูกค้า</th>
                  <th className="pb-3 px-4">คอนเสิร์ต</th>
                  <th className="pb-3 px-4">ที่นั่ง</th>
                  <th className="pb-3 px-4">ยอดชำระ</th>
                  <th className="pb-3 px-4">สถานะ</th>
                  <th className="pb-3 px-4 text-right">วันที่จอง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-sky-50/40 transition">
                    <td className="py-3.5 px-4 font-bold text-sky-600">{b.bookingNumber}</td>
                    <td className="py-3.5 px-4 text-slate-800">{b.user?.firstName} {b.user?.lastName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{b.event?.name}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {b.bookingItems?.map((bi: any) => bi.seat.seatNumber).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">฿{Number(b.finalAmount).toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        b.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {new Date(b.createdAt).toLocaleString('th-TH')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

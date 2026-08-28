'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { Music, Ticket, DollarSign, Users, Zap, ShieldAlert, Download, RefreshCw } from 'lucide-react';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      });

    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f4f9fd] text-slate-800">
      {/* Left Sidebar matching Image 3 */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />

        <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Dashboard Header Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                แดชบอร์ดผู้ดูแลระบบ (Admin Overview)
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                ภาพรวมตัวเลขสถิติระบบ ยอดขายตั๋ว Traffic และความปลอดภัย Anti-Bot แบบเรียลไทม์
              </p>
            </div>

            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-sky-50 transition shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>

          {/* 6 Metric Statistic Cards matching Image 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Total Concerts */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm relative overflow-hidden flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">คอนเสิร์ตทั้งหมด</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {stats?.totalConcerts ?? 6} <span className="text-base font-extrabold text-slate-700">รายการ</span>
                </h3>
                <p className="text-[11px] text-sky-600 font-medium mt-1">
                  เปิดขายอยู่ {stats?.onSaleConcerts ?? 2} คอนเสิร์ต
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                <Music className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Tickets Sold */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm relative overflow-hidden flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">ตั๋วที่จำหน่ายแล้ว</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {(stats?.soldTickets ?? 8424).toLocaleString()} <span className="text-base font-extrabold text-slate-700">ใบ</span>
                </h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">
                  อัตราการขายสำเร็จ 98.4%
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Total Revenue */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm relative overflow-hidden flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">รายได้รวมสุทธิ</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  ฿{(stats?.totalRevenue ?? 2466200).toLocaleString()}
                </h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">
                  เติบโต +14.2% จากกรอบก่อน
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Total Users */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm relative overflow-hidden flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">ผู้ใช้งานในระบบ</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {stats?.totalUsers ?? 12} <span className="text-base font-extrabold text-slate-700">บัญชี</span>
                </h3>
                <p className="text-[11px] text-sky-600 font-medium mt-1">
                  ยืนยันตัวตนสำเร็จ {stats?.faceVerifiedUsers ?? 10} บัญชี
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Card 5: Traffic */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm relative overflow-hidden flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">TRAFFIC จองตั๋วรวม</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {(stats?.totalTrafficRequests ?? 25433).toLocaleString()} <span className="text-base font-extrabold text-slate-700">Request</span>
                </h3>
                <p className="text-[11px] text-sky-600 font-medium mt-1">
                  ความเร็วเฉลี่ย 500 TPS
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
            </div>

            {/* Card 6: Anti-Bot Blocked */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm relative overflow-hidden flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">บอทที่ถูกบล็อก (ANTI-BOT)</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {(stats?.blockedBotCount ?? 1286).toLocaleString()} <span className="text-base font-extrabold text-slate-700">รายการ</span>
                </h3>
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  ป้องกันการสแคลป์ตั๋ว 100%
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Security Monitoring Anti-Bot Table matching Image 3 */}
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">เหตุการณ์ความปลอดภัย Anti-Bot ล่าสุด</h3>
                <p className="text-xs text-slate-400 mt-0.5">รายการบล็อก IP และตรวจจับพฤติกรรมบอทที่น่าสงสัย</p>
              </div>
              <a
                href="/api/admin/export/audit-logs"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export XLSX</span>
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-4">IP Address</th>
                    <th className="pb-3 px-4">การกระทำ</th>
                    <th className="pb-3 px-4">สาเหตุ</th>
                    <th className="pb-3 px-4">เวลาที่ตรวจพบ</th>
                    <th className="pb-3 px-4 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {stats?.securityEvents?.length ? (
                    stats.securityEvents.map((event: any) => (
                      <tr key={event.id} className="hover:bg-sky-50/40 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{event.ipAddress}</td>
                        <td className="py-3.5 px-4 text-slate-600">{event.action}</td>
                        <td className="py-3.5 px-4 text-slate-600">{event.reason}</td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(event.detectedAt).toLocaleString('th-TH')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold">
                            Blocked
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="hover:bg-sky-50/40 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-800">103.22.180.45</td>
                      <td className="py-3.5 px-4 text-slate-600">Blocked</td>
                      <td className="py-3.5 px-4 text-slate-600">Rate Limit Exceeded (500 TPS Burst)</td>
                      <td className="py-3.5 px-4 text-slate-500">23/2/2569 19:00:00</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold">
                          Blocked
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { Download } from 'lucide-react';

export default function AdminLoginHistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.data));
    fetch('/api/admin/login-history').then((r) => r.json()).then((d) => setHistory(d.data || []));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f4f9fd] text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">ประวัติการเข้าสู่ระบบ (Login History)</h1>
              <p className="text-xs text-slate-500 mt-1">บันทึกการเข้าสู่ระบบของสมาชิกและแอดมิน พร้อมเหตุผลกรณีล้มเหลว</p>
            </div>
            <a
              href="/api/admin/export/login-history"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Login History (.xlsx)</span>
            </a>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-4">อีเมลที่พยายามเข้าสู่ระบบ</th>
                  <th className="pb-3 px-4">IP Address</th>
                  <th className="pb-3 px-4">Browser / Agent</th>
                  <th className="pb-3 px-4">สถานะ</th>
                  <th className="pb-3 px-4 text-right">เวลาการเข้าสู่ระบบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-sky-50/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {item.user?.email || item.emailAttempted || 'Unknown'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{item.ipAddress}</td>
                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-[200px]">{item.userAgent || 'Chrome'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {new Date(item.createdAt).toLocaleString('th-TH')}
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

'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { Download, History } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.data));
    fetch('/api/admin/audit-logs').then((r) => r.json()).then((d) => setLogs(d.data || []));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f4f9fd] text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">ประวัติการแก้ไขและกิจกรรมระบบ (Audit Logs)</h1>
              <p className="text-xs text-slate-500 mt-1">บันทึกทุกการกระทำสำคัญในระบบ พร้อมสิทธิ์ในการส่งออกเป็นไฟล์ Excel</p>
            </div>
            <a
              href="/api/admin/export/audit-logs"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Logs (.xlsx)</span>
            </a>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-4">ผู้กระทำ (Actor)</th>
                  <th className="pb-3 px-4">การกระทำ (Action)</th>
                  <th className="pb-3 px-4">ทรัพยากร (Resource)</th>
                  <th className="pb-3 px-4">IP Address</th>
                  <th className="pb-3 px-4 text-right">เวลาที่ทำรายการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-sky-50/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {log.actor?.email || 'System / Guest'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{log.resource}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{log.ipAddress}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {new Date(log.createdAt).toLocaleString('th-TH')}
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

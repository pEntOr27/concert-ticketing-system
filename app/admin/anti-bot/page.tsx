'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { ShieldAlert, Lock, Unlock, Plus } from 'lucide-react';

export default function AdminAntiBotPage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>({ events: [], blockedIps: [] });
  const [ipToBlock, setIpToBlock] = useState('');
  const [blockReason, setBlockReason] = useState('Suspicious Bot Burst Requests');

  const fetchData = () => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.data));
    fetch('/api/admin/security-events').then((r) => r.json()).then((d) => setData(d.data || { events: [], blockedIps: [] }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBlockIp = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/ip/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ipAddress: ipToBlock, reason: blockReason }),
    });
    setIpToBlock('');
    fetchData();
  };

  const handleUnblockIp = async (ipAddress: string) => {
    await fetch('/api/admin/ip/unblock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ipAddress }),
    });
    fetchData();
  };

  return (
    <div className="flex min-h-screen bg-[#f4f9fd] text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">ระบบตรวจสอบ Anti-Bot & IP Blocklist</h1>
              <p className="text-xs text-slate-500 mt-1">เฝ้าระวัง Headless Bot, Rate Limit Violations และจัดการการระงับ IP</p>
            </div>
          </div>

          {/* Form Manual Block IP */}
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-500" />
              <span>บล็อก IP Address ใหม่</span>
            </h3>
            <form onSubmit={handleBlockIp} className="flex gap-3 text-xs">
              <input
                type="text"
                placeholder="103.22.180.45"
                required
                value={ipToBlock}
                onChange={(e) => setIpToBlock(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border rounded-xl flex-1 font-mono"
              />
              <input
                type="text"
                placeholder="สาเหตุในการบล็อก"
                required
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border rounded-xl flex-[2]"
              />
              <button type="submit" className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition">
                บล็อก IP ทันที
              </button>
            </form>
          </div>

          {/* Active Blocked IPs */}
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">รายการ IP Address ที่ถูกบล็อกในปัจจุบัน</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="pb-3 px-4">IP Address</th>
                    <th className="pb-3 px-4">สาเหตุ</th>
                    <th className="pb-3 px-4">วันที่บันทึก</th>
                    <th className="pb-3 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {data.blockedIps?.map((b: any) => (
                    <tr key={b.id}>
                      <td className="py-3 px-4 font-mono font-bold text-rose-600">{b.ipAddress}</td>
                      <td className="py-3 px-4 text-slate-600">{b.reason}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(b.createdAt).toLocaleString('th-TH')}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleUnblockIp(b.ipAddress)}
                          className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[11px] font-bold hover:bg-emerald-100"
                        >
                          ปลดบล็อก IP
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { Lock, ShieldCheck } from 'lucide-react';

export default function AdminRbacPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.data));
  }, []);

  const matrix = [
    { module: 'Customer Portal', customer: true, admin: true, superAdmin: true },
    { module: 'Interactive Seat Selection', customer: true, admin: true, superAdmin: true },
    { module: 'Payment Simulation & E-Ticket', customer: true, admin: true, superAdmin: true },
    { module: 'Admin Dashboard Overview', customer: false, admin: true, superAdmin: true },
    { module: 'Concert & Zone Management', customer: false, admin: true, superAdmin: true },
    { module: 'Booking & Ticket Management', customer: false, admin: true, superAdmin: true },
    { module: 'Anti-Bot & IP Block Control', customer: false, admin: true, superAdmin: true },
    { module: 'Audit Logs & Excel Export', customer: false, admin: true, superAdmin: true },
    { module: 'Assign / Remove Admin Roles', customer: false, admin: false, superAdmin: true },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f9fd] text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">ตารางสิทธิ์การใช้งาน (RBAC Permission Matrix)</h1>
            <p className="text-xs text-slate-500 mt-1">ตารางเปรียบเทียบสิทธิ์การเข้าถึงระหว่าง Customer, Admin และ Super Admin</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-4">โมดูล / ฟังก์ชันการใช้งาน</th>
                  <th className="pb-3 px-4 text-center">Customer</th>
                  <th className="pb-3 px-4 text-center">Admin</th>
                  <th className="pb-3 px-4 text-center">Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {matrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-sky-50/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{row.module}</td>
                    <td className="py-3.5 px-4 text-center">
                      {row.customer ? <span className="text-emerald-500 font-bold">✓ อนุญาต</span> : <span className="text-slate-300">✗ ปฏิเสธ (403)</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.admin ? <span className="text-emerald-500 font-bold">✓ อนุญาต</span> : <span className="text-slate-300">✗ ปฏิเสธ (403)</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.superAdmin ? <span className="text-emerald-500 font-bold">✓ อนุญาต</span> : <span className="text-slate-300">✗ ปฏิเสธ (403)</span>}
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

'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

export default function AdminDemandAnalyticsPage() {
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
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">วิเคราะห์ความต้องการ (Demand Analytics Demo)</h1>
            <p className="text-xs text-slate-500 mt-1">วิเคราะห์แนวโน้มความต้องการตั๋ว ความหนาแน่นของคิว และโซนที่ได้รับความนิยมสูง</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-500" />
                <span>โซนที่ยอดฮิตที่สุด (Top Popular Zones)</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1"><span>Zone A (VIP)</span><span className="text-sky-600">100% Sold Out</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"><div className="bg-sky-500 h-full rounded-full w-full" /></div>
                </div>
                <div>
                  <div className="flex justify-between font-bold mb-1"><span>Zone B (Regular)</span><span className="text-sky-600">85% Occupied</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"><div className="bg-sky-500 h-full rounded-full w-[85%]" /></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>ช่วงเวลาที่มีการจองสูงสุด (Peak Booking Hours)</span>
              </h3>
              <div className="space-y-2 text-xs">
                <p className="text-slate-600">19:00 - 20:00 น.: <span className="font-bold text-slate-900">18,400 Request/min</span></p>
                <p className="text-slate-600">20:00 - 21:00 น.: <span className="font-bold text-slate-900">7,033 Request/min</span></p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

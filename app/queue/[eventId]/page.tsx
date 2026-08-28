'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Clock, Users, ArrowRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VirtualQueuePage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const [queueStatus, setQueueStatus] = useState<any>(null);

  useEffect(() => {
    // Join queue first
    fetch('/api/queue/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: params.eventId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setQueueStatus(d.data);
      });

    // Poll status every 3 seconds
    const interval = setInterval(() => {
      fetch(`/api/queue/status?eventId=${params.eventId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setQueueStatus(d.data);
            if (d.data.status === 'READY') {
              clearInterval(interval);
              router.push(`/concert/${params.eventId}`);
            }
          }
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [params.eventId, router]);

  return (
    <div className="min-h-screen bg-[#f4f9fd] flex flex-col justify-between text-slate-800">
      <Navbar />

      <main className="max-w-md mx-auto px-4 py-16 text-center flex-1 w-full">
        <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center mx-auto animate-bounce shadow-md">
            <Clock className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
              VIRTUAL WAITING QUEUE (FIFO)
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">คุณกำลังอยู่ในคิวจองตั๋ว</h2>
            <p className="text-xs text-slate-500 mt-1">กรุณาอย่าปิดหน้าต่างนี้ ระบบจะนำคุณเข้าสู่การเลือกที่นั่งอัตโนมัติเมื่อถึงคิว</p>
          </div>

          {/* Queue Info Cards */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
              <p className="text-[11px] font-semibold text-slate-400">ตำแหน่งคิวของคุณ</p>
              <p className="text-2xl font-black text-sky-600">#{queueStatus?.queueNumber || '124'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
              <p className="text-[11px] font-semibold text-slate-400">ผู้รอข้างหน้า</p>
              <p className="text-2xl font-black text-slate-800">{queueStatus?.peopleAhead ?? 123} คน</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">เวลาประมาณการรอ:</span>
            <span className="font-bold text-sky-600">{queueStatus?.estimatedWaitMinutes ?? 12} นาที</span>
          </div>

          <button
            onClick={() => router.push(`/concert/${params.eventId}`)}
            className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-200 transition flex items-center justify-center gap-2"
          >
            <span>ข้ามคิว (สำหรับทดสอบ Demo)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

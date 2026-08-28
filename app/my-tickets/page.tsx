'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Ticket, Calendar, MapPin, QrCode, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MyTicketsPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUser(d.data);
      });

    fetch('/api/tickets/my-tickets')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBookings(d.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f9fd] text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar user={user} />

        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
          <div>
            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
              MY TICKETS COLLECTION
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">ตั๋วของฉัน (My E-Tickets)</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              รายการตั๋วคอนเสิร์ตที่คุณชำระเงินสำเร็จแล้ว พร้อม E-Ticket และ QR Code สำหรับสแกนเข้างาน
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 rounded-3xl bg-slate-200/60 animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-sky-100 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto shadow-sm">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">ยังไม่มีรายการตั๋วคอนเสิร์ต</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                เมื่อคุณทำรายการจองและชำระเงินสำเร็จ ตั๋วคอนเสิร์ตพร้อม E-Ticket จะถูกจัดเก็บไว้ในหน้านี้ทันที
              </p>
              <Link
                href="/#concerts"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-200 hover:bg-sky-600 transition"
              >
                <span>เลือกจองคอนเสิร์ต</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-[2rem] p-6 border border-sky-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <img
                      src={b.event.posterUrl}
                      alt={b.event.name}
                      className="w-24 h-32 object-cover rounded-2xl shadow-sm shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">
                          ชำระเงินแล้ว (PAID)
                        </span>
                        <span className="text-xs font-mono font-bold text-sky-600">
                          {b.bookingNumber}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900">{b.event.name}</h3>
                      <p className="text-xs font-semibold text-sky-600">{b.event.artist}</p>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-sky-500" />
                          {new Date(b.event.eventDate).toLocaleDateString('th-TH')} ({b.event.startTime} น.)
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-500" />
                          {b.event.venue}
                        </span>
                      </div>

                      {/* Seats List */}
                      <div className="pt-2 text-xs">
                        <span className="font-semibold text-slate-400">ที่นั่งของคุณ: </span>
                        <span className="font-bold text-slate-800">
                          {b.tickets.map((t: any) => t.seat?.seatNumber).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & QR Preview */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400 font-semibold">ยอดเงินสุทธิ</p>
                      <p className="text-lg font-black text-sky-600">
                        ฿{Number(b.finalAmount).toLocaleString()}
                      </p>
                    </div>

                    <Link
                      href={`/ticket/${b.id}`}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 transition flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>ดู E-Ticket & สแกนเข้างาน</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="bg-white border-t border-sky-100 py-8 px-4 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ระบบจำหน่ายตั๋วคอนเสิร์ตออนไลน์ (Online Concert Ticketing System). All rights reserved.</p>
          <p className="font-semibold text-sky-600">Production-like Demo v1.0.0</p>
        </div>
      </footer>
    </div>
  );
}

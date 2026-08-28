'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import PromotionPopup from '@/components/PromotionPopup';
import AiVerificationModal from '@/components/AiVerificationModal';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Ticket, Calendar, MapPin, Cpu } from 'lucide-react';
import { getSocket } from '@/lib/socket-client';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Verification Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [targetConcertId, setTargetConcertId] = useState<string | null>(null);

  const fetchEvents = () => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEvents(data.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Fetch authenticated user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      })
      .catch(() => {});

    // Initial fetch concerts
    fetchEvents();

    // Listen to Real-time Socket.IO updates
    const socket = getSocket();
    socket.on('concert_updated', () => {
      fetchEvents();
    });

    return () => {
      socket.off('concert_updated');
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const triggerAiCheck = (concertId: string) => {
    setTargetConcertId(concertId);
    setAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f4f9fd] text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar user={user} onLogout={handleLogout} />

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 pb-12">
          <div className="bg-gradient-to-b from-sky-100/70 to-sky-50/30 rounded-[2.5rem] p-8 md:p-14 border border-sky-100 shadow-sm relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-sky-200 text-sky-700 text-xs font-bold mb-6 shadow-xs backdrop-blur-xs">
                <span>✨ จองตั๋วง่าย ปลอดภัย เป็นธรรมสำหรับทุกคน</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
                จองตั๋วคอนเสิร์ตที่คุณชื่นชอบ
              </h1>

              <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8 font-medium">
                ระบบจำหน่ายตั๋วออนไลน์ที่ปลอดภัย เป็นธรรม และใช้งานง่าย ด้วยระบบป้องกัน Anti-Bot, จัดคิวเสมือน 500 TPS และผังเลือกที่นั่งแบบเรียลไทม์
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>ยืนยันตัวตน CAPTCHA + OTP</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
                  <span className="text-sky-500">⚡</span>
                  <span>จัดคิวเสมือน 500 TPS</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
                  <span className="text-sky-500">🎫</span>
                  <span>ออก E-Ticket ทันที</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#concerts"
                  className="px-7 py-3.5 rounded-2xl bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-200 transition"
                >
                  <span>จองตั๋ว</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#concerts"
                  className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm shadow-xs transition"
                >
                  ดูคอนเสิร์ต
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">ระบบป้องกันบอท (Anti-Bot)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                ระบบตรวจสอบสิทธิ์ 6 ชั้น (CAPTCHA, OTP, Device Fingerprint, Rate Limit) เพื่อป้องกัน Scalper
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">ระบบจัดคิวเสมือน (Virtual Queue)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                รองรับปริมาณผู้เข้าชมสูงสุดถึง 500 TPS จัดลำดับการเข้าซื้อตั๋วอย่างเป็นธรรม ไร้ปัญหาระบบล่ม
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">ผังที่นั่งแบบเรียลไทม์</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                เลือกที่นั่งตามความชอบ พร้อมระบบล็อคที่นั่งชั่วคราว 10 นาที (Reservation Timer) ป้องกันที่นั่งซ้ำ
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">บัตร E-Ticket</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                รับ E-Ticket สามารถสแกนเข้างานได้ทันที ดาวน์โหลด PDF และตรวจสอบความถูกต้องผ่าน QR Code
              </p>
            </div>
          </div>
        </section>

        {/* Concert Events Section */}
        <section id="concerts" className="max-w-7xl mx-auto px-4 lg:px-8 mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900">คอนเสิร์ตแนะนำ</h2>
              <p className="text-xs text-slate-500 mt-1">เลือกคอนเสิร์ตที่คุณต้องการจองตั๋ว</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-3xl bg-slate-200/60 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => {
                const minPrice = event.zones?.length
                  ? Math.min(...event.zones.map((z: any) => Number(z.price)))
                  : 2500;

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-[2rem] border border-sky-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                      <img
                        src={event.posterUrl}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                            event.status === 'ON_SALE'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {event.status === 'ON_SALE' ? 'เปิดจำหน่าย' : event.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-sky-600 transition">
                          {event.name}
                        </h3>
                        <p className="text-xs font-semibold text-sky-600 mb-3">{event.artist}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4">{event.description}</p>

                        <div className="space-y-1.5 text-xs text-slate-600 mb-6">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-sky-500" />
                            <span>{new Date(event.eventDate).toLocaleDateString('th-TH')} ({event.startTime} น.)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-sky-500" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold">ราคาเริ่มต้น</p>
                          <p className="text-lg font-extrabold text-sky-600">฿{minPrice.toLocaleString()}</p>
                        </div>

                        {/* Button with AI Verification trigger */}
                        <button
                          onClick={() => triggerAiCheck(event.id)}
                          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 transition flex items-center gap-1.5"
                        >
                          <span>เลือกที่นั่ง</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-sky-100 py-8 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ระบบจำหน่ายตั๋วคอนเสิร์ตออนไลน์ (Online Concert Ticketing System). All rights reserved.</p>
          <p className="font-semibold text-sky-600">Production-like Demo v1.0.0</p>
        </div>
      </footer>

      {/* Floating Promotion Popup */}
      <PromotionPopup />

      {/* AI Bot Verification Inspection Modal Simulation */}
      <AiVerificationModal
        isOpen={aiModalOpen}
        targetConcertId={targetConcertId}
        onClose={() => setAiModalOpen(false)}
      />
    </div>
  );
}

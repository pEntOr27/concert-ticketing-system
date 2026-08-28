'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Tag, Check, Copy, ArrowRight, Sparkles, Percent } from 'lucide-react';
import { getSocket } from '@/lib/socket-client';

export default function CustomerPromotionsPage() {
  const [user, setUser] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchPromotions = () => {
    fetch('/api/promotions')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPromotions(d.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUser(d.data);
      });

    fetchPromotions();

    const socket = getSocket();
    socket.on('concert_updated', () => {
      fetchPromotions();
    });

    return () => {
      socket.off('concert_updated');
    };
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activePromos = promotions.filter((p) => p.status);

  return (
    <div className="min-h-screen bg-[#f4f9fd] text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar user={user} />

        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
          <div>
            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              SPECIAL DISCOUNT COUPONS
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">โปรโมชั่นและส่วนลดพิเศษ (Promotions & Coupons)</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              รวบรวมคูปองส่วนลดและข้อเสนอพิเศษสำหรับการจองตั๋วคอนเสิร์ต คัดลอกโค้ดแล้วใช้รับส่วนลดได้ทันที
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-3xl bg-slate-200/60 animate-pulse" />
              ))}
            </div>
          ) : activePromos.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-sky-100 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto">
                <Tag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">ยังไม่มีรายการโปรโมชั่นในขณะนี้</h3>
              <p className="text-xs text-slate-500">ติดตามข่าวสารส่วนลดพิเศษสำหรับคอนเสิร์ตถัดไปได้เร็วๆ นี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePromos.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-[2rem] p-6 border border-sky-100 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-200 text-xs font-black font-mono">
                        {p.code}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5" />
                        {p.discountType === 'PERCENTAGE' ? `ส่วนลด ${p.discountValue}%` : `ส่วนลด ฿${p.discountValue}`}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 leading-snug">
                      ส่วนลดพิเศษคูปอง {p.code}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {p.discountType === 'PERCENTAGE'
                        ? `รับส่วนลด ${p.discountValue}% ทุกที่นั่งเมื่อทำการชำระเงินผ่าน PromptPay QR`
                        : `รับส่วนลดมูลค่า ฿${p.discountValue} บาท สำหรับทุกรายการจองคอนเสิร์ต`}
                    </p>

                    <div className="pt-2 text-[11px] text-slate-400 space-y-1 font-semibold">
                      <p>ใช้สิทธิ์ไปแล้ว: <span className="text-slate-700 font-bold">{p.timesUsed || 0} / {p.usageLimit} ครั้ง</span></p>
                      <p>หมดอายุ: <span className="text-slate-700 font-bold">{new Date(p.endDate).toLocaleDateString('th-TH')}</span></p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(p.code)}
                      className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 transition flex items-center justify-center gap-1.5"
                    >
                      {copiedCode === p.code ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>คัดลอกเรียบร้อย!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>คัดลอกโค้ดส่วนลด</span>
                        </>
                      )}
                    </button>
                    <Link
                      href="/#concerts"
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                      title="ใช้จองตั๋ว"
                    >
                      <ArrowRight className="w-4 h-4" />
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

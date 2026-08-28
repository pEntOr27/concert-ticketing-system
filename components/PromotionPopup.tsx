'use client';

import React, { useState, useEffect } from 'react';
import { Tag, X, ArrowRight, Check } from 'lucide-react';
import { getSocket } from '@/lib/socket-client';

export default function PromotionPopup() {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activePromo, setActivePromo] = useState<any>({
    code: 'SUMMER10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
  });

  const fetchPromo = () => {
    fetch('/api/promotions')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.length) {
          const active = d.data.find((p: any) => p.status) || d.data[0];
          if (active) setActivePromo(active);
        }
      });
  };

  useEffect(() => {
    fetchPromo();

    const socket = getSocket();
    socket.on('concert_updated', () => {
      fetchPromo();
    });

    return () => {
      socket.off('concert_updated');
    };
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activePromo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-30 w-auto sm:w-96 bg-white rounded-3xl p-5 shadow-2xl border border-sky-100 animate-slideUp">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-200 shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold">
              ✨ โปรโมชั่นพิเศษสำหรับคุณ!
            </span>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-tight mt-0.5">
              ส่วนลดพิเศษ {activePromo.code}
            </h4>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-3 leading-relaxed">
        {activePromo.discountType === 'PERCENTAGE'
          ? `รับส่วนลด ${activePromo.discountValue}% สำหรับทุกที่นั่งเมื่อทำการชำระเงิน`
          : `รับส่วนลดมูลค่า ฿${activePromo.discountValue} บาท สำหรับทุกรายการจองคอนเสิร์ต`}
      </p>

      {/* Code Badge Box */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/80 border border-sky-100 mb-3 text-xs">
        <div>
          <p className="text-[10px] font-semibold text-slate-400">รหัสโค้ดส่วนลด</p>
          <p className="text-xs font-extrabold text-slate-800 font-mono">{activePromo.code}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold text-sky-600">รับส่วนลด</p>
          <p className="text-xs font-extrabold text-sky-600">
            {activePromo.discountType === 'PERCENTAGE' ? `${activePromo.discountValue}%` : `฿${activePromo.discountValue}`}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition"
        >
          ปิด
        </button>
        <button
          onClick={handleCopy}
          className="flex-[1.5] py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 transition flex items-center justify-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>คัดลอกเรียบร้อย!</span>
            </>
          ) : (
            <>
              <span>คัดลอกโค้ด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

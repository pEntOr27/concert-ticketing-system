'use client';

import React from 'react';
import { X, UserCheck, ShieldCheck, Ticket, QrCode, CheckCircle2, Cpu, HelpCircle } from 'lucide-react';

interface HowToBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToBookModal({ isOpen, onClose }: HowToBookModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      step: '1',
      title: 'สมัครสมาชิก & ยืนยันตัวตน 2 ชั้น',
      subtitle: 'สมัครสมาชิกใหม่ สแกนใบหน้า (AI Liveness Scan) + ยืนยันรหัส SMS OTP (123456) เพื่อเปิดใช้งานบัญชี',
      icon: UserCheck,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
    },
    {
      step: '2',
      title: 'เลือกคอนเสิร์ต & สแกนโหมด AI (5 วินาที)',
      subtitle: 'เลือกคอนเสิร์ตที่ต้องการ ระบบ AI Scalper Defense จะวิเคราะห์ความปลอดภัย 5 วินาทีก่อนเข้าสู่ผัง',
      icon: Cpu,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      step: '3',
      title: 'เลือกโซนและที่นั่งบนผังเรียลไทม์',
      subtitle: 'เลือกที่นั่งบนผัง (สูงสุด 4 ที่นั่ง/รายการ) พร้อมระบบนับถอยหลังล็อคที่นั่งชั่วคราว 10 นาที',
      icon: Ticket,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      step: '4',
      title: 'ใช้โค้ดส่วนลด & ชำระเงินผ่าน PromptPay QR',
      subtitle: 'คัดลอกโค้ดส่วนลด (เช่น SUMMER10) กรอกส่วนลด แล้วสแกน PromptPay QR ชำระเงิน',
      icon: QrCode,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      step: '5',
      title: 'รับ E-Ticket & สแกนเข้างาน',
      subtitle: 'ตั๋วคอนเสิร์ตพร้อม QR Code & Barcode จะถูกจัดเก็บในเมนู "ตั๋วของฉัน" สามารถพิมพ์ PDF ได้ทันที',
      icon: CheckCircle2,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-200 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 leading-tight">ขั้นตอนและวิธีการจองตั๋วคอนเสิร์ต (เวอร์ชันล่าสุด)</h2>
              <p className="text-xs text-sky-600 font-semibold mt-0.5">How to Book Tickets Guide (Latest System Workflow)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-sky-800 font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
            <span>ระบบจำหน่ายตั๋วปลอดภัย เป็นธรรม รองรับผู้ใช้งานสูงสุด 500 TPS พร้อมระบบป้องกันบอท 6 ชั้น</span>
          </div>

          <div className="space-y-3 pt-2">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:shadow-md transition"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-black text-[10px]">
                        ขั้นตอนที่ {item.step}
                      </span>
                      <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{item.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 font-semibold hidden sm:block">
            ต้องการความช่วยเหลือเพิ่มเติม? ติดต่อ Admin Support
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 transition"
          >
            รับทราบ & เริ่มจองตั๋ว
          </button>
        </div>
      </div>
    </div>
  );
}

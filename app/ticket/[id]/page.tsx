'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Ticket, Download, Printer, CheckCircle2, Calendar, MapPin, User, QrCode } from 'lucide-react';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tickets/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTicketData(d.data);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f9fd] flex items-center justify-center font-bold text-sky-600">
        กำลังโหลด E-Ticket...
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-[#f4f9fd] flex items-center justify-center font-bold text-rose-500">
        ไม่พบตั๋วคอนเสิร์ตที่ระบุ
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f9fd] text-slate-800 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        {/* Printable Ticket Card */}
        <div className="bg-white rounded-3xl border border-sky-100 shadow-xl overflow-hidden print:shadow-none print:border-none">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-8 text-white flex items-center justify-between">
            <div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                OFFICIAL E-TICKET
              </span>
              <h2 className="text-2xl font-black mt-2">{ticketData.eventName}</h2>
              <p className="text-xs text-sky-100 font-semibold">{ticketData.artist}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Ticket className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Ticket Details Body */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-6">
              <div>
                <p className="text-slate-400 font-semibold mb-1">ผู้ถือตั๋ว (Customer)</p>
                <p className="text-sm font-bold text-slate-800">{ticketData.customerName}</p>
                <p className="text-slate-500">{ticketData.customerEmail}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-1">เลขที่การจอง (Booking No.)</p>
                <p className="text-sm font-bold text-sky-600 font-mono">{ticketData.bookingNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-6">
              <div>
                <p className="text-slate-400 font-semibold mb-1">วัน-เวลา แสดง</p>
                <p className="text-sm font-bold text-slate-800">
                  {new Date(ticketData.eventDate).toLocaleDateString('th-TH')} ({ticketData.startTime} น.)
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-1">สถานที่จัดงาน (Venue)</p>
                <p className="text-sm font-bold text-slate-800">{ticketData.venue}</p>
              </div>
            </div>

            {/* Issued Seats Cards & QR Codes */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">รายการบัตรเข้าชม ({ticketData.tickets?.length})</h4>
              {ticketData.tickets?.map((t: any) => (
                <div key={t.id} className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-500 text-white text-[10px] font-bold">
                      โซน {t.seat?.zone?.name}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-1">ที่นั่ง {t.seat?.seatNumber}</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">Ticket Code: {t.ticketCode}</p>
                  </div>

                  {/* QR Code image */}
                  <div className="text-center">
                    {t.qrDataUrl && <img src={t.qrDataUrl} alt="Ticket QR Code" className="w-24 h-24 rounded-xl border border-slate-200" />}
                    <p className="text-[9px] text-slate-400 font-mono mt-1">{t.barcode}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons (Download / Print) */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์บัตร / บันทึก PDF</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

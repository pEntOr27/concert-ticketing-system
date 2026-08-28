'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import InteractiveSeatMap, { ZoneItem, SeatItem } from '@/components/InteractiveSeatMap';
import FaceScanModal from '@/components/FaceScanModal';
import OtpModal from '@/components/OtpModal';
import PaymentModal from '@/components/PaymentModal';
import { Calendar, MapPin, Ticket, ShieldCheck, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket-client';

export default function ConcertDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<{ seat: SeatItem; zone: ZoneItem }[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  // Hold Timer state (10 mins)
  const [holdTimeLeft, setHoldTimeLeft] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchEventDetail = () => {
    fetch(`/api/events/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setEvent(d.data);
          setZones(
            (d.data.zones || []).map((z: any) => ({
              id: z.id,
              name: z.name,
              price: Number(z.price),
              seats: z.seats || [],
            }))
          );
        } else {
          setEvent(null);
        }
      })
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (d.success) setUser(d.data);
    });

    fetchEventDetail();

    // Listen to real-time Socket updates
    const socket = getSocket();
    socket.on('concert_updated', () => {
      fetchEventDetail();
    });

    return () => {
      socket.off('concert_updated');
    };
  }, [params.id]);

  // Hold timer effect
  useEffect(() => {
    if (holdTimeLeft === null || holdTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setHoldTimeLeft((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(interval);
          alert('หมดเวลาล็อคที่นั่งชั่วคราว (10 นาที) ที่นั่งของคุณถูกคืนสู่ระบบเรียบร้อย');
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [holdTimeLeft]);

  const handleToggleSeat = (seat: SeatItem, zone: ZoneItem) => {
    setErrorMsg('');
    if (selectedSeats.some((s) => s.seat.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s.seat.id !== seat.id));
    } else {
      if (selectedSeats.length >= 4) {
        alert('สามารถเลือกที่นั่งได้สูงสุด 4 ที่นั่งต่อรายการจอง');
        return;
      }
      setSelectedSeats([...selectedSeats, { seat, zone }]);
    }
  };

  const handleStartBookingProcess = () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการเลือกที่นั่ง');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('กรุณาเลือกที่นั่งอย่างน้อย 1 ที่นั่ง');
      return;
    }

    // Require Face Scan Verification
    if (!user.faceVerifiedAt) {
      setIsFaceModalOpen(true);
      return;
    }

    // Require OTP Verification
    if (!user.phoneVerifiedAt) {
      setIsOtpModalOpen(true);
      return;
    }

    executeSeatHold();
  };

  const executeSeatHold = async () => {
    setErrorMsg('');
    try {
      const res = await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          seatIds: selectedSeats.map((s) => s.seat.id),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error?.message || 'ที่นั่งนี้ถูกจองโดยผู้ใช้งานอื่นแล้ว');
        return;
      }

      setActiveBookingId(data.data.bookingId);
      setHoldTimeLeft(600); // 10 minutes
      setIsPaymentModalOpen(true);
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการล็อคที่นั่ง');
    }
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.zone.price, 0);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f9fd] flex items-center justify-center">
        <div className="text-center font-bold text-sky-600 animate-pulse">กำลังโหลดข้อมูลผังที่นั่ง...</div>
      </div>
    );
  }

  // Graceful 404 handler if event is null or deleted
  if (!event) {
    return (
      <div className="min-h-screen bg-[#f4f9fd] text-slate-800 flex flex-col justify-between">
        <Navbar user={user} />
        <main className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-800">ไม่พบข้อมูลคอนเสิร์ตนี้ในระบบ</h3>
            <p className="text-xs text-slate-500 font-medium">
              คอนเสิร์ตที่คุณต้องการดูอาจถูกแก้ไข ลบออก หรือรหัสอ้างอิงไม่ถูกต้อง
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้าหลัก</span>
            </Link>
          </div>
        </main>
        <footer className="bg-white border-t border-sky-100 py-6 text-center text-xs text-slate-400">
          <p>© 2026 ระบบจำหน่ายตั๋วคอนเสิร์ตออนไลน์ (Online Concert Ticketing System)</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f9fd] text-slate-800 flex flex-col justify-between">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 flex-1">
        {/* Concert Info Header */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          <img src={event.posterUrl} alt={event.name} className="w-32 h-40 object-cover rounded-2xl shadow-md" />
          <div className="flex-1 space-y-2">
            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
              {event.status}
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">{event.name}</h1>
            <p className="text-sm font-semibold text-sky-600">{event.artist}</p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-sky-500" />{new Date(event.eventDate).toLocaleDateString('th-TH')} ({event.startTime} น.)</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-sky-500" />{event.venue}</span>
            </div>
          </div>
        </div>

        {/* 10-Minute Reservation Timer Banner */}
        {holdTimeLeft !== null && (
          <div className="p-4 rounded-2xl bg-amber-500 text-white flex items-center justify-between shadow-lg shadow-amber-200 animate-pulse">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Clock className="w-5 h-5" />
              <span>ล็อคที่นั่งชั่วคราวสำเร็จ! กรุณาชำระเงินภายในเวลาที่กำหนด</span>
            </div>
            <div className="text-xl font-black font-mono tracking-wider bg-white/20 px-4 py-1 rounded-xl">
              {formatTimer(holdTimeLeft)}
            </div>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Interactive Seat Map & Selection Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <InteractiveSeatMap
              eventId={event.id}
              zones={zones}
              selectedSeatIds={selectedSeats.map((s) => s.seat.id)}
              onToggleSeat={handleToggleSeat}
            />
          </div>

          {/* Selected Seats Checkout Summary Sidebar */}
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-sky-500" />
              <span>สรุปที่นั่งที่เลือก ({selectedSeats.length})</span>
            </h3>

            {selectedSeats.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-medium">
                ยังไม่ได้เลือกที่นั่ง กรุณาคลิกเลือกที่นั่งจากผัง
              </p>
            ) : (
              <div className="space-y-3">
                {selectedSeats.map((s) => (
                  <div key={s.seat.id} className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs">
                    <div>
                      <p className="font-extrabold text-slate-800">ที่นั่ง {s.seat.seatNumber}</p>
                      <p className="text-slate-500 text-[11px]">{s.zone.name}</p>
                    </div>
                    <span className="font-bold text-sky-600">฿{s.zone.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">ราคารวมทั้งสิ้น</span>
              <span className="text-2xl font-black text-sky-600">฿{totalPrice.toLocaleString()}</span>
            </div>

            <button
              onClick={handleStartBookingProcess}
              disabled={selectedSeats.length === 0}
              className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-200 transition disabled:opacity-50"
            >
              ดำเนินการจองที่นั่ง (Lock 10 นาที)
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <FaceScanModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        onSuccess={() => {
          setIsFaceModalOpen(false);
          if (!user?.phoneVerifiedAt) {
            setIsOtpModalOpen(true);
          } else {
            executeSeatHold();
          }
        }}
      />

      <OtpModal
        isOpen={isOtpModalOpen}
        phone={user?.phone || ''}
        email={user?.email || ''}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={() => {
          setIsOtpModalOpen(false);
          executeSeatHold();
        }}
      />

      {activeBookingId && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          bookingId={activeBookingId}
          totalAmount={totalPrice}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={(ticketUrl) => {
            router.push(ticketUrl);
          }}
        />
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { Grid3X3, Plus, Trash2, Edit, CheckCircle, Eye, X, Lock, Check } from 'lucide-react';

export default function AdminZonesPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Add Zone Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('Zone C (Balcony)');
  const [price, setPrice] = useState('1500');
  const [startRow, setStartRow] = useState('F');
  const [endRow, setEndRow] = useState('H');
  const [seatsPerRow, setSeatsPerRow] = useState('20');

  // Edit Zone Modal State
  const [editingZone, setEditingZone] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Seat Inspector Modal State
  const [selectedZoneSeatsModal, setSelectedZoneSeatsModal] = useState<any>(null);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const fetchEvents = () => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.data || []);
        if (d.data?.length && !selectedEventId) {
          setSelectedEventId(d.data[0].id);
        }
      });
  };

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.data));
    fetchEvents();
  }, []);

  const currentEvent = events.find((e) => e.id === selectedEventId);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          name,
          price,
          startRow,
          endRow,
          seatsPerRow,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        fetchEvents();
      } else {
        alert(data.error?.message || 'ไม่สามารถสร้างโซนได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  const openEditZoneModal = (zone: any) => {
    setEditingZone(zone);
    setEditName(zone.name);
    setEditPrice(String(zone.price));
  };

  const handleUpdateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/zones/${editingZone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          price: editPrice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingZone(null);
        fetchEvents();
      } else {
        alert(data.error?.message || 'ไม่สามารถแก้ไขโซนได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteZone = async (zoneId: string, zoneName: string) => {
    if (!confirm(`คุณต้องการลบโซน "${zoneName}" และที่นั่งทั้งหมดในโซนนี้ใช่หรือไม่?`)) return;
    try {
      const res = await fetch(`/api/admin/zones/${zoneId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchEvents();
      } else {
        alert(data.error?.message || 'ไม่สามารถลบโซนได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const handleUpdateSeatStatus = async (seatId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/seats/${seatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local modal state
        if (selectedZoneSeatsModal) {
          setSelectedZoneSeatsModal((prev: any) => ({
            ...prev,
            seats: prev.seats.map((s: any) => (s.id === seatId ? { ...s, status: newStatus } : s)),
          }));
        }
        fetchEvents();
        setSelectedSeat(null);
      } else {
        alert(data.error?.message || 'ไม่สามารถอัปเดตสถานะที่นั่งได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการปรับเปลี่ยนสถานะ');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f9fd] text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">จัดการโซนและที่นั่ง (Zone & Seat Management)</h1>
              <p className="text-xs text-slate-500 mt-1">
                กำหนดโซนที่นั่ง ราคา ปรับเปลี่ยนสถานะที่นั่ง และสร้างผังที่นั่งประจำคอนเสิร์ต
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-200 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มโซนใหม่</span>
            </button>
          </div>

          {/* Event Selector Card */}
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center font-bold shrink-0">
                <Grid3X3 className="w-5 h-5" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase">เลือกคอนเสิร์ตที่ต้องการจัดการ</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.artist}) - {e.venue}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400 font-medium">โซนทั้งหมด: </span>
              <span className="font-extrabold text-sky-600">{currentEvent?.zones?.length || 0} โซน</span>
            </div>
          </div>

          {/* Zones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentEvent?.zones?.map((zone: any) => {
              const seats = zone.seats || [];
              const availableSeats = seats.filter((s: any) => s.status === 'AVAILABLE').length;
              const soldSeats = seats.filter((s: any) => s.status === 'SOLD').length;
              const heldSeats = seats.filter((s: any) => s.status === 'HELD').length;
              const blockedSeats = seats.filter((s: any) => s.status === 'BLOCKED').length;

              return (
                <div key={zone.id} className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900">{zone.name}</h3>
                      <span className="px-3 py-1 bg-sky-50 text-sky-600 font-black text-xs rounded-xl border border-sky-200">
                        ฿{Number(zone.price).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1.5 mt-3">
                      <p className="flex justify-between">
                        <span>ความจุรวม:</span>
                        <span className="font-bold text-slate-800">{zone.capacity} ที่นั่ง</span>
                      </p>
                      <p className="flex justify-between">
                        <span>รูปแบบแถว:</span>
                        <span className="font-bold text-slate-800">{zone.rowPattern || 'A-E'}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>รูปแบบที่นั่ง:</span>
                        <span className="font-bold text-slate-800">{zone.seatPattern || '1-20'}</span>
                      </p>
                    </div>

                    {/* Seat Status Breakdown Pills */}
                    <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] text-center font-bold">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <div>ว่าง</div>
                        <div className="text-sm font-black">{availableSeats}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                        <div>Hold 10นาที</div>
                        <div className="text-sm font-black">{heldSeats}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                        <div>ขายแล้ว</div>
                        <div className="text-sm font-black">{soldSeats}</div>
                      </div>
                    </div>
                  </div>

                  {/* Zone Actions: View Seats, Edit Zone, Delete Zone */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedZoneSeatsModal(zone)}
                      className="flex-1 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition flex items-center justify-center gap-1 border border-sky-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ผังที่นั่ง ({seats.length})</span>
                    </button>
                    <button
                      onClick={() => openEditZoneModal(zone)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200"
                      title="แก้ไขโซนนี้"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone.id, zone.name)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-200"
                      title="ลบโซนนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Add Zone Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-2xl w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">เพิ่มโซนและสร้างที่นั่งใหม่</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อโซน</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="เช่น Zone C (Balcony)"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ราคาตั๋วต่อที่นั่ง (บาท)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="1500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">แถวเริ่มต้น</label>
                  <input
                    type="text"
                    value={startRow}
                    onChange={(e) => setStartRow(e.target.value.toUpperCase())}
                    maxLength={1}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">แถวสิ้นสุด</label>
                  <input
                    type="text"
                    value={endRow}
                    onChange={(e) => setEndRow(e.target.value.toUpperCase())}
                    maxLength={1}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ที่นั่ง/แถว</label>
                  <input
                    type="number"
                    value={seatsPerRow}
                    onChange={(e) => setSeatsPerRow(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 transition mt-2 disabled:opacity-50"
              >
                {loading ? 'กำลังสร้างโซน...' : '+ ยืนยันสร้างโซนและที่นั่ง'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {editingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-2xl w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">แก้ไขข้อมูลโซน ({editingZone.name})</h3>
              <button onClick={() => setEditingZone(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateZone} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อโซน</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ราคาตั๋วต่อที่นั่ง (บาท)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold shadow-md shadow-sky-200 transition disabled:opacity-50"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zone Seats Grid Viewer & Seat Status Management Modal */}
      {selectedZoneSeatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  ผังที่นั่งโซน {selectedZoneSeatsModal.name}
                </h3>
                <p className="text-xs text-slate-400 font-semibold">
                  ราคา ฿{Number(selectedZoneSeatsModal.price).toLocaleString()} / ที่นั่ง (คลิกที่นั่งเพื่อปรับเปลี่ยนสถานะ)
                </p>
              </div>
              <button onClick={() => { setSelectedZoneSeatsModal(null); setSelectedSeat(null); }} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Legend */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-400" /> ว่าง (Available)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400" /> Hold 10นาที</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-400" /> ขายแล้ว (Sold)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-400" /> งดจำหน่าย (Blocked)</span>
            </div>

            {/* Individual Seat Quick Action Bar when seat is selected */}
            {selectedSeat && (
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                <div>
                  <span className="font-bold text-slate-800">จัดการที่นั่ง {selectedSeat.seatNumber}: </span>
                  <span className="text-sky-600 font-semibold">สถานะปัจจุบัน: {selectedSeat.status}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateSeatStatus(selectedSeat.id, 'AVAILABLE')}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600"
                  >
                    ว่าง (Available)
                  </button>
                  <button
                    onClick={() => handleUpdateSeatStatus(selectedSeat.id, 'BLOCKED')}
                    className="px-2.5 py-1 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600"
                  >
                    งดจำหน่าย (Block)
                  </button>
                  <button
                    onClick={() => handleUpdateSeatStatus(selectedSeat.id, 'SOLD')}
                    className="px-2.5 py-1 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600"
                  >
                    ขายแล้ว (Sold)
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Seats Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-2">
              {selectedZoneSeatsModal.seats?.map((seat: any) => (
                <button
                  key={seat.id}
                  type="button"
                  onClick={() => setSelectedSeat(seat)}
                  className={`p-2 rounded-xl text-center text-xs font-bold border transition ${
                    selectedSeat?.id === seat.id
                      ? 'ring-2 ring-sky-500 ring-offset-2 scale-105'
                      : ''
                  } ${
                    seat.status === 'AVAILABLE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : seat.status === 'HELD'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : seat.status === 'BLOCKED'
                      ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {seat.seatNumber}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

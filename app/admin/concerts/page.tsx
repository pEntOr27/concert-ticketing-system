'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { Plus, Edit, Trash2, Calendar, MapPin, Music, Eye, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminConcertsPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    artist: '',
    description: '',
    venue: '',
    eventDate: '2026-11-20',
    startTime: '19:00',
    endTime: '22:00',
    posterUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    capacity: 5000,
    status: 'ON_SALE',
  });
  const [loading, setLoading] = useState(false);

  const fetchEvents = () => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.data));
    fetch('/api/events').then((r) => r.json()).then((d) => setEvents(d.data || []));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      artist: '',
      description: '',
      venue: '',
      eventDate: '2026-11-20',
      startTime: '19:00',
      endTime: '22:00',
      posterUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
      capacity: 5000,
      status: 'ON_SALE',
    });
    setShowModal(true);
  };

  const openEditModal = (event: any) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      artist: event.artist,
      description: event.description,
      venue: event.venue,
      eventDate: new Date(event.eventDate).toISOString().split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      posterUrl: event.posterUrl,
      capacity: event.capacity,
      status: event.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingEvent) {
        // Edit Concert
        const res = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setShowModal(false);
          fetchEvents();
        } else {
          alert(data.error?.message || 'ไม่สามารถแก้ไขคอนเสิร์ตได้');
        }
      } else {
        // Create New Concert
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setShowModal(false);
          fetchEvents();
        } else {
          alert(data.error?.message || 'ไม่สามารถสร้างคอนเสิร์ตได้');
        }
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, concertName: string) => {
    if (!confirm(`คุณต้องการลบรายการคอนเสิร์ต "${concertName}" และข้อมูลโซน/ที่นั่งทั้งหมดใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchEvents();
      } else {
        alert(data.error?.message || 'ไม่สามารถลบคอนเสิร์ตได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f9fd] text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">จัดการคอนเสิร์ต (Concert Management)</h1>
              <p className="text-xs text-slate-500 mt-1">เพิ่ม ลบ แก้ไข และจัดการรายการคอนเสิร์ตในระบบ</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-200 hover:bg-sky-600 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ สร้างคอนเสิร์ตใหม่</span>
            </button>
          </div>

          {/* Concerts Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col justify-between hover:shadow-md transition space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                        event.status === 'ON_SALE'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}
                    >
                      {event.status}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{event.capacity} ที่นั่ง</span>
                  </div>

                  <div className="flex items-start gap-4">
                    <img
                      src={event.posterUrl}
                      alt={event.name}
                      className="w-16 h-20 object-cover rounded-xl shrink-0 shadow-xs"
                    />
                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-snug line-clamp-2">{event.name}</h3>
                      <p className="text-xs font-bold text-sky-600 mt-0.5">{event.artist}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-3 font-medium">{event.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="space-y-1 text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span>{new Date(event.eventDate).toLocaleDateString('th-TH')} ({event.startTime} - {event.endTime} น.)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => openEditModal(event)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>แก้ไข</span>
                    </button>
                    <Link
                      href="/admin/zones"
                      className="py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition border border-sky-200 flex items-center gap-1"
                      title="จัดการโซน"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>โซน</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id, event.name)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-200"
                      title="ลบคอนเสิร์ต"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal Form for Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-2xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-800">
                {editingEvent ? 'แก้ไขรายการคอนเสิร์ต' : 'สร้างคอนเสิร์ตใหม่'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อคอนเสิร์ต</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="เช่น World Tour Live in Bangkok 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ศิลปิน / ศิลปินหลัก</label>
                  <input
                    type="text"
                    required
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="เช่น Global Superstar Band"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">สถานะการเปิดขาย</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="ON_SALE">ON_SALE (เปิดจำหน่ายตั๋ว)</option>
                    <option value="UPCOMING">UPCOMING (เร็วๆ นี้)</option>
                    <option value="SOLD_OUT">SOLD_OUT (ตั๋วหมดแล้ว)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">รายละเอียดคอนเสิร์ต</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="อธิบายรายละเอียดการแสดง..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">สถานที่จัดแสดง (Venue)</label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="เช่น Impact Arena, Muang Thong Thani"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">วันที่จัดแสดง</label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เวลาเริ่ม</label>
                  <input
                    type="text"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                    placeholder="19:00"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="text"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                    placeholder="22:00"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL ภาพโปสเตอร์</label>
                <input
                  type="url"
                  required
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-700 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold shadow-md shadow-sky-200 transition disabled:opacity-50"
                >
                  {loading ? 'กำลังบันทึก...' : editingEvent ? 'บันทึกการแก้ไข' : '+ ยืนยันสร้างคอนเสิร์ต'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

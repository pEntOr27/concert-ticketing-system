'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { Tag, Plus, Edit, Trash2, CheckCircle, XCircle, X } from 'lucide-react';

export default function AdminPromotionsPage() {
  const [user, setUser] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);

  // Form State
  const [code, setCode] = useState('SUMMER10');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('10');
  const [usageLimit, setUsageLimit] = useState('500');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [loading, setLoading] = useState(false);

  const fetchPromotions = () => {
    fetch('/api/promotions')
      .then((r) => r.json())
      .then((d) => setPromotions(d.data || []));
  };

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.data));
    fetchPromotions();
  }, []);

  const openCreateModal = () => {
    setEditingPromo(null);
    setCode('PROMO' + Math.floor(10 + Math.random() * 90));
    setDiscountType('PERCENTAGE');
    setDiscountValue('15');
    setUsageLimit('200');
    setEndDate('2026-12-31');
    setIsAddModalOpen(true);
  };

  const openEditModal = (promo: any) => {
    setEditingPromo(promo);
    setCode(promo.code);
    setDiscountType(promo.discountType);
    setDiscountValue(String(promo.discountValue));
    setUsageLimit(String(promo.usageLimit));
    setEndDate(new Date(promo.endDate).toISOString().split('T')[0]);
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPromo) {
        // Edit Promo
        const res = await fetch(`/api/admin/promotions/${editingPromo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            discountType,
            discountValue,
            usageLimit,
            endDate,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsAddModalOpen(false);
          fetchPromotions();
        } else {
          alert(data.error?.message || 'ไม่สามารถแก้ไขโค้ดโปรโมชั่นได้');
        }
      } else {
        // Create Promo
        const res = await fetch('/api/admin/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            discountType,
            discountValue,
            usageLimit,
            endDate,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsAddModalOpen(false);
          fetchPromotions();
        } else {
          alert(data.error?.message || 'ไม่สามารถสร้างโค้ดโปรโมชั่นได้');
        }
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (promo: any) => {
    try {
      const res = await fetch(`/api/admin/promotions/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: !promo.status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPromotions();
      }
    } catch {
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (id: string, promoCode: string) => {
    if (!confirm(`คุณต้องการลบโค้ดโปรโมชั่น "${promoCode}" ใช่หรือไม่?`)) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchPromotions();
      } else {
        alert(data.error?.message || 'ไม่สามารถลบได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาด');
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
              <h1 className="text-2xl font-black text-slate-900">จัดการโปรโมชั่น (Promotion Management)</h1>
              <p className="text-xs text-slate-500 mt-1">
                สร้าง เพิ่ม ลบ แก้ไขโค้ดส่วนลดโปรโมชั่น คูปอง และเงื่อนไขการใช้งาน
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-200 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มโปรโมชั่นใหม่</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-4">โค้ดส่วนลด (Code)</th>
                  <th className="pb-3 px-4">ประเภทส่วนลด</th>
                  <th className="pb-3 px-4">มูลค่าส่วนลด</th>
                  <th className="pb-3 px-4">จำนวนครั้งที่ใช้แล้ว</th>
                  <th className="pb-3 px-4">วันหมดอายุ</th>
                  <th className="pb-3 px-4 text-center">สถานะ</th>
                  <th className="pb-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {promotions.map((p) => (
                  <tr key={p.id} className="hover:bg-sky-50/40 transition">
                    <td className="py-3.5 px-4 font-black text-sky-600 font-mono text-sm">{p.code}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-bold">
                      {p.discountType === 'PERCENTAGE' ? 'เปอร์เซ็นต์ (%)' : 'ส่วนลดจำนวนเงิน (บาท)'}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `฿${p.discountValue}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-bold">
                      {p.timesUsed || 0} / {p.usageLimit} ครั้ง
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {new Date(p.endDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`px-3 py-1 rounded-full font-extrabold text-[10px] border transition ${
                          p.status
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {p.status ? 'เปิดใช้งาน (Active)' : 'ปิดใช้งาน (Inactive)'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="แก้ไขโปรโมชั่น"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.code)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                          title="ลบโปรโมชั่น"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Form Modal for Add / Edit */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-2xl w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-800">
                {editingPromo ? 'แก้ไขโค้ดโปรโมชั่น' : 'สร้างโค้ดโปรโมชั่นใหม่'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">รหัสโค้ดส่วนลด (Promo Code)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-sky-600 uppercase focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="เช่น SUMMER10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ประเภทส่วนลด</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="PERCENTAGE">เปอร์เซ็นต์ (%)</option>
                    <option value="FIXED">จำนวนเงินคงที่ (บาท)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">มูลค่าส่วนลด</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">จำกัดสิทธิ์สูงสุด (ครั้ง)</label>
                  <input
                    type="number"
                    required
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">วันหมดอายุ</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold shadow-md shadow-sky-200 transition disabled:opacity-50"
                >
                  {loading ? 'กำลังบันทึก...' : editingPromo ? 'บันทึกการแก้ไข' : '+ ยืนยันสร้างโค้ด'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

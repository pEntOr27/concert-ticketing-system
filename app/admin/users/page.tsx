'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { UserCheck, ShieldCheck, UserPlus, Edit, Trash2, X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSocket } from '@/lib/socket-client';

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [status, setStatus] = useState('ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = () => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setCurrentUser(d.data));
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => setUsers(d.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();

    // Socket.IO Real-time Sync
    const socket = getSocket();
    socket.on('user_updated', () => {
      fetchUsers();
    });

    return () => {
      socket.off('user_updated');
    };
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFirstName('');
    setLastName('');
    setEmail(`user${Math.floor(1000 + Math.random() * 9000)}@gmail.com`);
    setPhone(`08${Math.floor(10000000 + Math.random() * 90000000)}`);
    setPassword('Customer@123456');
    setRole('customer');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setFirstName(u.firstName);
    setLastName(u.lastName);
    setEmail(u.email);
    setPhone(u.phone);
    setPassword('');
    setRole(u.roles[0] || 'customer');
    setStatus(u.status || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingUser) {
        // Update existing user
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            status,
            role,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          fetchUsers();
        } else {
          alert(data.error?.message || 'ไม่สามารถแก้ไขข้อมูลผู้ใช้ได้');
        }
      } else {
        // Create new user
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            password,
            role,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsModalOpen(false);
          fetchUsers();
        } else {
          alert(data.error?.message || 'ไม่สามารถสร้างบัญชีผู้ใช้ได้');
        }
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error?.message || 'ไม่สามารถเปลี่ยน Role ได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเปลี่ยน Role');
    }
  };

  const handleToggleStatus = async (u: any) => {
    const nextStatus = u.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch {
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบบัญชีผู้ใช้งาน "${name}" ออกจากระบบใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error?.message || 'ไม่สามารถลบผู้ใช้งานได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f9fd] text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={currentUser} />
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">จัดการผู้ใช้งาน & Roles (User & RBAC)</h1>
              <p className="text-xs text-slate-500 mt-1">
                สร้าง เพิ่ม ลบ แก้ไขผู้ใช้งาน กำหนดสิทธิ์ Customer, Admin, Super Admin และซิงก์ข้อมูลทั้งระบบ
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-200 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ เพิ่มผู้ใช้งานใหม่</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-4">ชื่อ-นามสกุล</th>
                  <th className="pb-3 px-4">อีเมล</th>
                  <th className="pb-3 px-4">เบอร์โทรศัพท์</th>
                  <th className="pb-3 px-4">AI Face Scan</th>
                  <th className="pb-3 px-4">Role สิทธิ์ปัจจุบัน</th>
                  <th className="pb-3 px-4">สถานะบัญชี</th>
                  <th className="pb-3 px-4">การจัดการ Role</th>
                  <th className="pb-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => {
                  const currentRole = u.roles?.[0] || 'customer';
                  return (
                    <tr key={u.id} className="hover:bg-sky-50/40 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{u.firstName} {u.lastName}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">{u.email}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">{u.phone}</td>
                      <td className="py-3.5 px-4">
                        {u.faceVerified ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px] border border-emerald-200">
                            ✓ ยืนยันแล้ว
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 font-medium text-[10px]">
                            ยังไม่ยืนยัน
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] border ${
                            currentRole === 'super_admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : currentRole === 'admin'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          {currentRole}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] border transition ${
                            u.status === 'BLOCKED'
                              ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'BLOCKED' ? 'ระงับการใช้งาน' : 'ใช้งานปกติ'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={currentRole}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="แก้ไขผู้ใช้"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                            title="ลบผู้ใช้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-2xl w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-800">
                {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อ</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="สมชาย"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">นามสกุล</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="ใจดี"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">อีเมล (Email)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="somchai@gmail.com"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="0812345678"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">รหัสผ่าน (Password)</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Customer@123456"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">กำหนด Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">สถานะบัญชี</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ใช้งานปกติ (Active)</option>
                    <option value="BLOCKED">ระงับการใช้งาน (Blocked)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold shadow-md shadow-sky-200 transition disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : editingUser ? 'บันทึกการแก้ไข' : '+ สร้างผู้ใช้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

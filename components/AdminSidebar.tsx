'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Music,
  Grid3X3,
  PenTool,
  Ticket,
  Users,
  Tag,
  ShieldCheck,
  Bot,
  TrendingUp,
  DollarSign,
  History,
  Lock,
  Menu,
  X,
} from 'lucide-react';

const menuItems = [
  { name: 'แดชบอร์ดผู้ดูแลระบบ', path: '/admin', icon: LayoutDashboard },
  { name: 'จัดการคอนเสิร์ต', path: '/admin/concerts', icon: Music },
  { name: 'จัดการโซนและที่นั่ง', path: '/admin/zones', icon: Grid3X3 },
  { name: 'ออกแบบผัง Visual Editor', path: '/admin/visual-editor', icon: PenTool },
  { name: 'จัดการการจอง & ตั๋ว', path: '/admin/bookings', icon: Ticket },
  { name: 'จัดการผู้ใช้งาน & Roles', path: '/admin/users', icon: Users },
  { name: 'จัดการโปรโมชั่น', path: '/admin/promotions', icon: Tag },
  { name: 'ระบบตรวจสอบ Anti-Bot', path: '/admin/anti-bot', icon: ShieldCheck },
  { name: 'ระบบ AI ตรวจสอบบอท', path: '/admin/ai-monitoring', icon: Bot },
  { name: 'วิเคราะห์ความต้องการ (Demo)', path: '/admin/demand-analytics', icon: TrendingUp },
  { name: 'วิเคราะห์รายได้ (Revenue)', path: '/admin/revenue', icon: DollarSign },
  { name: 'ประวัติการแก้ไข (Audit Logs)', path: '/admin/audit-logs', icon: History },
  { name: 'ตารางสิทธิ์การใช้งาน RBAC', path: '/admin/rbac', icon: Lock },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-5">
      <div>
        {/* Top Header Badge */}
        <div className="mb-6 flex items-center justify-between lg:block">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-sky-400 text-white text-[10px] font-bold tracking-wider uppercase mb-2 shadow-xs">
              ADMIN FULL CONTROL
            </span>
            <h2 className="text-xl font-extrabold text-slate-800 leading-tight">
              ระบบจำหน่ายตั๋ว<br className="hidden lg:block" />คอนเสิร์ต
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Modern Minimalist Dashboard</p>
          </div>

          {/* Close button on mobile drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-sky-400 text-white shadow-md shadow-sky-200'
                    : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-sky-500'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-6 border-t border-slate-100 text-center mt-6">
        <p className="text-[10px] text-slate-400 font-medium">Ticketing System v1.0.0</p>
        <p className="text-[10px] text-sky-600 font-semibold mt-0.5">Responsive Mobile & Desktop</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Menu Trigger */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2.5 bg-white text-slate-700 border border-sky-200 rounded-2xl shadow-md flex items-center gap-2 text-xs font-bold"
        >
          <Menu className="w-5 h-5 text-sky-500" />
          <span>เมนู Admin</span>
        </button>
      </div>

      {/* Mobile Slide-Over Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 bg-white min-h-screen overflow-y-auto shadow-2xl animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-sky-100 min-h-screen shrink-0 shadow-xs">
        {sidebarContent}
      </aside>
    </>
  );
}

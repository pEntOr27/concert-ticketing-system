import './globals.css';
import React from 'react';

export const metadata = {
  title: 'ระบบจำหน่ายตั๋วคอนเสิร์ตออนไลน์ (Online Concert Ticketing System)',
  description: 'ระบบจำหน่ายตั๋วคอนเสิร์ตออนไลน์ที่ปลอดภัย เป็นธรรม และใช้งานง่าย พร้อมผังเลือกที่นั่งแบบเรียลไทม์',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="scroll-smooth">
      <body className="antialiased bg-[#f4f9fd] text-slate-800">{children}</body>
    </html>
  );
}

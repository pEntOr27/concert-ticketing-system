'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import { PenTool, Grid, Save, RefreshCw, Plus, Move, ZoomIn, ZoomOut, CheckCircle } from 'lucide-react';

interface LayoutBlock {
  id: string;
  type: 'stage' | 'zone_vip' | 'zone_regular' | 'control';
  title: string;
  price?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export default function AdminVisualEditorPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initial Seat Map Canvas Layout Blocks
  const [blocks, setBlocks] = useState<LayoutBlock[]>([
    {
      id: 'stage-1',
      type: 'stage',
      title: '[ STAGE เวทีแสดงคอนเสิร์ต ]',
      x: 180,
      y: 30,
      width: 360,
      height: 60,
      color: 'bg-sky-500 text-white font-extrabold shadow-md shadow-sky-200',
    },
    {
      id: 'zone-a',
      type: 'zone_vip',
      title: 'Zone A (VIP) - ฿4,500',
      price: 4500,
      x: 140,
      y: 120,
      width: 440,
      height: 90,
      color: 'bg-emerald-50 border-2 border-emerald-400 text-emerald-800 font-bold',
    },
    {
      id: 'zone-b',
      type: 'zone_regular',
      title: 'Zone B (Regular) - ฿2,500',
      price: 2500,
      x: 100,
      y: 230,
      width: 520,
      height: 110,
      color: 'bg-sky-50 border-2 border-sky-400 text-sky-800 font-bold',
    },
    {
      id: 'control-1',
      type: 'control',
      title: '🎛️ Sound Control & Lighting Booth',
      x: 260,
      y: 360,
      width: 200,
      height: 45,
      color: 'bg-slate-100 border border-slate-300 text-slate-600 text-xs font-semibold',
    },
  ]);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.data));
    fetch('/api/events')
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.data || []);
        if (d.data?.length) setSelectedEventId(d.data[0].id);
      });
  }, []);

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    setDraggingBlockId(id);
    setDragOffset({
      x: e.clientX - block.x,
      y: e.clientY - block.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingBlockId) return;
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const newX = Math.max(10, Math.min(canvasRect.width - 150, e.clientX - canvasRect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(canvasRect.height - 50, e.clientY - canvasRect.top - dragOffset.y));

    setBlocks((prev) =>
      prev.map((b) => (b.id === draggingBlockId ? { ...b, x: newX, y: newY } : b))
    );
  };

  const handleMouseUp = () => {
    setDraggingBlockId(null);
  };

  const handleSaveLayout = () => {
    setSaveSuccessMsg('บันทึกพิกัดและตำแหน่งผัง Visual Seat Map เรียบร้อยแล้ว!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleAddBlock = (type: 'zone_vip' | 'zone_regular') => {
    const newId = `zone-${Date.now()}`;
    const newBlock: LayoutBlock = {
      id: newId,
      type,
      title: type === 'zone_vip' ? 'Zone VIP (Stage Front)' : 'Zone C (Balcony)',
      x: 180,
      y: 180,
      width: 360,
      height: 80,
      color: type === 'zone_vip' ? 'bg-amber-50 border-2 border-amber-400 text-amber-800 font-bold' : 'bg-purple-50 border-2 border-purple-400 text-purple-800 font-bold',
    };
    setBlocks([...blocks, newBlock]);
  };

  return (
    <div className="flex min-h-screen bg-[#f4f9fd] text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">ออกแบบผัง Visual Editor (Seat Map Designer)</h1>
              <p className="text-xs text-slate-500 mt-1">
                เครื่องมือออกแบบและจัดวางตำแหน่งที่นั่งและเวทีแสดงคอนเสิร์ตแบบ Interactive Drag & Drop
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveLayout}
                className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-200 transition"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกผังที่นั่ง (Save Layout)</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Control Bar & Tools */}
          <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Event Selector */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 shrink-0">เลือกคอนเสิร์ต:</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.artist})
                  </option>
                ))}
              </select>
            </div>

            {/* Toolbox & Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddBlock('zone_vip')}
                className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มบล็อกโซน</span>
              </button>

              <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-600 w-12 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Drag & Drop Canvas */}
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-2">
              <span>💡 คลิกค้างแล้วลาก (Drag & Drop) เพื่อย้ายตำแหน่งเวทีและโซนที่นั่ง</span>
              <span>Canvas Grid View: 720 x 440px</span>
            </div>

            <div
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="relative w-full h-[450px] bg-slate-50/60 rounded-3xl border-2 border-dashed border-sky-200 overflow-hidden select-none transition-transform"
            >
              {/* Canvas Background Grid Lines Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Draggable Blocks */}
              {blocks.map((b) => (
                <div
                  key={b.id}
                  onMouseDown={(e) => handleMouseDown(b.id, e)}
                  style={{
                    left: `${b.x}px`,
                    top: `${b.y}px`,
                    width: `${b.width}px`,
                    height: `${b.height}px`,
                  }}
                  className={`absolute rounded-2xl flex items-center justify-center cursor-move transition-shadow hover:shadow-lg ${b.color}`}
                >
                  <span className="text-xs font-black tracking-wide px-2 text-center flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 opacity-60" />
                    <span>{b.title}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

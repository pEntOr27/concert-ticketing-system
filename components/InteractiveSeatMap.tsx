'use client';

import React, { useEffect, useState } from 'react';
import { getSocketClient } from '@/lib/socket-client';
import { ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export interface SeatItem {
  id: string;
  seatNumber: string;
  rowName: string;
  seatIndex: number;
  status: 'AVAILABLE' | 'SELECTED' | 'HELD' | 'RESERVED' | 'SOLD' | 'BLOCKED';
}

export interface ZoneItem {
  id: string;
  name: string;
  price: number;
  seats: SeatItem[];
}

interface InteractiveSeatMapProps {
  eventId: string;
  zones: ZoneItem[];
  selectedSeatIds: string[];
  onToggleSeat: (seat: SeatItem, zone: ZoneItem) => void;
}

export default function InteractiveSeatMap({
  eventId,
  zones,
  selectedSeatIds,
  onToggleSeat,
}: InteractiveSeatMapProps) {
  const [liveZones, setLiveZones] = useState<ZoneItem[]>(zones);

  useEffect(() => {
    setLiveZones(zones);
  }, [zones]);

  // Real-time Socket.IO synchronization listener
  useEffect(() => {
    const socket = getSocketClient();
    socket.emit('join_event_room', eventId);

    socket.on('seat_state_update', (updates: { seatId: string; status: any }[]) => {
      setLiveZones((prevZones) =>
        prevZones.map((zone) => ({
          ...zone,
          seats: zone.seats.map((seat) => {
            const update = updates.find((u) => u.seatId === seat.id);
            if (update) {
              return { ...seat, status: update.status };
            }
            return seat;
          }),
        }))
      );
    });

    return () => {
      socket.emit('leave_event_room', eventId);
      socket.off('seat_state_update');
    };
  }, [eventId]);

  const getSeatColor = (seat: SeatItem) => {
    if (selectedSeatIds.includes(seat.id)) {
      return 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-200 scale-105';
    }
    switch (seat.status) {
      case 'AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-500 hover:text-white hover:scale-105';
      case 'HELD':
        return 'bg-amber-100 text-amber-800 border-amber-300 cursor-not-allowed';
      case 'RESERVED':
        return 'bg-orange-100 text-orange-800 border-orange-300 cursor-not-allowed';
      case 'SOLD':
        return 'bg-rose-100 text-rose-600 border-rose-200 cursor-not-allowed opacity-75';
      case 'BLOCKED':
        return 'bg-purple-100 text-purple-700 border-purple-200 cursor-not-allowed';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-sky-100">
      {/* Seat Map Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md bg-emerald-500 inline-block" />
          <span className="text-slate-700">ว่าง (Available)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md bg-sky-500 inline-block" />
          <span className="text-slate-700">กำลังเลือก (Selected)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md bg-amber-400 inline-block" />
          <span className="text-slate-700">ชั่วคราว 10 นาที (Held)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md bg-orange-400 inline-block" />
          <span className="text-slate-700">สำรองแล้ว (Reserved)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md bg-rose-500 inline-block" />
          <span className="text-slate-700">ขายแล้ว (Sold Out)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-md bg-purple-400 inline-block" />
          <span className="text-slate-700">งดจำหน่าย (Blocked)</span>
        </div>
      </div>

      {/* STAGE Visual Indicator */}
      <div className="w-full max-w-2xl mx-auto mb-10 text-center">
        <div className="py-3 px-8 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-white font-extrabold tracking-widest text-sm rounded-2xl shadow-lg shadow-sky-200 uppercase">
          [ STAGE เวทีแสดงคอนเสิร์ต ]
        </div>
        <div className="w-3/4 h-2 mx-auto bg-sky-200/50 rounded-b-xl blur-xs mt-1" />
      </div>

      {/* Seat Grid Layout (Responsive Horizontal Scroll for small devices) */}
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[650px] space-y-8">
          {liveZones.map((zone) => {
            // Group seats by row
            const rowsMap = new Map<string, SeatItem[]>();
            zone.seats.forEach((seat) => {
              const list = rowsMap.get(seat.rowName) || [];
              list.push(seat);
              rowsMap.set(seat.rowName, list);
            });

            return (
              <div key={zone.id} className="p-5 rounded-2xl bg-sky-50/40 border border-sky-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span>{zone.name}</span>
                  </h3>
                  <span className="text-xs font-bold text-sky-600 bg-white px-3 py-1 rounded-xl border border-sky-200 shadow-xs">
                    ฿{Number(zone.price).toLocaleString()} / ที่นั่ง
                  </span>
                </div>

                <div className="space-y-3">
                  {Array.from(rowsMap.entries()).map(([rowName, rowSeats]) => (
                    <div key={rowName} className="flex items-center justify-center gap-2">
                      <span className="w-6 text-center text-xs font-bold text-slate-400">{rowName}</span>
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        {rowSeats.map((seat) => {
                          const isClickable = seat.status === 'AVAILABLE' || selectedSeatIds.includes(seat.id);
                          return (
                            <button
                              key={seat.id}
                              disabled={!isClickable}
                              onClick={() => onToggleSeat(seat, zone)}
                              className={`w-9 h-9 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center ${getSeatColor(
                                seat
                              )}`}
                              title={`ที่นั่ง ${seat.seatNumber} (${seat.status})`}
                            >
                              {seat.seatNumber}
                            </button>
                          );
                        })}
                      </div>
                      <span className="w-6 text-center text-xs font-bold text-slate-400">{rowName}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

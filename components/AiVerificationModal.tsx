'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AiVerificationModalProps {
  isOpen: boolean;
  targetConcertId: string | null;
  onClose: () => void;
}

export default function AiVerificationModal({ isOpen, targetConcertId, onClose }: AiVerificationModalProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen || !targetConcertId) {
      setProgress(0);
      setStage(1);
      setCountdown(5);
      return;
    }

    // Step-by-step AI Inspection Simulation Progress
    const timer1 = setTimeout(() => {
      setProgress(35);
      setStage(2);
    }, 800);

    const timer2 = setTimeout(() => {
      setProgress(75);
      setStage(3);
    }, 1800);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStage(4);
    }, 2500);

    // Countdown interval from 5 seconds to 0
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Auto redirect to seat selection page after exactly 5 seconds (5000ms)
    const redirectTimer = setTimeout(() => {
      onClose();
      router.push(`/concert/${targetConcertId}`);
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(redirectTimer);
      clearInterval(countdownInterval);
    };
  }, [isOpen, targetConcertId, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-100 text-center space-y-6 overflow-hidden">
        {/* Decorative Top Radar Background Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* AI Radar Scanner Animation Badge */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-sky-200 animate-ping opacity-30" />
          <div className="absolute inset-2 rounded-full border-2 border-sky-400/50 animate-spin" style={{ animationDuration: '3s' }} />
          
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
            stage === 4 ? 'bg-emerald-500 text-white shadow-emerald-200 scale-110' : 'bg-sky-500 text-white shadow-sky-200'
          }`}>
            {stage === 4 ? (
              <ShieldCheck className="w-10 h-10 animate-bounce" />
            ) : (
              <Cpu className="w-9 h-9 animate-pulse" />
            )}
          </div>
        </div>

        {/* Header Text */}
        <div className="space-y-1.5">
          <span className="inline-block px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-extrabold border border-sky-200">
            🤖 AI SCALPER BOT DEFENSE SYSTEM
          </span>
          <h3 className="text-xl font-black text-slate-900">
            {stage === 4 ? 'ผ่านการตรวจสอบสิทธิ์แล้ว (AI Verified)' : 'กำลังประมวลผล ตรวจสอบบอทด้วย AI...'}
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            {stage === 4 ? (
              <span className="text-emerald-600 font-bold">
                กำลังเปลี่ยนหน้าเข้าสู่ผังเลือกที่นั่งอัตโนมัติภายใน {countdown} วินาที...
              </span>
            ) : (
              'วิเคราะห์พฤติกรรม อัตราคำขอ และอุปกรณ์แบบ Real-time'
            )}
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                stage === 4 ? 'bg-emerald-500' : 'bg-sky-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span>AI Threat Analysis</span>
            <span className={stage === 4 ? 'text-emerald-600 font-black' : 'text-sky-600'}>{progress}%</span>
          </div>
        </div>

        {/* Interactive Inspection Checkpoints */}
        <div className="space-y-2 text-xs text-left bg-slate-50 p-4 rounded-2xl border border-slate-200/60 font-semibold">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">1. วิเคราะห์ Device Fingerprint & Headers</span>
            {stage >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">2. ตรวจสอบ Rate Limit (500 TPS Protection)</span>
            {stage >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : stage >= 2 ? <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" /> : <span className="w-2 h-2 rounded-full bg-slate-300" />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">3. สรุปผลความปลอดภัย (Threat Score: 0.8%)</span>
            {stage === 4 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : stage >= 3 ? <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" /> : <span className="w-2 h-2 rounded-full bg-slate-300" />}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-bold">
          <Lock className="w-3.5 h-3.5 text-sky-500" />
          <span>ระบบป้องกันบอท 6 ชั้น Active (Redirecting in {countdown}s)</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, ShieldCheck, X, RefreshCw, AlertCircle } from 'lucide-react';

interface FaceScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const livenessPrompts = [
  'กรุณากะพริบตา 2 ครั้ง',
  'กรุณาหันหน้าไปทางซ้ายช้าๆ',
  'กรุณาหันหน้าไปทางขวาช้าๆ',
  'กรุณายิ้มเพื่อยืนยันตัวตน',
];

export default function FaceScanModal({ isOpen, onClose, onSuccess }: FaceScanModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      setProgress(0);
      setIsCompleted(false);
      return;
    }

    // Start video stream
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(() => {
        setCameraError(true);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const handleStartScan = () => {
    setIsScanning(true);
    setProgress(0);
    setCurrentPromptIndex(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setIsCompleted(true);
          // Call API verification
          fetch('/api/auth/face/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isLivenessPassed: true }),
          });
          if (onSuccess) onSuccess();
          return 100;
        }
        if (prev === 25) setCurrentPromptIndex(1);
        if (prev === 55) setCurrentPromptIndex(2);
        if (prev === 80) setCurrentPromptIndex(3);
        return prev + 5;
      });
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden text-center p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sky-600 font-bold text-sm">
            <Camera className="w-5 h-5" />
            <span>AI Face Scan / Liveness (Simulation)</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Notice Banner */}
        <div className="mb-4 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>ระบบ Simulation เพื่อการทดสอบเดโมเท่านั้น (ไม่ใช่ Biometric จริง)</span>
        </div>

        {/* Video Frame with Oval Face Guide */}
        <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-sky-400 shadow-xl bg-slate-900 flex items-center justify-center mb-5">
          {cameraError ? (
            <div className="p-4 text-slate-400 text-xs">
              <Camera className="w-12 h-12 mx-auto mb-2 text-slate-500" />
              <span>ไม่พบการเชื่อมต่อกล้อง (แสดงระบบจำลอง)</span>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          )}

          {/* Oval Guide Overlay */}
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-sky-300 pointer-events-none" />

          {/* Animated Scan Line when Scanning */}
          {isScanning && <div className="absolute left-0 right-0 scan-line" />}
        </div>

        {/* Progress & Prompt */}
        {!isCompleted ? (
          <div>
            <div className="mb-4 min-h-[44px]">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">คำสั่ง Liveness</p>
              <h4 className="text-base font-extrabold text-sky-600 animate-pulse mt-0.5">
                {isScanning ? livenessPrompts[currentPromptIndex] : 'กดปุ่มเพื่อเริ่มสแกนใบหน้า'}
              </h4>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-sm shadow-lg shadow-sky-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isScanning ? `กำลังวิเคราะห์ (${progress}%)` : 'เริ่มสแกน Liveness'}</span>
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-100">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">ยืนยันโครงสร้างใบหน้าสำเร็จเรียบร้อย!</h3>
              <p className="text-xs text-slate-500 mt-1">สามารถดำเนินการเลือกและจองที่นั่งได้ทันที</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-200 transition"
            >
              ตกลง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Volume2, VolumeX, ShieldCheck, Printer } from 'lucide-react';
import { sound } from '../utils/sound';

interface HeaderProps {
  examState: 'register' | 'exam' | 'result';
  onReset?: () => void;
  onPrint?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  timeLeftFormatted?: string;
  isUrgentTime?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  examState,
  onReset,
  onPrint,
  soundEnabled,
  onToggleSound,
  timeLeftFormatted,
  isUrgentTime
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Zone 1: Wordmark / Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-inner font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <a href="#" onClick={(e) => { e.preventDefault(); if (examState === 'result' && onReset) onReset(); }} className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-indigo-200 transition-colors font-brand">
              CPR MEDICAL ACADEMY
            </a>
            <div className="text-[11px] text-slate-400 font-bengali leading-none hidden sm:block">
              স্পেশাল বিসিএস ক্রিস্টাল ব্যাচ · বাংলা ব্যাকরণ
            </div>
          </div>
        </div>

        {/* Zone 2: Informational / Contextual Area (Middle) */}
        {examState === 'exam' && timeLeftFormatted ? (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${
            isUrgentTime 
              ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse' 
              : 'bg-slate-800/80 border-slate-700 text-slate-200'
          }`}>
            <span className="text-xs uppercase tracking-wider text-slate-400 hidden md:inline">সময় বাকি:</span>
            <span className={`font-mono text-base sm:text-lg font-bold tabular-nums ${isUrgentTime ? 'text-rose-400' : 'text-amber-300'}`}>
              {timeLeftFormatted}
            </span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
            <span>Special BCS Crystal Batch</span>
            <span aria-hidden="true">·</span>
            <span>৫০ MCQ</span>
            <span aria-hidden="true">·</span>
            <span>৩০ মিনিট</span>
            <span aria-hidden="true">·</span>
            <span>নেগেটিভ মার্কিং -০.৫</span>
          </div>
        )}

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              sound.enabled = !soundEnabled;
              onToggleSound();
            }}
            title={soundEnabled ? "শব্দ বন্ধ করুন (Mute)" : "শব্দ চালু করুন (Sound On)"}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {examState === 'result' && (
            <>
              {onPrint && (
                <button
                  type="button"
                  onClick={onPrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">প্রিন্ট / সেভ</span>
                </button>
              )}
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors whitespace-nowrap shadow-sm"
                >
                  নতুন পরীক্ষা
                </button>
              )}
            </>
          )}

          {examState === 'exam' && onReset && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("আপনি কি নিশ্চিত যে বর্তমান পরীক্ষাটি বাতিল করে শুরুতে ফিরে যেতে চান?")) {
                  onReset();
                }
              }}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-300 transition-colors"
            >
              বাতিল
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

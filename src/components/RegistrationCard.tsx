import React, { useState } from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, Clock, Award, History, RotateCcw, ArrowRight } from 'lucide-react';
import { EXAM_CONFIG, StudentData, ExamResult } from '../data/questionsData';

interface RegistrationCardProps {
  onStart: (data: StudentData) => void;
  savedState?: { student: StudentData; timeLeft: number } | null;
  onResume?: () => void;
  pastResults: ExamResult[];
  onSelectPastResult?: (res: ExamResult) => void;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({
  onStart,
  savedState,
  onResume,
  pastResults,
  onSelectPastResult
}) => {
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('অনুগ্রহ করে আপনার পুরো নাম লিখুন। (Please enter your name)');
      return;
    }
    setError('');
    onStart({
      name: name.trim(),
      roll: roll.trim() || 'N/A',
      startTime: Date.now()
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4">
      {/* Academy & Exam Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
          <Award className="w-3.5 h-3.5" />
          <span>SPECIAL BCS CRYSTAL BATCH</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif-bengali">
          অনলাইন মূল্যায়ন পরীক্ষা: বাংলা ব্যাকরণ
        </h1>
        <p className="mt-2 text-sm text-slate-600 font-bengali max-w-lg mx-auto">
          সিপিআর মেডিকেল একাডেমি বিসিএস স্পেশাল ক্রিস্টাল ব্যাচ মডেল টেস্ট। প্রমিত বিসিএস সিলেবাসের আলোকে ৫০টি গুরুত্বপূর্ণ প্রশ্নাবলী।
        </p>
      </div>

      {/* Resume Active Session Card (if user refreshed during exam) */}
      {savedState && onResume && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-sm">
              <p className="font-semibold font-bengali">অসম্পূর্ণ সেশন সংরক্ষিত আছে!</p>
              <p className="text-xs text-amber-800">
                শিক্ষার্থী: <span className="font-medium">{savedState.student.name}</span> · বাকি সময়: {Math.floor(savedState.timeLeft / 60)} মি. {savedState.timeLeft % 60} সে.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResume}
            className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition whitespace-nowrap"
          >
            পরীক্ষা চালিয়ে যান (Resume)
          </button>
        </div>
      )}

      {/* Registration Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900 font-bengali">
            শিক্ষার্থী তথ্য (Candidate Registration)
          </h2>
          <p className="text-xs text-slate-500 font-bengali mt-0.5">
            পরীক্ষায় অংশগ্রহণের পূর্বে আপনার সঠিক নাম ও রোল নম্বর উল্লেখ করুন
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="student-name-input" className="block text-sm font-medium text-slate-700 font-bengali mb-1.5">
              শিক্ষার্থীর পূর্ণ নাম <span className="text-rose-500">*</span>
            </label>
            <input
              id="student-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="যেমন: ডা. তানভীর আহমেদ / Dr. Tanvir Ahmed"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 text-sm placeholder:text-slate-400 transition"
              autoFocus
            />
            {error && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium font-bengali">{error}</p>
            )}
          </div>

          <div>
            <label htmlFor="student-roll-input" className="block text-sm font-medium text-slate-700 font-bengali mb-1.5">
              রেজিস্ট্রেশন নম্বর / ব্যাচ আইডি <span className="text-slate-400 text-xs font-normal">(ঐচ্ছিক / Optional)</span>
            </label>
            <input
              id="student-roll-input"
              type="text"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              placeholder="যেমন: CPR-CB-104"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 text-sm placeholder:text-slate-400 transition font-mono"
            />
          </div>

          {/* Exam Rules & Marking System Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 text-xs space-y-2.5 text-slate-700">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 font-bengali">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>পরীক্ষা নির্দেশিকা ও মূল্যায়ন পদ্ধতি (Exam Rules):</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-bengali">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>মোট প্রশ্ন: <strong>{EXAM_CONFIG.totalQuestions}টি</strong> MCQ</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>বরাদ্দকৃত সময়: <strong>{EXAM_CONFIG.durationMinutes} মিনিট</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>সঠিক উত্তরের মান: <strong>+{EXAM_CONFIG.correctMarks} নম্বর</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>নেগেটিভ মার্কিং: <strong>-{EXAM_CONFIG.negativePenalty} নম্বর</strong> (প্রতি ভুলে)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 font-bengali">
              <span className="font-semibold text-slate-800">চূড়ান্ত ফলাফল সূত্র:</span> প্রাপ্ত নম্বর = সঠিক MCQ - (ভুল MCQ × ০.৫)। কোনো প্রশ্ন উত্তর না দিলে কোনো নম্বর কাটা যাবে না।
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2 font-bengali"
          >
            <span>পরীক্ষা শুরু করুন (Start Exam)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Previous Results / History Section (if any exist) */}
      {pastResults.length > 0 && onSelectPastResult && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
            <History className="w-4 h-4 text-indigo-600" />
            <span>পূর্ববর্তী ফলাফল রেকর্ড (Previous Attempts)</span>
          </div>
          <div className="divide-y divide-slate-100">
            {pastResults.slice(0, 3).map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{item.studentName}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(item.submittedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono text-sm">{item.finalScore.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-500"> / {item.totalQuestions}</span>
                    <div className="text-[10px] text-emerald-600 font-medium">সঠিক: {item.correctCount} · ভুল: {item.incorrectCount}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectPastResult(item)}
                    className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition font-bengali"
                  >
                    রিভিউ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

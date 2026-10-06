import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, BookmarkCheck, CheckCircle2, RotateCcw, AlertCircle, ArrowUp, Send, Grid, ChevronRight } from 'lucide-react';
import { Question, StudentData } from '../data/questionsData';
import { sound } from '../utils/sound';

interface ExamInterfaceProps {
  questions: Question[];
  student: StudentData;
  userAnswers: Record<number, number>;
  onAnswerChange: (questionId: number, optionIdx: number | null) => void;
  flaggedQuestions: Set<number>;
  onToggleFlag: (questionId: number) => void;
  onSubmit: () => void;
  timeLeftSeconds: number;
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({
  questions,
  student,
  userAnswers,
  onAnswerChange,
  flaggedQuestions,
  onToggleFlag,
  onSubmit,
  timeLeftSeconds
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'unanswered' | 'flagged'>('all');
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[Number(k)] !== undefined).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = flaggedQuestions.size;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  // Scroll to question
  const scrollToQuestion = (id: number) => {
    sound.playClick();
    const el = questionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-indigo-500', 'transition-all');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-indigo-500');
      }, 1200);
    }
    setShowPaletteDrawer(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter questions for viewing if student chooses
  const displayedQuestions = questions.filter(item => {
    if (filterMode === 'unanswered') {
      return userAnswers[item.id] === undefined;
    }
    if (filterMode === 'flagged') {
      return flaggedQuestions.has(item.id);
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Candidate Status & Progress Ribbon */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
              {student.name.slice(0, 2)}
            </div>
            <div>
              <div className="font-semibold text-slate-900 font-bengali">{student.name}</div>
              <div className="text-xs text-slate-500 font-mono">
                রোল / আইডি: <span className="text-slate-700 font-medium">{student.roll}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
              <span className="text-slate-600 font-bengali">উত্তর দেওয়া:</span>
              <span className="font-bold text-slate-900 font-mono">{answeredCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
              <span className="text-slate-600 font-bengali">বাকি:</span>
              <span className="font-bold text-slate-900 font-mono">{unansweredCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span className="text-slate-600 font-bengali">রিভিউ:</span>
              <span className="font-bold text-slate-900 font-mono">{flaggedCount}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-bengali">অগ্রগতি: {progressPercent}% সম্পন্ন</span>
            <span className="font-mono">{answeredCount} / {questions.length}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Questions, Right Sticky Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Questions Column (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Quick Filter Control */}
          <div className="flex items-center justify-between p-1.5 bg-slate-200/70 rounded-xl text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterMode === 'all' ? 'bg-white text-indigo-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সব প্রশ্ন ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('unanswered')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterMode === 'unanswered' ? 'bg-white text-indigo-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাকি প্রশ্ন ({unansweredCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('flagged')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  filterMode === 'flagged' ? 'bg-white text-indigo-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                রিভিউ চিহ্নিত ({flaggedCount})
              </button>
            </div>

            {/* Mobile Palette Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowPaletteDrawer(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium shadow-sm"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>তালিকা ({questions.length})</span>
            </button>
          </div>

          {/* Render Questions List */}
          {displayedQuestions.map((item) => {
            const currentSelected = userAnswers[item.id];
            const isFlagged = flaggedQuestions.has(item.id);

            return (
              <div
                key={item.id}
                ref={(el) => { questionRefs.current[item.id] = el; }}
                id={`question-${item.id}`}
                className={`bg-white rounded-xl border p-5 sm:p-6 transition-shadow shadow-xs hover:shadow-sm ${
                  isFlagged 
                    ? 'border-amber-300 ring-1 ring-amber-200' 
                    : currentSelected !== undefined 
                    ? 'border-indigo-200' 
                    : 'border-slate-200/90'
                }`}
              >
                {/* Question Header & Flag Action */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 font-bengali">
                      বিষয়: {item.topic}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 font-bengali leading-relaxed mt-0.5">
                      {item.q}
                    </h3>
                  </div>

                  {/* Bookmark / Flag Button */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onToggleFlag(item.id);
                    }}
                    title={isFlagged ? "রিভিউ তালিকা থেকে সরান" : "পরে পর্যালোচনার জন্য চিহ্নিত করুন"}
                    className={`p-2 rounded-lg transition shrink-0 ${
                      isFlagged
                        ? 'bg-amber-100 text-amber-800'
                        : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                    }`}
                  >
                    {isFlagged ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {item.opts.map((optText, optIdx) => {
                    const isSelected = currentSelected === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onAnswerChange(item.id, optIdx);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 ring-1 ring-indigo-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-slate-400'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <span className="text-sm font-bengali leading-snug">
                          {optText}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Question Footer: Clear Option if answered */}
                {currentSelected !== undefined && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 flex items-center gap-1 font-medium font-bengali">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      উত্তর সংরক্ষিত হয়েছে
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onAnswerChange(item.id, null);
                      }}
                      className="text-slate-400 hover:text-rose-600 flex items-center gap-1 transition font-bengali"
                      title="নেগেটিভ মার্কিং এড়াতে উত্তর বাতিল করুন"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>উত্তর বাতিল করুন (Clear)</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {displayedQuestions.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              <p className="font-bengali">এই ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি।</p>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                সব প্রশ্ন দেখুন
              </button>
            </div>
          )}

          {/* Bottom Submit Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div>
              <h4 className="text-lg font-bold font-serif-bengali">পরীক্ষা সম্পন্ন হয়েছে?</h4>
              <p className="text-xs text-slate-300 font-bengali mt-0.5">
                আপনার দেওয়া উত্তরগুলো নিশ্চিত করতে 'পরীক্ষা জমা দিন' বাটনে ক্লিক করুন।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="w-full sm:w-auto px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 font-bengali whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span>পরীক্ষা জমা দিন (Submit Exam)</span>
            </button>
          </div>
        </div>

        {/* Desktop Sticky Question Palette (4 cols on lg) */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-20">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm font-bengali flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-indigo-600" />
                <span>প্রশ্ন নেভিগেশন গ্রিড</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">১ - ৫০</span>
            </div>

            {/* Color Legend */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-bengali pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600 text-white inline-block"></span>
                <span>উত্তর দেওয়া</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block"></span>
                <span>রিভিউ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block"></span>
                <span>বাকি</span>
              </div>
            </div>

            {/* 50 Questions Number Grid */}
            <div className="grid grid-cols-5 gap-1.5 max-h-[360px] overflow-y-auto pr-1">
              {questions.map((item) => {
                const isAnswered = userAnswers[item.id] !== undefined;
                const isFlagged = flaggedQuestions.has(item.id);

                let btnClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                if (isFlagged && isAnswered) {
                  btnClass = 'bg-amber-500 text-white border-amber-600 font-bold';
                } else if (isFlagged) {
                  btnClass = 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400 font-bold';
                } else if (isAnswered) {
                  btnClass = 'bg-indigo-600 text-white border-indigo-700 font-bold';
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToQuestion(item.id)}
                    className={`h-8 rounded-lg text-xs font-mono border transition-all flex items-center justify-center cursor-pointer ${btnClass}`}
                  >
                    {item.id}
                  </button>
                );
              })}
            </div>

            {/* Quick Submit CTA */}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 font-bengali shadow-sm"
            >
              <span>ফাইনাল সাবমিট ({answeredCount}/{questions.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      </div>

      {/* Floating Action Button for Back-to-Top */}
      <button
        type="button"
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 p-3 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition z-30"
        title="উপরে যান"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* Mobile Palette Drawer Modal */}
      {showPaletteDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-80 bg-white h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h4 className="font-bold text-slate-900 text-sm font-bengali">প্রশ্ন তালিকা (১-৫০)</h4>
                <button
                  type="button"
                  onClick={() => setShowPaletteDrawer(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
                >
                  ✕ বন্ধ করুন
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((item) => {
                  const isAnswered = userAnswers[item.id] !== undefined;
                  const isFlagged = flaggedQuestions.has(item.id);
                  let btnClass = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (isFlagged && isAnswered) {
                    btnClass = 'bg-amber-500 text-white font-bold';
                  } else if (isFlagged) {
                    btnClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                  } else if (isAnswered) {
                    btnClass = 'bg-indigo-600 text-white font-bold';
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToQuestion(item.id)}
                      className={`h-9 rounded-lg text-xs font-mono border flex items-center justify-center ${btnClass}`}
                    >
                      {item.id}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowPaletteDrawer(false);
                  setShowSubmitModal(true);
                }}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold font-bengali"
              >
                পরীক্ষা জমা দিন ({answeredCount}/{questions.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-serif-bengali">পরীক্ষা জমা নিশ্চিতকরণ</h3>
              <p className="text-xs text-slate-500 font-bengali mt-1">
                একবার জমা দিলে আপনি আর উত্তর পরিবর্তন করতে পারবেন না।
              </p>
            </div>

            {/* Stat Summary Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs mb-5 font-bengali">
              <div className="flex justify-between text-slate-600">
                <span>মোট প্রশ্ন:</span>
                <span className="font-bold text-slate-900 font-mono">{questions.length}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>উত্তর দেওয়া হয়েছে:</span>
                <span className="font-bold text-indigo-700 font-mono">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>উত্তর দেওয়া বাকি:</span>
                <span className="font-bold text-rose-600 font-mono">{unansweredCount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>রিভিউয়ের জন্য চিহ্নিত:</span>
                <span className="font-bold text-amber-600 font-mono">{flaggedCount}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="pt-2 border-t border-slate-200 text-rose-600 font-medium text-[11px]">
                  ⚠️ সতর্কবার্তা: {unansweredCount}টি প্রশ্ন এখনো খালি রয়েছে।
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition font-bengali"
              >
                ফিরে যান (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  onSubmit();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm font-bengali"
              >
                হ্যাঁ, জমা দিন (Submit)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

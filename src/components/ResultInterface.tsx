import React, { useState, useEffect } from 'react';
import { 
  Award, CheckCircle2, XCircle, AlertCircle, Printer, RotateCcw, 
  Share2, ChevronDown, ChevronUp, BookOpen, Clock, BarChart3, Check, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, ExamResult, EXAM_CONFIG } from '../data/questionsData';
import { sound } from '../utils/sound';

interface ResultInterfaceProps {
  result: ExamResult;
  questions: Question[];
  onRetake: () => void;
  onPrint: () => void;
}

export const ResultInterface: React.FC<ResultInterfaceProps> = ({
  result,
  questions,
  onRetake,
  onPrint
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [showReview, setShowReview] = useState(true);

  // Trigger celebration confetti if score is solid (e.g. >= 25)
  useEffect(() => {
    sound.playFinish();
    if (result.finalScore >= 25) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // confetti safe fallback
      }
    }
  }, [result.finalScore]);

  // Performance Rating Band
  const getRating = (score: number) => {
    if (score >= 40) return { label: 'অসাধারণ! প্রিলিমিনারি ক্যাডার-প্রস্তুতি সম্পন্ন', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 32) return { label: 'খুব ভালো প্রস্তুতি! শীর্ষ মেধাতালিকায় থাকার মতো', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (score >= 22) return { label: 'সন্তোষজনক প্রস্তুতি! ভুলগুলো পুনরাবৃত্তি করুন', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    return { label: 'আরও গভীর প্রস্তুতি ও নিয়মিত অনুশীলন প্রয়োজন', color: 'text-rose-800 bg-rose-50 border-rose-200' };
  };

  const rating = getRating(result.finalScore);

  // Format time spent
  const minutesSpent = Math.floor(result.timeSpentSeconds / 60);
  const secondsSpent = result.timeSpentSeconds % 60;

  // Unique topics
  const topics = Array.from(new Set(questions.map(q => q.topic)));

  // Filtered list
  const filteredQuestions = questions.filter(item => {
    const userAns = result.answers[item.id];
    const isAnswered = userAns !== undefined;
    const isCorrect = userAns === item.ans;

    if (filter === 'correct' && !isCorrect) return false;
    if (filter === 'incorrect' && (!isAnswered || isCorrect)) return false;
    if (filter === 'skipped' && isAnswered) return false;

    if (selectedTopic !== 'all' && item.topic !== selectedTopic) return false;

    return true;
  });

  const handleCopySummary = () => {
    const text = `CPR Medical Academy - Special BCS Crystal Batch\nTopic: বাংলা ব্যাকরণ\nপরীক্ষার্থী: ${result.studentName} (ID: ${result.studentRoll})\nসঠিক: ${result.correctCount} | ভুল: ${result.incorrectCount} | অনুত্তীর্ণ: ${result.unansweredCount}\nচূড়ান্ত প্রাপ্ত নম্বর: ${result.finalScore.toFixed(2)} / ${result.totalQuestions}\nতারিখ: ${new Date(result.submittedAt).toLocaleDateString('bn-BD')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* Printable Scorecard / Result Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden print-container">
        
        {/* Certificate Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-indigo-300 text-xs font-semibold mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>OFFICIAL PERFORMANCE REPORT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-brand tracking-wider">
            CPR MEDICAL ACADEMY
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-bengali mt-1">
            স্পেশাল বিসিএস ক্রিস্টাল ব্যাচ · বিষয়: বাংলা ব্যাকরণ
          </p>
          <div className="text-[11px] text-slate-400 mt-2 font-english">
            {new Date(result.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Candidate Credentials Strip */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-bengali">পরীক্ষার্থীর নাম</span>
            <span className="font-bold text-slate-900 font-bengali text-sm">{result.studentName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-bengali">রোল / ব্যাচ আইডি</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{result.studentRoll}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-bengali">ব্যয়িত সময়</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{minutesSpent} মি. {secondsSpent} সে.</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-bengali">সঠিকতার হার (Accuracy)</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{result.accuracy}%</span>
          </div>
        </div>

        {/* Scorecard Body */}
        <div className="p-6 sm:p-8">
          
          {/* Big Final Score Display */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-6 text-center max-w-md mx-auto mb-6">
            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider font-bengali mb-1">
              চূড়ান্ত প্রাপ্ত নম্বর (Net Score)
            </div>
            <div className="flex items-baseline justify-center gap-1.5 font-mono">
              <span className="text-5xl font-extrabold text-indigo-950 tabular-nums">
                {result.finalScore.toFixed(2)}
              </span>
              <span className="text-lg font-bold text-slate-400">/ {result.totalQuestions}.00</span>
            </div>
            <p className="text-xs text-slate-500 font-bengali mt-2">
              সূত্র: সঠিক ({result.correctCount}) - ভুল ({result.incorrectCount} × ০.৫) = {result.finalScore.toFixed(2)}
            </p>
            <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold border ${rating.color} font-bengali`}>
              {rating.label}
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 font-bengali block">মোট প্রশ্ন</span>
              <span className="text-2xl font-bold text-slate-900 font-mono">{result.totalQuestions}</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-bengali block">সঠিক উত্তর (+১)</span>
              <span className="text-2xl font-bold text-emerald-700 font-mono">+{result.correctCount}</span>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
              <span className="text-xs text-rose-800 font-bengali block">ভুল উত্তর (-০.৫)</span>
              <span className="text-2xl font-bold text-rose-700 font-mono">-{result.negativeMarks.toFixed(1)}</span>
              <span className="text-[10px] text-rose-600 block">({result.incorrectCount}টি ভুল)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 font-bengali block">উত্তরহীন / এড়ানো</span>
              <span className="text-2xl font-bold text-slate-600 font-mono">{result.unansweredCount}</span>
            </div>
          </div>

          {/* Action CTAs (No Print) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-100 no-print">
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট / সেভ করুন (Print / PDF)</span>
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'কপি হয়েছে!' : 'ফলাফল কপি করুন'}</span>
            </button>
            <button
              type="button"
              onClick={onRetake}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>পুনরায় পরীক্ষা দিন (Retake)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Answer Sheet & Solution Review Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif-bengali flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>বিস্তারিত উত্তরপত্র ও ব্যাকরণিক ব্যাখ্যা</span>
            </h2>
            <p className="text-xs text-slate-500 font-bengali mt-0.5">
              প্রতিটি প্রশ্নের নির্ভুল সমাধান এবং বিসিএস ব্যাকরণ সম্পর্কিত প্রয়োজনীয় ব্যাখ্যা
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowReview(!showReview)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg shadow-xs hover:bg-slate-50 no-print"
          >
            <span>{showReview ? 'সংকোচন করুন' : 'বিস্তারিত দেখুন'}</span>
            {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showReview && (
          <div className="space-y-4">
            
            {/* Filter and Topic Tabs (No Print) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 space-y-3 no-print shadow-xs">
              
              {/* Status Segmented Control */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    filter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  সব প্রশ্ন ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('correct')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    filter === 'correct' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  সঠিক উত্তর ({result.correctCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('incorrect')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    filter === 'incorrect' ? 'bg-white text-rose-800 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ভুল উত্তর ({result.incorrectCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('skipped')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    filter === 'skipped' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  উত্তর না দেওয়া ({result.unansweredCount})
                </button>
              </div>

              {/* Topic Filter Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-bengali">বিষয় ফিল্টার:</span>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">সকল ব্যাকরণিক বিষয় ({topics.length})</option>
                  {topics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Questions Review List */}
            <div className="space-y-4">
              {filteredQuestions.map((item) => {
                const userAns = result.answers[item.id];
                const isAnswered = userAns !== undefined;
                const isCorrect = userAns === item.ans;

                let borderClass = 'border-slate-200';
                let statusBadge = (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-bengali">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>উত্তর দেওয়া হয়নি</span>
                  </span>
                );

                if (isAnswered) {
                  if (isCorrect) {
                    borderClass = 'border-emerald-200 bg-emerald-50/10';
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold font-bengali">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>সঠিক (+১.০)</span>
                      </span>
                    );
                  } else {
                    borderClass = 'border-rose-200 bg-rose-50/10';
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-700 font-semibold font-bengali">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>ভুল (-০.৫)</span>
                      </span>
                    );
                  }
                }

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border ${borderClass} p-5 sm:p-6 shadow-xs space-y-4`}
                  >
                    {/* Header: Question Text & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] text-slate-400 font-bengali">
                          টপিক: {item.topic}
                        </div>
                        <h4 className="text-base font-semibold text-slate-900 font-bengali mt-0.5 leading-relaxed">
                          {item.q}
                        </h4>
                      </div>
                      <div className="shrink-0">{statusBadge}</div>
                    </div>

                    {/* 4 Options with Visual Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {item.opts.map((optText, optIdx) => {
                        const isOfficialAns = optIdx === item.ans;
                        const isUserChoice = optIdx === userAns;

                        let optClass = 'bg-slate-50/80 border-slate-200 text-slate-700';
                        if (isOfficialAns) {
                          optClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-300';
                        } else if (isUserChoice && !isCorrect) {
                          optClass = 'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-300';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border flex items-start justify-between gap-2 ${optClass}`}
                          >
                            <span className="font-bengali leading-snug">{optText}</span>
                            <div className="shrink-0 text-[10px] font-bold font-bengali">
                              {isOfficialAns && (
                                <span className="text-emerald-700 flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>সঠিক উত্তর</span>
                                </span>
                              )}
                              {isUserChoice && !isCorrect && (
                                <span className="text-rose-600 flex items-center gap-0.5">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>আপনার উত্তর</span>
                                </span>
                              )}
                              {isUserChoice && isCorrect && (
                                <span className="text-emerald-700 flex items-center gap-0.5">
                                  <span>(আপনার উত্তর)</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Grammar Rule & Explanation Callout */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
                      <div className="font-semibold text-indigo-900 flex items-center gap-1.5 font-bengali">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>ব্যাকরণগত ব্যাখ্যা ও বিশ্লেষণ:</span>
                      </div>
                      <p className="text-slate-600 font-bengali leading-relaxed pt-0.5">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}

              {filteredQuestions.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 font-bengali">
                  এই ক্যাটাগরিতে কোনো প্রশ্ন নেই।
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

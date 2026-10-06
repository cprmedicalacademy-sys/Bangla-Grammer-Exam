/**
 * CPR Medical Academy - Online Exam Portal
 * Special BCS Crystal Batch - বাংলা ব্যাকরণ (Bangla Grammar)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { RegistrationCard } from './components/RegistrationCard';
import { ExamInterface } from './components/ExamInterface';
import { ResultInterface } from './components/ResultInterface';
import { 
  questionsData, 
  EXAM_CONFIG, 
  StudentData, 
  ExamResult 
} from './data/questionsData';
import { sound } from './utils/sound';

const STORAGE_KEYS = {
  PAST_RESULTS: 'cpr_bcs_past_results',
  ACTIVE_SESSION: 'cpr_bcs_active_session',
  SOUND_ENABLED: 'cpr_bcs_sound_enabled'
};

export default function App() {
  const [examState, setExamState] = useState<'register' | 'exam' | 'result'>('register');
  const [student, setStudent] = useState<StudentData>({ name: '', roll: '' });
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(EXAM_CONFIG.durationSeconds);
  const [activeResult, setActiveResult] = useState<ExamResult | null>(null);
  const [pastResults, setPastResults] = useState<ExamResult[]>([]);
  const [savedSession, setSavedSession] = useState<{ student: StudentData; timeLeft: number; answers: Record<number, number> } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const timerRef = useRef<number | null>(null);
  const examStartTimeRef = useRef<number>(Date.now());

  // Load past results, audio setting, and check for saved unfinished session on mount
  useEffect(() => {
    try {
      const storedResults = localStorage.getItem(STORAGE_KEYS.PAST_RESULTS);
      if (storedResults) {
        setPastResults(JSON.parse(storedResults));
      }

      const storedSound = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      if (storedSound !== null) {
        const isEnabled = JSON.parse(storedSound);
        setSoundEnabled(isEnabled);
        sound.enabled = isEnabled;
      }

      const activeSessionStr = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (activeSessionStr) {
        const session = JSON.parse(activeSessionStr);
        if (session && session.timeLeft > 0 && session.student?.name) {
          setSavedSession(session);
        }
      }
    } catch {
      // Storage unavailable or corrupted
    }
  }, []);

  // Save sound setting change
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    sound.enabled = nextVal;
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(nextVal));
    } catch {
      // safe fallback
    }
  };

  // Submit and compute score
  const handleCalculateAndSubmit = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    let correct = 0;
    let incorrect = 0;

    questionsData.forEach(item => {
      const chosen = userAnswers[item.id];
      if (chosen !== undefined) {
        if (chosen === item.ans) {
          correct += 1;
        } else {
          incorrect += 1;
        }
      }
    });

    const unanswered = questionsData.length - (correct + incorrect);
    const negative = incorrect * EXAM_CONFIG.negativePenalty;
    const finalScore = Number((correct - negative).toFixed(2));
    const accuracy = correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;
    const timeSpent = EXAM_CONFIG.durationSeconds - timeLeftSeconds;

    const resultPayload: ExamResult = {
      studentName: student.name,
      studentRoll: student.roll,
      totalQuestions: questionsData.length,
      answeredCount: correct + incorrect,
      unansweredCount: unanswered,
      correctCount: correct,
      incorrectCount: incorrect,
      negativeMarks: negative,
      finalScore: finalScore,
      accuracy: accuracy,
      timeSpentSeconds: timeSpent > 0 ? timeSpent : 1,
      submittedAt: new Date().toISOString(),
      answers: { ...userAnswers }
    };

    setActiveResult(resultPayload);
    setExamState('result');

    // Save to past history in localStorage
    try {
      const updatedHistory = [resultPayload, ...pastResults.slice(0, 9)];
      setPastResults(updatedHistory);
      localStorage.setItem(STORAGE_KEYS.PAST_RESULTS, JSON.stringify(updatedHistory));
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      setSavedSession(null);
    } catch {
      // storage quota or private mode
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [userAnswers, timeLeftSeconds, student, pastResults]);

  // Start fresh exam
  const handleStartExam = (candidate: StudentData) => {
    sound.playClick();
    setStudent(candidate);
    setUserAnswers({});
    setFlaggedQuestions(new Set());
    setTimeLeftSeconds(EXAM_CONFIG.durationSeconds);
    examStartTimeRef.current = Date.now();
    setExamState('exam');

    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      setSavedSession(null);
    } catch {
      // ignore
    }
  };

  // Resume saved exam
  const handleResumeExam = () => {
    if (!savedSession) return;
    sound.playClick();
    setStudent(savedSession.student);
    setUserAnswers(savedSession.answers || {});
    setTimeLeftSeconds(savedSession.timeLeft);
    examStartTimeRef.current = Date.now() - ((EXAM_CONFIG.durationSeconds - savedSession.timeLeft) * 1000);
    setExamState('exam');
    setSavedSession(null);
  };

  // Answer selection handler
  const handleAnswerChange = (questionId: number, optionIdx: number | null) => {
    setUserAnswers(prev => {
      const next = { ...prev };
      if (optionIdx === null) {
        delete next[questionId];
      } else {
        next[questionId] = optionIdx;
      }

      // Persist active session state
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify({
          student,
          timeLeft: timeLeftSeconds,
          answers: next
        }));
      } catch {
        // storage quota
      }

      return next;
    });
  };

  // Toggle flag for review
  const handleToggleFlag = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Countdown timer effect
  useEffect(() => {
    if (examState !== 'exam') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleCalculateAndSubmit();
          return 0;
        }

        // Sound alert for 5 minutes and 1 minute
        if (prev === 300 || prev === 60) {
          sound.playTimeWarning();
        }

        // Periodically sync session
        if (prev % 10 === 0) {
          try {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify({
              student,
              timeLeft: prev - 1,
              answers: userAnswers
            }));
          } catch {
            // safe fallback
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [examState, handleCalculateAndSubmit, student, userAnswers]);

  // Format timer string MM:SS
  const mins = Math.floor(timeLeftSeconds / 60);
  const secs = timeLeftSeconds % 60;
  const timeLeftFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const isUrgentTime = timeLeftSeconds < 180; // less than 3 minutes

  const handlePrint = () => {
    window.print();
  };

  const handleResetToRegistration = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    } catch {
      // ignore
    }
    setExamState('register');
    setActiveResult(null);
    setUserAnswers({});
    setFlaggedQuestions(new Set());
    setTimeLeftSeconds(EXAM_CONFIG.durationSeconds);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Header Bar */}
      <Header
        examState={examState}
        onReset={handleResetToRegistration}
        onPrint={handlePrint}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        timeLeftFormatted={timeLeftFormatted}
        isUrgentTime={isUrgentTime}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {examState === 'register' && (
          <RegistrationCard
            onStart={handleStartExam}
            savedState={savedSession}
            onResume={handleResumeExam}
            pastResults={pastResults}
            onSelectPastResult={(item) => {
              setActiveResult(item);
              setExamState('result');
            }}
          />
        )}

        {examState === 'exam' && (
          <ExamInterface
            questions={questionsData}
            student={student}
            userAnswers={userAnswers}
            onAnswerChange={handleAnswerChange}
            flaggedQuestions={flaggedQuestions}
            onToggleFlag={handleToggleFlag}
            onSubmit={handleCalculateAndSubmit}
            timeLeftSeconds={timeLeftSeconds}
          />
        )}

        {examState === 'result' && activeResult && (
          <ResultInterface
            result={activeResult}
            questions={questionsData}
            onRetake={handleResetToRegistration}
            onPrint={handlePrint}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-bengali no-print">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-700">CPR MEDICAL ACADEMY</span> · স্পেশাল বিসিএস ক্রিস্টাল ব্যাচ
          </div>
          <div className="text-[11px] text-slate-400">
            স্বত্বাধিকার সংরক্ষিত © {new Date().getFullYear()} · অফিসিয়াল মডেল টেস্ট পোর্টাল
          </div>
        </div>
      </footer>
    </div>
  );
}

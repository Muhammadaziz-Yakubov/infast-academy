'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  XCircle,
  Play,
  Award,
  Coins,
  Flame,
  HelpCircle,
  Sparkles,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  Check,
  Zap,
} from 'lucide-react';

interface QuestionItem {
  question: string;
  options: string[];
  explanation?: string;
}

interface PairItem {
  id: string;
  term: string;
  definition: string;
}

export default function StudentLessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'theory' | 'quiz' | 'interactive'>('theory');

  // Quiz state (9 questions)
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<any | null>(null);

  // Interactive Matching Pairs state
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ termId: string; defId: string } | null>(null);
  const [savingInteractive, setSavingInteractive] = useState(false);
  const [interactiveCompleted, setInteractiveCompleted] = useState(false);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError('');
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/student/lessons/${lessonId}`, { headers });
      const json = await res.json();
      if (res.ok && json.success) {
        setLesson(json.lesson);
      } else {
        setError(json.error || "Darsni yuklashda xatolik yuz berdi");
      }
    } catch (e: any) {
      setError(e.message || "Tarmoq xatoligi");
    } finally {
      setLoading(false);
    }
  };

  const questions: QuestionItem[] = lesson?.testQuestions || [];

  // Generate or retrieve interactive pairs
  const pairs: PairItem[] = useMemo(() => {
    if (lesson?.interactiveActivity?.pairs && lesson.interactiveActivity.pairs.length >= 2) {
      return lesson.interactiveActivity.pairs.map((p: any, idx: number) => ({
        id: `pair-${idx}`,
        term: p.term,
        definition: p.definition,
      }));
    }
    // High-quality contextual fallback pairs if lesson pairs not seeded
    const title = lesson?.title || "Dasturlash";
    return [
      { id: 'p1', term: `${title} Asosi`, definition: "Mavzuning poydevor tushunchasi va ishlash tamoyili" },
      { id: 'p2', term: "Sintaksis & Standart", definition: "Toza, xatosiz va sanoat talablariga mos kod yozish qoidasi" },
      { id: 'p3', term: "Optimallashtirish", definition: "Tizim tezligi va resurslar sarfini eng samarali holatga keltirish" },
      { id: 'p4', term: "Amaliy Integratsiya", definition: "Haqiqiy biznes loyihalarida qo'llash va sinovdan o'tkazish" },
    ];
  }, [lesson]);

  // Shuffled definitions for the interactive matching game
  const shuffledDefinitions = useMemo(() => {
    return [...pairs].sort((a, b) => b.id.localeCompare(a.id));
  }, [pairs]);

  const handleTheoryComplete = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/student/submit-progress', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          lessonId,
          markTheoryRead: true,
        }),
      });
    } catch (e) {
      console.error(e);
    }
    setActiveTab('quiz');
  };

  const handleQuizSubmit = async () => {
    const answersArray = questions.map((_: any, idx: number) =>
      typeof selectedAnswers[idx] === 'number' ? selectedAnswers[idx] : 0
    );

    try {
      setSubmittingQuiz(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/student/submit-progress', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          lessonId,
          markTheoryRead: true,
          testAnswers: answersArray,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setQuizResult(json.testEvaluation);
      } else {
        alert(json.error || "Testni tekshirishda xatolik");
      }
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Interactive Matching Logic
  const handleTermClick = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedTermId(id);
    setWrongPair(null);
  };

  const handleDefinitionClick = async (defId: string) => {
    if (matchedIds.includes(defId) || !selectedTermId) return;

    // Check if match
    if (selectedTermId === defId) {
      const newMatched = [...matchedIds, defId];
      setMatchedIds(newMatched);
      setSelectedTermId(null);
      setWrongPair(null);

      // Check if all pairs matched!
      if (newMatched.length === pairs.length) {
        setInteractiveCompleted(true);
        try {
          setSavingInteractive(true);
          const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          await fetch('/api/student/submit-progress', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              lessonId,
              markInteractiveCompleted: true,
              interactiveSubmission: { completed: true, matchedCount: pairs.length },
            }),
          });
        } catch (e) {
          console.error(e);
        } finally {
          setSavingInteractive(false);
        }
      }
    } else {
      // Mismatch
      setWrongPair({ termId: selectedTermId, defId });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedTermId(null);
      }, 700);
    }
  };

  const resetInteractive = () => {
    setMatchedIds([]);
    setSelectedTermId(null);
    setWrongPair(null);
    setInteractiveCompleted(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-[#00F0FF] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-400">Dars yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-neutral-900/40 border border-white/10 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Darsga kirish cheklangan</h3>
        <p className="text-xs text-neutral-400 leading-relaxed">{error}</p>
        <Link
          href="/student/curriculum"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>O'quv xaritasiga qaytish</span>
        </Link>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const quizPassed = quizResult && quizResult.passed;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Sleek Apple Header Bar */}
      <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <Link
            href="/student/curriculum"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>O'quv xaritasi</span>
          </Link>

          <div className="flex items-center space-x-2 text-xs font-mono font-bold">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              +{lesson.xpReward || 50} XP
            </span>
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-[#00F0FF] border border-cyan-500/20">
              +{lesson.xcoinReward || 10} Coin
            </span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
            {lesson.order ? `${lesson.order}-Dars` : "Dars"} • {lesson.moduleId?.title || "Modul"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              {lesson.description}
            </p>
          )}
        </div>

        {/* 3 Main Stages: Nazariya, Quiz, Interaktiv */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
          <button
            onClick={() => setActiveTab('theory')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'theory'
                ? 'bg-white text-black font-extrabold shadow-md'
                : 'bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Nazariya</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'quiz'
                ? 'bg-white text-black font-extrabold shadow-md'
                : 'bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>2. Quiz Test (9)</span>
          </button>

          <button
            onClick={() => setActiveTab('interactive')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'interactive'
                ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md shadow-[#FF2A85]/20 font-extrabold'
                : 'bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3. Interaktiv</span>
          </button>
        </div>
      </div>

      {/* STAGE 1: Nazariya (Theory) */}
      {activeTab === 'theory' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-6">
          <div className="prose prose-invert max-w-none text-neutral-300 text-sm leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
            {lesson.theoryContent || "Ushbu dars uchun nazariy tushunchalar kiritilmoqda..."}
          </div>

          <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Nazariyani o'qib bo'lgach, 2-bosqich Quiz testiga o'ting.
            </span>
            <button
              onClick={handleTheoryComplete}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white font-bold text-xs shadow-lg shadow-[#FF2A85]/25 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
            >
              <span>Testga o'tish</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: Minimalist Apple Quiz / Test */}
      {activeTab === 'quiz' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-6">
          
          {/* Progress Bar & Stepper */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-300">
                Savol {currentQIdx + 1} / {questions.length}
              </span>
              <span className="text-neutral-400 font-mono">
                {answeredCount} ta belgilandi
              </span>
            </div>

            <div className="grid grid-cols-9 gap-1.5">
              {questions.map((_, idx) => {
                const isAnswered = typeof selectedAnswers[idx] === 'number';
                const isCurrent = currentQIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQIdx(idx)}
                    className={`h-2 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-[#00F0FF] scale-y-125'
                        : isAnswered
                        ? 'bg-emerald-500'
                        : 'bg-white/10'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Test Evaluation Result Card */}
          {quizResult && (
            <div
              className={`p-5 rounded-2xl border ${
                quizResult.passed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              } space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-2">
                  {quizResult.passed ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Test topshirildi! (+{quizResult.earnedXp || 50} XP)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>Test topshirilmadi (O'tish bali: kamida 8/9)</span>
                    </>
                  )}
                </span>
                <span className="text-lg font-black font-mono">
                  {quizResult.score} / {quizResult.maxScore}
                </span>
              </div>
              <p className="text-xs opacity-90">
                {quizResult.passed
                  ? "Ajoyib natija! Endi 3-bosqich: Interaktiv mashg'ulotni yakunlab darsni to'liq yakunlang."
                  : "Xatolaringiz ustida ishlab, testni qaytadan topshiring."}
              </p>
            </div>
          )}

          {/* Current Question Container */}
          {questions[currentQIdx] && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#FF7A00] uppercase">
                  {currentQIdx < 3 ? "1-Bosqich: Asoslar" : currentQIdx < 6 ? "2-Bosqich: Mantiq" : "3-Bosqich: Chuqur tahlil"}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {questions[currentQIdx].question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {(questions[currentQIdx].options || []).map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQIdx] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() =>
                        setSelectedAnswers((prev) => ({ ...prev, [currentQIdx]: optIdx }))
                      }
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#FF2A85]/20 to-[#FF7A00]/20 border-[#FF2A85] text-white font-bold shadow-lg shadow-[#FF2A85]/10'
                          : 'bg-neutral-900/40 border-white/[0.06] text-neutral-300 hover:border-white/20 hover:bg-neutral-900/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <span
                          className={`w-7 h-7 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#FF2A85] text-white'
                              : 'bg-white/5 text-neutral-400 group-hover:text-white'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#FF2A85] bg-[#FF2A85]' : 'border-neutral-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Between Questions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={currentQIdx === 0}
                  onClick={() => setCurrentQIdx((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-full bg-white/5 text-neutral-400 hover:text-white text-xs font-semibold disabled:opacity-30"
                >
                  Oldingi
                </button>

                {currentQIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIdx((prev) => prev + 1)}
                    className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all"
                  >
                    Keyingi savol
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleQuizSubmit}
                    disabled={submittingQuiz || answeredCount < questions.length}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#FF2A85] bg-[length:200%_auto] text-white text-xs font-bold shadow-lg shadow-[#FF2A85]/25 disabled:opacity-50"
                  >
                    {submittingQuiz ? "Tekshirilmoqda..." : "Testni Yakunlash"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Step 3 Button if Passed */}
          {quizPassed && (
            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setActiveTab('interactive')}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-[#FF2A85]/25"
              >
                <span>3-Bosqich: Interaktiv Mashg'ulot</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STAGE 3: Interaktiv Juftliklar Mashg'uloti (Interactive Matching Game) */}
      {activeTab === 'interactive' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center space-x-2 text-[11px] font-bold text-[#00F0FF] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interaktiv Juftliklarni Topish</span>
              </div>
              <h3 className="text-xl font-black text-white mt-0.5">
                Termin va To'g'ri Ta'rifni Bog'lang
              </h3>
              <p className="text-xs text-neutral-400">
                Chap tomondagi terminga bosing, so'ngra o'ng tomondan unga mos ta'rifni tanlang.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <span className="font-mono text-xs font-bold text-emerald-400">
                Topildi: {matchedIds.length} / {pairs.length}
              </span>
              <button
                onClick={resetInteractive}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                title="Qayta boshlash"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Completion Celebration Card */}
          {interactiveCompleted && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 border border-emerald-500/30 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-white">
                  Tabriklaymiz! Dars To'liq Yakunlandi! 🎉
                </h4>
                <p className="text-xs text-neutral-300">
                  Barcha 3 bosqich (Nazariya, Test va Interaktiv o'yin) muvaffaqiyatli topshirildi va keyingi dars ochildi.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <Link
                  href="/student/curriculum"
                  className="px-8 py-3.5 rounded-full bg-white text-black font-extrabold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  Keyingi darsga o'tish →
                </Link>
              </div>
            </div>
          )}

          {/* Dual Columns: Left = Terms, Right = Definitions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
            
            {/* Column A: Terms */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider px-1">
                1. Terminlar:
              </h4>
              {pairs.map((p) => {
                const isMatched = matchedIds.includes(p.id);
                const isSelected = selectedTermId === p.id;
                const isWrong = wrongPair?.termId === p.id;

                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleTermClick(p.id)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-bold transition-all ${
                      isMatched
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default opacity-80'
                        : isWrong
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                        : isSelected
                        ? 'bg-cyan-500/20 border-[#00F0FF] text-white shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'bg-black/40 border-white/[0.06] text-white hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{p.term}</span>
                      {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Column B: Definitions */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider px-1">
                2. Ta'riflar:
              </h4>
              {shuffledDefinitions.map((p) => {
                const isMatched = matchedIds.includes(p.id);
                const isWrong = wrongPair?.defId === p.id;

                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isMatched || !selectedTermId}
                    onClick={() => handleDefinitionClick(p.id)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition-all ${
                      isMatched
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default opacity-80'
                        : isWrong
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                        : selectedTermId
                        ? 'bg-black/60 border-white/15 text-white hover:border-[#00F0FF] hover:scale-[1.01]'
                        : 'bg-black/20 border-white/[0.04] text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="leading-relaxed">{p.definition}</span>
                      {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
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
  Code2,
  HelpCircle,
  FileText,
  Send,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Layers,
  Lock,
} from 'lucide-react';

export default function StudentLessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'theory' | 'test' | 'practice' | 'activity'>('theory');

  // Test state (9 questions)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Practice state
  const [practiceText, setPracticeText] = useState('');
  const [submittingPractice, setSubmittingPractice] = useState(false);
  const [practiceSuccess, setPracticeSuccess] = useState(false);

  // Pairs matching interactive state
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

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

  const handleTheoryRead = async () => {
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
      setActiveTab('test');
    } catch (e) {
      console.error(e);
      setActiveTab('test');
    }
  };

  const handleTestSubmit = async () => {
    const questions = lesson?.testQuestions || [];
    const answersArray = questions.map((_: any, idx: number) =>
      typeof selectedAnswers[idx] === 'number' ? selectedAnswers[idx] : 0
    );

    try {
      setSubmittingTest(true);
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
        setTestResult(json.testEvaluation);
      } else {
        alert(json.error || "Testni tekshirishda xatolik yuz berdi");
      }
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setSubmittingTest(false);
    }
  };

  const handlePracticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceText.trim()) return;

    try {
      setSubmittingPractice(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/student/submit-progress', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          lessonId,
          practiceSubmissionText: practiceText,
          markPracticeCompleted: true,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPracticeSuccess(true);
      } else {
        alert(json.error || "Amaliyotni yuborishda xatolik");
      }
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setSubmittingPractice(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-[#FF2A85] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-400">Dars yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-neutral-900/60 border border-white/10 text-center space-y-4">
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

  const questions = lesson.testQuestions || [];
  const interactive = lesson.interactiveActivity || { pairs: [] };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Breadcrumb & Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <Link
            href="/student/curriculum"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>O'quv xaritasiga qaytish</span>
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
          <span className="text-xs font-bold text-[#FF7A00] uppercase tracking-wider">
            {lesson.order ? `${lesson.order}-Dars` : "Dars"} • {lesson.moduleId?.title || "Modul"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 max-w-2xl">
              {lesson.description}
            </p>
          )}
        </div>

        {/* 4 Interactive Mode Tabs */}
        <div className="flex items-center space-x-2 pt-2 border-t border-white/[0.06] overflow-x-auto">
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeTab === 'theory'
                ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md shadow-[#FF2A85]/20'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Nazariya</span>
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeTab === 'test'
                ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md shadow-[#FF2A85]/20'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>2. Test (9 savol)</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeTab === 'practice'
                ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md shadow-[#FF2A85]/20'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>3. Amaliyot</span>
          </button>

          {interactive?.pairs?.length > 0 && (
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                activeTab === 'activity'
                  ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md shadow-[#FF2A85]/20'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>4. Interaktiv</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Nazariya / Theory */}
      {activeTab === 'theory' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-6">
          <div className="prose prose-invert max-w-none text-neutral-300 text-sm leading-relaxed space-y-4 whitespace-pre-wrap">
            {lesson.theoryContent || "Ushbu dars uchun nazariy ma'lumotlar kiritilmoqda..."}
          </div>

          <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Nazariyani to'liq o'qib chiqqaningizdan so'ng keyingi bosqich testga o'ting.
            </span>
            <button
              onClick={handleTheoryRead}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF] text-white font-bold text-xs shadow-lg shadow-[#FF2A85]/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
            >
              <span>Testga o'tish</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Test (9 Questions divided into 3 rounds) */}
      {activeTab === 'test' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-8">
          
          {/* Test Evaluation Result Banner */}
          {testResult && (
            <div
              className={`p-6 rounded-2xl border ${
                testResult.passed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              } space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-base flex items-center gap-2">
                  {testResult.passed ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Tabriklaymiz! Testdan muvaffaqiyatli o'tdingiz!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>Test topshirilmadi (O'tish bali: kamida 8/9)</span>
                    </>
                  )}
                </span>
                <span className="text-xl font-black font-mono">
                  {testResult.correctCount} / {testResult.totalQuestions}
                </span>
              </div>
              <p className="text-xs opacity-90">
                {testResult.passed
                  ? "Siz dars testini a'lo darajada bajardingiz! Endi amaliy topshiriqqa o'tishingiz mumkin."
                  : "Xatolaringiz ustida ishlab, dars nazariyasini qayta ko'rib chiqing va testni qaytadan topshiring."}
              </p>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {questions.map((q: any, qIdx: number) => {
              const selectedOpt = selectedAnswers[qIdx];
              return (
                <div
                  key={qIdx}
                  className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-mono font-bold text-[#00F0FF]">
                      Savol {qIdx + 1} / {questions.length}
                    </span>
                    <span className="text-[10px] text-neutral-500 uppercase">
                      {qIdx < 3 ? "1-Bosqich: Asoslar" : qIdx < 6 ? "2-Bosqich: Amaliyot" : "3-Bosqich: Chuqur tahlil"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-relaxed">
                    {q.question}
                  </h4>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    {(q.options || []).map((opt: string, optIdx: number) => {
                      const isSelected = selectedOpt === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() =>
                            setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                          }
                          className={`w-full p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#FF2A85]/20 to-[#FF7A00]/20 border-[#FF2A85] text-white font-semibold'
                              : 'bg-white/[0.02] border-white/5 text-neutral-300 hover:bg-white/[0.05]'
                          }`}
                        >
                          <span>{opt}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-[#FF2A85] bg-[#FF2A85]'
                                : 'border-neutral-600'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Test Submit Button */}
          <div className="pt-4 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Barcha 9 ta savolga javob belgilab, natijani tekshirish tugmasini bosing.
            </span>
            <button
              onClick={handleTestSubmit}
              disabled={submittingTest}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#FF2A85] bg-[length:200%_auto] hover:bg-right text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#FF2A85]/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {submittingTest ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Natijani tekshirish</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Amaliyot / Practical assignment */}
      {activeTab === 'practice' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#00F0FF]" /> Amaliy Vazifa Ko'rsatmalari
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Dars mavzusiga doir amaliy topshiriq kodini yozing, GitHub repository havolasini yoki javob matnini kiritib topshiring.
            </p>
          </div>

          {practiceSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Amaliy topshiriq muvaffaqiyatli qabul qilindi!</span>
              </div>
              <p className="text-xs opacity-90">
                Ustozingiz yoki mentor tomonidan tekshiriladi va baholanadi.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePracticeSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Topshiriq hisoboti / GitHub havolasi / Kod
                </label>
                <textarea
                  rows={6}
                  required
                  value={practiceText}
                  onChange={(e) => setPracticeText(e.target.value)}
                  placeholder="GitHub repo havolasi yoki topshiriq yechimi..."
                  className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white font-mono text-xs placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/30 focus:border-[#00F0FF]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-400">
                  Topshirish tugmasini bosishingiz bilan progress yangilanadi.
                </span>
                <button
                  type="submit"
                  disabled={submittingPractice}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white font-bold text-xs shadow-lg shadow-[#FF2A85]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  {submittingPractice ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Topshirish</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 4: Interactive Activity (Matching Pairs) */}
      {activeTab === 'activity' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF2A85]" /> {interactive.title || "Juftliklarni Bog'lang"}
            </h3>
            <p className="text-xs text-neutral-400">
              {interactive.instructions || "Termin va uning to'g'ri ta'rifini tanlang."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(interactive.pairs || []).map((p: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2"
              >
                <div className="text-xs font-mono font-bold text-[#00F0FF]">
                  {p.term}
                </div>
                <div className="text-xs text-neutral-300">
                  {p.definition}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
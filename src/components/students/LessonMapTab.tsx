'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Lock,
  Unlock,
  CheckCircle2,
  PlayCircle,
  Award,
  Coins,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ClipboardCheck,
  Code,
  FileText,
  AlertCircle,
  Flag,
} from 'lucide-react';

interface LessonItem {
  _id: string;
  moduleId: string;
  title: string;
  order: number;
  description?: string;
  status: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';
  prerequisiteMet?: boolean;
  isStarting: boolean;
  isCurrent: boolean;
  theoryRead: boolean;
  testPassed: boolean;
  testScore: number;
  testAttempts: number;
  practiceCompleted: boolean;
  xpReward: number;
  xcoinReward: number;
  totalQuestions: number;
}

interface ModuleItem {
  _id: string;
  title: string;
  order: number;
  description?: string;
  lessons: LessonItem[];
  completedCount: number;
  totalCount: number;
  completionPercent: number;
}

interface LessonMapTabProps {
  studentId: string;
  courseName?: string;
  onRefreshStudent?: () => void;
}

export default function LessonMapTab({ studentId, courseName, onRefreshStudent }: LessonMapTabProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    progress: any;
    modules: ModuleItem[];
  } | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Test modal state
  const [testModalLesson, setTestModalLesson] = useState<any | null>(null);
  const [testLessonDetails, setTestLessonDetails] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(9).fill(0));
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Practice modal state
  const [practiceModalLesson, setPracticeModalLesson] = useState<any | null>(null);
  const [practiceSubmission, setPracticeSubmission] = useState('');
  const [practiceSubmitting, setPracticeSubmitting] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, [studentId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/students/${studentId}/progress`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        // Expand all modules by default
        const exp: Record<string, boolean> = {};
        (json.modules || []).forEach((m: ModuleItem) => {
          exp[m._id] = true;
        });
        setExpandedModules(exp);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleUnlockLesson = async (lessonId: string) => {
    try {
      setActionLoading(`unlock-${lessonId}`);
      const res = await fetch(`/api/students/${studentId}/progress/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });
      const resJson = await res.json();
      if (res.ok) {
        await fetchProgress();
        if (onRefreshStudent) onRefreshStudent();
      } else {
        alert(resJson.error || 'Darsni ochishda xatolik');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetStartLesson = async (lessonId: string) => {
    if (!confirm("Ushbu darsni talaba uchun boshlang'ich dars qilib belgilamoqchimisiz?")) return;
    try {
      setActionLoading(`start-${lessonId}`);
      const res = await fetch(`/api/students/${studentId}/progress/set-start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });
      const resJson = await res.json();
      if (res.ok) {
        await fetchProgress();
        if (onRefreshStudent) onRefreshStudent();
      } else {
        alert(resJson.error || "Boshlang'ich darsni belgilashda xatolik");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const openTestModal = async (lesson: LessonItem) => {
    if (lesson.status !== 'COMPLETED' && lesson.prerequisiteMet === false) {
      alert("Ushbu dars ochilgan, lekin oldingi dars hali to'liq yakunlanmagan. Avval oldingi darsni bajaring, shundan so'ng bu dars to'liq faollashadi.");
      return;
    }
    setTestModalLesson(lesson);
    setTestResult(null);
    setSelectedAnswers(new Array(9).fill(0));
    try {
      const res = await fetch(`/api/lessons/${lesson._id}`);
      if (res.ok) {
        const j = await res.json();
        setTestLessonDetails(j.lesson);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestSubmit = async () => {
    if (!testModalLesson) return;
    try {
      setTestSubmitting(true);
      const res = await fetch(`/api/students/${studentId}/progress/test-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: testModalLesson._id,
          answers: selectedAnswers,
          markTheoryRead: true,
        }),
      });
      const json = await res.json();
      setTestResult(json);
      if (res.ok) {
        await fetchProgress();
        if (onRefreshStudent) onRefreshStudent();
      } else {
        alert(json.error || 'Test tekshirishda xatolik');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setTestSubmitting(false);
    }
  };

  const openPracticeModal = (lesson: LessonItem) => {
    if (lesson.status !== 'COMPLETED' && lesson.prerequisiteMet === false) {
      alert("Ushbu dars ochilgan, lekin oldingi dars hali to'liq yakunlanmagan. Avval oldingi darsni bajaring, shundan so'ng bu dars to'liq faollashadi.");
      return;
    }
    setPracticeModalLesson(lesson);
    setPracticeSubmission('Amaliy vazifa topshirildi va tekshirildi');
  };

  const handlePracticeSubmit = async () => {
    if (!practiceModalLesson) return;
    try {
      setPracticeSubmitting(true);
      const res = await fetch(`/api/students/${studentId}/progress/practice-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: practiceModalLesson._id,
          submissionText: practiceSubmission,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setPracticeModalLesson(null);
        await fetchProgress();
        if (onRefreshStudent) onRefreshStudent();
      } else {
        alert(json.error || 'Amaliyotni topshirishda xatolik');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setPracticeSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-card text-center py-12 text-slate-400">
        O'quv xaritasi yuklanmoqda...
      </div>
    );
  }

  if (!data || !data.modules || data.modules.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-card text-center py-12 space-y-3">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-700">O'quv dasturi hali kiritilmagan</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Ushbu kurs ({courseName || 'Kurs'}) uchun hali modullar va darslar yaratilmagan.
          Kurslar bo'limidan modul va darslarni qo'shishingiz mumkin.
        </p>
      </div>
    );
  }

  const { progress, modules } = data;

  return (
    <div className="space-y-6">
      {/* Gamification & Progress Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Daraja: {progress.level || 1}
            </span>
            <span className="text-xs text-slate-400 font-semibold">• {courseName || 'Kurs'}</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">O'quv Taraqqiyoti va Xaritasi</h2>
          <p className="text-xs text-slate-400">
            Darslar ketma-ketligi: Nazariya &rarr; 9 savolli Test (&ge; 8/9 o'tish bali) &rarr; Amaliy topshiriq.
          </p>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700 px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Jami XP</p>
              <p className="text-lg font-black text-amber-400">{progress.xp || 0}</p>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">XCoin Balansi</p>
              <p className="text-lg font-black text-orange-400">{progress.xcoin || 0}</p>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Tugatilgan</p>
              <p className="text-lg font-black text-emerald-400">
                {progress.completedCount} / {progress.totalCount} ({progress.percentage}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules and Lessons Tree */}
      <div className="space-y-4">
        {modules.map((mod) => {
          const isExpanded = expandedModules[mod._id] !== false;
          return (
            <div
              key={mod._id}
              className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden transition-all"
            >
              {/* Module Header Bar */}
              <div
                onClick={() => toggleModule(mod._id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                    {mod.order}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{mod.title}</h3>
                    {mod.description && <p className="text-xs text-slate-400">{mod.description}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-slate-500">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all rounded-full"
                        style={{ width: `${mod.completionPercent}%` }}
                      />
                    </div>
                    <span>
                      {mod.completedCount}/{mod.totalCount} ({mod.completionPercent}%)
                    </span>
                  </div>

                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Module Lessons List */}
              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">
                  {mod.lessons.length === 0 ? (
                    <div className="p-4 text-xs text-slate-400 italic text-center">
                      Ushbu modulda hozircha darslar mavjud emas
                    </div>
                  ) : (
                    mod.lessons.map((lesson) => {
                      const isLocked = lesson.status === 'LOCKED';
                      const isCompleted = lesson.status === 'COMPLETED';
                      const isInProgress = lesson.status === 'IN_PROGRESS';
                      const isUnlocked = lesson.status === 'UNLOCKED';

                      return (
                        <div
                          key={lesson._id}
                          className={`p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                            isCompleted
                              ? 'bg-emerald-50/20'
                              : isInProgress
                              ? 'bg-amber-50/30'
                              : isUnlocked
                              ? 'bg-blue-50/20'
                              : 'bg-slate-50/40 opacity-75'
                          }`}
                        >
                          {/* Lesson Info */}
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-500 text-white'
                                  : isInProgress
                                  ? 'bg-amber-500 text-white'
                                  : isUnlocked
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : isLocked ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900">
                                  {lesson.order}-dars: {lesson.title}
                                </span>

                                {lesson.isStarting && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                                    <Flag className="w-3 h-3" /> Boshlang'ich nuqta
                                  </span>
                                )}

                                {lesson.isCurrent && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200">
                                    Joriy dars
                                  </span>
                                )}

                                {isUnlocked && !isCompleted && lesson.prerequisiteMet === false ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-amber-600" /> OCHILGAN (Oldingi dars kutilmoqda)
                                  </span>
                                ) : (
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                      isCompleted
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : isInProgress
                                        ? 'bg-amber-100 text-amber-800'
                                        : isUnlocked
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {isCompleted
                                      ? 'YAKUNLANGAN'
                                      : isInProgress
                                      ? "O'RGANILMOQDA"
                                      : isUnlocked
                                      ? 'OCHIQ'
                                      : 'QULFLANGAN'}
                                  </span>
                                )}
                              </div>

                              {lesson.description && (
                                <p className="text-xs text-slate-500 line-clamp-1">{lesson.description}</p>
                              )}

                              {/* Stage indicators */}
                              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-slate-600">
                                <span className="inline-flex items-center gap-1 text-slate-500">
                                  <FileText className="w-3.5 h-3.5" />
                                  Nazariya: {lesson.theoryRead ? '✅ O\'qildi' : 'Jarayonda'}
                                </span>

                                <span
                                  className={`inline-flex items-center gap-1 ${
                                    lesson.testPassed ? 'text-emerald-600 font-bold' : 'text-slate-500'
                                  }`}
                                >
                                  <ClipboardCheck className="w-3.5 h-3.5" />
                                  Test (3x3=9):{' '}
                                  {lesson.testPassed
                                    ? `✅ O'tildi (${lesson.testScore}/9)`
                                    : lesson.testAttempts > 0
                                    ? `⚠️ ${lesson.testScore}/9 (O'tilmadi)`
                                    : 'Topshirilmagan'}
                                </span>

                                <span
                                  className={`inline-flex items-center gap-1 ${
                                    lesson.practiceCompleted ? 'text-emerald-600 font-bold' : 'text-slate-500'
                                  }`}
                                >
                                  <Code className="w-3.5 h-3.5" />
                                  Amaliyot: {lesson.practiceCompleted ? '✅ Bajarildi' : 'Kutilmoqda'}
                                </span>

                                <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                                  <Sparkles className="w-3 h-3" /> +{lesson.xpReward} XP / +{lesson.xcoinReward} XCoin
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons for Teacher / Admin */}
                          <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                            {isLocked ? (
                              <button
                                onClick={() => handleUnlockLesson(lesson._id)}
                                disabled={actionLoading === `unlock-${lesson._id}`}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-all"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                                <span>{actionLoading === `unlock-${lesson._id}` ? 'Ochilmoqda...' : 'Darsni ochish'}</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => openTestModal(lesson)}
                                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center space-x-1 transition-all"
                                >
                                  <ClipboardCheck className="w-3.5 h-3.5" />
                                  <span>Test sinovi (9 savol)</span>
                                </button>

                                {!isCompleted && (
                                  <button
                                    onClick={() => openPracticeModal(lesson)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1 transition-all"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Amaliyotni yakunlash</span>
                                  </button>
                                )}
                              </>
                            )}

                            {!lesson.isStarting && (
                              <button
                                onClick={() => handleSetStartLesson(lesson._id)}
                                disabled={actionLoading === `start-${lesson._id}`}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
                                title="Boshlang'ich dars qilib belgilash (avvalgi darslar hisobga olinmaydi)"
                              >
                                <Flag className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Test Modal (9 Questions: 3 rounds x 3 questions) */}
      {testModalLesson && testLessonDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {testLessonDetails.order}-dars: {testLessonDetails.title} — Test Sinovi
                </h3>
                <p className="text-xs text-slate-500">
                  3 ta bosqich &times; 3 ta savol = jami 9 ta savol. O'tish bali: kamida 8/9 to'g'ri javob.
                </p>
              </div>
              <button
                onClick={() => setTestModalLesson(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                &times;
              </button>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-2xl border text-xs font-bold space-y-1 ${
                  testResult.passed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {testResult.passed ? '🎉 Muvaffaqiyatli topshirildi!' : "⚠️ O'tish bali yetarli emas!"}
                  </span>
                  <span className="font-black text-base font-mono">
                    {testResult.score} / {testResult.maxScore} (Talab: &ge; {testResult.passingThreshold})
                  </span>
                </div>
                <p className="text-slate-600 font-normal">{testResult.message}</p>
                {testResult.xpEarned > 0 && (
                  <p className="text-emerald-700 font-extrabold">
                    +{testResult.xpEarned} XP va +{testResult.xcoinEarned} XCoin taqdirlandi!
                  </p>
                )}
              </div>
            )}

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {[1, 2, 3].map((roundNum) => {
                const roundQuestions = (testLessonDetails.testQuestions || []).filter(
                  (q: any, i: number) => (q.round || Math.floor(i / 3) + 1) === roundNum
                );

                return (
                  <div key={roundNum} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <h4 className="font-extrabold text-xs text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                        {roundNum}
                      </span>
                      {roundNum}-Bosqich Savollari (3 ta)
                    </h4>

                    {roundQuestions.map((q: any, qIndex: number) => {
                      const globalIndex = (roundNum - 1) * 3 + qIndex;
                      return (
                        <div key={globalIndex} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <p className="font-bold text-xs text-slate-800">
                            {globalIndex + 1}. {q.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {(q.options || []).map((opt: string, optIndex: number) => (
                              <label
                                key={optIndex}
                                className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                  selectedAnswers[globalIndex] === optIndex
                                    ? 'bg-blue-50 border-blue-400 font-bold text-blue-900'
                                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question_${globalIndex}`}
                                  checked={selectedAnswers[globalIndex] === optIndex}
                                  onChange={() => {
                                    const next = [...selectedAnswers];
                                    next[globalIndex] = optIndex;
                                    setSelectedAnswers(next);
                                  }}
                                  className="text-blue-600"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-semibold">
                Barcha 9 ta savolga server tekshiruvi asosida baho beriladi.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTestModalLesson(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Yopish
                </button>
                <button
                  onClick={handleTestSubmit}
                  disabled={testSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>{testSubmitting ? 'Tekshirilmoqda...' : 'Javoblarni Tekshirish'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Practice Modal */}
      {practiceModalLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Amaliy Vazifani Tasdiqlash: {practiceModalLesson.title}
              </h3>
              <button
                onClick={() => setPracticeModalLesson(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Talaba nazariya va testdan o'tgandan so'ng amaliy vazifani bajarganini tasdiqlang. Dars to'liq yakunlanadi va talabaga yakuniy bonus XP beriladi.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Amaliyot natijasi / Izoh / Havola:
                </label>
                <textarea
                  rows={3}
                  value={practiceSubmission}
                  onChange={(e) => setPracticeSubmission(e.target.value)}
                  placeholder="Vazifa amalda ko'rib chiqildi va qabul qilindi..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPracticeModalLesson(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Bekor qilish
              </button>
              <button
                onClick={handlePracticeSubmit}
                disabled={practiceSubmitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{practiceSubmitting ? 'Saqlanmoqda...' : 'Tasdiqlash va Darsni Yakunlash'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

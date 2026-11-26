'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  Play,
  ChevronDown,
  ChevronRight,
  Flame,
  Coins,
  Award,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function StudentCurriculumPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/student/curriculum', { headers });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        // Expand all modules by default
        const exp: Record<string, boolean> = {};
        (json.modules || []).forEach((m: any) => {
          exp[m._id] = true;
        });
        setExpandedModules(exp);
      }
    } catch (e) {
      console.error('Curriculum error:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-400">O'quv dasturi xaritasi yuklanmoqda...</p>
      </div>
    );
  }

  const course = data?.course || { name: 'Dasturlash kursi' };
  const modules = data?.modules || [];
  const totalLessons = modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);
  const completedLessons = modules.reduce(
    (sum: number, m: any) =>
      sum + (m.lessons?.filter((l: any) => l.status === 'COMPLETED').length || 0),
    0
  );
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF2A85]/15 to-[#00F0FF]/15 border border-white/10 px-3.5 py-1 rounded-full text-[11px] font-bold text-[#00F0FF]">
            <BookOpen className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>O'QUV DASTURI VA XARITA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{course.name}</h1>
          <p className="text-xs text-neutral-400">
            {completedLessons} / {totalLessons} dars muvaffaqiyatli topshirildi • {percent}% yakunlandi
          </p>
        </div>

        {/* Circular / Pill progress */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="block text-2xl font-black text-[#00F0FF]">{percent}%</span>
            <span className="text-[10px] text-neutral-400 font-medium">Bajarilgan</span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 p-2 flex items-center justify-center">
            <div className="text-center font-mono font-bold text-xs text-white">
              {completedLessons}/{totalLessons}
            </div>
          </div>
        </div>
      </div>

      {/* Modules & Lessons Accordion List */}
      <div className="space-y-4">
        {modules.map((mod: any, mIdx: number) => {
          const isExpanded = !!expandedModules[mod._id];
          const modCompleted = (mod.lessons || []).filter((l: any) => l.status === 'COMPLETED').length;
          const modTotal = (mod.lessons || []).length;
          const modPercent = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;

          return (
            <div
              key={mod._id}
              className="rounded-3xl bg-neutral-900/40 border border-white/[0.08] overflow-hidden backdrop-blur-2xl transition-all shadow-xl"
            >
              {/* Module Header Bar */}
              <button
                onClick={() => toggleModule(mod._id)}
                className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center font-mono font-bold text-sm text-[#00F0FF]">
                    {mIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {modCompleted} / {modTotal} dars yakunlangan • {modPercent}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="hidden sm:inline-block text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/[0.04] text-neutral-300 border border-white/10">
                    {modPercent}%
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
              </button>

              {/* Module Lessons List */}
              {isExpanded && (
                <div className="p-3 sm:p-5 pt-0 space-y-2 border-t border-white/[0.04]">
                  {(mod.lessons || []).map((lesson: any) => {
                    const isCompleted = lesson.status === 'COMPLETED';
                    const isInProgress = lesson.status === 'IN_PROGRESS';
                    const isUnlocked = lesson.status === 'UNLOCKED';
                    const isLocked = lesson.status === 'LOCKED';
                    const isAccessible = !isLocked;

                    return (
                      <div
                        key={lesson._id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCompleted
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : isInProgress
                            ? 'bg-amber-500/5 border-amber-500/30 shadow-lg shadow-amber-500/5'
                            : isUnlocked
                            ? 'bg-cyan-500/5 border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                            : 'bg-black/30 border-white/[0.04] opacity-60'
                        }`}
                      >
                        <div className="flex items-start sm:items-center space-x-3 min-w-0">
                          {/* Status Icon Indicator */}
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                : isInProgress
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                : isUnlocked
                                ? 'bg-[#00F0FF] text-black shadow-md shadow-cyan-500/30'
                                : 'bg-neutral-800 text-neutral-500'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : isInProgress ? (
                              <Play className="w-4 h-4 fill-white" />
                            ) : isUnlocked ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-xs sm:text-sm text-white truncate">
                                {lesson.order}-dars: {lesson.title}
                              </span>
                              {lesson.isStarting && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Boshlang'ich
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 line-clamp-1">
                              {lesson.description || "Nazariya, quiz test va interaktiv mashg'ulot"}
                            </p>
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                          {/* XP / Coin tags */}
                          <div className="hidden md:flex items-center space-x-2 text-[10px] text-neutral-400 font-mono pr-2">
                            <span>+{lesson.xpReward || 50} XP</span>
                            <span>+{lesson.xcoinReward || 10} Coin</span>
                          </div>

                          {isAccessible ? (
                            <Link
                              href={`/student/lesson/${lesson._id}`}
                              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center space-x-1 ${
                                isCompleted
                                  ? 'bg-white/10 hover:bg-white/20 text-white'
                                  : isInProgress
                                  ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/25'
                                  : 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md shadow-[#FF2A85]/20'
                              }`}
                            >
                              <span>{isCompleted ? "Ko'rib chiqish" : "Boshlash"}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-neutral-900 border border-white/5 text-neutral-500 text-xs font-medium cursor-not-allowed">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Yopiq</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
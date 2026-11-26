'use client';

import React from 'react';
import Link from 'next/link';
import { useStudent } from './layout';
import {
  Play,
  CheckCircle2,
  Lock,
  Flame,
  Coins,
  Award,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { studentData, loading } = useStudent();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-[#FF2A85] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-400">Talaba paneli yuklanmoqda...</p>
      </div>
    );
  }

  const student = studentData?.student || {};
  const progress = studentData?.progress || { xp: 0, xcoin: 0, level: 1 };
  const currentLesson = studentData?.currentLesson || studentData?.startingLesson;
  const totalLessons = studentData?.totalLessonsCount || 0;
  const completedLessons = studentData?.completedLessonsCount || 0;
  const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const attendanceRate = studentData?.attendanceRate || 100;
  const upcomingEvents = studentData?.events || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Hero Welcome Card with GTA VI Sunset Glow */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900/40 border border-white/[0.08] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#FF2A85]/20 to-[#00F0FF]/15 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF2A85]/15 to-[#00F0FF]/15 border border-white/10 px-3 py-1 rounded-full text-[11px] font-bold text-[#00F0FF] backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#FF2A85]" />
              <span>O'QUVCHI BOSHQARUVI</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Salom, {student.firstName || "Talaba"}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              Kurs: <span className="font-semibold text-neutral-200">{student.courseName || student.courseId?.name || "IT Yo'nalishi"}</span> • Guruh: <span className="font-semibold text-neutral-200">{student.groupName || student.groupId?.name || "Asosiy"}</span>
            </p>
          </div>

          {/* Quick Action Button to continue active lesson */}
          {currentLesson && (
            <Link
              href={`/student/lesson/${currentLesson._id}`}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#FF2A85] bg-[length:200%_auto] hover:bg-right transition-all duration-300 text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#FF2A85]/25 active:scale-95 group shrink-0"
            >
              <Play className="w-4 h-4 mr-2 fill-white" />
              <span>Darsni Davom Ettirish</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>

      {/* 4 Apple Squircle Bento Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* XP */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-xl flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-neutral-400">To'plangan XP</span>
            <span className="text-lg sm:text-2xl font-black text-white">{progress.xp || 0}</span>
          </div>
        </div>

        {/* XCoin */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-xl flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#00F0FF] flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-neutral-400">InFast XCoin</span>
            <span className="text-lg sm:text-2xl font-black text-[#00F0FF]">{progress.xcoin || 0}</span>
          </div>
        </div>

        {/* Level */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-xl flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-neutral-400">Daraja</span>
            <span className="text-lg sm:text-2xl font-black text-white">{progress.level || 1}-Daraja</span>
          </div>
        </div>

        {/* Progress % */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-xl flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[11px] font-medium text-neutral-400">O'zlashtirish</span>
            <span className="text-lg sm:text-2xl font-black text-emerald-400">{completionPercent}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Lesson & Next Lessons + Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Lesson Details & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Lesson Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-[#00F0FF]" /> Joriy Dars
              </span>
              <span className="text-xs text-neutral-400">
                {completedLessons} / {totalLessons} dars yakunlangan
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, completionPercent))}%` }}
              />
            </div>

            {currentLesson ? (
              <div className="p-5 rounded-2xl bg-neutral-950/60 border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#FF7A00]">
                    {currentLesson.order ? `${currentLesson.order}-Dars` : "Dars"}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {currentLesson.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {currentLesson.description || "Ushbu dars nazariyasi, testi va amaliy topshirig'ini yakunlang."}
                  </p>
                </div>

                <Link
                  href={`/student/lesson/${currentLesson._id}`}
                  className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shrink-0 active:scale-95"
                >
                  Ochish
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-neutral-400">
                Hozircha faol dars mavjud emas yoki kurs yakunlangan.
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] text-xs">
              <Link
                href="/student/curriculum"
                className="text-[#00F0FF] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Barcha darslar xaritasini ko'rish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Access Grid: Curriculum, Leaderboard, Shop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/student/curriculum"
              className="p-5 rounded-2xl bg-neutral-900/30 hover:bg-neutral-900/60 border border-white/[0.06] hover:border-white/20 transition-all space-y-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">O'quv Xaritasi</h4>
              <p className="text-xs text-neutral-400">Modullar va barcha darslar ro'yxati</p>
            </Link>

            <Link
              href="/student/leaderboard"
              className="p-5 rounded-2xl bg-neutral-900/30 hover:bg-neutral-900/60 border border-white/[0.06] hover:border-white/20 transition-all space-y-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Reyting & Top</h4>
              <p className="text-xs text-neutral-400">Guruh va filial talabalari reytingi</p>
            </Link>

            <Link
              href="/student/shop"
              className="p-5 rounded-2xl bg-neutral-900/30 hover:bg-neutral-900/60 border border-white/[0.06] hover:border-white/20 transition-all space-y-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-[#00F0FF] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Coins className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">XCoin Do'koni</h4>
              <p className="text-xs text-neutral-400">Merchlar va sovg'alarni xarid qilish</p>
            </Link>
          </div>
        </div>

        {/* Right Col: Attendance & Academy Events */}
        <div className="space-y-6">
          {/* Attendance Stats Card */}
          <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Davomat Ko'rsatkichi
            </h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/[0.04]">
              <div>
                <span className="block text-2xl font-black text-emerald-400">{attendanceRate}%</span>
                <span className="text-[11px] text-neutral-400 font-medium">Umumiy qatnashish</span>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-neutral-200">
                  {student.groupId?.schedules || "Dush - Chor - Juma"}
                </span>
                <span className="text-[11px] text-neutral-400">Dars jadvali</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Darslarni muntazam qoldirmasdan qatnashish yuqori o'zlashtirish va sertifikat olish kafolatidir.
            </p>
          </div>

          {/* Upcoming Events Mini Widget */}
          <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF2A85]" /> Yaqin Tadbirlar
              </h3>
              <Link href="/student/events" className="text-[11px] text-[#00F0FF] hover:underline font-semibold">
                Hammasi
              </Link>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 2).map((evt: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.04] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white truncate pr-2">{evt.title}</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00F0FF] text-[10px] font-bold shrink-0">
                        +{evt.coinReward || 500} coin
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">{evt.location || "InFast Bosh Filiali"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 text-center py-4">Yaqin orada tadbirlar rejalashtirilmagan</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
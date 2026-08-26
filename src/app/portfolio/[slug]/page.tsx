'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Code2,
  ExternalLink,
  Github,
  Linkedin,
  Send,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  BookOpen,
  UserCheck,
  Briefcase,
  Mail,
  Phone,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function PublicStudentPortfolioPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHireModal, setShowHireModal] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPortfolio();
    }
  }, [slug]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`/api/public/portfolio/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data.portfolio);
      } else {
        const err = await res.json();
        setError(err.error || "Portfolio topilmadi");
      }
    } catch (e: any) {
      setError("Tarmoq xatoligi");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400 font-sans tracking-wide uppercase">
            Talaba Portfoliosi Yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 shadow-2xl text-center space-y-5 border border-slate-800">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Portfolio Topilmadi</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {error || "Kiritilgan havola bo'yicha talaba portfoliosi mavjud emas yoki o'chirilgan."}
          </p>
          <Link
            href="/portfolio"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Barcha Talabalar Portfoliosi</span>
          </Link>
        </div>
      </div>
    );
  }

  const courseName = portfolio.course?.name || 'IT Mutaxassis';
  const groupName = portfolio.group?.name || 'Guruh';
  const stats = portfolio.stats || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Background Glow Accents */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/portfolio" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-emerald-500/20">
              IF
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight uppercase">INFAST ACADEMY</span>
              <span className="block text-[9px] text-emerald-400 font-mono">TALABALAR PORTFOLIOLARI</span>
            </div>
          </Link>

          <button
            onClick={() => setShowHireModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
          >
            <Briefcase className="w-4 h-4" />
            <span>Ishga Taklif Qilish</span>
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8 relative z-10">
        {/* Student Profile Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none">
            <Code2 className="w-64 h-64" />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar / Photo */}
              {portfolio.avatarUrl ? (
                <img
                  src={portfolio.avatarUrl}
                  alt={portfolio.firstName}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/10 shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-3xl flex items-center justify-center border-2 border-emerald-400/40 shadow-xl shadow-emerald-500/20 shrink-0">
                  {portfolio.firstName[0]}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>INFAST VERIFIED STUDENT</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold font-mono">
                    {groupName}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {portfolio.firstName} {portfolio.lastName}
                </h1>

                <p className="text-sm font-semibold text-emerald-400 font-sans">
                  {courseName}
                </p>

                {portfolio.bio && (
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed pt-1">
                    {portfolio.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Social & Contact Links */}
            <div className="flex items-center space-x-2 shrink-0 self-stretch sm:self-auto justify-start">
              {portfolio.githubUrl && (
                <a
                  href={portfolio.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors"
                  title="GitHub Profile"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {portfolio.linkedinUrl && (
                <a
                  href={portfolio.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-xl border border-slate-700 transition-colors"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {portfolio.telegramUsername && (
                <a
                  href={`https://t.me/${portfolio.telegramUsername.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 rounded-xl border border-slate-700 transition-colors"
                  title="Telegram"
                >
                  <Send className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Verified Performance Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center space-y-1 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dars Davomati</p>
            <p className="text-xl font-black text-emerald-400 font-mono">
              {stats.attendancePercentage}%
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center space-y-1 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Imtihon Balli (Avg)</p>
            <p className="text-xl font-black text-sky-400 font-mono">
              {stats.avgExamPercentage}%
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center space-y-1 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topshirilgan Loyihalar</p>
            <p className="text-xl font-black text-amber-400 font-mono">
              {stats.completedProjectsCount} ta
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center space-y-1 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Akademiya Statusi</p>
            <p className="text-xs font-bold text-emerald-400 font-mono pt-1">
              ✓ FAOL TALABA
            </p>
          </div>
        </div>

        {/* Skills Section */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-extrabold text-white">Texnik Ko'nikmalar & Texnologiyalar</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold font-mono shadow-sm hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects Showcase Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-extrabold text-white">Bajarilgan Portfolio Loyihalari</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {portfolio.projects?.length || 0} ta loyiha
            </span>
          </div>

          {(!portfolio.projects || portfolio.projects.length === 0) ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
              Ushbu talaba hali o'z loyihalarini joylamagan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {portfolio.projects.map((proj: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 space-y-4 shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <h3 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Tech Badges */}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {proj.technologies.map((t: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-300 text-[10px] font-bold font-mono border border-slate-700/60"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* External Links */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center space-x-3">
                    {proj.liveDemo && (
                      <a
                        href={proj.liveDemo}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {proj.githubRepo && (
                      <a
                        href={proj.githubRepo}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-slate-700"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>GitHub Code</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal: Hire / Contact Student */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-800 space-y-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Ishga Taklif Qilish</h3>
              </div>
              <button
                onClick={() => setShowHireModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-white">{portfolio.firstName} {portfolio.lastName}</strong> bilan bog'lanish va vakansiya yoki amaliyot bo'yicha taklif berish uchun:
              </p>

              <div className="space-y-2 font-mono pt-2">
                {portfolio.telegramUsername && (
                  <a
                    href={`https://t.me/${portfolio.telegramUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-between border border-slate-700 text-sky-400 font-bold transition-colors"
                  >
                    <span>Telegram: @{portfolio.telegramUsername.replace('@', '')}</span>
                    <Send className="w-4 h-4" />
                  </a>
                )}

                <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 space-y-1">
                  <p className="text-[10px] text-slate-400">INFAST IT Academy Bo'limi:</p>
                  <p className="text-white font-bold font-sans">Tel: +998 (90) 271-00-27</p>
                  <p className="text-[10px] text-emerald-400 font-sans">Email: hr@infast.uz</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHireModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

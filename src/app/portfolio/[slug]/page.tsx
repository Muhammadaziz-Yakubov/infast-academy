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
  Zap,
  X,
  Loader2,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

export default function PublicStudentPortfolioPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHireModal, setShowHireModal] = useState(false);

  // Hire Form State
  const [hireFormData, setHireFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    roleNeeded: 'Frontend Dasturchi',
    notes: '',
  });
  const [submittingHire, setSubmittingHire] = useState(false);
  const [hireSuccessMessage, setHireSuccessMessage] = useState('');

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

        const courseNameLower = (data.portfolio?.course?.name || '').toLowerCase();
        const isBackend = courseNameLower.includes('backend');
        setHireFormData(prev => ({
          ...prev,
          roleNeeded: isBackend ? 'Backend Dasturchi' : 'Frontend Dasturchi',
        }));
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

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingHire(true);
    setHireSuccessMessage('');
    try {
      const res = await fetch('/api/public/hire-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...hireFormData,
          studentId: portfolio?.id || portfolio?._id,
          studentName: `${portfolio?.firstName} ${portfolio?.lastName}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHireSuccessMessage(data.message || "So'rovingiz qabul qilindi!");
        setHireFormData({
          companyName: '',
          contactPerson: '',
          phone: '',
          email: '',
          roleNeeded: 'Frontend Dasturchi',
          notes: '',
        });
      } else {
        alert(data.error || "So'rov yuborishda xatolik");
      }
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    } finally {
      setSubmittingHire(false);
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
        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center space-y-5 border border-slate-800">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Portfolio Topilmadi</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {error || "Kiritilgan havola bo'yicha talaba portfoliosi mavjud emas yoki o'chirilgan."}
          </p>
          <Link
            href="/portfolio"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all font-sans"
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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans relative overflow-x-hidden">
      {/* Glow Effects */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/portfolio" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight uppercase">INFAST IT-ACADEMY</span>
              <span className="block text-[9px] text-emerald-400 font-mono">PORTFOLIO SHAXSIY PROFILI</span>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              href="/portfolio"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-colors hidden sm:flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ro'yxatga Qaytish</span>
            </Link>

            <button
              onClick={() => {
                setHireSuccessMessage('');
                setShowHireModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>Ishga Taklif Qilish</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8 relative z-10">
        {/* Student Profile Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800/90 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
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
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/10 shrink-0"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 text-slate-950 font-black text-4xl flex items-center justify-center border-2 border-emerald-400/40 shadow-xl shadow-emerald-500/20 shrink-0">
                  {portfolio.firstName[0]}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
                    <ShieldCheck className="w-4 h-4" />
                    <span>INFAST VERIFIED GRADUATE</span>
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold font-mono border border-slate-700">
                    {groupName}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {portfolio.firstName} {portfolio.lastName}
                </h1>

                <p className="text-sm font-bold text-emerald-400 font-mono">
                  {courseName}
                </p>

                {portfolio.bio && (
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed pt-1 font-medium">
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
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-2xl border border-slate-700 transition-all hover:scale-105"
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
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 text-sky-400 hover:text-sky-300 rounded-2xl border border-slate-700 transition-all hover:scale-105"
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
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 text-teal-400 hover:text-teal-300 rounded-2xl border border-slate-700 transition-all hover:scale-105"
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center space-y-1 backdrop-blur-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Dars Davomati</p>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {stats.attendancePercentage}%
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center space-y-1 backdrop-blur-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Imtihon Balli (Avg)</p>
            <p className="text-2xl font-black text-sky-400 font-mono">
              {stats.avgExamPercentage}%
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center space-y-1 backdrop-blur-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Topshirilgan Loyihalar</p>
            <p className="text-2xl font-black text-amber-400 font-mono">
              {stats.completedProjectsCount} ta
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center space-y-1 backdrop-blur-md">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Akademiya Statusi</p>
            <p className="text-xs font-bold text-emerald-400 font-mono pt-1">
              ✓ FAOL BITIRUVCHI
            </p>
          </div>
        </div>

        {/* Skills Section */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-extrabold text-white">Texnik Ko'nikmalar & Texnologiyalar Steki</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-4 py-2 rounded-2xl bg-slate-800/90 text-slate-200 border border-slate-700 text-xs font-bold font-mono shadow-sm hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
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
              <h2 className="text-xl font-black text-white">Bajarilgan Amaliy Portfolio Loyihalari</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono font-bold">
              {portfolio.projects?.length || 0} ta loyiha
            </span>
          </div>

          {(!portfolio.projects || portfolio.projects.length === 0) ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 font-medium">
              Ushbu talaba hali o'z loyihalarini joylamagan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolio.projects.map((proj: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 space-y-4 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group backdrop-blur-md"
                >
                  <div className="space-y-3">
                    <h3 className="text-lg font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      {proj.description}
                    </p>

                    {/* Tech Badges */}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {proj.technologies.map((t: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 rounded-xl bg-slate-800/90 text-slate-300 text-[10px] font-bold font-mono border border-slate-700/60"
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
                        className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
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
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-slate-700"
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

      {/* Modal: Hire Student */}
      {showHireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-800 text-slate-100 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {portfolio.firstName} {portfolio.lastName} ni Ishga Taklif Qilish
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Kompaniyangiz ma'lumotlarini qoldiring</p>
                </div>
              </div>
              <button
                onClick={() => setShowHireModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {hireSuccessMessage ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="font-bold text-sm text-white">{hireSuccessMessage}</p>
                <p className="text-xs text-slate-300">
                  Akademiya HR bo'limi ko'rsatilgan raqam orqali siz bilan bog'lanadi.
                </p>
                <button
                  onClick={() => setShowHireModal(false)}
                  className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Yopish
                </button>
              </div>
            ) : (
              <form onSubmit={handleHireSubmit} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center space-x-3">
                  {portfolio.avatarUrl ? (
                    <img src={portfolio.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center">
                      {portfolio.firstName[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white">{portfolio.firstName} {portfolio.lastName}</p>
                    <p className="text-[11px] font-mono text-emerald-400">{courseName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Kompaniya Nomi (Ixtiyoriy)</label>
                    <input
                      type="text"
                      placeholder="Masalan: IT-Tech LLC"
                      value={hireFormData.companyName}
                      onChange={(e) => setHireFormData({ ...hireFormData, companyName: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Mas'ul Shaxs Ismi *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ismingiz"
                      value={hireFormData.contactPerson}
                      onChange={(e) => setHireFormData({ ...hireFormData, contactPerson: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Telefon Raqamingiz *</label>
                    <input
                      type="text"
                      required
                      placeholder="+998 (90) 123-45-67"
                      value={hireFormData.phone}
                      onChange={(e) => setHireFormData({ ...hireFormData, phone: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Email (Ixtiyoriy)</label>
                    <input
                      type="email"
                      placeholder="hr@company.com"
                      value={hireFormData.email}
                      onChange={(e) => setHireFormData({ ...hireFormData, email: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kerakli Dasturchi Yo'nalishi *</label>
                  <select
                    value={hireFormData.roleNeeded}
                    onChange={(e) => setHireFormData({ ...hireFormData, roleNeeded: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Frontend Dasturchi (React / Next.js)">Frontend Dasturchi (React / Next.js)</option>
                    <option value="Backend Dasturchi (Node.js / Express / Python)">Backend Dasturchi (Node.js / Express / Python)</option>
                    <option value="Full-Stack Dasturchi">Full-Stack Dasturchi</option>
                    <option value="Boshqa vakansiya">Boshqa vakansiya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Qo'shimcha Talablar yoki Izoh</label>
                  <textarea
                    rows={3}
                    placeholder="Masalan: Ish shakli Remote/Office, maosh oralig'i yoki loyiha talablari..."
                    value={hireFormData.notes}
                    onChange={(e) => setHireFormData({ ...hireFormData, notes: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowHireModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={submittingHire}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    {submittingHire ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Yuborilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 fill-slate-950" />
                        <span>Taklifni Yuborish</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

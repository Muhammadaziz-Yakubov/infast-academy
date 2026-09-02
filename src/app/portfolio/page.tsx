'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Code2,
  Sparkles,
  ExternalLink,
  Github,
  Linkedin,
  Briefcase,
  GraduationCap,
  Users,
  CheckCircle2,
  Send,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Zap,
  X,
  Loader2,
  Layers,
  Terminal,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';

export default function PublicTalentShowcaseDirectory() {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'FRONTEND' | 'BACKEND' | 'FULLSTACK'>('ALL');

  // Hire Modal State
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedTalentForHire, setSelectedTalentForHire] = useState<any>(null);
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
    fetchTalents();
  }, [search]);

  const fetchTalents = async () => {
    try {
      const res = await fetch(`/api/public/portfolio?q=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setTalents(data.talents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenHireModal = (talent?: any) => {
    setSelectedTalentForHire(talent || null);
    if (talent) {
      const isBackend = talent.courseName?.toLowerCase().includes('backend') || talent.skills?.some((s: string) => ['node', 'express', 'python', 'django', 'nest'].some(k => s.toLowerCase().includes(k)));
      setHireFormData(prev => ({
        ...prev,
        roleNeeded: isBackend ? 'Backend Dasturchi' : 'Frontend Dasturchi',
      }));
    }
    setHireSuccessMessage('');
    setShowHireModal(true);
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
          studentId: selectedTalentForHire?.id,
          studentName: selectedTalentForHire?.name,
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

  // Filter logic by role
  const filteredTalents = talents.filter((t) => {
    if (selectedRole === 'ALL') return true;
    const courseLower = (t.courseName || '').toLowerCase();
    const skillsLower = (t.skills || []).map((s: string) => s.toLowerCase());

    const isFrontend = courseLower.includes('front') || skillsLower.some((s: string) => ['react', 'vue', 'next', 'html', 'css', 'tailwind', 'javascript', 'typescript'].includes(s));
    const isBackend = courseLower.includes('back') || skillsLower.some((s: string) => ['node', 'express', 'python', 'django', 'nest', 'mongodb', 'postgres', 'sql', 'rest'].includes(s));

    if (selectedRole === 'FRONTEND') return isFrontend && !isBackend;
    if (selectedRole === 'BACKEND') return isBackend && !isFrontend;
    if (selectedRole === 'FULLSTACK') return isFrontend && isBackend;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Background Decorative Glow Accents */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 text-slate-950 font-black text-base flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-base text-white tracking-tight uppercase">INFAST</span>
                <span className="text-xs font-mono font-bold text-emerald-400">IT-ACADEMY</span>
              </div>
              <span className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Talantlar & Portfoliolar Portali
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleOpenHireModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center space-x-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Dasturchi Taklif Qilish</span>
            </button>

            <Link
              href="/login"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-800 transition-all hidden sm:block"
            >
              Tizimga Kirish
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono shadow-inner">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>TALANTLAR BAZASI & AMALIY PORTFOLIOLAR</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Aralash Nazariya Emas, <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              100% Real Amaliy Koddagi
            </span> IT Mutaxassislar
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            InFast IT-Academy'ning <strong className="text-white">Frontend</strong> va <strong className="text-white">Backend</strong> yo'nalishi bitiruvchilari hamda iqtidorli talabalari yaratgan loyihalarni ko'ring. Jamoangiz uchun tayyor va g'ayratli dasturchilarni bevosita tanlang.
          </p>

          {/* Stats Banner */}
          <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md text-center space-y-1">
              <p className="text-2xl font-black text-emerald-400 font-mono">50+</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tayyor Dasturchilar</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md text-center space-y-1">
              <p className="text-2xl font-black text-sky-400 font-mono">150+</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amaliy Loyihalar</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md text-center space-y-1">
              <p className="text-2xl font-black text-teal-400 font-mono">100%</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kodni Tekshirish</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md text-center space-y-1">
              <p className="text-2xl font-black text-amber-400 font-mono">20+</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hamkor Kompaniyalar</p>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar Section */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/80 p-3 sm:p-4 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
            {/* Specialty Role Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedRole('ALL')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  selectedRole === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Barcha Talantlar ({talents.length})</span>
              </button>

              <button
                onClick={() => setSelectedRole('FRONTEND')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  selectedRole === 'FRONTEND'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>💻 Frontend Dasturchilar</span>
              </button>

              <button
                onClick={() => setSelectedRole('BACKEND')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  selectedRole === 'BACKEND'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>⚙️ Backend Dasturchilar</span>
              </button>

              <button
                onClick={() => setSelectedRole('FULLSTACK')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  selectedRole === 'FULLSTACK'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>⚡ Full-Stack</span>
              </button>
            </div>

            {/* Live Search Input */}
            <div className="relative min-w-[280px] sm:min-w-[340px]">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Qidiruv (Ism, React, Node.js, Python)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Talent Showcase Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono font-bold text-slate-400">Talantlar portfoliosi yuklanmoqda...</p>
          </div>
        ) : filteredTalents.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Talabalar Topilmadi</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Kiritilgan mezon yoki filter bo'yicha hozircha talabalar topilmadi. Qidiruv so'rovini o'zgartirib ko'ring.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalents.map((t) => (
              <div
                key={t.id}
                className="bg-gradient-to-b from-slate-900/90 to-slate-900/70 border border-slate-800/90 hover:border-emerald-500/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all flex flex-col justify-between group backdrop-blur-md relative overflow-hidden"
              >
                {/* Accent glow line at top of card */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-5">
                  {/* Student Header Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      {t.avatarUrl ? (
                        <img
                          src={t.avatarUrl}
                          alt={t.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md shrink-0 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                          {t.name[0]}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono border border-emerald-500/20 flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>INFAST GRADUATE</span>
                          </span>
                        </div>

                        <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug">
                          {t.name}
                        </h3>

                        <p className="text-xs font-bold text-emerald-400 font-mono">
                          {t.courseName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
                    {t.bio}
                  </p>

                  {/* Tech Skills Pills */}
                  {t.skills && t.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {t.skills.slice(0, 5).map((skill: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 text-[10px] font-bold font-mono border border-slate-700/80 group-hover:border-emerald-500/30 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                      {t.skills.length > 5 && (
                        <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-bold font-mono">
                          +{t.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Featured Projects Preview Snippet */}
                  {t.featuredProjects && t.featuredProjects.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800/60">
                      <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
                        Bajarilgan Amaliy Loyihalar:
                      </p>
                      <div className="space-y-2">
                        {t.featuredProjects.map((fp: any, pIdx: number) => (
                          <div key={pIdx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                            <div className="truncate mr-2">
                              <p className="font-bold text-slate-200 truncate">{fp.title}</p>
                              {fp.technologies && fp.technologies.length > 0 && (
                                <p className="text-[10px] text-slate-400 font-mono truncate">
                                  {fp.technologies.slice(0, 3).join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 shrink-0">
                              {fp.liveDemo && (
                                <a
                                  href={fp.liveDemo}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded"
                                  title="Live Demo"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {fp.githubRepo && (
                                <a
                                  href={fp.githubRepo}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                                  title="GitHub Repository"
                                >
                                  <Github className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    {t.projectsCount} ta loyiha
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenHireModal(t)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center space-x-1"
                      title="Ushbu dasturchini ishga taklif qilish"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Taklif Qilish</span>
                    </button>

                    <Link
                      href={`/portfolio/${t.slug}`}
                      className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1"
                    >
                      <span>Portfolio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recruiter / Employer Banner CTA Section */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none hidden md:block">
            <Building2 className="w-72 h-72" />
          </div>

          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              <Building2 className="w-4 h-4" />
              <span>ISH BERUVCHILAR VA HR KADRLAR UCHUN</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Kompaniyangiz Uchun Kuchli <br />
              <span className="text-emerald-400">Frontend yoki Backend</span> Dasturchi Kerakmi?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              InFast IT-Academy kompaniyalarga eng iqtidorli va g'ayratli bitiruvchilarni bepul saralab beradi. Talablaringizni qoldiring va HR mutaxassisimiz siz bilan bog'lanadi.
            </p>

            <div className="pt-2">
              <button
                onClick={() => handleOpenHireModal()}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center space-x-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>Dasturchilar Bazasidan Saralab Berish So'rovi</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 relative z-10 text-slate-500 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              IF
            </div>
            <span className="font-bold text-white">INFAST IT-ACADEMY</span>
            <span>© 2026. Barcha huquqlar himoyalangan.</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Asosiy Sahifa</Link>
            <Link href="/portfolio" className="hover:text-emerald-400 transition-colors">Talantlar</Link>
            <Link href="/login" className="hover:text-emerald-400 transition-colors">Tizimga Kirish</Link>
          </div>
        </div>
      </footer>

      {/* Modal: Hire Talent / Recruiter Form */}
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
                    {selectedTalentForHire ? `${selectedTalentForHire.name} ni Ishga Taklif Qilish` : "Dasturchi Taklif Qilish"}
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
                  Akademiya HR bo'limi ko'rsatilgan raqam orqali siz bilan bog'lanib, saralab berishni amalga oshiradi.
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
                {selectedTalentForHire && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center space-x-3">
                    {selectedTalentForHire.avatarUrl ? (
                      <img src={selectedTalentForHire.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center">
                        {selectedTalentForHire.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-white">{selectedTalentForHire.name}</p>
                      <p className="text-[11px] font-mono text-emerald-400">{selectedTalentForHire.courseName}</p>
                    </div>
                  </div>
                )}

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
